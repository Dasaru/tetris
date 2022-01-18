const Tetris = (function(){
"use strict"

const canvas = document.getElementById("tetrisBoard");
let ctx = canvas.getContext("2d");

clearScreen();

function clearScreen(){
	ctx.fillStyle = "black";
	ctx.fillRect(0, 0, 400, 600);
}

})();