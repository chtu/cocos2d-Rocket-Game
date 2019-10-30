/*
The Maze class is will contain the map as read from the file.
There are two arrays, horizontalWalls and verticalWalls.
At any particular position, x and y, there will be a true/false
value in horizontalWalls and verticalWalls to determine which walls
are around that position.

                  horizontalWalls[y][x]
                      +------+
                      | pos: |
verticalWalls[y][x]   | x, y |   verticalWalls[y][x+1]
                      +------+
                  horizontalWalls[y+1][x]

Additionally, there is another 2D array to contain the general
layout of the map. This only contains boolean values to indicate
whether or not the space was already visited by the solution-generating
algorithm.
*/

class Maze {
	// Construct the Map object
	constructor(str) {
		// Get the maximum number of rows and columns
		this.maxRows = this.calculateMaxRows(str);
		this.maxCols = this.calculateMaxCols(str);

		// This is primarily to generate the solution.
		this.visitedCells = this.getInitialMaze();

		// Generate the walls to reference in the arrays.
		this.horizontalWalls = [];
		this.verticalWalls = [];
		this.generateWalls(str);
	}

	// This will initiate the horizontal and vertical walls.
	generateWalls(str) {
		let lines = str.split("\n");
		let map = []

		let row = 0;

		for (let i = 0; i < lines.length; i++) {
			let line = lines[i];
			if (line.trim() === "") {
				continue;
			}

			// If row is even, then that means this row in the
			// 2D array is going to be the horizontal walls.
			// Otherwise, it will be the vertical walls.
			if (row % 2 === 0) {
				this.horizontalWalls.push(this.getHorizontalWalls(line));
			} else {
				this.verticalWalls.push(this.getVerticalWalls(line));
			}

			row++;
		}
	}

	// Show the array of the current solution.
	// Primarily for debugging purposes.
	displaySolution() {
		let solution = this.generateSolutionPath();

		console.log(solution);
	}

	// Find a path that will take the rocket object from the top left
	// to the bottom right in the maze. This will be performed recursively,
	// continuously updating an array that serves as a record for previously
	// visited blocks.
	generateSolutionPath() {
		let startingCoord = new Array(2);
		startingCoord[0] = 0;
		startingCoord[1] = 0;
		let visitedBlocks = this.getInitialMaze();
		let fullDirections = [];
		visitedBlocks[startingCoord[1]][startingCoord[0]] = "0";

		let nextPossiblePaths = this.getPossiblePaths(startingCoord[0], startingCoord[1]);

		for (let i = 0; i < nextPossiblePaths.length; i++) {
			let nextCoord = nextPossiblePaths[i];
			if (this.visitBlock(visitedBlocks, startingCoord[0], startingCoord[1], nextCoord[0], nextCoord[1], fullDirections)) {
				break;
			}
		}
		return fullDirections;
	}

	// This method will return true if we have reached the final block.
	// if we have not reached the destination, then we will recursively call
	// this method on the next block. If there is no next block that
	// can be travelled to, then it will return false.
	visitBlock(visitedBlocks, previousX, previousY, currentX, currentY, fullDirections) {
		visitedBlocks[currentY][currentX] = "%";
		// Base case. If we return true, then that means we hit the solution.
		if ((currentX === this.maxCols-1) && (currentY === this.maxRows-1)) {
			visitedBlocks[currentY][currentX] = "0";
			let direction = this.getDirection(previousX, previousY, currentX, currentY)
			fullDirections.unshift(direction);
			return true;
		}

		let currentPossiblePaths = this.getPossiblePaths(currentX, currentY);

		for (let i = 0; i < currentPossiblePaths.length; i++) {
			let nextCoord = currentPossiblePaths[i];

			// Check to see if we already visited the path. If we did, then search the next
			// path.
			if (visitedBlocks[nextCoord[1]][nextCoord[0]] != "#")
				continue

			// This should only return true if the path ends up being the one that gets to the end.
			if (this.visitBlock(visitedBlocks, currentX, currentY, nextCoord[0], nextCoord[1], fullDirections)) {
				visitedBlocks[currentY][currentX] = "0";
				let direction = this.getDirection(previousX, previousY, currentX, currentY)
				fullDirections.unshift(direction);
				return true;
			}
		}

		// If the program reached this point, then that means there is no solution.
		visitedBlocks[currentY][currentX] = "X";
		return false;
	}

	// Based on the current coordinates, determine which direction the
	// rocket object can travel towards. The object can travel in any direction
	// where there aren't any walls.
	getPossiblePaths(currentX, currentY) {
		let possiblePaths = [];
		let coord;

		// Top wall is open.
		if (!this.horizontalWalls[currentY][currentX] && (currentY > 0)) {
			possiblePaths.push([currentX, currentY-1]);
		}
		// Bottom wall is open.
		if (!this.horizontalWalls[currentY+1][currentX] && (currentY < this.maxRows-1)) {
			possiblePaths.push([currentX, currentY+1]);
		}
		// Left wall is open.
		if (!this.verticalWalls[currentY][currentX] && (currentX > 0)) {
			possiblePaths.push([currentX-1, currentY]);
		}
		// Right wall is open.
		if (!this.verticalWalls[currentY][currentX+1] && (currentX < this.maxCols-1)) {
			possiblePaths.push([currentX+1, currentY]);
		}

		return possiblePaths;

	}

	// Based on the current and previous coordinates, determine,
	// which direction the object has traveled in.
	getDirection(previousX, previousY, currentX, currentY) {
		// The direction was right.
		if (previousX < currentX)
			return "R";
		// The direction was left.
		if (previousX > currentX)
			return "L";
		// The direction was down.
		if (previousY < currentY)
			return "D";
		// The direction was up.
		if (previousY > currentY)
			return "U"

		// If there is an error.
		return "Z"

	}

	// This method gets a maze for the purpose of figuring out
	// a solution. It will track which blocks have been visited
	// so that it doesn't revisit old blocks.
	getInitialMaze() {
		let returnMaze = new Array(this.maxRows);
		for (let i = 0; i < this.maxRows; i++) {
			let newRow = new Array(this.maxCols);
			newRow.fill("#");
			returnMaze[i] = newRow;
		}
		return returnMaze;
	}

	// Reads from the ASCII-drawn maze and determines
	// where the horizontal walls are located.
	getHorizontalWalls(line) {
		let walls = line.split("+");
		walls.shift();
		let returnArr = new Array(this.maxCols);
		for (let i = 0; i < this.maxCols; i++) {
			returnArr[i] = (walls[i] === "--");
		}

		return returnArr;
	}

	// Reads from the ASCII-drawn maze and determines
	// where the vertical walls are located.
	getVerticalWalls(line) {
		let returnArr = new Array(this.maxCols+1);
		for (let i = 0; i < (this.maxCols+1); i ++) {
			if (i < line.length) {
				returnArr[i] = (line.charAt(i*3) === '|');
			} else {
				returnArr[i] = false;
			}
		}
		return returnArr;
	}

	// Calculates the number of columns in the maze.
	calculateMaxCols(mazeStr) {
		let topBorderWalls = mazeStr.split("\n")[0].trim().split("+");
		let numWalls = 0;
		for (let i = 0; i < topBorderWalls.length; i++) {
			if (topBorderWalls[i] === "")
				continue;
			numWalls++;
		}
		return numWalls;
	}

	// Calculates the number of rows in the maze.
	calculateMaxRows(mazeStr) {
		let allRows = mazeStr.split("\n");
		return (allRows.length - 1) / 2;
	}


	// Accessor methods
	getMaxRows() { return this.maxRows; }
	getMaxCols() { return this.maxCols; }
	retrieveVerticalWalls() { return this.verticalWalls; }
	retrieveHorizontalWalls() { return this.horizontalWalls; }
}