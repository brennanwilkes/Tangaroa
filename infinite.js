const MAX_DIM = Math.min(Math.max(document.documentElement.clientWidth, window.innerWidth || 0), Math.max(document.documentElement.clientHeight, window.innerHeight || 0));

const MAP_SIZE = 25;

const TILE_SIZE = Math.round(MAX_DIM*0.9/MAP_SIZE);
const CANVAS_SIZE = TILE_SIZE*MAP_SIZE;

var canvas = document.getElementById("map");
var ctx = canvas.getContext("2d");

var map = new Array(CANVAS_SIZE);

function setUp(){
	canvas.width = CANVAS_SIZE;
	canvas.height = CANVAS_SIZE;
	canvas.style.margin = Math.round(MAX_DIM*0.05)+"px";
	generateMap();
	drawMap();
}

function generateMap(){
	noise.seed(Math.random()*1000);

	for(let i=0;i<CANVAS_SIZE;i++){
		map[i] = new Array(CANVAS_SIZE);
		for(let j=0; j<CANVAS_SIZE; j++){
			map[i][j] = Math.abs(noise.simplex2(i/15, j/15));
		}
	}
}

function drawMap(){
	for(let i=0;i<CANVAS_SIZE;i++){
		for(let j=0; j<CANVAS_SIZE; j++){
			if(map[i][j]>0.5){
				ctx.fillStyle = "green";
			}
			else{
				ctx.fillStyle = "blue";
			}
			ctx.fillRect(i*1,j*1,1,1);
		}
	}
}
