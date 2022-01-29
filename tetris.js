const Tetris = (function(){
"use strict"

/*******************
 * CLASSES
 *******************/

 class Tetromino {
	constructor(shapeIndex = 2 /*Math.floor(Math.random()*shapeList.length)*/){
		this.shapeIndex = shapeIndex;
		this.type = shapeList[shapeIndex].type;
		this.color = shapeList[shapeIndex].color;
		this.state = 0;
		this.pos = {
			x: 7,
			y: 5
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
	let row = Array(20).fill(null);
	for (let i=0; i<20; i++){
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

clearScreen();
drawBackground();

let test = new Tetromino(1);

playfield[2][2] = "red";
drawPlayfield();

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

	ctx.fillStyle = "red";
	for (let row=playfield.length-1; row >= 0; row--){
		
		for (let col=0; col < playfield[row].length; col++){

			if (playfield[row][col] === "red"){
				const cubeSize = 30;
				const xOffset = board.padding + col*cubeSize; // offsets 30 pixels per column
				const yOffset = board.height - board.padding - (row+1)*cubeSize; // Inverted (start at bottom)
				
				ctx.fillRect(xOffset, yOffset, cubeSize, cubeSize);
			}

		}
		
	}
}

function drawGameStats(){
	ctx.fillStyle = "white";
	ctx.textAlign = "left";
	ctx.font = "1.3rem Courier New, sans-serif";
	ctx.fillText("SCORE: " + scoreboard.scoreFormat(), board.nextBlock.x, board.nextBlock.y + board.nextBlock.height + 40);
	ctx.fillText(" LEVEL: " + scoreboard.levelFormat(), board.nextBlock.x, board.nextBlock.y + board.nextBlock.height + 70);
}

})();