var origBoard;
var humanPlayer = 'X';
var aiPlayer = 'O';
var currentPlayer;
var mode;
var cpuEH;
var countXWins = 0;
var countOWins = 0;
var winBreak = false;
var f = 0, isOver = false;
var timeLimited = 60;
var winingConditions = [
    [0,1,2],
    [3,4,5],
    [6,7,8],
    [0,3,6],
    [1,4,7],
    [2,5,8],
    [0,4,8],
    [2,4,6]
]
var time = 0;
var cells = document.querySelectorAll('.cell');
var modal = document.querySelector('.modal');
var modeOfCpu = document.querySelector('.computer-mode');
function cpu(){
	modeOfCpu.style.display='flex';
	mode = 'AI';
}
function cpuMode(e){
	modal.style.display = "none";
	if(e=="mode-easy"){
		cpuEH = "easy";
	}else{
		cpuEH = "hard";
	}
	startGame();
}
function human(){
	modal.style.display='none';
	mode = 'HUMAN';
	document.querySelector('.app').style.backgroundColor='#4d3a85';
	startGame();
}

function handleTimeLimited(){
	let btnTL = document.querySelector(".time-limited input");
	if(btnTL.value){
		timeLimited = btnTL.value;
		btnTL.value='';
	}
}
function startGame(){
	document.querySelector('.end-game').style.display = "none";
    origBoard = Array.from(Array(9).keys());
	winBreak=false;
	isOver=false;
	timeLimited=60;
	document.querySelector(".turn-player").innerText="";
    for (const cell of cells) {
        cell.innerText = '';
        cell.style.removeProperty("background-color");
        cell.style.removeProperty("color");
		cell.classList.remove("highlight");
		if(mode == 'AI'){
			cell.addEventListener('click',turnClick);
		}
    }
	if(mode=='HUMAN'){
		startGameHuman();
	}
}
function turnClick(){
    if (typeof origBoard[this.id] == 'number') {
		document.querySelector(".turn-player").innerText="X";
		turn(this.id, humanPlayer);
		if (!checkWin(origBoard, humanPlayer) && !checkTie()) {
			turn(bestSpot(), aiPlayer);
		};
	}
}
var clock = document.querySelector(".clock");
clock.innerText=0;
function counter(f){
	if(f<2){
		let a = setInterval(function(){
			time++;
			if(time==timeLimited && isOver==false){
				time = 0;
				if(mode=="AI"){
					declareWinner("over time O");
				}
				if (mode == "HUMAN") {
					var reverseCurrent;
					reverseCurrent = currentPlayer == "X" ? "O" : "X";
					declareWinner("over time "+reverseCurrent)
				};
				clearInterval(a);
			}
			if(isOver==true){
				time = 0;
				clearInterval(a);
			}
			clock.innerText=time;
		},1000)
	}
}

function turn(id,player){
	// clearInterval(a);
	if(player == aiPlayer){
		f++;
		counter(f);
		document.getElementById(id).style.color="#f2436f";
	}
	if(player==humanPlayer){
		time = 0;
		
	}
    origBoard[id]=player;
    document.getElementById(id).innerText=player;
    let gameWon = checkWin(origBoard,player);
    if(gameWon){
        gameOver(gameWon);
    }
}
function checkWin(board,player){
    
    let plays = board.reduce(function(a, e, i){
		if(e == player) return  a.concat(i) 
        else return a;
    }, []);
    let gameWon = null;
    for (let [index, win] of winingConditions.entries()) {
		if (win.every(elem => plays.indexOf(elem) > -1)) {
			gameWon = {index: index, player: player};
			break;
		}
	}
    return gameWon;
}

function gameOver(gameWon){
    for(let index of winingConditions[gameWon.index]){
        document.getElementById(index).style.backgroundColor= "#2d414b";
    }
    for (const cell of cells) {
       
        cell.removeEventListener('click',turnClick)
    }
    declareWinner(gameWon.player==humanPlayer? humanPlayer : aiPlayer);
}


function declareWinner(who){
	f=0;
	isOver = true;
	document.querySelector(".end-game").style.display="block";
	if(who == "X" || who == "over time X"){
		countXWins++;
		document.querySelector('.x-win i').innerText=countXWins;
	}
	if(who == "O" || who == "over time O"){
		countOWins++;
		document.querySelector('.o-win i').innerText=countOWins;
	}

    
	if(who == "Tie game!"){
		document.querySelector(".end-game .text").innerText=who;
	}
	else{
		document.querySelector(".end-game .text").innerText=who + " win!";
	}
}

function emptySquares() {
	return origBoard.filter(function(s){ return typeof s == 'number'});
}

function random(n){
	if(n<0) return;
	let random = Math.random() * (n-1);
	let result = Math.round(random);
	return result;
}

function randomSpot(){
	let lengthES = emptySquares().length;
	let spot = emptySquares()[random(lengthES)];
	return spot;
}

function bestSpot() {
	if(cpuEH == "easy"){
		let s = randomSpot();
		return s;
	}
	if(cpuEH == "hard"){
		return minimax(origBoard,aiPlayer).index;
	}
}

function checkTie(){
    if(emptySquares().length==0 && winBreak == false){
        for (const cell of cells) {
            cell.style.backgroundColor="#2d414b";
            cell.removeEventListener('click',turnClick)
        }
		
        declareWinner("Tie game!");
        return true;
    }
    return false;
}

function minimax(newBoard, player) {
	var availSpots = emptySquares();

	if (checkWin(newBoard, humanPlayer)) {
		return {score: -10};
	} else if (checkWin(newBoard, aiPlayer)) {
		return {score: 10};
	} else if (availSpots.length === 0) {
		return {score: 0};
	}
	var moves = [];
	for (var i = 0; i < availSpots.length; i++) {
		var move = {};
		move.index = newBoard[availSpots[i]];
		newBoard[availSpots[i]] = player;

		if (player == aiPlayer) {
			var result = minimax(newBoard, humanPlayer);
			move.score = result.score;
		} else {
			var result = minimax(newBoard, aiPlayer);
			move.score = result.score;
		}

		newBoard[availSpots[i]] = move.index;

		moves.push(move);
	}

	var bestMove;
	if(player === aiPlayer) {
		var bestScore = -10000;
		for(var i = 0; i < moves.length; i++) {
			if (moves[i].score > bestScore) {
				bestScore = moves[i].score;
				bestMove = i;
			}
		}
	} else {
		var bestScore = 10000;
		for(var i = 0; i < moves.length; i++) {
			if (moves[i].score < bestScore) {
				bestScore = moves[i].score;
				bestMove = i;
			}
		}
	}

	return moves[bestMove];
}


function startGameHuman(){
	currentPlayer = "X";
	document.querySelector(".turn-player").innerText="X";
	function checkForWinner(){
		winingConditions.forEach(function(combo){
			let check = combo.every(idx => cells[idx].innerText.trim() == currentPlayer);
			if(check){
				winBreak=true;
				highlightCells(combo);
				declareWinner(currentPlayer);
			}
		})
	}

	function highlightCells(combo){
		combo.forEach(function(idx){
			cells[idx].classList.add("highlight");
		})
	}
	
	cells.forEach(function(cell){
		cell.addEventListener('click', function (){
			if(cell.innerText.trim() != "") return;
			if(currentPlayer=="O"){
				this.style.color = "#f2436f";
			}
			cell.innerText = currentPlayer;
			time=0;
			f++;
			counter(f);
			origBoard[cell.id]=currentPlayer;
			checkForWinner();
			checkTie();
			currentPlayer = currentPlayer == "X" ? "O" : "X";
			document.querySelector(".turn-player").innerText=currentPlayer;
		})
	})
}
function quitGame(){
	window.location.reload();
}
