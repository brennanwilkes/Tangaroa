const MAX_DIM = Math.min(Math.max(document.documentElement.clientWidth, window.innerWidth || 0), Math.max(document.documentElement.clientHeight, window.innerHeight || 0));

const MAP_SIZE = 5;

const TILE_SIZE = Math.round(MAX_DIM*0.9/MAP_SIZE);
const CANVAS_SIZE = TILE_SIZE*MAP_SIZE;

var canvas = document.getElementById("map");
var ctx = canvas.getContext("2d");

var map = new Array(MAP_SIZE);
var islands = new Array(MAP_SIZE);

function dist(x,y){
	return 1-Math.sqrt(Math.pow(Math.abs(0.5-(x/TILE_SIZE)),2)+Math.pow(Math.abs(0.5-(y/TILE_SIZE)),2));
}

function islandify(height,dis,scale){
	return height*Math.pow(dis*scale,0.8);
}

function setUp(){
	canvas.width = CANVAS_SIZE;
	canvas.height = CANVAS_SIZE;
	canvas.style.margin = Math.round(MAX_DIM*0.05)+"px";


	noise.seed(Math.random()*1000);

	for(let i=0;i<MAP_SIZE;i++){
		map[i] = new Array(MAP_SIZE);
		islands[i] = new Array(MAP_SIZE);
		for(let j=0; j<MAP_SIZE; j++){
			map[i][j] = Math.abs(noise.simplex2(i/15, j/15));
		}
	}
	for(let i=0;i<MAP_SIZE;i++){
		for(let j=0; j<MAP_SIZE; j++){
			islands[i][j] = new Array(TILE_SIZE);
			noise.seed(Math.random()*1000);
			for(let x=0;x<TILE_SIZE;x++){
				islands[i][j][x] = new Array(TILE_SIZE);
				for(let y=0;y<TILE_SIZE;y++){
					islands[i][j][x][y] = Math.abs(noise.perlin2(x/10, y/10));
					islands[i][j][x][y] = islandify(islands[i][j][x][y],dist(x,y),map[i][j]);
					islands[i][j][x][y] = Math.max(Math.min(islands[i][j][x][y],1),0);
				}
			}
		}
	}

	drawMap();
	drawIslands();
}

function drawMap(){
	for(let i=0;i<MAP_SIZE;i++){
		for(let j=0; j<MAP_SIZE; j++){
			ctx.fillStyle = "rgb("+map[i][j]*255+", "+map[i][j]*255+", "+map[i][j]*255+")";
			ctx.fillRect(i*TILE_SIZE,j*TILE_SIZE,TILE_SIZE,TILE_SIZE);
		}
	}
}

function drawIslands(){
	for(let i=0;i<MAP_SIZE;i++){
		for(let j=0; j<MAP_SIZE; j++){
			for(let x=0;x<TILE_SIZE;x++){
				for(let y=0; y<TILE_SIZE; y++){
					if(islands[i][j][x][y] < 0.2){
						ctx.fillStyle = "rgb("+0+", "+0+", "+255+")";
					}
					else if(islands[i][j][x][y] < 0.25){
						ctx.fillStyle = "rgb("+96+", "+54+", "+38+")";
					}
					else{
						ctx.fillStyle = "rgb("+0+", "+255+", "+0+")";
					}
					ctx.fillRect(i*TILE_SIZE+x,j*TILE_SIZE+y,1,1);
				}
			}
		}
	}
}
