const Tetris = (function(){
"use strict"

const canvas = document.getElementById("tetrisBoard");
let ctx = canvas.getContext("2d");

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

let playfield = Array(20).fill(Array(10).fill(null));

let scoreboard = {
	nextShape: null,
	score: 0,
	level: 1
}

clearScreen();
drawBackground();

/*******************
 * CLASSES
 *******************/

class Tetromino {
	constructor(shapeIndex){
		this.shapeIndex = shapeIndex;
		this.type = shapeList[shapeIndex].type;
		this.color = shapeList[shapeIndex].color;
		this.state = 0;
	}
}

/*******************
 * FUNCTIONS
 *******************/

function clearScreen(){
	ctx.fillStyle = "#14a1de";
	ctx.fillRect(0, 0, 500, 600);
}

function drawBackground(){
	drawBoardBackground();
	drawNextTetronimoBackground();
}

function drawBoardBackground(){
	ctx.fillStyle = "black";
	ctx.fillRect(20, 20, 300, 560);
}

function drawNextTetronimoBackground(){
	ctx.fillStyle = "black";
	ctx.fillRect(340, 20, 140, 100);
}

})();