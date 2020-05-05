const MAX_Y = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
const MAX_X = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);

var canvas = document.getElementById("map");
var ctx = canvas.getContext("2d");

var map;
var map2;
var map3;


function setUp(){
	canvas.width = MAX_X;
	canvas.height = MAX_Y;

	noise.seed(Math.random()*1000);


	//map = gen_island(MAX_X,MAX_Y);
	//map2 = gen_island(MAX_X,MAX_Y);
	//map3 = gen_island(MAX_X,MAX_Y);


	map = gen_arch(MAX_X,MAX_Y,3,2);

	drawMap(map);
}

function rgb(r,g,b){
	return "rgb("+r+", "+g+", "+b+")";
}

function drawMap(map){
	console.log("Rendering map - "+map.seed);

	ctx.fillStyle = "darkblue";
	ctx.fillRect(0,0,MAX_X,MAX_Y);

	for(let i=0;i<MAX_X;i++){
		for(let j=0; j<MAX_Y; j++){
			if(map[i][j]<0.1){
				continue;
			}
			else if(map[i][j]<0.3){
				ctx.fillStyle = "blue";
			}
			else if(map[i][j] < 0.35){
				ctx.fillStyle = "coral";
			}
			else if(map[i][j] < 0.75){
				ctx.fillStyle = "green";
			}
			else{
				ctx.fillStyle = "grey";
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
