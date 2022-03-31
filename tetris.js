const Tetris = (function(){
"use strict";

/*******************
 * EVENT LISTENERS
 *******************/

window.addEventListener("keydown", function (e) {

	if (gameState.started && Tetromino.active){
		if (gameState.paused && (e.code === "Enter" || e.code === "KeyZ")){
			Menu.activeMenu.selectItem();
			return;
		}
		if (!gameState.paused){
			if (e.code === "Enter") {
				pauseGame();
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
		if (e.code === "Enter" || e.code === "KeyZ") {
			Menu.activeMenu.selectItem();
		}
	}

	if (e.code === "ArrowLeft"){
		Menu.activeMenu.moveCursor("left");
	}
	if (e.code === "ArrowRight"){
		Menu.activeMenu.moveCursor("right");
	}
	if (e.code === "ArrowUp"){
		Menu.activeMenu.moveCursor("up");
	}
	if (e.code === "ArrowDown"){
		Menu.activeMenu.moveCursor("down");
	}
	
});

window.addEventListener("gamepadconnected", function(e){
	gamepad.active = navigator.getGamepads()[0];
});

window.addEventListener("gamepaddisconnected", function(e){
	gamepad.active = null;
	if (gameState.started && !gameState.paused) {
		pauseGame();
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
	static _activeMenu = null;
	static get activeMenu() {
		return Menu._activeMenu;
	}
	static set activeMenu(value) {
		Menu._activeMenu = value;
		Menu.itemSelected = 0;
	}
	
	static itemSelected = 0;

	display(){
		this.drawMenuBackground();
		let cursorOffset = (this.hasCursor) ? 10 : -5;
		this.menuItems.forEach((item, index) => {
			ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
			ctx.textAlign = "left";
			ctx.textBaseline = "top";
			ctx.font = board.menu.fontSize + "px Courier New, monospace";
			if (item.highlight) {
				ctx.fillStyle = "rgba(130, 255, 150, 0.9)";
			}
			const itemOffset = (item.offset) ?? 0;
			ctx.fillText(item.name, board.menu.width/2 + cursorOffset + itemOffset, board.height/2 + index*(board.menu.fontSize) - board.menu.height/2 + board.menu.padding);
		});
		if (this.hasCursor){
			ctx.fillText(">", board.menu.width/2 - 10, board.height/2 + Menu.itemSelected*(board.menu.fontSize) - board.menu.height/2 + board.menu.padding);
		}
		ctx.textBaseline = "alphabetic"; //reset value
	}

	drawMenuBackground(){
		ctx.fillStyle = "gray";
		ctx.fillRect(board.padding + board.menu.margin, board.height/2 - board.menu.height/2, board.menu.width, board.menu.height);
	}

	moveCursor(direction){
		if (direction === "up"){
			Menu.itemSelected--;
			if (Menu.itemSelected < 0) Menu.itemSelected = this.menuItems.length - 1;
		}
		if (direction === "down"){
			Menu.itemSelected++;
			if (Menu.itemSelected > this.menuItems.length - 1) Menu.itemSelected = 0;
		}
	}

	selectItem(){
		if (this.hasCursor){
			this.menuItems[Menu.itemSelected].select();
		} else {
			Menu.activeMenu.menuItems.forEach(item => item.highlight = false);
			// Go back to the previous menu
			if (this.prevMenu !== null){
				Menu.activeMenu = this.prevMenu;
			} else {
				// Default back to main menu
				Menu.activeMenu = mainMenu;
			}
		}
	}
}

class HighScoreMenu extends Menu {
	constructor(menuItemsArr, activeCursor = true){
		super(menuItemsArr, false);
		this.playerInitials = [menuItemsArr[0].name, menuItemsArr[1].name, menuItemsArr[2].name];
	}

	static alphabet = ["A", "B", "C", "D", "E", "F", "G",
		"H", "I", "J", "K", "L", "M", "N", "O", "P", "Q",
		"R", "S", "T", "U", "V", "W", "X", "Y", "Z"];

	display(){
		this.drawMenuBackground();
		ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
		ctx.textAlign = "left";
		ctx.textBaseline = "top";
		ctx.fillStyle = "rgba(0, 255, 0, 0.9)";
		ctx.font = "25px Courier New, monospace";
		ctx.fillText("New High Score!", board.menu.width/2 - 50, board.height/2 + board.menu.fontSize - this.menuItems.length*(board.menu.fontSize) + 10);
		ctx.font = board.menu.fontSize + "px Courier New, monospace";
		ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
		ctx.fillText("Enter Initials:", board.menu.width/2 - 30, board.height/2 + board.menu.fontSize - this.menuItems.length*(board.menu.fontSize) + 40);
		this.menuItems.forEach((item, index, items) => {
			ctx.fillStyle = (Menu.itemSelected === index) ? "rgba(255, 0, 0, 1)" : "rgba(255, 255, 255, 0.9)";
			if (index !== items.length-1) {
				ctx.fillText(item.name, board.menu.width/2 + index*20, board.height/2 - board.menu.height/2 + board.menu.padding + 50);
			} else {
				//reposition last item (Done)
				ctx.fillText(item.name, board.menu.width/2 + index*20 + 60, board.height/2 - board.menu.height/2 + board.menu.padding + 70);
			}
		});
		ctx.textBaseline = "alphabetic"; //reset value
	}

	drawMenuBackground(){
		ctx.fillStyle = "gray";
		let margin = 30;
		ctx.fillRect(board.padding + margin, board.height/2 - board.menu.height/2, board.main.width - 2*margin, board.menu.height);
	}

	moveCursor(direction){
		let selected = Menu.itemSelected;
		if (direction === "up" && selected < 3){
			this.menuItems[selected].name = this.prevInitial(selected);
		}
		if (direction === "down" && selected < 3){
			this.menuItems[selected].name = this.nextInitial(selected);
		}
		if (direction === "left"){
			Menu.itemSelected--;
			if (Menu.itemSelected < 0) Menu.itemSelected = this.menuItems.length - 1;
		}
		if (direction === "right"){
			Menu.itemSelected++;
			if (Menu.itemSelected > this.menuItems.length - 1) Menu.itemSelected = 0;
		}
	}

	nextInitial(selected) {
		let initial = this.menuItems[selected].name;
		let index = HighScoreMenu.alphabet.indexOf(initial);
		index++;
		if (index > HighScoreMenu.alphabet.length-1) index = 0;
		let next = HighScoreMenu.alphabet[index];
		return next;
	}

	prevInitial(selected) {
		let initial = this.menuItems[selected].name;
		let index = HighScoreMenu.alphabet.indexOf(initial);
		index--;
		if (index < 0) index = HighScoreMenu.alphabet.length-1;
		let prev = HighScoreMenu.alphabet[index];
		return prev;
	}

	selectItem(){
		this.menuItems[Menu.itemSelected].select();
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
		margin: 40,
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
		name: "Level 5",
		select: function(){
			resetGame(5);
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
	// {
	// 	name: "Insert Score",
	// 	select: function(){
	// 		insertHighScore.prevMenu = mainMenu;
	// 		Menu.activeMenu = insertHighScore;
	// 	}
	// },
	{
		name: "Options",
		select: function(){
			Menu.activeMenu = optionsMenu;
		}
	}
]);

const pauseMenu = new Menu([
	{
		name: "Unpause",
		select: function(){
			unpauseGame();
		}
	},
	{
		name: "End Game",
		select: function(){
			gameState.started = false;
			gameState.paused = false;
			selectEndOfGameMenu();
		}
	}
]);

const gameOverMenu = new Menu([
	{
		name: "Game Over",
		select: function(){
			selectEndOfGameMenu();
		}
	}
]);

const optionsMenu = new Menu([
	{
		name: "Reset Scores",
		select: function(){
			Menu.activeMenu = resetConfirmation;
		}
	},
	{
		name: "Back",
		select: function(){
			Menu.activeMenu = mainMenu;
		}
	}
]);

const resetConfirmation = new Menu([
	{
		name: "Delete Scores",
		select: function(){
			highScore = createHighScore();
			saveHighScore();
			Menu.activeMenu = scoresDeletedMessage;
		}
	}, 
	{
		name: "Cancel",
		select: function(){
			Menu.activeMenu = optionsMenu;
		}
	}
]);

const scoresDeletedMessage = new Menu([
	{
		name: "Scores Deleted",
		offset: -20,
		select: function(){
			Menu.activeMenu = mainMenu;
		}
	}, 
], false);

const insertHighScore = new HighScoreMenu([
	{
		name: "A",
		select: function(){}
	},
	{
		name: "B",
		select: function(){}
	},
	{
		name: "C",
		select: function(){}
	},
	{
		name: "Done",
		select: function(){
			let initials = insertHighScore.menuItems.reduce((inits, item, index) => {
				if (index > 2) return inits;
				return inits += item.name;
			}, "");
			addHighScore(initials, scoreboard.score);
			saveHighScore();
			Menu.activeMenu = highScore;
		}
	},
]);

let highScore = createHighScore();

let gameState = {
	started: false,
	gameOver: false,
	paused: false,
};

let gamepad = {
	connected: false,
	active: null,
	buttonList: {
		0: {
			button: "A",
			keyCode: "KeyZ",
			pressed: false
		},
		1: {
			button: "B",
			keyCode: "KeyX",
			pressed: false
		},
		12: {
			button: "up",
			keyCode: "ArrowUp",
			pressed: false
		},
		13: {
			button: "down",
			keyCode: "ArrowDown",
			pressed: false
		},
		14: {
			button: "left",
			keyCode: "ArrowLeft",
			pressed: false
		},
		15: {
			button: "right",
			keyCode: "ArrowRight",
			pressed: false
		},
		9: {
			button: "start",
			keyCode: "Enter",
			pressed: false
		}
	}
};

let scoreboard = {
	nextShape: null,
	level: 0,
	score: 0,
	linesCleared: 0,
	scoreFormat: function(){
		return scoreboard.score.toString().padStart(6, "0");
	},
	levelFormat: function(){
		return scoreboard.level.toString().padStart(2, " ");
	},
	linesFormat: function(){
		const curLv = scoreboard.linesCleared.toString().padStart(2, " ");
		const nextLv = nextLevelRequirement().toString().padStart(2, " ");
		return curLv + "/" + nextLv;
			
	}
};

/*******************
 * INITIALIZE
 *******************/

const canvas = document.getElementById("tetrisBoard");
let ctx = canvas.getContext("2d");
loadSprites();
Menu.activeMenu = mainMenu;
let playfield = null;
let nextBlockList = nextBlockGenerator();
clearPlayfield();
let highScoreStorage = window.localStorage;
loadHighScore();
resetHighlighting();

/*******************
 * EVENT LOOP
 *******************/

let tickRate = getTickRate(scoreboard.level); // milliseconds per tick
let nextTick = tickRate;

function animationTick(timestamp) {
	clearScreen();
	drawBackground();
	checkGamepadButtonPress();
	
	if (gameState.started && !gameState.paused) {
		if (Tetromino.active){
			Tetromino.active.move();
		}

		if (timestamp >= nextTick){
			let oldState = Tetromino.active.state;
			let oldPos = Tetromino.active.pos.y;
			let lockout = 0;
			Tetromino.active.move(0, -1);
			if (Tetromino.active.state === oldState && Tetromino.active.pos.y === oldPos) {
				if (!Tetromino.active.hasLocked){
					Tetromino.active.hasLocked = true;
					lockout = 500;
				} else {
					updatePlayfield();
					getNextBlock();
				}
			}
			checkGameOver();
			nextTick = timestamp + tickRate + lockout;
		}
	}

	drawPlayfield();

	if (!gameState.started || gameState.paused){
		Menu.activeMenu.display();
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
	drawGamepadMessage();
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
	ctx.fillStyle = "rgba(220, 220, 220, 0.9)";
	ctx.fillText(" LINES: " + scoreboard.linesFormat(), board.nextBlock.x, board.nextBlock.y + board.nextBlock.height + 100);
}

function drawGamepadMessage(){
	ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
	ctx.textAlign = "left";
	ctx.font = "1.0rem Courier New, sans-serif";
	ctx.fillText("-- Controller --", board.nextBlock.x - 10, board.nextBlock.y + board.nextBlock.height + 150);
	if (gamepad.active) {
		ctx.fillStyle = "rgba(130, 255, 150, 0.8)";
		ctx.fillText("   Connected", board.nextBlock.x - 10, board.nextBlock.y + board.nextBlock.height + 170);
	} else {
		ctx.fillText("  Disconnected", board.nextBlock.x - 10, board.nextBlock.y + board.nextBlock.height + 170);
	}
};

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
	switch (level){
		case 0:	return 500;
		case 1: return 400;
		case 2: return 300;
		case 3: return 225;
		case 4: return 175;
		case 5: return 150;
	}
	return 150 - Math.min((level-5)*20, 50);
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
			Menu.activeMenu = gameOverMenu;
		};
	});
}

function resetGame(startingLevel = 0) {
	scoreboard.score = 0;
	scoreboard.level = startingLevel;
	scoreboard.linesCleared = 0;
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
				if (block.states[block.state][block.size-1-row][col] === 1){
					ctx.fillStyle = block.color;
				} else {
					ctx.fillStyle = "black";
				}
				ctx.fillRect(board.nextBlock.x + (col*15) + xOffset, board.nextBlock.y + (row*15) + yOffset, 15, 15);
			} else {
				if (block.states[block.state][block.size-1-row][col] === 1){
					ctx.drawImage(block.sprite, board.nextBlock.x + (col*15) + xOffset, board.nextBlock.y + (row*15) + yOffset, 15, 15);
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
		scoreboard.linesCleared += rows.length;
		if (scoreboard.linesCleared >= nextLevelRequirement()){
			changeLevel();
			scoreboard.linesCleared = 0;
		}
	}
}

function nextLevelRequirement(){
	return Math.min(65, scoreboard.level*3 + 5);
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

function createHighScore() {
	return new Menu([
		{
			name: "AAA  054000",
			initials: "AAA",
			score: 54000
		},
		{
			name: "AAA  048000",
			initials: "AAA",
			score: 48000
		},
		{
			name: "AAA  036000",
			initials: "AAA",
			score: 36000
		},
		{
			name: "AAA  024000",
			initials: "AAA",
			score: 24000
		},
		{
			name: "AAA  016000",
			initials: "AAA",
			score: 16000
		},
		{
			name: "AAA  012000",
			initials: "AAA",
			score: 12000
		},
		{
			name: "AAA  008000",
			initials: "AAA",
			score: 8000
		},
		{
			name: "AAA  005000",
			initials: "AAA",
			score: 5000
		},{
			name: "AAA  003000",
			initials: "AAA",
			score: 3000
		},{
			name: "AAA  001000",
			initials: "AAA",
			score: 1000
		}
	], false);
}

function addHighScore(playerInitials, playerScore){
	let formatInit = playerInitials.toUpperCase();
	let formatScore = playerScore.toString().padStart(6, "0");
	let formatName = formatInit + "  " + formatScore;
	let newScore = {
		name: formatName,
		initials: formatInit,
		score: playerScore,
		highlight: true
	};
	highScore.menuItems.push(newScore);
	sortHighScore();
	highScore.menuItems.pop();
}

function loadHighScore(){
	let strScore = highScoreStorage.getItem("score");
	if (strScore === null) return;
	let scoreArr = JSON.parse(strScore);
	if (Array.isArray(scoreArr)) {
		highScore.menuItems = scoreArr;
	} else {
		throw new Error("Invalid stored high score.");
	}
}

function saveHighScore(){
	let strScore = JSON.stringify(highScore.menuItems);
	highScoreStorage.setItem("score", strScore);
}

function sortHighScore(){
	let sorted = highScore.menuItems.sort((prev, cur) => {
		return prev.score < cur.score;
	});
	return sorted;
}

function resetHighlighting(){
	highScore.menuItems.forEach(item => item.highlight = false);
}

function checkGamepadButtonPress(){
	if (!gamepad.active) return;
	
	for (let index in gamepad.buttonList) {
		if (gamepad.active.buttons[index].pressed){
			if (gamepad.buttonList[index].pressed) {
				//hold
			} else {
				//hit
				gamepad.buttonList[index].pressed = true;
			}
		} else {
			if (gamepad.buttonList[index].pressed) {
				//release
				let keyCode = gamepad.buttonList[index].keyCode;
				window.dispatchEvent(new KeyboardEvent('keydown',{'code':keyCode}));
				gamepad.buttonList[index].pressed = false;
			}
		}
	}

}

function selectEndOfGameMenu(){
	const hasHighScore = highScore.menuItems.some(item => item.score <= scoreboard.score);
	if (hasHighScore){
		Menu.activeMenu = insertHighScore;
	} else {
		Menu.activeMenu = mainMenu;
	}
}

function pauseGame(){
	gameState.paused = true;
	Menu.activeMenu = pauseMenu;
}

function unpauseGame() {
	gameState.paused = false;
	Menu.activeMenu = mainMenu;
}

})();