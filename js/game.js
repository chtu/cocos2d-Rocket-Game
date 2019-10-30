var maze;
var scale = 2;
const TIME_BETWEEN_BLOCKS = 0.5;
const ROTATION_TIME = 0.10;


var windowSize;
var startingX, startingY;
var tileWidth, tileHeight;
var numCols, numRows;
var initialized = false;

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
		for (let i = 0; i < solutionCoordinates.length; i++) {
			let nextIndexes = solutionCoordinates[i];
			let newPos = getPosition(nextIndexes[0], nextIndexes[1]);
			let spriteAction = new cc.MoveBy(5, cc.p(500, 0));
			rocket.runAction(spriteAction);

			break;
		}
*/

function startAnimation(sprite, directions, obj) {
	move(sprite, directions, obj);
}

function move(sprite, directions, obj) {
	let currentDirection = directions[0];
	let x = 0;
	let y = 0;
	let spriteRotation;

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
/*
		var tile = cc.Sprite.create("images/wood.png");
		tile.setPosition(size.width / 2, size.height / 2);
		tile.setScale(1.5);
		this.addChild(tile, 0);
		*/

		// Set the tiles
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

		// Set the Walls
		const verticalWalls = maze.retrieveVerticalWalls();
		const horizontalWalls = maze.retrieveHorizontalWalls();
		console.log(verticalWalls);
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
/*
		var label = cc.LabelTTF.create("Hello World", "Arial", 40);
		label.setPosition(size.width / 2, size.height / 2);
		this.addChild(label, 1);
		*/
	},
	onEnter: function() {
		this._super();
		let size = cc.director.getWinSize();

		let rocket = cc.Sprite.create("images/rocket.png");
		let coord = getPosition(0, 0);
		rocket.setPosition(coord[0], coord[1]);
		rocket.setScale(scale/12); 
		this.addChild(rocket, 1);

		// Obtain the solutions and animate the sprite to follow
		// the solution path.
		const directions = maze.generateSolutionPath();
		console.log(directions);

		startAnimation(rocket, directions, this);
/*
		for (let i = 0; i < directions.length; i++) {
			let nextIndexes = directions[i];
			let newPos = getPosition(nextIndexes[0], nextIndexes[1]);
			let spriteAction = new cc.MoveBy(5, cc.p(500, 0));
			rocket.runAction(spriteAction);


			setTimeout()
		}
*/
	}
});


GameLayer.scene = function() {
	let scene = new cc.Scene();
	let layer = new GameLayer();
	scene.addChild(layer);
	return scene;
}

function runGame(mazeStr) {

	maze = new Map(mazeStr);

	cc.game.onStart = function () {
		// Load the resources
		cc.LoaderScene.preload(["images/wood.png", "images/rocket.png", "images/vert-wall.png", "images/h-wall.png"], function() {
			cc.director.runScene(GameLayer.scene());
		}, this);
	};

	cc.game.run("gameCanvas");

};