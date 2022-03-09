const Tetris = (function(){
"use strict"

/*******************
 * EVENT LISTENERS
 *******************/

 addEventListener("keydown", (e) => {

	if (gameState.started && Tetromino.active){
		if (gameState.paused && e.code === "Enter"){
			Menu.activeMenu.selectItem();
			return;
		}
		if (!gameState.paused){
			if (e.code === "Enter") {
				gameState.paused = true;
				Menu.activeMenu = pauseMenu;
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
			if (e.code === "ArrowDown"){
				Tetromino.active.move(0, -1);
			}
			if (e.code === "ArrowUp"){
				Tetromino.active.hardDrop();
			}
		}
	}

	if (!gameState.started) {
		if (e.code === "Enter") {
			Menu.activeMenu.selectItem();
		}
		if (e.code === "ArrowUp"){;
			Menu.moveCursor("up");
		}
		if (e.code === "ArrowDown"){
			Menu.moveCursor("down");
		}
	}
	
});

/*******************
 * CLASSES
 *******************/

 class Tetromino {
	constructor(shapeId, active){
		if (typeof active === "boolean" && active){
			Tetromino.active = this;
		}
		this.id = shapeId;
		this.hasFloorKicked = false;
		this.hasLocked = false;
		this.type = shapeList[shapeId].type;
		this.color = shapeList[shapeId].color;
		this.sprite = shapeList[shapeId].sprite;
		this.shape = shapeList[shapeId].shape;
		this.size = shapeList[shapeId].shape.size;
		this.states = shapeList[shapeId].shape.states;
		this.state = 0;
		this.pos = {
			x: 3,
			y: 18,
			oldX: 3,
			oldY: 18,
			save: () => {
				this.pos.oldX = this.pos.x;
				this.pos.oldY = this.pos.y;
			},
			restore: () => {
				this.pos.x = this.pos.oldX;
				this.pos.y = this.pos.oldY;
			}
		}
		if (this.type === "I") {
			this.pos.y = 17;
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
		let startHeight = this.pos.y;
		do {
			this.pos.save();
			this.lift();
			this.pos.y -= 1;
		} while (!this.isCollide());

		this.pos.restore();
		this.drop();
		addScore(startHeight - this.pos.y);
	}

	rotate(clockwise = true) {
		clockwise = !clockwise; // Reverse clockwise direction since rows are reversed.
		let oldState = this.state;
		this.lift();

		if (clockwise){
			this.state++;
			if (this.state > this.states.length-1) {
				this.state = 0;
			}
		} else {
			this.state--;
			if (this.state < 0) {
				this.state = this.states.length-1;
			}
		}

		if (this.isCollide()){

			// try moving right
			this.pos.save();
			this.pos.x++;
			if (!this.isCollide()) {
				// Right Kick
				this.drop();
				return;
			}
			// try again for I blocks
			if (this.type === "I"){
				this.pos.x++;
				if (!this.isCollide()) {
					this.drop();
					return;
				}
			}
			this.pos.restore();

			// try moving left
			this.pos.save();
			this.pos.x--;
			if (!this.isCollide()) {
				// Left Kick
				this.drop();
				return;
			}
			// try again for I blocks
			if (this.type === "I"){
				this.pos.x--;
				if (!this.isCollide()) {
					this.drop();
					return;
				}
			}
			this.pos.restore();

			// try floor kicking once
			if (!this.hasFloorKicked) {
				this.pos.save();
				this.pos.y++;
				if (!this.isCollide()) {
					// Floor Kick
					this.hasFloorKicked = true;
					this.drop();
					return;
				}
				// try again for I blocks
				if (this.type === "I"){
					this.pos.y++;
					if (!this.isCollide()) {
						// Floor Kick
						this.hasFloorKicked = true;
						this.drop();
						return;
					}
				}
				this.pos.restore();
			}

			// failure to move
			this.state = oldState;
		}
	}

}

class Menu {
	constructor(menuItemsArr, activeCursor = true) {
		this.menuItems = menuItemsArr;
		this.hasCursor = activeCursor;
		this.prevMenu = null;
	}
	static activeMenu = null;
	static itemSelected = 0;

	static displayActive(){
		Menu.drawMenuBackground();
		let cursorOffset = (Menu.activeMenu.hasCursor) ? 30 : 15;
		Menu.activeMenu.menuItems.forEach((item, index, items) => {
			ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
			ctx.textAlign = "left";
			ctx.textBaseline = "top";
			ctx.font = board.menu.fontSize + "px Courier New, monospace";
			ctx.fillText(item.name, board.menu.width/2 + cursorOffset, board.height/2 + index*(board.menu.fontSize) - board.menu.height/2 + board.menu.padding);
		});
		if (Menu.activeMenu.hasCursor){
			ctx.fillText(">", board.menu.width/2 + 10, board.height/2 + Menu.itemSelected*(board.menu.fontSize) - board.menu.height/2 + board.menu.padding);
		}
		ctx.textBaseline = "alphabetic"; //reset value
	}

	static drawMenuBackground(){
		ctx.fillStyle = "gray";
		ctx.fillRect(board.padding + board.menu.margin, board.height/2 - board.menu.height/2, board.menu.width, board.menu.height);
	}

	static moveCursor(direction){
		if (direction === "up"){
			Menu.itemSelected--;
			if (Menu.itemSelected < 0) Menu.itemSelected = Menu.activeMenu.menuItems.length - 1;
		}
		if (direction === "down"){
			Menu.itemSelected++;
			if (Menu.itemSelected > Menu.activeMenu.menuItems.length - 1) Menu.itemSelected = 0;
		}
	}

	selectItem(){
		if (this.hasCursor){
			this.menuItems[Menu.itemSelected].select();
		} else {
			// Go back to the previous menu
			Menu.itemSelected = 0;
			if (this.prevMenu !== null){
				Menu.activeMenu = this.prevMenu;
			} else {
				// Default back to main menu
				Menu.activeMenu = mainMenu;
			}
		}
	}
}

/*******************
 * STATES
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
				]
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
	menu: {
		fontSize: 20,
		margin: 60,
		padding: 20,
		get width() {
			return board.main.width - 2*board.menu.margin;
		},
		get height() {
			let itemCount = Menu.activeMenu.menuItems.length;
			return itemCount*(board.menu.fontSize) + 2*board.menu.padding;
		}
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

const mainMenu = new Menu([
	{
		name: "New Game",
		select: function(){
			resetGame();
			// initialize first blocks
			getNextBlock();
			getNextBlock();
			gameState.started = true;
		}
	},
	{
		name: "High Score",
		select: function(){
			highScore.prevMenu = mainMenu;
			Menu.activeMenu = highScore;
		}
	},
	{
		name: "Options",
		select: function(){
			console.log("Options!");
		}
	}
]);

const pauseMenu = new Menu([
	{
		name: "Paused",
		select: function(){
			gameState.paused = false;
			Menu.activeMenu = mainMenu;
		}
	}
]);

const optionsMenu = new Menu([
	{
		name: "Apple",
		select: function(){
			console.log("Apple!");
		}
	},
	{
		name: "Orange",
		select: function(){
			console.log("Orange!");
		}
	},
	{
		name: "Peach",
		select: function(){
			console.log("Peach!");
		}
	},
	{
		name: "Back",
		select: function(){
			console.log("Back!");
		}
	}
]);

let highScore = new Menu([
	{name: "AAA  100000"},
	{name: "AAA  080000"},
	{name: "AAA  060000"},
	{name: "AAA  040000"},
	{name: "AAA  030000"},
	{name: "AAA  020000"},
	{name: "AAA  015000"},
	{name: "AAA  010000"},
	{name: "AAA  005000"},
	{name: "AAA  001000"}
], false);

let gameState = {
	started: false,
	gameOver: false,
	paused: false
};

let scoreboard = {
	nextShape: null,
	level: 0,
	score: 0,
	scoreFormat: function(){
		return scoreboard.score.toString().padStart(6, "0");
	},
	levelFormat: function(){
		return scoreboard.level.toString().padStart(2, " ");
	}
};

/*******************
 * INITIALIZE
 *******************/

const canvas = document.getElementById("tetrisBoard");
let ctx = canvas.getContext("2d");
loadSprites();
Menu.activeMenu = mainMenu;
let linesCleared = 0;
let playfield = null;
let nextBlockList = nextBlockGenerator();
clearPlayfield();

/*******************
 * EVENT LOOP
 *******************/

let tickRate = getTickRate(scoreboard.level); // milliseconds per tick
let nextTick = tickRate;

function animationTick(timestamp) {
	clearScreen();
	drawBackground();
	
	if (gameState.started && !gameState.paused) {
		if (Tetromino.active){
			Tetromino.active.move();
		}

		// TODO: On floor collision (and floor kick), add locking time (500 milliseconds?) to nextTick
		if (timestamp >= nextTick){
			let oldState = Tetromino.active.state;
			let oldPos = Tetromino.active.pos.y;
			Tetromino.active.move(0, -1);
			if (Tetromino.active.state === oldState && Tetromino.active.pos.y === oldPos) {
				if (!Tetromino.active.hasLocked){
					Tetromino.active.hasLocked = true;
					nextTick += 500;
				} else {
					updatePlayfield();
					getNextBlock();
				}
			}
			checkGameOver();
			nextTick = timestamp + tickRate;
		}
	}

	drawPlayfield();

	if (!gameState.started || gameState.paused){
		Menu.displayActive();
	}

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
	playfield = Array(22);
	for (let i=0; i<playfield.length; i++){
		playfield[i] = Array(10).fill(null);
	}
}

function drawPlayfield(){
	for (let row=19; row >= 0; row--){
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
	ctx.font = "1.2rem Courier New, sans-serif";
	ctx.fillText("SCORE: " + scoreboard.scoreFormat(), board.nextBlock.x, board.nextBlock.y + board.nextBlock.height + 40);
	ctx.fillText(" LEVEL: " + scoreboard.levelFormat(), board.nextBlock.x, board.nextBlock.y + board.nextBlock.height + 70);
}

function drawControlsMessage(){
	ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
	ctx.textAlign = "left";
	ctx.font = "1.0rem Courier New, monospace";
	ctx.fillText("--- CONTROLS ---", board.nextBlock.x - 10, board.height - 130);
	ctx.fillText("Menu: Up/Down", board.nextBlock.x - 10, board.height - 110);
	ctx.fillText("Select: [Enter]", board.nextBlock.x - 10, board.height - 90);
	ctx.fillText("Move: Left/Right", board.nextBlock.x - 10, board.height - 70);
	ctx.fillText("Drop: Up/Down", board.nextBlock.x - 10, board.height - 50);
	ctx.fillText("Rotate: Z/X", board.nextBlock.x - 10, board.height - 30);
}

function getTickRate(level) {
	return 400 - Math.min(level*16.5, 330);
}

function updateTickRate() {
	tickRate = getTickRate(scoreboard.level);
}

function changeLevel(inc = 1){
	scoreboard.level += inc;
	updateTickRate(scoreboard.level);
}

function addScore(num) {
	scoreboard.score += num;
}

function checkGameOver(){
	let outOfBounds = playfield.slice(20);
	outOfBounds.forEach((row) => {
		if (!row.every((elem) => elem === null)){
			gameState.started = false;
			gameState.gameOver = true;
		};
	});
}

function resetGame() {
	scoreboard.score = 0;
	scoreboard.level = 0;
	scoreboard.nextShape = null;
	Tetromino.active = null;
	clearPlayfield();
	updateTickRate();
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
	if (block === null) return;

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

function getNextBlock() {
	Tetromino.active = scoreboard.nextShape;
	scoreboard.nextShape = nextBlockList.next().value;
	// check for spawn collision
	if (Tetromino.active && Tetromino.active.isCollide()) {
		// first collision shift
		Tetromino.active.pos.y++;
		if (Tetromino.active.isCollide()) {
			// second collision shift
			Tetromino.active.pos.y++;
			if (Tetromino.active.isCollide()) {
				// game over
				gameState.started = false;
				gameState.gameOver = true;
			}
		}
	}
}

function updatePlayfield() {
	let rows = getFullRows();
	if (rows.length >= 1) {
		scoreFullRows(rows.length);
		deleteFullRows(rows);
		linesCleared += rows.length;
		if (linesCleared >= Math.min(70, scoreboard.level*3 + 10)){
			changeLevel();
			linesCleared = 0;
		}
	}
}

function getFullRows() {
	let indexList = [];
	playfield.forEach(function(row, index){
		if (isNullRow(row)){
			indexList.push(index);	
		}
	});
	return indexList;	
}

function isNullRow(row) {
	return !row.some((elem) => {
		return elem === null;
	});
}

function scoreFullRows(rowsCleared) {
	const pointValue = [0, 40, 100, 300, 1200];
	const scored = pointValue[rowsCleared] * (scoreboard.level + 1);
	addScore(scored);
}

function deleteFullRows(rows) {
	let reversedIndexes = rows.sort((a,b) => b-a);
	for (let i=0; i < reversedIndexes.length; i++){
		playfield.splice(reversedIndexes[i], 1);
		playfield.push(Array(10).fill(null));
	}
}

function loadSprites() {
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
}

})();