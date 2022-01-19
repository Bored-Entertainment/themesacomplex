// Thanks to David Rousset for providing a tutorial to create this rendering engine, and most of the code in this script
// https://www.davrous.com/2013/06/13/tutorial-series-learning-how-to-write-a-3d-soft-engine-from-scratch-in-c-typescript-or-javascript/#mainjavascript

var SoftEngine;
(function (SoftEngine) {

    var Camera = (function () {
        function Camera() {
            this.Position = BABYLON.Vector3.Zero();
            this.Rotation = BABYLON.Vector3.Zero();
            this.Target = new BABYLON.Vector3(this.Position.x, this.Position.y, this.Position.z - 1);
        }
        return Camera;
    })();
    SoftEngine.Camera = Camera;

    var Mesh = (function () {
        function Mesh(name, verticesCount, facesCount, faceColor) {
            this.name = name;
            this.Vertices = new Array(verticesCount);
            this.Faces = new Array(facesCount);
            this.Rotation = new BABYLON.Vector3(0, 0, 0);
            this.Position = new BABYLON.Vector3(0, 0, 0);
            this.FaceColor = faceColor;
            this.VolumetricLightLevel = 0;
            this.VolumetricLightColor;
            //this.WireColor = wireColor;
            //this.WireShader = wireShader;
            this.Direction = 0;
            // 0: default, no direction
            // 1: xP
            // 2: xN
            // 3: yP
            // 4: yN
            // 5: zP
            // 6: zN
        }
        return Mesh;
    })();
    SoftEngine.Mesh = Mesh;

    var Light = (function () {
        function Light(name, type, color, intensity) {
            this.name = name;
            this.Type = type;
            this.Color = color;
            this.Intensity = intensity;
            this.Position = new BABYLON.Vector3(0, 0, 0);
            this.Direction = new BABYLON.Vector3(0, -1, 0);
        }
        return Light;
    })();
    SoftEngine.Light = Light;

    var Device = (function () {

        function Device(canvas) {
            this.workingCanvas = canvas;
            this.workingWidth = canvas.width;
            this.workingHeight = canvas.height;
            this.workingContext = this.workingCanvas.getContext("2d", { alpha : false});
            this.depthbuffer = new Array(this.workingWidth * this.workingHeight);
        }


        Device.prototype.clear = function () {
            // Clearing with black color by default
            this.workingContext.clearRect(0, 0, this.workingWidth, this.workingHeight);
            let colorString = "rgb(" + (skyBoxColor.r + maskColor.r) + ", " + (skyBoxColor.g + maskColor.g) + ", " + (skyBoxColor.b + maskColor.b) + ")";
            this.workingContext.fillStyle = colorString;
            this.workingContext.fillRect(0, 0, this.workingWidth, this.workingHeight);

            // once cleared with black pixels, we're getting back the associated image data to clear out back buffer
            this.backbuffer = this.workingContext.getImageData(0, 0, this.workingWidth, this.workingHeight);

            // Clearing depth buffer
            for (var i = 0; i < this.depthbuffer.length; i++) {
                // Max possible value
                this.depthbuffer[i] = 10000;
            }
        };

        Device.prototype.present = function () {
            this.workingContext.putImageData(this.backbuffer, 0, 0);
        };

        Device.prototype.putPixel = function (x, y, z, color) {
            this.backbufferdata = this.backbuffer.data;
            // As we have a 1-D Array for our back buffer
            // we need to know the equivalent cell index in 1-D based
            // on the 2D coordinates of the screen
            var index = ((x >> 0) + (y >> 0) * this.workingWidth);
            var index4 = index * 4;

            if (this.depthbuffer[index] < z) {
                return; // Discard
            }

            this.depthbuffer[index] = z;

            // RGBA color space is used by the HTML5 canvas
            this.backbufferdata[index4] = color.r;
            this.backbufferdata[index4 + 1] = color.g;
            this.backbufferdata[index4 + 2] = color.b;
            this.backbufferdata[index4 + 3] = 255;
        };

        // Project takes some 3D coordinates and transform them
        // in 2D coordinates using the transformation matrix
        Device.prototype.project = function (coord, transMat) {
            // transforming the coordinates
            var point = BABYLON.Vector3.TransformCoordinates(coord, transMat);
            // The transformed coordinates will be based on coordinate system
            // starting on the center of the screen. But drawing on screen normally starts
            // from top left. We then need to transform them again to have x:0, y:0 on top left.
            var x = point.x * this.workingWidth + this.workingWidth / 2.0;
            var y = -point.y * this.workingHeight + this.workingHeight / 2.0;
            return (new BABYLON.Vector3(x, y, point.z));
        };

        // drawPoint calls putPixel but does the clipping operation before
        Device.prototype.drawPoint = function (point, color) {
            // Clipping what's visible on screen
            if (point.x >= 0 && point.y >= 0 && point.x < this.workingWidth
                && point.y < this.workingHeight) {
                // Drawing a pixel to the buffer
                this.putPixel(point.x, point.y, point.z, color);
            }
        };


        Device.prototype.clamp = function (value, min, max) {
            if (typeof min === "undefined") { min = 0; }
            if (typeof max === "undefined") { max = 1; }
            return Math.max(min, Math.min(value, max));
        };

        // Interpolating the value between 2 vertices
        // min is the starting point, max the ending point
        // and gradient the % between the 2 points
        Device.prototype.interpolate = function (min, max, gradient) {
            return min + (max - min) * this.clamp(gradient);
        };

        // drawing line between 2 points from left to right
        // papb -> pcpd
        // pa, pb, pc, pd must then be sorted before
        Device.prototype.processScanLine = function (y, pa, pb, pc, pd, color) {
            // Thanks to current Y, we can compute the gradient to compute others values like
            // the starting X (sx) and ending X (ex) to draw between
            // if pa.Y == pb.Y or pc.Y == pd.Y, gradient is forced to 1
            var gradient1 = pa.y != pb.y ? (y - pa.y) / (pb.y - pa.y) : 1;
            var gradient2 = pc.y != pd.y ? (y - pc.y) / (pd.y - pc.y) : 1;

            var sx = this.interpolate(pa.x, pb.x, gradient1) >> 0;
            var ex = this.interpolate(pc.x, pd.x, gradient2) >> 0;

            // starting Z & ending Z
            var z1 = this.interpolate(pa.z, pb.z, gradient1);
            var z2 = this.interpolate(pc.z, pd.z, gradient2);

            // drawing a line from left (sx) to right (ex)
            for (var x = sx; x < ex; x++) {
                var gradient = (x - sx) / (ex - sx);
                var z = this.interpolate(z1, z2, gradient);
                //checks to see if the z-buffer distance is positive, meaning it is in front of the camera
                if (z > 0) {
                    this.drawPoint(new BABYLON.Vector3(x, y, z), color);
                }
            }
        };


        // 2D vector cross product � uses only X and Y coordinates, ignores Z
        Device.prototype.Cross2D = function(x0, y0, x1, y1) {
            return (x0 * y1) - (x1 * y0);
        };
        // determine on which side of a 2D line a 2D point is
        // returns positive values for "right", negative values for "left", and zero if point is on line
        Device.prototype.LineSide2D = function (p, lineFrom, lineTo) {
            return this.Cross2D(p.x - lineFrom.x, p.y - lineFrom.y, lineTo.x - lineFrom.x, lineTo.y - lineFrom.y);
        };

        Device.prototype.drawTriangle = function (p1, p2, p3, color) {
            // Sorting the points in order to always have this order on screen p1, p2 & p3
            // with p1 always up (thus having the Y the lowest possible to be near the top screen)
            // then p2 between p1 & p3
            if (p1.y > p2.y) {
                var temp = p2;
                p2 = p1;
                p1 = temp;
            }
            if (p2.y > p3.y) {
                var temp = p2;
                p2 = p3;
                p3 = temp;
            }
            if (p1.y > p2.y) {
                var temp = p2;
                p2 = p1;
                p1 = temp;
            }

            // inverse slopes
            var dP1P2; var dP1P3;

            // http://en.wikipedia.org/wiki/Slope
            // Computing slopes
            if (p2.y - p1.y > 0) {
                dP1P2 = (p2.x - p1.x) / (p2.y - p1.y);
            } else {
                dP1P2 = 0;
            }

            if (p3.y - p1.y > 0) {
                dP1P3 = (p3.x - p1.x) / (p3.y - p1.y);
            } else {
                dP1P3 = 0;
            }

            // First case where triangles are like that:
            // P1
            // -
            // --
            // - -
            // -  -
            // -   - P2
            // -  -
            // - -
            // -
            // P3
            var lineSide = this.LineSide2D(p2, p1, p3);

            if (lineSide > 0) {
                for (var y = p1.y >> 0; y <= p3.y >> 0; y++) {
                    if (y < p2.y) {
                        this.processScanLine(y, p1, p3, p1, p2, color);
                    } else {
                        this.processScanLine(y, p1, p3, p2, p3, color);
                    }
                }
            }
            // First case where triangles are like that:
            //       P1
            //        -
            //       --
            //      - -
            //     -  -
            // P2 -   -
            //     -  -
            //      - -
            //        -
            //       P3
            else {
                for (var y = p1.y >> 0; y <= p3.y >> 0; y++) {
                    if (y < p2.y) {
                        this.processScanLine(y, p1, p2, p1, p3, color);
                    } else {
                        this.processScanLine(y, p2, p3, p1, p3, color);
                    }
                }
            }
        };


        Device.prototype.drawLine = function (point0, point1, color, shader) {
            var x0;
            var y0;
            var x1;
            var y1;

            if (point0.x <= point1.x) {
                x0 = point0.x;
                y0 = point0.y;
                x1 = point1.x;
                y1 = point1.y;
            }
            else {
                x0 = point1.x;
                y0 = point1.y;
                x1 = point0.x;
                y1 = point0.y;
            }

            var xDist = x1 - x0;
            var yDist = y1 - y0;

            var slope = (y1 - y0) / (x1 - x0);
            var cx = x0;
            var cy = y0;
            var i;
            var point;

            // Exit loop if dist between the next pixel and the vertex is less than 2 (line is done rendering)
            if (Math.abs(xDist) < 2 && Math.abs(yDist) < 2) {
                return;
            }

            // Does different things for each shader
            // If slope is more horizontal, then render it based on dy/dx
            if (slope >= -1 && slope <= 1) {
                for (i = x0; i < x1; i++) {
                    cx = i;
                    cy += slope;

                    var gradient = (cy - y0) / (y1 - y0);
                    var z = this.interpolate(point0.z, point1.z, gradient);
                    point = new BABYLON.Vector3(cx, Math.round(cy), z - wireOffset);
                    this.drawPoint(point, color);
                }
            }
            // If slope is more vertical, then render based on dx/dy
            else {
                if (y0 < y1) {
                    for (i = y0; i < y1; i++) {
                        cy = i;
                        cx += 1 / slope;

                        var gradient = (cy - y0) / (y1 - y0);
                        var z = this.interpolate(point0.z, point1.z, gradient);
                        point = new BABYLON.Vector3(Math.round(cx), cy, z - wireOffset);
                        this.drawPoint(point, color);
                    }
                }

                else if (y1 < y0) {
                    cx = x1;
                    for (i = y1; i < y0; i++) {
                        cy = i;
                        cx += 1 / slope;

                        var gradient = (cy - y1) / (y0 - y1);
                        var z = this.interpolate(point0.z, point1.z, gradient);
                        point = new BABYLON.Vector3(Math.round(cx), cy, z - wireOffset);
                        this.drawPoint(point, color);
                    }
                }
            }
        };



        // Compute the cosine of the angle between the light vector and the normal vector
        // Returns a value between 0 and 1
        Device.prototype.computeNDotL = function (vertex, normal, lightPosition) {
            var lightDirection = lightPosition.subtract(vertex);

            normal.normalize();
            lightDirection.normalize();

            return BABYLON.Vector3.Dot(normal, lightDirection);
        };

        var edgePadding = 40;  // 40

        Device.prototype.render = function (camera, meshes) {
            var viewMatrix = BABYLON.Matrix.LookAtLH(camera.Position, camera.Target, BABYLON.Vector3.Up());
            var projectionMatrix = BABYLON.Matrix.PerspectiveFovLH(cameraFOV, this.workingWidth / this.workingHeight, 0.01, 1.0);

            for (var index = 0; index < meshes.length; index++) {
                var cMesh = meshes[index];
                var worldMatrix = BABYLON.Matrix.RotationYawPitchRoll(cMesh.Rotation.y, cMesh.Rotation.x, cMesh.Rotation.z).multiply(BABYLON.Matrix.Translation(cMesh.Position.x, cMesh.Position.y, cMesh.Position.z));
                var camSpaceMatrix = worldMatrix.multiply(viewMatrix);
                var transformMatrix = camSpaceMatrix.multiply(projectionMatrix);

                for (var indexFaces = 0; indexFaces < cMesh.Faces.length; indexFaces++) {
                    var currentFace = cMesh.Faces[indexFaces];
                    var vertexA = cMesh.Vertices[currentFace.A];
                    var vertexB = cMesh.Vertices[currentFace.B];
                    var vertexC = cMesh.Vertices[currentFace.C];

                    var normalX = currentFace.NX;
                    var normalY = currentFace.NY;
                    var normalZ = currentFace.NZ;
                    var normalVector = new BABYLON.Vector3(normalX, normalY, normalZ);
                    normalVector.normalize();
                    //var worldNormal = BABYLON.Vector3.TransformCoordinates(normalVector, worldMatrix);


                    var faceCenter = (vertexA.add(vertexB.add(vertexC))).scale(1 / 3);
                    var faceCamSpace = BABYLON.Vector3.TransformCoordinates(faceCenter, camSpaceMatrix);

                    var faceColor = cMesh.FaceColor;

                    //var camSpaceNormal = BABYLON.Vector3.TransformNormal(normalVector, camSpaceMatrix);
                    var centerPoint = BABYLON.Vector3.TransformCoordinates(faceCenter, worldMatrix);
                    var normalDotCamera = BABYLON.Vector3.Dot(centerPoint.subtract(cam.Position), normalVector);


                    // LINE DRAWING, IF ENABLED
                    
                    var wireColor = cMesh.WireColor;
                    //var wireShader = cMesh.WireShader;

                    

                    //FACE DRAWING, IF ENABLED
                    if (showFaces == true && faceColor != null) {

                        // First, immediately moves on if the current face is a back face
                        if (normalDotCamera <= 0 && faceCamSpace.z > 0) {
                            var pixelA = this.project(vertexA, transformMatrix);
                            var pixelB = this.project(vertexB, transformMatrix);
                            var pixelC = this.project(vertexC, transformMatrix);
                            // Checks if any of the current vertices are within the screen boundaries, if they are then it proceeds to render the face
                            if ((pixelA.x >= -edgePadding && pixelA.x <= this.workingWidth + edgePadding && pixelA.y >= -edgePadding && pixelA.y <= this.workingHeight + edgePadding) ||
                                (pixelB.x >= -edgePadding && pixelB.x <= this.workingWidth + edgePadding && pixelB.y >= -edgePadding && pixelB.y <= this.workingHeight + edgePadding) ||
                                (pixelC.x >= -edgePadding && pixelC.x <= this.workingWidth + edgePadding && pixelC.y >= -edgePadding && pixelC.y <= this.workingHeight + edgePadding)) {
                                
                                //goes through each light and adds its color value times the angle

                                //var worldA = BABYLON.Vector3.TransformCoordinates(vertexA, worldMatrix);
                                //var worldB = BABYLON.Vector3.TransformCoordinates(vertexB, worldMatrix);
                                //var worldC = BABYLON.Vector3.TransformCoordinates(vertexC, worldMatrix);
                                

                                // First, add ambient light
                                var ndotl = 0;
                                var outputColor = new BABYLON.Color3(ambientLight * faceColor.r, ambientLight * faceColor.g, ambientLight * faceColor.b);

                                switch (currLightingMode){

                                    case LightingMode.Flat_InverseSquared:
                                        for (var indexLights = 0; indexLights < lights.length; indexLights++) {
                                            let thisLight = lights[indexLights];
                                            let distanceMultiplier = 1;
                                            let maxMultiplier = 1;

                                            if (thisLight.Type == LightType.Point) {
                                                ndotl = this.computeNDotL(centerPoint, normalVector, thisLight.Position);
                                                var dist = BABYLON.Vector3.DistanceSquared(thisLight.Position, centerPoint);
                                                distScale = Math.min(thisLight.Intensity / dist, maxMultiplier);
                                            }
        
                                            if (thisLight.Type == LightType.Directional) {
                                                //thisLight.Direction.normalize();
                                                ndotl = this.computeNDotL(centerPoint, normalVector, centerPoint.subtract(thisLight.Direction));
                                                //var dist = BABYLON.Vector3.Distance(thisLight.Position, centerPoint)
                                                distScale = thisLight.Intensity;
                                            }

                                            ndotl = this.clamp(ndotl, 0, 1);

                                            outputColor.r += distScale * ndotl * faceColor.r * thisLight.Color.r / 255;
                                            outputColor.g += distScale * ndotl * faceColor.g * thisLight.Color.g / 255;
                                            outputColor.b += distScale * ndotl * faceColor.b * thisLight.Color.b / 255;
                                        }

                                        
                                        break;
                                    
                                    case LightingMode.Flat_Linear:
                                        for (var indexLights = 0; indexLights < lights.length; indexLights++) {
                                            let thisLight = lights[indexLights];
                                            let distanceMultiplier = 1;
                                            let maxMultiplier = 1;

                                            if (thisLight.Type == LightType.Point) {
                                                ndotl = this.computeNDotL(centerPoint, normalVector, thisLight.Position);
                                                var dist = BABYLON.Vector3.Distance(thisLight.Position, centerPoint);
                                                distScale = this.clamp(thisLight.Intensity - (dist / 8), 0, maxMultiplier);
                                            }
        
                                            if (thisLight.Type == LightType.Directional) {
                                                //thisLight.Direction.normalize();
                                                ndotl = this.computeNDotL(centerPoint, normalVector, centerPoint.subtract(thisLight.Direction));
                                                //var dist = BABYLON.Vector3.Distance(thisLight.Position, centerPoint)
                                                distScale = thisLight.Intensity;
                                            }

                                            ndotl = this.clamp(ndotl, 0, 1);

                                            outputColor.r += distScale * ndotl * faceColor.r * thisLight.Color.r / 255;
                                            outputColor.g += distScale * ndotl * faceColor.g * thisLight.Color.g / 255;
                                            outputColor.b += distScale * ndotl * faceColor.b * thisLight.Color.b / 255;
                                        }
                                        
                                        break;
                                    
                                    case LightingMode.Voxel:
                                        if (cMesh.Direction !== 0){
                                            let blockPos = cMesh.Position.round();
                                            let sunlightData = GetBlockLightData(blockPos.x, blockPos.y, blockPos.z);
        
                                            let sunlightLevel = sunlightData[cMesh.Direction - 1] / maxLightLevel;
                                            let volumetricLightLevel = cMesh.VolumetricLightLevel / maxLightLevel;
                                            
                                            let sunlightColor = sunLight.Color.scale(sunlightLevel);
                                            let volumetricLightColor = cMesh.VolumetricLightColor.scale(volumetricLightLevel);
                                            //let displayLightLevel = Math.max(sunlightLevel, volumetricLightLevel);
                                            // Change 'torchOrange' to the current mesh's light color
                                            let displayLightColor = sunlightColor.combine(volumetricLightColor);

                                            outputColor.r += faceColor.r * displayLightColor.r / 255;
                                            outputColor.g += faceColor.g * displayLightColor.g / 255;
                                            outputColor.b += faceColor.b * displayLightColor.b / 255;
                                        }

                                        break;

                                }
                                

                                if (drawFog === true) {
                                    // Draw distance fog by shifting face color towards the skybox color (reducing contrast)                                  
                                    let camDist = BABYLON.Vector3.Distance(cam.Position, centerPoint);
                                    let distRatio = camDist / (chunkWidth * (renderDistance + 0.5));

                                    if (distRatio > 0.8) {
                                        // Cubes the gradient so that closer objects have less fog but the furthest ones are still obscured
                                        let densityGradient = 5 * distRatio - 4;//Math.pow(distRatio, 3) * fogIntensity;

                                        outputColor.r = this.interpolate(outputColor.r, skyBoxColor.r, densityGradient);
                                        outputColor.g = this.interpolate(outputColor.g, skyBoxColor.g, densityGradient);
                                        outputColor.b = this.interpolate(outputColor.b, skyBoxColor.b, densityGradient);

                                        if (showWires) {
                                            var lineColor = new BABYLON.Color3(0, 0, 0);
                                            lineColor.r = this.interpolate(lineColor.r, skyBoxColor.r, densityGradient);
                                            lineColor.g = this.interpolate(lineColor.g, skyBoxColor.g, densityGradient);
                                            lineColor.b = this.interpolate(lineColor.b, skyBoxColor.b, densityGradient);
                                        }                                        
                                    }                                  
                                }

                                // Apply masking color
                                outputColor.r += maskColor.r;
                                outputColor.g += maskColor.g;
                                outputColor.b += maskColor.b;

                                this.drawTriangle(pixelA, pixelB, pixelC, outputColor);

                                // Draw lines around face edges
                                if (showWires) {
                                    this.drawLine(pixelA, pixelB, lineColor, 0);
                                    this.drawLine(pixelB, pixelC, lineColor, 0);
                                    //this.drawLine(pixelC, pixelA, wireColor, 0);
                                }
                            }
                        }
                                              
                    }

                    // NORMAL VECTOR DRAWING, IF ENABLED
                    if (drawNormals == true) {
                        this.drawLine(this.project(faceCenter, transformMatrix), this.project(faceCenter.add(normalVector.scale(0.2)), transformMatrix), red, 0);
                    }
                }
            }
	
			this.drawPoint(new BABYLON.Vector2(this.workingWidth / 2, this.workingHeight / 2), synthMagenta);
        };

        return Device;
    })();
    SoftEngine.Device = Device;
})(SoftEngine || (SoftEngine = {}));
