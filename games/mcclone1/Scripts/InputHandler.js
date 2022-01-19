var spaceDown = false;
var wDown = false;
var aDown = false;
var sDown = false;
var dDown = false;
var qDown = false;
var eDown = false;
var rDown = false;

var leftMouseDown = false;
var middleMouseDown = false;
var rightMouseDown = false;
var m_deltaX = 0;
var m_deltaY = 0;

var showCursor = true;

window.addEventListener("keydown", function (event) {
    if (event.defaultPrevented) {
        return; // Do nothing if the event was already processed
    }

    switch (event.key) {
        case ' ':
            spaceDown = true;
            break;
        case 'w':
            wDown = true;
            break;
        case 'a':
            aDown = true;
            break;
        case 's':
            sDown = true;
            break;
        case 'd':
            dDown = true;
            break;
        case 'q':
            qDown = true;
            break;
        case 'e':
            eDown = true;
            break;
        case 'r':
            rDown = true;
            break;
		case ',':
            CycleSelectedBlock(-1);
            break;
		case '.':
            CycleSelectedBlock(1);
            break;

        default:
            return; // Quit when this doesn't handle the key event.
    }

    // Cancel the default action to avoid it being handled twice
    if (document.pointerLockElement === document.body) {
        event.preventDefault();
    }
}, true);

window.addEventListener("keyup", function (event) {
    if (event.defaultPrevented) {
        return; // Do nothing if the event was already processed
    }



    switch (event.key) {
        case ' ':
            spaceDown = false;
            break;
        case 'w':
            wDown = false;
            break;
        case 'a':
            aDown = false;
            break;
        case 's':
            sDown = false;
            break;
        case 'd':
            dDown = false;
            break;
        case 'q':
            qDown = false;
            break;
        case 'e':
            eDown = false;
            break;
        case 'r':
            rDown = false;
            break;

        default:
            return; // Quit when this doesn't handle the key event.
    }

    // Cancel the default action if pointer is hidden and the player is playing the game
    if (document.pointerLockElement === document.body) {
        event.preventDefault();
    }
}, true);


window.addEventListener("mousedown", function (event) {
    if (event.defaultPrevented) {
        return; // Do nothing if the event was already processed
    }

    //if left click
    if (event.button == 0) {
        leftMouseDown = true;

        if (event.target === document.getElementById("frontBuffer")) { //(document.pointerLockElement !== document.getElementById("frontBuffer")) {
            document.body.requestPointerLock();
            showCursor = false;
        }
        // Cancel the default action to avoid it being handled twice
        //event.preventDefault();
    }

    //if middle click
    if (event.button == 1) {
        middleMouseDown = true;
        
        // Cancel the default action to avoid it being handled twice
        event.preventDefault();
    }

    //if right click
    if (event.button == 2) {
        rightMouseDown = true;

        // Cancel the default action to avoid it being handled twice
        event.preventDefault();
    }
}, true);

window.addEventListener("mousemove", function (event) {
    if (event.defaultPrevented) {
        return; // Do nothing if the event was already processed
    }

    if (Math.abs(event.movementX) > 1 || Math.abs(event.movementY) > 1) {
        m_deltaX = event.movementX;
        m_deltaY = event.movementY;
    }


    // Cancel the default action to avoid it being handled twice
    event.preventDefault();
}, true);

window.addEventListener("mouseup", function (event) {
    if (event.defaultPrevented) {
        return; // Do nothing if the event was already processed
    }

    //if left click
    if (event.button == 0) {
        leftMouseDown = false;

        // Cancel the default action to avoid it being handled twice
        event.preventDefault();
    }

    //if middle click
    if (event.button == 1) {
        middleMouseDown = false;

        // Cancel the default action to avoid it being handled twice
        event.preventDefault();
    }

    //if right click
    if (event.button == 2) {
        rightMouseDown = false;

        // Cancel the default action to avoid it being handled twice
        event.preventDefault();
    }
}, true);

// Disable right-click menu popup
document.addEventListener("contextmenu", function (event) {
    event.preventDefault();
}, false);