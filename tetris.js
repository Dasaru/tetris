const Tetris = (function(){
"use strict"

/*******************
 * CLASSES
 *******************/

 class Tetromino {
	constructor(shapeIndex = 2 /*Math.floor(Math.random()*shapeList.length)*/, active){
		if (typeof active === "boolean" && active){
			Tetromino.active = this;
		}
		this.shapeIndex = shapeIndex;
		this.type = shapeList[shapeIndex].type;
		this.color = shapeList[shapeIndex].color;
		this.shape = shapeList[shapeIndex].shape;
		this.size = shapeList[shapeIndex].shape.size;
		this.states = shapeList[shapeIndex].shape.states;
		this.state = 0;
		this.pos = {
			x: 1,
			y: 1
		}
	}

	static active = null;

	static setActive(shape = null) {
		Tetromino.active = shape;
	}

	// TODO: offset tetonimo to draw it in the middle of board (based on this.pos.x and this.pos.y) instead in lower left.
	drawTetronimo(){
		console.log("outputting: " + this.type);
		for (let row=0; row < this.size; row++){
			// console.log(this.states[this.state][row] + " - " + row);
			for (let col=0; col < this.size; col++){
				// console.log(this.states[this.state][row][col]);
				let block = this.states[this.state][row][col];
				// console.log("BLOCK IS: " + block);
				// console.log("PLAYFIELD IS: " + playfield[row + this.pos.y][col + this.pos.x]);
				// console.log("ROW:", row);
				// console.log("COL:", col);
				// console.log("POS: ", row + this.pos.y, col + this.pos.x);

				if (block === 1 && playfield[row + this.pos.y][col + this.pos.x] === null){
					playfield[row + this.pos.y][col + this.pos.x] = this.color;
				} else {
					if (block === 1) {
						console.log("-------------------------------------------------------");
						console.error("Drawing Tetronimo into another filled block!");
						console.log("In row:", row, "- col:", col);
						console.log("-------------------------------------------------------");
					}
				}
			}
		}
	}
}

const shapeList = [
	{
		type: "I",
		color: "cyan",
		shape: {
			size: 4,
			states: [
				[
					[0, 0, 0, 0],
					[1, 1, 1, 1],
					[0, 0, 0, 0],
					[0, 0, 0, 0]
				],
				[
					[0, 0, 1, 0],
					[0, 0, 1, 0],
					[0, 0, 1, 0],
					[0, 0, 1, 0]
				],
				[
					[0, 0, 0, 0],
					[0, 0, 0, 0],
					[1, 1, 1, 1],
					[0, 0, 0, 0]
				],
				[
					[0, 1, 0, 0],
					[0, 1, 0, 0],
					[0, 1, 0, 0],
					[0, 1, 0, 0]
				],
			]
		}
	},
	{
		type: "O",
		color: "yellow",
		shape: {
			size: 4,
			states: [
				[
					[0, 0, 0, 0],
					[0, 1, 1, 0],
					[0, 1, 1, 0],
					[0, 0, 0, 0]
				]
			]
		}
	},
	{
		type: "T",
		color: "purple",
		shape: {
			size: 3,
			states: [
				[
					[0, 1, 0],
					[1, 1, 1],
					[0, 0, 0]
				],
				[
					[0, 1, 0],
					[0, 1, 1],
					[0, 1, 0]
				],
				[
					[0, 0, 0],
					[1, 1, 1],
					[0, 1, 0]
				],
				[
					[0, 1, 0],
					[1, 1, 0],
					[0, 1, 0]
				]
			]
		}
	},
	{
		type: "S",
		color: "green",
		shape: {
			size: 3,
			states: [
				[
					[0, 1, 1],
					[1, 1, 0],
					[0, 0, 0]
				],
				[
					[0, 1, 0],
					[0, 1, 1],
					[0, 0, 1]
				],
				[
					[0, 0, 0],
					[0, 1, 1],
					[1, 1, 0]
				],
				[
					[1, 0, 0],
					[1, 1, 0],
					[0, 1, 0]
				]
			]
		}
	},
	{
		type: "Z",
		color: "red",
		shape: {
			size: 3,
			states: [
				[
					[1, 1, 0],
					[0, 1, 1],
					[0, 0, 0]
				],
				[
					[0, 0, 1],
					[0, 1, 1],
					[0, 1, 0]
				],
				[
					[0, 0, 0],
					[1, 1, 0],
					[0, 1, 1]
				],
				[
					[0, 1, 0],
					[1, 1, 0],
					[1, 0, 0]
				]
			]
		}
	},
	{
		type: "J",
		color: "blue",
		shape: {
			size: 3,
			states: [
				[
					[1, 0, 0],
					[1, 1, 1],
					[0, 0, 0]
				],
				[
					[0, 1, 1],
					[0, 1, 0],
					[0, 1, 0]
				],
				[
					[0, 0, 0],
					[1, 1, 1],
					[0, 0, 1]
				],
				[
					[0, 1, 0],
					[0, 1, 0],
					[1, 1, 0]
				]
			]
		}
	},
	{
		type: "L",
		color: "orange",
		shape: {
			size: 3,
			states: [
				[
					[0, 0, 1],
					[1, 1, 1],
					[0, 0, 0]
				],
				[
					[0, 1, 0],
					[0, 1, 0],
					[0, 1, 1]
				],
				[
					[0, 0, 0],
					[1, 1, 1],
					[1, 0, 0]
				],
				[
					[1, 1, 0],
					[0, 1, 0],
					[0, 1, 0]
				]
			]
		}
	}
];

const canvas = document.getElementById("tetrisBoard");
let ctx = canvas.getContext("2d");

let playfield = (function(){
	let row = Array(24);
	for (let i=0; i<row.length; i++){
		row[i] = Array(10).fill(null);
	}
	return row;
})();

let scoreboard = {
	nextShape: null,
	level: 1,
	score: 0,
	scoreFormat: function(){
		return scoreboard.score.toString().padStart(4, "0");
	},
	levelFormat: function(){
		return scoreboard.level.toString().padStart(2, " ");
	}
}

const board = {
	width: 500,
	height: 640,
	padding: 20,
	main: {
		width: 300,
		height: 600
	},
	nextBlock: {
		get x() {
			return board.main.width + 2*board.padding;
		},
		get y() {
			return board.padding;
		},
		get width() {
			return board.width - board.main.width - 3*board.padding;
		},
		height: 100
	}
}

// Loop Start

clearScreen();
drawBackground();

let test = new Tetromino(2, true);

playfield[5][5] = "red";
test.drawTetronimo();

drawPlayfield();

// Loop End

/*******************
 * FUNCTIONS
 *******************/

function clearScreen(){
	ctx.fillStyle = "#14a1de";
	ctx.fillRect(0, 0, board.width, board.height);
}

function drawBackground(){
	drawBoardBackground();
	drawNextTetronimoBackground();
	drawGameStats();
	drawControlsMessage();
}

function drawBoardBackground(){
	ctx.fillStyle = "black";
	ctx.fillRect(board.padding, board.padding, board.main.width, board.main.height);
}

function drawNextTetronimoBackground(){
	ctx.fillStyle = "black";
	ctx.fillRect(board.nextBlock.x, board.nextBlock.y, board.nextBlock.width, board.nextBlock.height);
	ctx.fillStyle = "#aaa";
	ctx.textAlign = "center";
	ctx.font = "1rem Arial, sans-serif";
	ctx.fillText("NEXT", board.nextBlock.x + (board.nextBlock.width / 2), board.nextBlock.y + 20);
}

function drawPlayfield(){
	// Log start
	let count = 0;
	for (let row=playfield.length-1; row >= 0; row--){
		let str = "";
		for (let col=0; col < playfield[row].length; col++){
			str += playfield[row][col] + ", ";
		}
		console.log(str + count++);
		str = "";
	}
	// Log end

	for (let row=playfield.length-1; row >= 0; row--){
		
		for (let col=0; col < playfield[row].length; col++){

			if (playfield[row][col] !== null){
				ctx.fillStyle = playfield[row][col];
				const cubeSize = 30;
				const xOffset = board.padding + col*cubeSize; // offsets 30 pixels per column
				const yOffset = board.height - board.padding - (row+1)*cubeSize; // Inverted (start at bottom)
				
				ctx.fillRect(xOffset, yOffset, cubeSize, cubeSize);
			}

		}
		
	}
}

function drawGameStats(){
	ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
	ctx.textAlign = "left";
	ctx.font = "1.3rem Courier New, sans-serif";
	ctx.fillText("SCORE: " + scoreboard.scoreFormat(), board.nextBlock.x, board.nextBlock.y + board.nextBlock.height + 40);
	ctx.fillText(" LEVEL: " + scoreboard.levelFormat(), board.nextBlock.x, board.nextBlock.y + board.nextBlock.height + 70);
}

function drawControlsMessage(){
	ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
	ctx.textAlign = "left";
	ctx.font = "1.0rem Courier New, monospace";
	ctx.fillText("--- CONTROLS ---", board.nextBlock.x - 10, board.height - 110);
	ctx.fillText("Select: [Enter]", board.nextBlock.x - 10, board.height - 90);
	ctx.fillText("Move: Left/Right", board.nextBlock.x - 10, board.height - 70);
	ctx.fillText("Rotate: Z/X", board.nextBlock.x - 10, board.height - 50);
	ctx.fillText("Drop: Down/Space", board.nextBlock.x - 10, board.height - 30);	
}

function changeLevel(inc = 1){
	scoreboard.level += inc;
}

function addScore(num) {
	scoreboard.score += num;
}

})();