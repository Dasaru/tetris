const Tetris = (function(){
"use strict"

const canvas = document.getElementById("tetrisBoard");
let ctx = canvas.getContext("2d");

const shapeList = [
	{
		type: "I",
		color: "cyan"
	},
	{
		type: "O",
		color: "yellow"
	},
	{
		type: "T",
		color: "purple"
	},
	{
		type: "S",
		color: "green"
	},
	{
		type: "Z",
		color: "red"
	},
	{
		type: "J",
		color: "blue"
	},
	{
		type: "L",
		color: "orange"
	}
];

let playfield = Array(20).fill(Array(10).fill(null));

clearScreen();
drawBoardBackground();

/*******************
 * CLASSES
 *******************/

class Tetromino {
	constructor(shapeIndex){
		this.shapeIndex = shapeIndex;
		this.type = shapeList[shapeIndex].type;
		this.color = shapeList[shapeIndex].color;
	}
}

/*******************
 * FUNCTIONS
 *******************/

function clearScreen(){
	ctx.fillStyle = "#14a1de";
	ctx.fillRect(0, 0, 500, 600);
}

function drawBoardBackground(){
	ctx.fillStyle = "black";
	ctx.fillRect(20, 20, 300, 560);
}

})();