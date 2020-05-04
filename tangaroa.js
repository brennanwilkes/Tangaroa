const MAX_X = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
const MAX_Y = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

var canvas = document.getElementById("map");
var ctx = canvas.getContext("2d");

var map;



function setUp(){
	canvas.width = MAX_X;
	canvas.height = MAX_Y;

	noise.seed(Math.random()*1000);

	//map = gen_noise_map(MAX_X, MAX_Y, 50, 4, 0.5, 2);
	map = gen_island(MAX_X,MAX_Y);

	drawMap();

}
function drawMap(){
	for(let i=0;i<MAX_X;i++){
		for(let j=0; j<MAX_Y; j++){
			if(map[i][j]<0.4){
				ctx.fillStyle = "darkblue";
			}
			else if(map[i][j]<0.5){
				ctx.fillStyle = "blue";
			}
			else if(map[i][j] < 0.55){
				ctx.fillStyle = "coral";
			}
			else{
				ctx.fillStyle = "green";
			}

			ctx.fillRect(i,j,1,1);
		}
	}
}

function debug_update(scale,oct,persist,lac,reseed=false){
	if(reseed){
		noise.seed(Math.random()*1000);
	}
	map = gen_noise_map(MAX_X, MAX_Y, scale,oct,persist,lac);
	drawMap();
}
