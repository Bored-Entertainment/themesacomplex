
function setupCamera(currCamera, pos, rot) {
    currCamera.Position = pos;
    currCamera.Rotation = new BABYLON.Vector3(0, 0, 0);
    currCamera.Target = new BABYLON.Vector3(pos.x, pos.y, pos.z - 1);

    deltaRotationY = rot.y;
    deltaRotationX = rot.x;
    currCamera.Rotation.y += rot.y;
    currCamera.Rotation.x += rot.x;
    rotateCamera(currCamera);
}

function firstPersonMovement() {
    //checks key and mouse inputs once per frame
    if (spaceDown == true) {
        playerVel.y = jumpSpeed;
    }

    if (wDown == true) {
        controlCamera(cam, "f", deltaTime);
    }
    if (aDown == true) {
        controlCamera(cam, "l", deltaTime);
    }
    if (sDown == true) {
        controlCamera(cam, "b", deltaTime);
    }
    if (dDown == true) {
        controlCamera(cam, "r", deltaTime);
    }
    if (eDown == true) {
        //controlCamera(cam, "up", deltaTime);
    }
    if (qDown == true) {
        //controlCamera(cam, "down", deltaTime);
    }
    
    // Rotate camera only if the user has activated mouse movement. Otherwise, let them control the cursor
    if (document.pointerLockElement === document.body) {
        prevRotationY = cam.Rotation.y;//.y - (cameraSensitivity * deltaTime);
        prevRotationX = cam.Rotation.x;
        prevRotationZ = cam.Rotation.z;

        cam.Rotation.y += cameraSensitivity * m_deltaX;
        cam.Rotation.x += cameraSensitivity * -m_deltaY;
        if (cam.Rotation.x > 1.57) {
            cam.Rotation.x = 1.57;
        }
        if (cam.Rotation.x < -1.57) {
            cam.Rotation.x = -1.57;
        }

        newRotationY = cam.Rotation.y;
        newRotationX = cam.Rotation.x;
        newRotationZ = cam.Rotation.z;

        deltaRotationY = newRotationY - prevRotationY;
        deltaRotationX = newRotationX - prevRotationX;
        deltaRotationZ = newRotationZ - prevRotationZ;

        rotateCamera(cam);
        
        m_deltaX = 0;
        m_deltaY = 0;
    }
}


function controlCamera(currCamera, direction, deltaTime) {
    var camPosition = currCamera.Position;
    var camTarget = currCamera.Target;
    var camDirection = camTarget.subtract(camPosition);
    camDirection.normalize();
    var velocity = playerSpeed * Math.min(0.05, deltaTime);

    
    var forwardVector = new BABYLON.Vector3(camDirection.x, 0, camDirection.z);
    forwardVector.normalize();
	
	var leftVector = new BABYLON.Vector3(-forwardVector.z, 0, forwardVector.x);
    var rightVector = new BABYLON.Vector3(forwardVector.z, 0, -forwardVector.x);
	
    var backwardVector = forwardVector.negate();


    var currVector;
    switch (direction) {
        case "f":
            currVector = forwardVector.scale(velocity);
            break;
        case "l":
            currVector = leftVector.scale(velocity);
            break;
        case "b":
            currVector = backwardVector.scale(velocity);
            break;
        case "r":
            currVector = rightVector.scale(velocity);
            break;
        case "up":
            currVector = new BABYLON.Vector3(0, 1, 0).scale(velocity);
            break;
        case "down":
            currVector = new BABYLON.Vector3(0, -1, 0).scale(velocity);
            break;
        default:
            currVector = BABYLON.Vector3.Zero;
            break;
    }

    //var deltaX = camDirection.x * velocity + direction.x;
    //var deltaY = camDirection.y * velocity + direction.y;
    //var deltaZ = camDirection.z * velocity + direction.z;

    currCamera.Position = new BABYLON.Vector3(camPosition.x + currVector.x, camPosition.y + currVector.y, camPosition.z + currVector.z);
    currCamera.Target = new BABYLON.Vector3(camTarget.x + currVector.x, camTarget.y + currVector.y, camTarget.z + currVector.z);
}

function rotateCamera(currCamera) {
    var camPosition = currCamera.Position;
    var camRotation = currCamera.Rotation;
    var camTarget = currCamera.Target;
    var camDirection = camTarget.subtract(camPosition);
    //camDirection.normalize();

    var rotationPitchMatrix = BABYLON.Matrix.RotationAxis(new BABYLON.Vector3(-camDirection.z, 0, camDirection.x), deltaRotationX);
    var rotationYawMatrix = BABYLON.Matrix.RotationY(deltaRotationY);
    //var rotationMatrix = BABYLON.Matrix.RotationYawPitchRoll(deltaRotationY, deltaRotationX, deltaRotationZ);
    var camRotVector = BABYLON.Vector3.TransformNormal(camDirection, rotationPitchMatrix.multiply(rotationYawMatrix));

    //document.getElementById("testStat").innerHTML = camRotVector.toString();

    currCamera.Target = camPosition.add(camRotVector);
}

function resetCamera(currCamera) {
    currCamera.Position = camInitPos;
    currCamera.Target = new BABYLON.Vector3(camInitPos.x, camInitPos.y, camInitPos.z - 1);
}


function moveCameraVector(currCamera, vect) {
    var camPosition = currCamera.Position;
    var camTarget = currCamera.Target;
    var camDirection = camTarget.subtract(camPosition);
    camDirection.normalize();

    currCamera.Position = new BABYLON.Vector3(camPosition.x + vect.x, camPosition.y + vect.y, camPosition.z + vect.z);
    currCamera.Target = new BABYLON.Vector3(camTarget.x + vect.x, camTarget.y + vect.y, camTarget.z + vect.z);
}

function moveCameraToPosition(currCamera, pos) {
    var camPosition = currCamera.Position;
    var camTarget = currCamera.Target;
    var camDirection = camTarget.subtract(camPosition);
    camDirection.normalize();

    currCamera.Position = pos;
    currCamera.Target = pos.add(camDirection);
}