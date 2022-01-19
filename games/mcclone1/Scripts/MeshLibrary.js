function findMesh(inputName) {
    for (var meshIndex = 0; meshIndex < meshes.length; meshIndex++) {
        if (meshes[meshIndex].name == inputName) {
            return meshes[meshIndex];
        }
    }
    return meshes[0];
}

function newEmptyMesh() {
    // DOES NOT PUSH THE MESH, YOU MUST DO IT MANUALLY OR INSERT IT AT A SPECIFIC SPOT
    var thisMesh;
    thisMesh = new SoftEngine.Mesh("", 0, 0, black, black, 0);
    thisMesh.Position = new BABYLON.Vector3(0, 0, 0);
    thisMesh.Rotation = new BABYLON.Vector3(0, 0, 0);
    return thisMesh;
}


function newRect(name, xWidth, yWidth, zWidth, faceColor, wireColor = black, wireShader = 0) {
    var thisRect;
    thisRect = new SoftEngine.Mesh(name, 8, 12, faceColor, wireColor, wireShader);

    var xHalfWidth = xWidth / 2;
	var yHalfWidth = yWidth / 2;
	var zHalfWidth = zWidth / 2;
    thisCube.Vertices[0] = new BABYLON.Vector3(-xHalfWidth, yHalfWidth, zHalfWidth);
    thisCube.Vertices[1] = new BABYLON.Vector3(xHalfWidth, yHalfWidth, zHalfWidth);
    thisCube.Vertices[2] = new BABYLON.Vector3(-xHalfWidth, -yHalfWidth, zHalfWidth);
    thisCube.Vertices[3] = new BABYLON.Vector3(xHalfWidth, -yHalfWidth, zHalfWidth);
    thisCube.Vertices[4] = new BABYLON.Vector3(-xHalfWidth, yHalfWidth, -zHalfWidth);
    thisCube.Vertices[5] = new BABYLON.Vector3(xHalfWidth, yHalfWidth, -zHalfWidth);
    thisCube.Vertices[6] = new BABYLON.Vector3(xHalfWidth, -yHalfWidth, -zHalfWidth);
    thisCube.Vertices[7] = new BABYLON.Vector3(-xHalfWidth, -yHalfWidth, -zHalfWidth);

    thisRect.Faces[0] = {
        A: 0,
        B: 1,
        C: 2,

        NX: 0,
        NY: 0,
        NZ: 1
    };
    thisRect.Faces[1] = {
        A: 1,
        B: 2,
        C: 3,

        NX: 0,
        NY: 0,
        NZ: 1
    };
    thisRect.Faces[2] = {
        A: 1,
        B: 3,
        C: 6,

        NX: 1,
        NY: 0,
        NZ: 0
    };
    thisRect.Faces[3] = {
        A: 1,
        B: 5,
        C: 6,

        NX: 1,
        NY: 0,
        NZ: 0
    };
    thisRect.Faces[4] = {
        A: 0,
        B: 1,
        C: 4,

        NX: 0,
        NY: 1,
        NZ: 0
    };
    thisRect.Faces[5] = {
        A: 1,
        B: 4,
        C: 5,

        NX: 0,
        NY: 1,
        NZ: 0
    };
    thisRect.Faces[6] = {
        A: 2,
        B: 3,
        C: 7,

        NX: 0,
        NY: -1,
        NZ: 0
    };
    thisRect.Faces[7] = {
        A: 3,
        B: 6,
        C: 7,

        NX: 0,
        NY: -1,
        NZ: 0
    };
    thisRect.Faces[8] = {
        A: 0,
        B: 2,
        C: 7,

        NX: -1,
        NY: 0,
        NZ: 0
    };
    thisRect.Faces[9] = {
        A: 0,
        B: 4,
        C: 7,

        NX: -1,
        NY: 0,
        NZ: 0
    };
    thisRect.Faces[10] = {
        A: 4,
        B: 5,
        C: 6,

        NX: 0,
        NY: 0,
        NZ: -1
    };
    thisRect.Faces[11] = {
        A: 4,
        B: 6,
        C: 7,

        NX: 0,
        NY: 0,
        NZ: -1
    };

    thisRect.Position = new BABYLON.Vector3(0, 0, 0);
    thisRect.Rotation = new BABYLON.Vector3(0, 0, 0);

    meshes.push(thisRect);
    return thisRect;
}


function newFace(name, directionNum, faceColor, wireColor = black){
    var thisFace;
    thisFace = new SoftEngine.Mesh(name, 4, 2, faceColor, wireColor, 0);

    let axis;
    let sign;

    switch (directionNum){
        case 0:
            axis = 'x';
            sign = 1;
        break;

        case 1:
            axis = 'x';
            sign = -1;
        break;

        case 2:
            axis = 'y';
            sign = 1;
        break;

        case 3:
            axis = 'y';
            sign = -1;
        break;

        case 4:
            axis = 'z';
            sign = 1;
        break;

        case 5:
            axis = 'z';
            sign = -1;
        break;
        
        default:
            axis = 'x';
            sign = 1;
    }

    let offset = 0.5 * sign;

    if(axis == 'x'){
        thisFace.Vertices[0] = new BABYLON.Vector3(offset, offset, offset);
        thisFace.Vertices[1] = new BABYLON.Vector3(offset, -offset, offset);
        thisFace.Vertices[2] = new BABYLON.Vector3(offset, -offset, -offset);
        thisFace.Vertices[3] = new BABYLON.Vector3(offset, offset, -offset);

        thisFace.Faces[0] = {
            A: 0,
            B: 1,
            C: 2,

            NX: sign,
            NY: 0,
            NZ: 0
        };
        thisFace.Faces[1] = {
            A: 0,
            B: 3,
            C: 2,

            NX: sign,
            NY: 0,
            NZ: 0
        };
    }
  
    else if(axis == 'y'){
        thisFace.Vertices[0] = new BABYLON.Vector3(-offset, offset, offset);
        thisFace.Vertices[1] = new BABYLON.Vector3(offset, offset, offset);
        thisFace.Vertices[2] = new BABYLON.Vector3(offset, offset, -offset);
        thisFace.Vertices[3] = new BABYLON.Vector3(-offset, offset, -offset);

        thisFace.Faces[0] = {
            A: 0,
            B: 1,
            C: 2,

            NX: 0,
            NY: sign,
            NZ: 0
        };
        thisFace.Faces[1] = {
            A: 0,
            B: 3,
            C: 2,

            NX: 0,
            NY: sign,
            NZ: 0
        };
    }
  
    else if(axis == 'z'){
        thisFace.Vertices[0] = new BABYLON.Vector3(-offset, -offset, offset);
        thisFace.Vertices[1] = new BABYLON.Vector3(offset, -offset, offset);
        thisFace.Vertices[2] = new BABYLON.Vector3(offset, offset, offset);
        thisFace.Vertices[3] = new BABYLON.Vector3(-offset, offset, offset);

        thisFace.Faces[0] = {
            A: 0,
            B: 1,
            C: 2,

            NX: 0,
            NY: 0,
            NZ: sign
        };
        thisFace.Faces[1] = {
            A: 0,
            B: 3,
            C: 2,

            NX: 0,
            NY: 0,
            NZ: sign
        };
    }
  
    meshes.push(thisFace);
    return thisFace;
}


function newCube(name, width, faceColor, wireColor = black, wireShader = 0) {
    var thisCube;
    thisCube = new SoftEngine.Mesh(name, 8, 12, faceColor, wireColor, wireShader);

    var halfWidth = width / 2;
    thisCube.Vertices[0] = new BABYLON.Vector3(-halfWidth, halfWidth, halfWidth);
    thisCube.Vertices[1] = new BABYLON.Vector3(halfWidth, halfWidth, halfWidth);
    thisCube.Vertices[2] = new BABYLON.Vector3(-halfWidth, -halfWidth, halfWidth);
    thisCube.Vertices[3] = new BABYLON.Vector3(halfWidth, -halfWidth, halfWidth);
    thisCube.Vertices[4] = new BABYLON.Vector3(-halfWidth, halfWidth, -halfWidth);
    thisCube.Vertices[5] = new BABYLON.Vector3(halfWidth, halfWidth, -halfWidth);
    thisCube.Vertices[6] = new BABYLON.Vector3(halfWidth, -halfWidth, -halfWidth);
    thisCube.Vertices[7] = new BABYLON.Vector3(-halfWidth, -halfWidth, -halfWidth);

    thisCube.Faces[0] = {
        A: 0,
        B: 1,
        C: 2,

        NX: 0,
        NY: 0,
        NZ: 1
    };
    thisCube.Faces[1] = {
        A: 1,
        B: 2,
        C: 3,

        NX: 0,
        NY: 0,
        NZ: 1
    };
    thisCube.Faces[2] = {
        A: 1,
        B: 3,
        C: 6,

        NX: 1,
        NY: 0,
        NZ: 0
    };
    thisCube.Faces[3] = {
        A: 1,
        B: 5,
        C: 6,

        NX: 1,
        NY: 0,
        NZ: 0
    };
    thisCube.Faces[4] = {
        A: 0,
        B: 1,
        C: 4,

        NX: 0,
        NY: 1,
        NZ: 0
    };
    thisCube.Faces[5] = {
        A: 1,
        B: 4,
        C: 5,

        NX: 0,
        NY: 1,
        NZ: 0
    };
    thisCube.Faces[6] = {
        A: 2,
        B: 3,
        C: 7,

        NX: 0,
        NY: -1,
        NZ: 0
    };
    thisCube.Faces[7] = {
        A: 3,
        B: 6,
        C: 7,

        NX: 0,
        NY: -1,
        NZ: 0
    };
    thisCube.Faces[8] = {
        A: 0,
        B: 2,
        C: 7,

        NX: -1,
        NY: 0,
        NZ: 0
    };
    thisCube.Faces[9] = {
        A: 0,
        B: 4,
        C: 7,

        NX: -1,
        NY: 0,
        NZ: 0
    };
    thisCube.Faces[10] = {
        A: 4,
        B: 5,
        C: 6,

        NX: 0,
        NY: 0,
        NZ: -1
    };
    thisCube.Faces[11] = {
        A: 4,
        B: 6,
        C: 7,

        NX: 0,
        NY: 0,
        NZ: -1
    };

    thisCube.Position = new BABYLON.Vector3(0, 1, 0);
    thisCube.Rotation = new BABYLON.Vector3(0, 0, 0);

    meshes.push(thisCube);
    return thisCube;
}


function newQuad(name, xWidth, zWidth, faceColor, wireColor = black, wireShader = 0) {
    var thisQuad;
    thisQuad = new SoftEngine.Mesh(name, 4, 2, faceColor, wireColor, wireShader);
    meshes.push(thisQuad);

    var xHalfWidth = xWidth / 2;
    var zHalfWidth = zWidth / 2;
    thisQuad.Vertices[0] = new BABYLON.Vector3(-xHalfWidth, 0, zHalfWidth);
    thisQuad.Vertices[1] = new BABYLON.Vector3(xHalfWidth, 0, zHalfWidth);
    thisQuad.Vertices[2] = new BABYLON.Vector3(xHalfWidth, 0, -zHalfWidth);
    thisQuad.Vertices[3] = new BABYLON.Vector3(-xHalfWidth, 0, -zHalfWidth);

    thisQuad.Faces[0] = {
        A: 0,
        B: 1,
        C: 2,

        NX: 0,
        NY: 1,
        NZ: 0
    };
    thisQuad.Faces[1] = {
        A: 0,
        B: 3,
        C: 2,

        NX: 0,
        NY: 1,
        NZ: 0
    };

    return thisQuad;
}


function newPlane(name, xWidth, zWidth, xDetail, zDetail, faceColor, wireColor = black, wireShader = 0) {
    var xVerts = xDetail + 1;
    var zVerts = zDetail + 1;
    var thisPlane;
    thisPlane = new SoftEngine.Mesh(name, (xVerts) * (zVerts), xDetail * zDetail * 2, faceColor, wireColor, wireShader);

    // GENERATE VERTICES
    for (var iZ = 0; iZ < zVerts; iZ++) {
        for (var iX = 0; iX < xVerts; iX++) {
            var tempX = (iX / xDetail) * xWidth - ((xWidth) / 2);
            var tempY = 0;
            var tempZ = (iZ / zDetail) * zWidth - ((zWidth) / 2);

            var currIndex = (iZ * xVerts) + iX;
            thisPlane.Vertices[currIndex] = new BABYLON.Vector3(tempX, tempY, tempZ);
        }
    }

    // GENERATE FACES FROM VERTICES
    var iFaces = 0;
    for (var iZ = 0; iZ < zDetail; iZ++) {
        for (var iX = 0; iX < xDetail; iX++) {

            var currIndex = (iZ * xVerts) + iX;


            // Upper triangles
            var tempV = thisPlane.Vertices[currIndex + 1].subtract(thisPlane.Vertices[currIndex]);
            var tempU = thisPlane.Vertices[currIndex + xVerts + 1].subtract(thisPlane.Vertices[currIndex]);

            var thisNX = (tempU.y * tempV.z) - (tempU.z * tempV.y);
            var thisNY = (tempU.z * tempV.x) - (tempU.x * tempV.z);
            var thisNZ = (tempU.x * tempV.y) - (tempU.y * tempV.x);

            thisPlane.Faces[iFaces] = {
                A: currIndex,
                B: currIndex + 1,
                C: currIndex + 1 + xVerts,

                NX: thisNX,
                NY: thisNY,
                NZ: thisNZ
            };
            iFaces++;


            //Lower triangles
            var tempU = thisPlane.Vertices[currIndex + xVerts].subtract(thisPlane.Vertices[currIndex]);
            var tempV = thisPlane.Vertices[currIndex + xVerts + 1].subtract(thisPlane.Vertices[currIndex]);

            var thisNX = (tempU.y * tempV.z) - (tempU.z * tempV.y);
            var thisNY = (tempU.z * tempV.x) - (tempU.x * tempV.z);
            var thisNZ = (tempU.x * tempV.y) - (tempU.y * tempV.x);

            thisPlane.Faces[iFaces] = {
                A: currIndex,
                B: currIndex + xVerts,
                C: currIndex + xVerts + 1,

                NX: thisNX,
                NY: thisNY,
                NZ: thisNZ
            };
            iFaces++;
        }
    }

    thisPlane.Position = new BABYLON.Vector3(0, 0, 0);
    thisPlane.Rotation = new BABYLON.Vector3(0, 0, 0);

    meshes.push(thisPlane);

    return thisPlane;
}


function newTerrainGridRand(name, xWidth, zWidth, xDetail, zDetail, height, faceColor, wireColor = black, wireShader = 0) {
    var xVerts = xDetail + 1;
    var zVerts = zDetail + 1;
    var thisTerrainGrid;
    thisTerrainGrid = new SoftEngine.Mesh(name, (xVerts) * (zVerts), xDetail * zDetail * 2, faceColor, wireColor, wireShader);

    // GENERATE VERTICES
    for (var iZ = 0; iZ < zVerts; iZ++) {
        for (var iX = 0; iX < xVerts; iX++) {
            var tempX = (iX / xDetail) * xWidth - ((xWidth) / 2);
            var tempY = height * (2 * (Math.random() - 0.5));
            var tempZ = (iZ / zDetail) * zWidth - ((zWidth) / 2);

            var currIndex = (iZ * xVerts) + iX;
            thisTerrainGrid.Vertices[currIndex] = new BABYLON.Vector3(tempX, tempY, tempZ);
        }
    }

    // GENERATE FACES FROM VERTICES
    var iFaces = 0;
    for (var iZ = 0; iZ < zDetail; iZ++) {
        for (var iX = 0; iX < xDetail; iX++) {

            var currIndex = (iZ * xVerts) + iX;


            // Upper triangles
            var tempV = thisTerrainGrid.Vertices[currIndex + 1].subtract(thisTerrainGrid.Vertices[currIndex]);
            var tempU = thisTerrainGrid.Vertices[currIndex + xVerts + 1].subtract(thisTerrainGrid.Vertices[currIndex]);

            var thisNX = (tempU.y * tempV.z) - (tempU.z * tempV.y);
            var thisNY = (tempU.z * tempV.x) - (tempU.x * tempV.z);
            var thisNZ = (tempU.x * tempV.y) - (tempU.y * tempV.x);

            thisTerrainGrid.Faces[iFaces] = {
                A: currIndex,
                B: currIndex + 1,
                C: currIndex + 1 + xVerts,

                NX: thisNX,
                NY: thisNY,
                NZ: thisNZ
            };
            iFaces++;


            //Lower triangles
            var tempU = thisTerrainGrid.Vertices[currIndex + xVerts].subtract(thisTerrainGrid.Vertices[currIndex]);
            var tempV = thisTerrainGrid.Vertices[currIndex + xVerts + 1].subtract(thisTerrainGrid.Vertices[currIndex]);

            var thisNX = (tempU.y * tempV.z) - (tempU.z * tempV.y);
            var thisNY = (tempU.z * tempV.x) - (tempU.x * tempV.z);
            var thisNZ = (tempU.x * tempV.y) - (tempU.y * tempV.x);

            thisTerrainGrid.Faces[iFaces] = {
                A: currIndex,
                B: currIndex + xVerts,
                C: currIndex + xVerts + 1,

                NX: thisNX,
                NY: thisNY,
                NZ: thisNZ
            };
            iFaces++;
        }
    }

    thisTerrainGrid.Position = new BABYLON.Vector3(0, 0, 0);
    thisTerrainGrid.Rotation = new BABYLON.Vector3(0, 0, 0);

    meshes.push(thisTerrainGrid);

    return thisTerrainGrid;
}


function newTerrainGridSmooth(name, xWidth, zWidth, xDetail, zDetail, height, interval, faceColor, wireColor = black, wireShader = 0) {
    if (interval <= 0 || interval % 2 != 0) {
        interval = 2;
    }
    var xVerts = xDetail + 1;
    var zVerts = zDetail + 1;
    var thisTerrainGrid;
    thisTerrainGrid = new SoftEngine.Mesh(name, (xVerts) * (zVerts), xDetail * zDetail * 2, faceColor, wireColor, wireShader);

    // GENERATE SAMPLE VERTICES
    for (var iZ = 0; iZ < zVerts; iZ++) {
        for (var iX = 0; iX < xVerts; iX++) {
            // Set sample heights, if iX and iZ are both even or both odd
            if ((iZ % interval == 0 && iX % interval == 0) || (iZ % interval == (interval / 2) && iX % interval == (interval / 2))) {
                var tempX = (iX / xDetail) * xWidth - ((xWidth) / 2);
                var tempY = height * (2 * (Math.random() - 0.5));
                var tempZ = (iZ / zDetail) * zWidth - ((zWidth) / 2);

                var currIndex = (iZ * xVerts) + iX;
                thisTerrainGrid.Vertices[currIndex] = new BABYLON.Vector3(tempX, tempY, tempZ);
            }
        }
    }
    
    // GENERATE IN BETWEEN VERTICES
    for (var iZ = 0; iZ < zVerts; iZ++) {
        for (var iX = 0; iX < xVerts; iX++) {
            var currIndex = (iZ * xVerts) + iX;

            // Interpolate in between vertices, if one index is even and the other is odd
            if (!(iZ % interval == 0 && iX % interval == 0) && !(iZ % interval == (interval / 2) && iX % interval == (interval / 2))) {
                // Sample the surrounding vertices, if they exist
                var avgHeight = 0;
                var sampleCount = 0;

                // Left
                if (iX > 0) {
                    sampleCount++;
                    avgHeight += thisTerrainGrid.Vertices[currIndex - 1].y;
                }
                // Right
                if (iX < xVerts - 1) {
                    sampleCount++;
                    avgHeight += thisTerrainGrid.Vertices[currIndex + 1].y;
                }
                // Up
                if (iZ > 0) {
                    sampleCount++;
                    avgHeight += thisTerrainGrid.Vertices[currIndex - xVerts].y;
                }
                // Down
                if (iZ < zVerts - 1) {
                    sampleCount++;
                    avgHeight += thisTerrainGrid.Vertices[currIndex + xVerts].y;
                }

                // Average the sample heights out
                avgHeight = avgHeight / sampleCount;

                var tempX = (iX / xDetail) * xWidth - ((xWidth) / 2);
                var tempY = avgHeight;
                var tempZ = (iZ / zDetail) * zWidth - ((zWidth) / 2);

                thisTerrainGrid.Vertices[currIndex] = new BABYLON.Vector3(tempX, tempY, tempZ);
            }
        }
    }

    // GENERATE FACES FROM VERTICES
    var iFaces = 0;
    for (var iZ = 0; iZ < zDetail; iZ++) {
        for (var iX = 0; iX < xDetail; iX++) {

            var currIndex = (iZ * xVerts) + iX;
            var tempV;
            var tempU;

            // Each point is the top left of its own square, excluding the bottom and right rows
            // If both points are of the same parity (both odd / both even) then the square will be split by a line going down and right
            // If the points are opposite parity, then the square will be split by a line going down and left
            // This deals with the ridges effect by flipping the triangle vertices, and instead creates a smoother, more natural flow to the grid

            // SAME-PARITY VERTICES
            if ((iZ % 2 == 0 && iX % 2 == 0) || (iZ % 2 == 1 && iX % 2 == 1)) {
                // Upper triangles
                tempV = thisTerrainGrid.Vertices[currIndex + 1].subtract(thisTerrainGrid.Vertices[currIndex]);
                tempU = thisTerrainGrid.Vertices[currIndex + xVerts + 1].subtract(thisTerrainGrid.Vertices[currIndex]);

                var thisNX = (tempU.y * tempV.z) - (tempU.z * tempV.y);
                var thisNY = (tempU.z * tempV.x) - (tempU.x * tempV.z);
                var thisNZ = (tempU.x * tempV.y) - (tempU.y * tempV.x);

                thisTerrainGrid.Faces[iFaces] = {
                    A: currIndex,
                    B: currIndex + 1,
                    C: currIndex + 1 + xVerts,

                    NX: thisNX,
                    NY: thisNY,
                    NZ: thisNZ
                };
                iFaces++;


                //Lower triangles
                tempU = thisTerrainGrid.Vertices[currIndex + xVerts].subtract(thisTerrainGrid.Vertices[currIndex]);
                tempV = thisTerrainGrid.Vertices[currIndex + xVerts + 1].subtract(thisTerrainGrid.Vertices[currIndex]);

                var thisNX = (tempU.y * tempV.z) - (tempU.z * tempV.y);
                var thisNY = (tempU.z * tempV.x) - (tempU.x * tempV.z);
                var thisNZ = (tempU.x * tempV.y) - (tempU.y * tempV.x);

                thisTerrainGrid.Faces[iFaces] = {
                    A: currIndex,
                    B: currIndex + xVerts,
                    C: currIndex + xVerts + 1,

                    NX: thisNX,
                    NY: thisNY,
                    NZ: thisNZ
                };
                iFaces++;
            }

            // OPPOSITE-PARITY VERTICES
            else if ((iZ % 2 == 1 && iX % 2 == 0) || (iZ % 2 == 0 && iX % 2 == 1)){
                // Upper triangles
                tempV = thisTerrainGrid.Vertices[currIndex + 1].subtract(thisTerrainGrid.Vertices[currIndex]);
                tempU = thisTerrainGrid.Vertices[currIndex + xVerts].subtract(thisTerrainGrid.Vertices[currIndex]);

                var thisNX = (tempU.y * tempV.z) - (tempU.z * tempV.y);
                var thisNY = (tempU.z * tempV.x) - (tempU.x * tempV.z);
                var thisNZ = (tempU.x * tempV.y) - (tempU.y * tempV.x);

                thisTerrainGrid.Faces[iFaces] = {
                    A: currIndex,
                    B: currIndex + 1,
                    C: currIndex + xVerts,

                    NX: thisNX,
                    NY: thisNY,
                    NZ: thisNZ
                };
                iFaces++;


                //Lower triangles
                tempU = thisTerrainGrid.Vertices[currIndex + xVerts].subtract(thisTerrainGrid.Vertices[currIndex + 1]);
                tempV = thisTerrainGrid.Vertices[currIndex + xVerts + 1].subtract(thisTerrainGrid.Vertices[currIndex + 1]);

                var thisNX = (tempU.y * tempV.z) - (tempU.z * tempV.y);
                var thisNY = (tempU.z * tempV.x) - (tempU.x * tempV.z);
                var thisNZ = (tempU.x * tempV.y) - (tempU.y * tempV.x);

                thisTerrainGrid.Faces[iFaces] = {
                    A: currIndex + 1,
                    B: currIndex + xVerts,
                    C: currIndex + xVerts + 1,

                    NX: thisNX,
                    NY: thisNY,
                    NZ: thisNZ
                };
                iFaces++;
            }
        }
    }

    thisTerrainGrid.Position = new BABYLON.Vector3(0, 0, 0);
    thisTerrainGrid.Rotation = new BABYLON.Vector3(0, 0, 0);

    meshes.push(thisTerrainGrid);

    return thisTerrainGrid;
}


var cosOffset = Math.PI / 2;
function newTerrainGridSin(name, xWidth, zWidth, xDetail, zDetail, height, numWaves, offset, faceColor, wireColor = black, wireShader = 0) {
    var xVerts = xDetail + 1;
    var zVerts = zDetail + 1;
    var thisTerrainGrid;
    thisTerrainGrid = new SoftEngine.Mesh(name, (xVerts) * (zVerts), xDetail * zDetail * 2, faceColor, wireColor, wireShader);

    // GENERATE VERTICES
    for (var iZ = 0; iZ < zVerts; iZ++) {
        for (var iX = 0; iX < xVerts; iX++) {
            var tempX = (iX / xDetail) * xWidth - ((xWidth) / 2);
            var tempY = height * Math.sin((iX / xDetail) * numWaves * Math.PI * 2 + offset);
            var tempZ = (iZ / zDetail) * zWidth - ((zWidth) / 2);

            var currIndex = (iZ * xVerts) + iX;
            thisTerrainGrid.Vertices[currIndex] = new BABYLON.Vector3(tempX, tempY, tempZ);
        }
    }

    // GENERATE FACES FROM VERTICES
    var iFaces = 0;
    for (var iZ = 0; iZ < zDetail; iZ++) {
        for (var iX = 0; iX < xDetail; iX++) {

            var currIndex = (iZ * xVerts) + iX;


            // Upper triangles
            var tempV = thisTerrainGrid.Vertices[currIndex + 1].subtract(thisTerrainGrid.Vertices[currIndex]);
            var tempU = thisTerrainGrid.Vertices[currIndex + xVerts + 1].subtract(thisTerrainGrid.Vertices[currIndex]);

            var thisNX = (tempU.y * tempV.z) - (tempU.z * tempV.y);
            var thisNY = (tempU.z * tempV.x) - (tempU.x * tempV.z);
            var thisNZ = (tempU.x * tempV.y) - (tempU.y * tempV.x);

            thisTerrainGrid.Faces[iFaces] = {
                A: currIndex,
                B: currIndex + 1,
                C: currIndex + 1 + xVerts,

                NX: thisNX,
                NY: thisNY,
                NZ: thisNZ
            };
            iFaces++;


            //Lower triangles
            var tempU = thisTerrainGrid.Vertices[currIndex + xVerts].subtract(thisTerrainGrid.Vertices[currIndex]);
            var tempV = thisTerrainGrid.Vertices[currIndex + xVerts + 1].subtract(thisTerrainGrid.Vertices[currIndex]);

            var thisNX = (tempU.y * tempV.z) - (tempU.z * tempV.y);
            var thisNY = (tempU.z * tempV.x) - (tempU.x * tempV.z);
            var thisNZ = (tempU.x * tempV.y) - (tempU.y * tempV.x);

            thisTerrainGrid.Faces[iFaces] = {
                A: currIndex,
                B: currIndex + xVerts,
                C: currIndex + xVerts + 1,

                NX: thisNX,
                NY: thisNY,
                NZ: thisNZ
            };
            iFaces++;
        }
    }

    thisTerrainGrid.Position = new BABYLON.Vector3(0, 0, 0);
    thisTerrainGrid.Rotation = new BABYLON.Vector3(0, 0, 0);

    meshes.push(thisTerrainGrid);

    return thisTerrainGrid;
}