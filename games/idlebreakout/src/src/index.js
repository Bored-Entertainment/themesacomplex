require('pixi.js');
require('p2');
require('phaser');

var ball;
var paddle;
var bricks;
const getInitialBrickSet = () => {
    let brickSet =  [];
    for (var y = 0; y < 6; y++)
    {
        let row = [];
        for (var x = 0; x < 15; x++)
        {
            row.push(1);
        }
        brickSet.push(row);
    }
    return brickSet;
}
var brickSet = getInitialBrickSet();
var liveBricks = [];

var ballOnPaddle = true;

var score = 0;

var ballInitialVelocity = 500;
var ballVelocity = ballInitialVelocity;

//medium ball and paddle
var ballRebound = 1.001;
var maxPaddleSpeed = 10;
var paddleAcceleration = 1;
var paddleDeceleration = 5;

//medium ball and paddle
// var ballRebound = 1.001;
// var maxPaddleSpeed = 300;
// var paddleAcceleration = 40;
// var paddleDeceleration = 100;

// very fast ball and ball
// var ballRebound = 1.05;
// var maxPaddleSpeed = 30000;
// var paddleAcceleration = 5000;
// var paddleDeceleration = 5000;

var scoreText;
var introText;

var brickTimer;
var brickDelay = 5;
var brickHeight = 52;
var brickDropHeight = 10;
var brickStartHeight = 100;
var resetBricks = false;

const preload = () => {
    game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    game.stage.backgroundColor = '#eee';

     game.load.atlas('breakout', 'img/breakout.png', 'img/breakout.json');

}
const create = () => {
    game.physics.startSystem(Phaser.Physics.ARCADE);
    game.physics.arcade.checkCollision.down = false;

    bricks = game.add.group();
    bricks.enableBody = true;
    bricks.physicsBodyType = Phaser.Physics.ARCADE;

    var brick;
    brickSet.forEach((row, y) => {
        row.forEach((space, x) => {
            brick = bricks.create(120 + (x * 36), brickStartHeight - (y * brickHeight), 'breakout', `brick_${space}_1.png`);
            brick.level = space;
            brick.body.bounce.set(1);
            brick.body.immovable = true;
            brick.indexX = x;
            brick.indexY = y;
            brick.originalY = y;
            liveBricks[y] = liveBricks[y] || [];
            liveBricks[y][x] = brick;
            brick.inputEnabled = true;
            brick.events.onInputDown.add(brickClick, this);
        })
    });
    brickTimer = game.time.events.loop(Phaser.Timer.SECOND * brickDelay, dropBricks, this);

    paddle = game.add.sprite(game.world.centerX, 500, 'breakout', 'paddle_big.png');
    paddle.anchor.setTo(0.5, 0.5);
    // paddle.scale.x = 3;
    // paddle.scale.y = 8;
    game.physics.enable(paddle, Phaser.Physics.ARCADE);
    paddle.body.setSize(48,200);
    paddle.body.collideWorldBounds = false;
    paddle.body.bounce.set(1);
    paddle.body.immovable = true;
    paddle.currentVelocity = 0;

    ball = game.add.sprite(game.world.centerX, paddle.y - 16, 'breakout', 'ball_1.png');
    ball.anchor.set(0.5);
    ball.checkWorldBounds = true;
    game.physics.enable(ball, Phaser.Physics.ARCADE);
    ball.body.collideWorldBounds = true;
    ball.body.bounce.set(1);
    // ball.body.maxVelocity.x = 1000;
    // ball.body.maxVelocity.y = 1000;
    ball.velX = () => {
         return ball.x - ball.lastX;
     };
     ball.needsRotation = false;
     ball.needsVelocity = false;

    ball.animations.add('spin', [ 'ball_1.png', 'ball_2.png', 'ball_3.png', 'ball_4.png', 'ball_5.png' ], 50, true, false);

    ball.events.onOutOfBounds.add(ballLost, this);

    scoreText = game.add.text(32, 550, 'score: 0', { font: "20px Arial", fill: "#ffffff", align: "left" });
    introText = game.add.text(game.world.centerX, 400, '- click to start -', { font: "40px Arial", fill: "#ffffff", align: "center" });
    introText.anchor.setTo(0.5, 0.5);

    game.input.onDown.add(releaseBall, this);
}

const paddleUnderBall = () => {
    return ball.x >= paddle.left && ball.x <= paddle.right
}

const ballLeftOfPaddle = () => {
    return ball.x < paddle.left
}

const ballRightOfPaddle = () => {
    return ball.x > paddle.right
}

const paddleGoingLeft = () => {
    return paddle.currentVelocity < 0;
}

const paddleGoingRight = () => {
    return paddle.currentVelocity > 0;
}

const ballGoingLeft = () => {
    return ball.body.velocity.x < 0;
}

const ballGoingRight = () => {
    return ball.body.velocity.x > 0;
}

const ballDistanceLeft = () => {
    // returning a negative number on purpose
    return ball.x - paddle.x + (paddle.width / 4);
}

const ballDistanceRight = () => {
    // returning a negative number on purpose
    return ball.x - paddle.x - (paddle.width / 4);
}

const paddleAccelerateRight = () => {
    paddle.currentVelocity = paddle.currentVelocity + paddleAcceleration;
    if (paddle.currentVelocity > maxPaddleSpeed) {
        // going faster than it can
        paddle.currentVelocity = maxPaddleSpeed;
    }
}

const paddleAccelerateLeft = () => {
    paddle.currentVelocity = paddle.currentVelocity - paddleAcceleration;
    if (paddle.currentVelocity > (maxPaddleSpeed * -1)) {
        // going faster than it can
        paddle.currentVelocity = maxPaddleSpeed * -1;
    }
    let desiredDistance = ballDistanceRight() + ball.velX();
    if (paddle.currentVelocity < desiredDistance) {
        //going faster than the paddle now
        paddle.currentVelocity = desiredDistance;
    }
}

const paddleDecelerateRight = () => {
    paddle.currentVelocity = paddle.currentVelocity - paddleDeceleration;
    if (paddle.currentVelocity < 0) {
        paddle.currentVelocity = 0;
    }
}

const paddleDecelerateLeft = () => {
    paddle.currentVelocity = paddle.currentVelocity + paddleDeceleration;
    if (paddle.currentVelocity > 0) {
        paddle.currentVelocity = 0;
    }
}

const dropBricks = () => {
    if (!ballOnPaddle) {
        bricks.y = bricks.y + brickDropHeight;
    }
}

const update = () => {
    if (!ballOnPaddle) {

        if (ballGoingRight()) {
            //paddle is to the left of the ball, go faster
            if (ballDistanceRight() > 0) {
                paddleAccelerateRight();
                let desiredDistance = ballDistanceRight() + ball.velX();
                if (paddle.currentVelocity > desiredDistance) {
                    //going faster than the paddle now
                    paddle.currentVelocity = desiredDistance;
                }
            } else if (ballDistanceLeft() < 0) {
                if (paddle.currentVelocity < 0) {
                    // paddle is going left, decelerate
                    paddleDecelerateLeft();
                } else {
                    // ball is to the right of the paddle, but heading back towards it
                    // the paddle should just wait?
                }

            }
            else {
                if (paddle.currentVelocity < ball.velX()) {
                    // paddle is right under the ball, but going too slow
                    paddleAccelerateRight()
                    if (paddle.currentVelocity > ball.velX()) {
                        paddle.currentVelocity = ball.velX()
                    }

                } else if (paddle.currentVelocity > ball.velX()) {
                    // paddle is right under the ball, but going too fast
                    paddleDecelerateRight();
                    if (paddle.currentVelocity < ball.velX()) {
                        paddle.currentVelocity = ball.velX()
                    }
                }
            }
        } else if (ballGoingLeft()) {//paddle is to the left of the ball, go faster
            if (ballDistanceLeft() < 0) {
                paddleAccelerateLeft();
                let desiredDistance = ballDistanceLeft() + ball.velX();
                if (paddle.currentVelocity < desiredDistance) {
                    //going faster than the paddle now
                    paddle.currentVelocity = desiredDistance;
                }
            } else if (ballDistanceRight() > 0) {
                if (paddle.currentVelocity > 0) {
                    // paddle is going left, decelerate
                    paddleDecelerateRight();
                } else {
                    // wait?
                }

            }
            else {
                if (paddle.currentVelocity > ball.velX()) {
                    // paddle is right under the ball, but going too slow
                    paddleAccelerateLeft()
                    if (paddle.currentVelocity < ball.velX()) {
                        paddle.currentVelocity = ball.velX()
                    }

                } else if (paddle.currentVelocity < ball.velX()) {
                    // paddle is right under the ball, but going too fast
                    paddleDecelerateLeft();
                    if (paddle.currentVelocity > ball.velX()) {
                        paddle.currentVelocity = ball.velX()
                    }
                }
            }
        }
        paddle.x = paddle.x + paddle.currentVelocity;

        // if(ballGoingLeft()) {
        //     paddle.x = ball.x + ballXDistance - 15;
        // } else if (ballGoingRight()) {
        //     paddle.x = ball.x + ballXDistance + 15;
        // }
        // let destination = ball.x;
        // // if the ball is over the paddle, don't do anything, maybe add deceleration.
        // if (paddleUnderBall()) {
        //
        //     if(ballGoingLeft() && paddle.velX() < ball.velX()) {
        //         // paddle has caught up to the ball but is now going too fast
        //         paddle.currentVelocity = paddle.currentVelocity + paddleDeceleration;
        //         if (paddle.velX() > ball.velX()) {
        //             paddle.currentVelocity = ball.velX()
        //         }
        //     } else if (ballGoingRight() && paddle.velX() > ball.velX()) {
        //         // paddle has caught up to the ball but is now going too fast
        //         paddle.currentVelocity = paddle.currentVelocity - paddleDeceleration;
        //         if (paddle.velX() < ball.velX()) {
        //             paddle.currentVelocity = ball.velX()
        //         }
        //     }
        //     paddle.x = paddle.x + paddle.currentVelocity
        // } else if (ballLeftOfPaddle()) {
        //     // paddle is to the right of the ball
        //     if (paddleGoingRight()) {
        //         // going the wrong way
        //         // if (paddle.body.velocity.x < paddleDeceleration) {
        //         paddle.currentVelocity = paddle.currentVelocity - paddleDeceleration
        //         if (paddle.currentVelocity < ballXDistance) {
        //             paddle.currentVelocity = ballXDistance;
        //         }
        //         paddle.x = paddle.x + paddle.currentVelocity;
        //         // } else {
        //         //     paddle.body.velocity.x = 0;
        //         // }
        //     } else if (paddle.currentVelocity > (maxPaddleSpeed * -1)) {
        //         // need to check is the new velocity is going to put the paddle too far past the ball
        //         // used in cases of a very high acceleration
        //         let acceleration = paddleAcceleration;
        //         paddle.currentVelocity = paddle.currentVelocity - paddleAcceleration;
        //         if (paddle.currentVelocity < maxPaddleSpeed * -1) {
        //             paddle.currentVelocity = maxPaddleSpeed
        //         }
        //         //don't accelerate much past the speed of the ball
        //         if(paddle.currentVelocity < ballDistanceLeft() + ballXDistance) {
        //             paddle.currentVelocity = ballDistanceLeft() + ballXDistance;
        //         }
        //         paddle.x = paddle.x + paddle.currentVelocity;
        //
        //         // }
        //     }
        // } else if (ballRightOfPaddle()) {
        //     // paddle is to the left of the ball
        //     if (paddleGoingLeft()) {
        //         // going the wrong way
        //         paddle.currentVelocity = paddle.currentVelocity + paddleDeceleration
        //         if (paddle.currentVelocity > ballXDistance) {
        //             paddle.currentVelocity = ballXDistance;
        //         }
        //         paddle.x = paddle.x + paddle.currentVelocity;
        //
        //     } else if (paddle.currentVelocity < maxPaddleSpeed) {
        //         // need to check is the new velocity is going to put the paddle too far past the ball
        //         // used in cases of a very high acceleration
        //         let acceleration = paddleAcceleration;
        //         paddle.currentVelocity = paddle.currentVelocity + paddleAcceleration;
        //         if (paddle.currentVelocity > maxPaddleSpeed) {
        //             paddle.currentVelocity = maxPaddleSpeed
        //         }
        //         //don't accelerate much past the speed of the ball
        //         if(paddle.currentVelocity > ballDistanceLeft() + ballXDistance) {
        //             paddle.currentVelocity = ballDistanceLeft() + ballXDistance;
        //         }
        //         paddle.x = paddle.x + paddle.currentVelocity;
        //
        //     }
        //
        // }

        // let distance = Math.abs(destination - paddle.x);
        // let direction = 1;
        // if (destination < paddle.x) {
        //     direction = -1;
        // }
        // if (distance > maxPaddleSpeed) {
        //     distance = maxPaddleSpeed;
        // }
        // paddle.x = paddle.x + (distance * direction);
    // let destination = ball.x;
    // if (destination >= paddle.left && destination <= paddle.right) {
    // } else {
    //     if (destination < paddle.left) {
    //         destination += paddle.width / 2;
    //     } else if (destination > paddle.right) {
    //         destination -= paddle.width / 2;
    //     }
    //     if ((paddle.x < ball.x && paddle.body.velocity.x < 0) || (paddle.x > ball.x && paddle.body.velocity.x > 0)) {
    //         game.physics.arcade.accelerateToXY(paddle, destination, paddle.y,2000,500,0);
    //     } else {
    //         game.physics.arcade.accelerateToXY(paddle, destination, paddle.y,500,500,0);
    //     }
    // }

    } else  {
        paddle.x = game.input.x;
    }

    // keep in bounds of the level
    if (paddle.x < 24)
    {
        paddle.x = 24;
        paddle.body.velocity.x = 0;
    }
    else if (paddle.x > game.width - 24)
    {
        paddle.x = game.width - 24;
        paddle.body.velocity.x = 0;
    }

    ball.lastX = ball.x;

    if (ball.needsVelocity) {
        ballVelocity = ballVelocity * ballRebound;

        game.physics.arcade.velocityFromRotation(ball.body.angle, ballVelocity, ball.body.velocity);
        ball.needsVelocity = false;
    }

    if (ball.needsRotation !== false) {

        var diff = ball.needsRotation
        if (Math.floor(Math.abs(diff)) < 3) {
            diff = getRandomInt(-20,20);
        }
        game.physics.arcade.velocityFromRotation(ball.body.angle + (diff / 1000), ballVelocity, ball.body.velocity);
        ball.needsRotation = false;
    }

    if (resetBricks) {
        // bricks.children.forEach((brick) => {
        //     brick.y = brick.destinationY;
        // });
        // resetBricks = false;
    } else {
        bricks.children.forEach((brick) => {
            if (brick.y < brick.destinationY) {
                brick.y += 5;
                if (brick.y > brick.destinationY) {
                    brick.y = brick.destinationY;
                }
            }
        });
    }

    if (ballOnPaddle)
    {
        ball.x = paddle.x;
        ball.lastX = paddle.x;
    }
    else
    {
        game.physics.arcade.collide(ball, paddle, ballHitPaddle, null, this);
        game.physics.arcade.collide(ball, bricks, ballHitBrick, null, this);
    }
}

const ballLost = () => {

    resetLevel();

}

const releaseBall = () => {

    if (ballOnPaddle)
    {
        ballOnPaddle = false;
        // randomAngle = getRandomInt(-135,-105);
        // if(getRandomInt(0,1) === 1) {
            randomAngle = getRandomInt(-15,-45);
        // }
        game.physics.arcade.velocityFromAngle(randomAngle, ballVelocity, ball.body.velocity);
        ball.animations.play('spin');
        introText.visible = false;
    }

}

const brickClick = (_brick) => {
    brickKilled(_brick);
}

const ballHitBrick = (_ball, _brick) => {

    _ball.needsVelocity = true;

    brickKilled(_brick);

}

const brickKilled = (_brick) => {
    _brick.kill();

    score += _brick.level * 1;

    scoreText.text = 'score: ' + score;

    //  Are they any bricks left?
    if (bricks.countLiving() == 0)
    {
        //  New level starts
        score += 1000;
        scoreText.text = 'score: ' + score;

        resetLevel();
    }
    let deadRow = false;
    let newBricks = [];
    liveBricks.forEach((row, y) => {
        if (y < _brick.indexY) {
            newBricks[y] = row;
        } else if (y === _brick.indexY) {
            let liveCells = row.filter((brick, x) => {
                return brick.alive === true;
            });
            if (liveCells.length === 0) {
                deadRow = true;
            }
        } else if (y > _brick.indexY && deadRow) {
            newBricks[y - 1] = row;
            newBricks[y - 1].forEach((brick, x) => {
                brick.indexY--;
                if(_brick.indexY > 0) {
                    brick.destinationY = brick.y + brickHeight;
                }
                newBricks[y - 1][x] = brick;
            });
        }
    });
    if (deadRow) {
        liveBricks = newBricks;
    }
}

const ballHitPaddle = (_ball, _paddle) => {

    var diff = _ball.x - _paddle.x;
    ball.needsRotation = diff;
}

const resetLevel = () => {
    paddle.x = game.world.centerX
    paddle.y = 500
    paddle.body.velocity.x = 0;

    ball.x = game.world.centerX
    ball.y =  paddle.y - 16;

    ballVelocity = ballInitialVelocity;
    randomAngle = getRandomInt(-135,-105);
    if(getRandomInt(0,1) === 1) {
        randomAngle = getRandomInt(-15,-45)
    }
    game.physics.arcade.velocityFromAngle(randomAngle, ballVelocity, ball.body.velocity);

    //  And bring the bricks back from the dead :)
    bricks.callAll('revive');
    bricks.y = brickStartHeight;
    liveBricks = [];
    bricks.children.forEach((brick) => {
        brick.indexY = brick.originalY;
        brick.y = brickStartHeight - (brick.indexY * brickHeight);
        brick.destinationY = brick.y;
        liveBricks[brick.indexY] = liveBricks[brick.indexY] || [];
        liveBricks[brick.indexY][brick.indexX] = brick;
    });
    resetBricks = true;

}

const getRandomInt = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

const render = () => {
    // game.debug.body(ball);
    // game.debug.body(paddle);
}

var game = new Phaser.Game(800, 600, Phaser.ScaleManager.SHOW_ALL, 'game-container', {
  preload: preload, create: create, update: update, render: render
});
