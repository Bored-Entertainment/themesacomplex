
FIELD_OFFSET_X = 180;
FIELD_OFFSET_Y = 12;

function TetrisControl() {
    var tetris = new Tetris(this);

    this.setup = function () {
	tetris.setup();
    };
    this.update = function () {
	tetris.update();
    };
    this.draw = function () {
	tetris.draw();
    };

    this.restart = function() {
	// create a new Tetris object
	tetris = new Tetris(this);

	// emulate an initial setup condition and the first loop
	tetris.setup();
	tetris.update();
    };
}

function Tetris(controller) {
    var background = null,
    game = null,
    timeOffset = 0,

    lastEscapeState = false,
    startPauseTime = 0,
    paused = false,
    lastPaused = false,

    gameOver = false,

    mouseClick = null,

    self = this,

    continueButton = null,
    restartButton = null,

    lastTime = null,
    dTime = null,

    gameEndTty = new TtyBlock('gameEndDiv', 10, 20, 1);
    

    this.setup = function () {
	// find the keys to stop	
	var stoppedKeys = [],
	curAction, i;
	for (curAction in inputAssignments) {
	    stoppedKeys = stoppedKeys.concat(inputAssignments[curAction]);
	}
	jaws.preventDefaultKeys(stoppedKeys);


	Tetris.currentInstance = self;
	game = new Game(inputAssignments, autoRepeatConfig, thresholdConfig);

	continueButton = new Button({image: 'img/buttons/continue.png', x: 250, y: 150});
	restartButton = new Button({image: 'img/buttons/restart.png', x: 250, y: 200});
	
	background = new Background();

	timeOffset = (new Date()).getTime();
    };

    this.update = function() {
	var realTime = (new Date()).getTime(),
	escapePressed = jaws.pressed('esc'),
	scoreObject;

	if (lastTime === null) {
	    dTime = 0;
	    lastTime = realTime;
	} else {
	    dTime = realTime - lastTime;
	    lastTime = realTime;
	}
	
	if (!paused && !gameOver) {
	    // see if the game should be pased
	    if (escapePressed && (!lastEscapeState)) {
		// go into pause mode
		startPauseTime = realTime;
		paused = true;
	    } else {
		game.update(realTime - timeOffset);
		// see if the game is over
		scoreObject = game.getResults();
		if (scoreObject) {
		    gameOver = true;

		    // make the game end visible
		    document.getElementById('gameEndContainer').setAttribute('class', 'gameEndOutputVisible');
		    gameEndTty.addLine('GOOD GAME!!!');
		    gameEndTty.addLine('');
		    gameEndTty.addLine('');
		    if (scoreObject.won) {
			gameEndTty.addLine('You Win!');
		    } else {
			gameEndTty.addLine('Better Luck Next Time');
		    }
		    gameEndTty.addLine('');
		    gameEndTty.addLine('');
		    gameEndTty.addLine('Re-directing you to');
		    gameEndTty.addLine('the score screen...');
		    gameEndTty.addLine('');
		    gameEndTty.addLine('');

		    sendScoreRequest(scoreObject.score);
		}
	    }
	} else if (paused) {
	    // see if the escape key was hit
	    if (escapePressed && (!lastEscapeState)) {
		// change the time offset
		timeOffset += realTime - startPauseTime;
		paused = false;
	    }
	    // see if any buttons were pressed
	    if (mouseClick) {
		if (continueButton.isClicked(mouseClick.x, mouseClick.y)) {
		    // change the time offset
		    timeOffset += realTime - startPauseTime;
		    paused = false;
		}
		if (restartButton.isClicked(mouseClick.x, mouseClick.y)) {
		    // restart the game
		    controller.restart();
		    return;
		}
	    }
	} else {
	    // TODO: nothing???
	}
	
	lastEscapeState = escapePressed;
	mouseClick = null;
    };

    this.draw = function() {

	if (!paused && !gameOver) {

	    // draw the game
	    background.draw(lastPaused);
	    if (lastPaused) {
		lastPaused = false;
		Block.invalidateAll();
	    }
	    game.draw(dTime);
	    Block.invalidFlushed();

	} else if (paused) {
	    // draw the game
	    background.draw();
	    game.draw(dTime);

	    //draw the pause menu
	    continueButton.draw();
	    restartButton.draw();
	    lastPaused = true;
	} else {
	    // continue to draw the game for game over
	    // draw the game
	    background.draw();
	    game.draw(dTime);
	}

	gameEndTty.draw(dTime);
    };
    
    this.mouseClicked = function(x, y) {
	mouseClick = {x: x, y: y};
    };
}

window.onload = function () {
    loadGameControls();

    jaws.assets.add('img/blueblock.png');
    jaws.assets.add('img/cyanblock.png');
    jaws.assets.add('img/greenblock.png');
    jaws.assets.add('img/orangeblock.png');
    jaws.assets.add('img/purpleblock.png');
    jaws.assets.add('img/redblock.png');
    jaws.assets.add('img/yellowblock.png');

    jaws.assets.add('img/greyblock.png');
    jaws.assets.add('img/emptyblock.png');

    jaws.assets.add('img/buttons/continue.png');
    jaws.assets.add('img/buttons/restart.png');

    jaws.assets.add('img/background/backdrop.png');
    jaws.assets.add('img/background/topbar.png');

    jaws.start(TetrisControl);
};

var redirCode;

function redirectToScore() {
    window.location.replace('/scoreScreen.html?tempRef=' + redirCode);
}

function sendScoreRequest(score) {
    var xmlhttp;
    if (window.XMLHttpRequest)
    {// code for IE7+, Firefox, Chrome, Opera, Safari
	xmlhttp=new XMLHttpRequest();
    }
    else
    {// code for IE6, IE5
	xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
    }
    xmlhttp.onreadystatechange=function()
    {
	if (xmlhttp.readyState==4 && xmlhttp.status==200)
	{
	    redirCode = xmlhttp.responseText;

	    setTimeout('redirectToScore();', 4000);
	}
    }
    
    // World's 3rd most piss-poor obfustication technique
    // A serious real-time/replay game monitor is needed
    xmlhttp.open("POST", "/score/reportScore?gthbyu="+(score*17), true);
    xmlhttp.send();
}
