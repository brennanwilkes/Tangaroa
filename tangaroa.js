const MAX_DIM = Math.min(Math.max(document.documentElement.clientWidth, window.innerWidth || 0), Math.max(document.documentElement.clientHeight, window.innerHeight || 0));

const MAP_SIZE = 25;

const TILE_SIZE = Math.round(MAX_DIM*0.9/MAP_SIZE);
const CANVAS_SIZE = TILE_SIZE*MAP_SIZE;

var canvas = document.getElementById("map");
var ctx = canvas.getContext("2d");

var map;

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

	map = gen_noise_map(CANVAS_SIZE, CANVAS_SIZE, 50, 4, 0.5, 2);



	drawMap();

}
function drawMap(){
	for(let i=0;i<CANVAS_SIZE;i++){
		for(let j=0; j<CANVAS_SIZE; j++){
			ctx.fillStyle = "rgb("+map[i][j]*255+", "+map[i][j]*255+", "+map[i][j]*255+")";
			ctx.fillRect(i,j,1,1);
		}
	}
}

function debug_update(scale,oct,persist,lac){
	map = gen_noise_map(CANVAS_SIZE, CANVAS_SIZE, scale,oct,persist,lac);
	drawMap();
}
