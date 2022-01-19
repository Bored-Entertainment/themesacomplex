function applyGravity(g, deltaTime, terminalVel) {
    // Adds an acceleration to the player, capping vertical velocity at a given speed
    // Since downwards velocity is negative, max is used to determine the 'least negative' one
    //deltaTime = ClampValue(deltaTime, 0, 0.15)
    playerVel.y = Math.max(terminalVel, playerVel.y - (g * deltaTime));
}

function getNStep(vect, n) {
    nVect = vect.scale(1 / n);
    return nVect;
}

function circleSquareIntersect(circlePos, circleRad, squarePos, squareRad) {
    // circlePos and squarePos are Vector2s
    let closestX = ClampValue(circlePos.x, squarePos.x - squareRad, squarePos.x + squareRad);
    let closestY = ClampValue(circlePos.y, squarePos.y - squareRad, squarePos.y + squareRad);

    let xDist = closestX - circlePos.x;
    let yDist = closestY - circlePos.y;
    let distSquared = xDist * xDist + yDist * yDist;

    if (distSquared < circleRad * circleRad) {
        return true;
    }
    else {
        return false;
    }
}

