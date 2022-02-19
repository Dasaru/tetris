const Tetris = (function(){
"use strict"

/*******************
 * CLASSES
 *******************/

 class Tetromino {
	constructor(shapeId, active){
		if (typeof active === "boolean" && active){
			Tetromino.active = this;
		}
		this.id = shapeId;
		this.type = shapeList[shapeId].type;
		this.color = shapeList[shapeId].color;
		this.sprite = shapeList[shapeId].sprite;
		this.shape = shapeList[shapeId].shape;
		this.size = shapeList[shapeId].shape.size;
		this.states = shapeList[shapeId].shape.states;
		this.state = 0;
		this.pos = {
			x: 4,
			y: 17,
			oldX: 4,
			oldY: 17,
			save: () => {
				this.pos.oldX = this.pos.x;
				this.pos.oldY = this.pos.y;
			},
			restore: () => {
				this.pos.x = this.pos.oldX;
				this.pos.y = this.pos.oldY;
			}
		}
	}

	static active = null;

	static setActive(shape = null) {
		Tetromino.active = shape;
	}

	drop(){
		for (let row=0; row < this.size; row++){
			for (let col=0; col < this.size; col++){
				let blockPart = this.states[this.state][row][col];
				
				if (blockPart === 1 && playfield[row + this.pos.y][col + this.pos.x] === null){
					playfield[row + this.pos.y][col + this.pos.x] = this.id;
				} else {
					if (blockPart === 1) {
						// console.error("Drawing Tetronimo into another filled block!");
						// console.log("In row:", row, "- col:", col);
					}
				}
			}
		}
	}

	lift() {
		for (let row=0; row < this.size; row++){
			for (let col=0; col < this.size; col++){
				let blockPart = this.states[this.state][row][col];
				if (blockPart === 1){
					playfield[row + this.pos.y][col + this.pos.x] = null;
				}
			}
		}
	}

	isCollide(){
		for (let row=0; row < this.size; row++){
			for (let col=0; col < this.size; col++){
				try {
					let blockPart = this.states[this.state][row][col];
					if (blockPart === 1 && playfield[row + this.pos.y][col + this.pos.x] !== null){
						return true;
					}
				} catch (e) {
					return true;
				}
			}
		}
		return false;
	}

	move(shiftX = 0, shiftY = 0){
		this.pos.save();
		this.lift();

		this.pos.x += shiftX;
		this.pos.y += shiftY;

		if (this.isCollide()) {
			this.pos.restore();
		}
		this.drop();
	}

	hardDrop(){
		do {
			this.pos.save();
			this.lift();
			this.pos.y -= 1;
		} while (!this.isCollide());

		this.pos.restore();
		this.drop();
	}

	rotate(clockwise = true) {
		let oldState = this.state;
		this.lift();

		if (clockwise){
			this.state--;
			if (this.state < 0) {
				this.state = this.states.length-1;
			}
		} else {
			this.state++;
			if (this.state > this.states.length-1) {
				this.state = 0;
			}
		}

		if (this.isCollide()){
			this.state = oldState;
		}
	}
}

/*******************
 * CONSTANTS
 *******************/

const shapeList = [
	{
		id: 0,
		type: "I",
		color: "cyan",
		sprite: null,
		shape: {
			size: 4,
			states: [
				[
					[0, 0, 0, 0],
					[0, 0, 0, 0],
					[1, 1, 1, 1],
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
					[1, 1, 1, 1],
					[0, 0, 0, 0],
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
		id: 1,
		type: "O",
		color: "yellow",
		sprite: null,
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
		id: 2,
		type: "T",
		color: "purple",
		sprite: null,
		shape: {
			size: 3,
			states: [
				[
					[0, 0, 0],
					[1, 1, 1],
					[0, 1, 0]
				],
				[
					[0, 1, 0],
					[0, 1, 1],
					[0, 1, 0]
				],
				[
					[0, 1, 0],
					[1, 1, 1],
					[0, 0, 0]
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
		id: 3,
		type: "S",
		color: "green",
		sprite: null,
		shape: {
			size: 3,
			states: [
				[
					[0, 0, 0],
					[1, 1, 0],
					[0, 1, 1]
				],
				[
					[0, 0, 1],
					[0, 1, 1],
					[0, 1, 0]
				],
				[
					[1, 1, 0],
					[0, 1, 1],
					[0, 0, 0]
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
		id: 4,
		type: "Z",
		color: "red",
		sprite: null,
		shape: {
			size: 3,
			states: [
				[
					[0, 0, 0],
					[0, 1, 1],
					[1, 1, 0]
				],
				[
					[0, 1, 0],
					[0, 1, 1],
					[0, 0, 1]
				],
				[
					[0, 1, 1],
					[1, 1, 0],
					[0, 0, 0]
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
		id: 5,
		type: "J",
		color: "blue",
		sprite: null,
		shape: {
			size: 3,
			states: [
				[
					[0, 0, 0],
					[1, 1, 1],
					[1, 0, 0]
				],
				[
					[0, 1, 0],
					[0, 1, 0],
					[0, 1, 1]
				],
				[
					[0, 0, 1],
					[1, 1, 1],
					[0, 0, 0]
				],
				[
					[1, 1, 0],
					[0, 1, 0],
					[0, 1, 0]
				]
			]
		}
	},
	{
		id: 6,
		type: "L",
		color: "orange",
		sprite: null,
		shape: {
			size: 3,
			states: [
				[
					[0, 0, 0],
					[1, 1, 1],
					[0, 0, 1]
				],
				[
					[0, 1, 1],
					[0, 1, 0],
					[0, 1, 0]
				],
				[
					[1, 0, 0],
					[1, 1, 1],
					[0, 0, 0]
				],
				[
					[0, 1, 0],
					[0, 1, 0],
					[1, 1, 0]
				]
			]
		}
	}
];

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

/*******************
 * EVENT LISTENERS
 *******************/

 addEventListener("keydown", (e) => {
	if (typeof buttonPressed[e.code] === "boolean") {
		buttonPressed[e.code] = true;
	}

	if (e.code === "Enter") {
		// Get next Block
		Tetromino.active = scoreboard.nextShape;
		scoreboard.nextShape = getBlock.next().value;
	}

	if (e.code === "Space") {
		Tetromino.active.hardDrop();
	}

	if (e.code === "KeyZ") {
		Tetromino.active.rotate(true);
	}
	if (e.code === "KeyX"){
		Tetromino.active.rotate(false);
	}
	if (e.code === "ArrowLeft"){
		Tetromino.active.move(-1, 0);
	}
	if (e.code === "ArrowRight"){
		Tetromino.active.move(1, 0);
	}
	if (e.code === "ArrowUp"){
		Tetromino.active.move(0, 1);
	}
	if (e.code === "ArrowDown"){
		Tetromino.active.move(0, -1);
	}
});

addEventListener("keyup", (e) => {
	if (typeof buttonPressed[e.code] === "boolean") {
		buttonPressed[e.code] = false;
	}
});

/*******************
 * LOGIC
 *******************/

const canvas = document.getElementById("tetrisBoard");
let ctx = canvas.getContext("2d");
let getBlock = nextBlockGenerator();

let playfield = null;
clearPlayfield();

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
};

let buttonPressed = {
	"ArrowUp": false,
	"ArrowDown": false,
	"ArrowLeft": false,
	"ArrowRight": false,
	"Enter": false,
	"KeyA": false,
	"KeyZ": false,
	"Space": false
};

/*******************
 * EVENT LOOP
 *******************/

// Initialize first block
Tetromino.active = getBlock.next().value;
scoreboard.nextShape = getBlock.next().value;

let img = new Image();
const spriteWidth = 30;
img.onload = function(){
	Promise.all([
		createImageBitmap(img, 0, 0, 30, 30),
		createImageBitmap(img, spriteWidth*1, 0, 30, 30),
		createImageBitmap(img, spriteWidth*2, 0, 30, 30),
		createImageBitmap(img, spriteWidth*3, 0, 30, 30),
		createImageBitmap(img, spriteWidth*4, 0, 30, 30),
		createImageBitmap(img, spriteWidth*5, 0, 30, 30),
		createImageBitmap(img, spriteWidth*6, 0, 30, 30)
	]).then(function (images){
		shapeList[0].sprite = images[0];
		shapeList[1].sprite = images[1];
		shapeList[2].sprite = images[2];
		shapeList[3].sprite = images[3];
		shapeList[4].sprite = images[4];
		shapeList[5].sprite = images[5];
		shapeList[6].sprite = images[6];
	});
};
img.src = "sprites.png";

function animationTick() {
	clearScreen();
	drawBackground();
	
	Tetromino.active.move();

	drawPlayfield();

	window.requestAnimationFrame(animationTick);
}

window.requestAnimationFrame(animationTick);

/*******************
 * FUNCTIONS
 *******************/

function clearScreen(){
	ctx.fillStyle = "#14a1de";
	ctx.fillRect(0, 0, board.width, board.height);
}

function drawBackground(){
	drawBoardBackground();
	drawNextTetrominoBackground();
	drawNextBlock();
	drawGameStats();
	drawControlsMessage();
}

function drawBoardBackground(){
	ctx.fillStyle = "black";
	ctx.fillRect(board.padding, board.padding, board.main.width, board.main.height);
}

function drawNextTetrominoBackground(){
	ctx.fillStyle = "black";
	ctx.fillRect(board.nextBlock.x, board.nextBlock.y, board.nextBlock.width, board.nextBlock.height);
	ctx.fillStyle = "#aaa";
	ctx.textAlign = "center";
	ctx.font = "1rem Arial, sans-serif";
	ctx.fillText("NEXT", board.nextBlock.x + (board.nextBlock.width / 2), board.nextBlock.y + 20);
}

function clearPlayfield(){
	playfield = Array(24);
	for (let i=0; i<playfield.length; i++){
		playfield[i] = Array(10).fill(null);
	}
}

function drawPlayfield(){
	for (let row=playfield.length-1; row >= 0; row--){
		
		for (let col=0; col < playfield[row].length; col++){

			if (playfield[row][col] !== null){
				
				let block = shapeList.find(elem => {
					return elem.id === playfield[row][col];
				});

				const cubeSize = 30;
				const xOffset = board.padding + col*cubeSize; // offsets 30 pixels per column
				const yOffset = board.height - board.padding - (row+1)*cubeSize; // Inverted (start at bottom)

				if (block.sprite === null){
					ctx.fillStyle = block.color;					
					ctx.fillRect(xOffset, yOffset, cubeSize, cubeSize);
				} else {
					ctx.drawImage(block.sprite, xOffset, yOffset);
				}
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

function resetGame() {
	scoreboard.score = 0;
	scoreboard.level = 1;
	scoreboard.nextShape = null;
}

function randomShuffle(array) {
	let m = array.length, t, i;
	while (m) {
		i = Math.floor(Math.random() * m--);
		t = array[m];
		array[m] = array[i];
		array[i] = t;
	}
	return array;
}

function* nextBlockGenerator(){
	let arr = [0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6];
	let nextIndex = 0;
	randomShuffle(arr);
	while(1){
		if (nextIndex > arr.length-1) {
			nextIndex = 0;
			randomShuffle(arr);
		}
		yield new Tetromino(arr[nextIndex++]);
	}
}

function drawNextBlock() {
	let block = scoreboard.nextShape;
	if (block === null){
		block = getBlock.next().value;
		scoreboard.nextShape = block;
	}
	let xOffset = (board.nextBlock.width / 2) - (15*block.size/2);
	let yOffset = (board.nextBlock.height / 2) - (15*block.size/2) + 10;
	for (let row=0; row < block.size; row++){
		for (let col=0; col < block.size; col++){

			if (block.sprite === null){
				if (block.states[block.state][row][col] === 1){
					ctx.fillStyle = block.color;
				} else {
					ctx.fillStyle = "black";
				}
				ctx.fillRect(board.nextBlock.x + (row*15) + xOffset, board.nextBlock.y + (col*15) + yOffset, 15, 15);
			} else {
				if (block.states[block.state][row][col] === 1){
					ctx.drawImage(block.sprite, board.nextBlock.x + (row*15) + xOffset, board.nextBlock.y + (col*15) + yOffset, 15, 15);
				}
			}		

		}
	}
}

})();