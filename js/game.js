/*
The game runs from this file. It will automatically run as soon as a file is uploaded.
*/

// Global variables and constants
var maze;
var scale = 2;
const TIME_BETWEEN_BLOCKS = 0.5;
const ROTATION_TIME = 0.10;

var windowSize;
var startingX, startingY;
var tileWidth, tileHeight;
var numCols, numRows;
var initialized = false;

// Retrieves the position where the rocket should be placed
// when it begins.
function getPosition(xIndex, yIndex) {
	// Convert the y Index to start from the bottom instead.
	yIndex = numRows - yIndex;

	// Calculate the x position.
	let xPos = startingX + (tileWidth * xIndex);
	let yPos = startingY + (tileHeight * yIndex);

	newCoord = [xPos, yPos];
	return newCoord;
}

/*
This method will recursively move the sprite. Because the number
of moves is determined during runtime, each action will begin
after the previous action is scheduled to end.
*/
function move(sprite, directions, obj) {
	let currentDirection = directions[0];
	let x = 0;
	let y = 0;
	let spriteRotation;

	// Determine the current direction and rotation.
	if (currentDirection === "R") {
		x += tileWidth;
		spriteRotation = new cc.RotateTo(ROTATION_TIME, 90);
	} else if (currentDirection === "L") {
		x -= tileWidth;
		spriteRotation = new cc.RotateTo(ROTATION_TIME, 270);
	} else if (currentDirection === "U") {
		y += tileWidth;
		spriteRotation = new cc.RotateTo(ROTATION_TIME, 0);
	} else if (currentDirection === "D") {
		y -= tileWidth;
		spriteRotation = new cc.RotateTo(ROTATION_TIME, 180);
	}

	// Set a timer to run the next move.
	setTimeout(function() {
		let spriteAction = new cc.MoveBy(TIME_BETWEEN_BLOCKS, cc.p(x, y));
		sprite.runAction(spriteAction);
		sprite.runAction(spriteRotation);

		if (directions.length == 1)
			return
		else
			move(sprite, directions.splice(1, directions.length, obj));

	}, TIME_BETWEEN_BLOCKS * 1000);
}

// The game layer
var GameLayer = cc.Layer.extend({
	ctor: function() {
		this._super();
		this.init();
	},

	init: function() {
		this._super();
		size = cc.director.getWinSize();
		numRows = maze.getMaxRows();
		numCols = maze.getMaxCols();
		let centerX = size.width / 2;
		let centerY = size.height / 2;

		// Draw the tiles to the layer.
		for (let i = 0; i < maze.getMaxRows(); i++) {
			for (let j = 0; j < maze.getMaxCols(); j++) {
				let tile = cc.Sprite.create("images/wood.png");
				if (!initialized) {
					tileWidth = tile.getContentSize().width * scale;
					tileHeight = tile.getContentSize().height * scale;
					startingX = centerX - (tileWidth * (numCols-1) / 2);
					startingY = centerY - (tileHeight * (numCols-1) / 2);
					initialized = true;
				}

				let coord = getPosition(j, i);
				tile.setPosition(coord[0], coord[1]);
				tile.setScale(scale);
				this.addChild(tile, 0);
			}
		}

		// Draw all of the walls.
		// Retrieve the walls from the maze object.
		const verticalWalls = maze.retrieveVerticalWalls();
		const horizontalWalls = maze.retrieveHorizontalWalls();
		// Set the vertical walls.
		for (let i = 0; i < verticalWalls.length; i++) {
			for (let j = 0; j < verticalWalls[i].length; j++) {
				if (!verticalWalls[i][j]) {
					continue;
				}

				let vertWall = cc.Sprite.create("images/vert-wall.png");
				let xPos = startingX - (tileWidth/2) + (j * tileWidth);
				let yPos = startingY + ((numRows-i) * tileWidth);
				vertWall.setPosition(xPos, yPos);
				vertWall.setScale(scale);
				this.addChild(vertWall, 1);
			}
		}

		// Set the horizontal walls
		for (let i = 0; i < horizontalWalls.length; i++) {
			for (let j = 0; j < horizontalWalls[i].length; j++) {
				if (!horizontalWalls[i][j]) {
					continue;
				}

				let hWall = cc.Sprite.create("images/h-wall.png");
				let xPos = startingX + (j * tileWidth);
				let yPos = startingY + (tileWidth/2) + ((numRows-i) * tileWidth);
				hWall.setPosition(xPos, yPos);
				hWall.setScale(scale);
				this.addChild(hWall, 1);
			}
		}
	},
	onEnter: function() {
		this._super();
		let size = cc.director.getWinSize();

		// Draw the rocket starting at the 0,0 position.
		let rocket = cc.Sprite.create("images/rocket.png");
		let coord = getPosition(0, 0);
		rocket.setPosition(coord[0], coord[1]);
		rocket.setScale(scale/12); 
		this.addChild(rocket, 1);

		// Obtain the solutions and animate the sprite to follow
		// the solution path.
		const directions = maze.generateSolutionPath();
		move(rocket, directions, this);
	}
});


GameLayer.scene = function() {
	let scene = new cc.Scene();
	let layer = new GameLayer();
	scene.addChild(layer);
	return scene;
}

// This method will begin the game.
// loadGame.js sets this to run when a user has uploaded a
// maze file.
function runGame(mazeStr) {

	maze = new Maze(mazeStr);

	cc.game.onStart = function () {
		// Load the resources
		cc.LoaderScene.preload(["images/wood.png", "images/rocket.png", "images/vert-wall.png", "images/h-wall.png"], function() {
			cc.director.runScene(GameLayer.scene());
		}, this);
	};

	cc.game.run("gameCanvas");

};