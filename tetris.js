const Tetris = (function(){
"use strict"

const canvas = document.getElementById("tetrisBoard");
let ctx = canvas.getContext("2d");

let grid = Array(20).fill(Array(10).fill(null));

clearScreen();
drawBoardBackground();

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