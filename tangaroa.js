const MAX_Y = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
const MAX_X = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);

var canvas = document.getElementById("map");
var ctx = canvas.getContext("2d");

const Resolution = Object.freeze({"ultralow":8,"low":4, "medium":2, "high":1})
var RESOLUTION = Resolution.high;

var map;

var resolutionSlider = document.getElementById("resolution");
resolutionSlider.oninput = function() {
	RESOLUTION = {"1":Resolution.ultralow,"2":Resolution.low,"3":Resolution.medium,"4":Resolution.high}[this.value];
	map = regenerate(map, RESOLUTION);
	drawOptimizedMap(map);
}

function setUp(){
	canvas.width = MAX_X;
	canvas.height = MAX_Y;


	map = optimize(split_map(compress(gen_island(1000,1000),RESOLUTION)));

	drawOptimizedMap(map);
}

function rgb(r,g,b){
	return "rgb("+r+", "+g+", "+b+")";
}

function drawDataMap(map){
	console.log("Rendering map - "+map.seed);

	ctx.fillStyle = "darkblue";
	ctx.fillRect(0,0,MAX_X,MAX_Y);

	for(let i=0;i<map.length;i++){
		for(let j=0; j<map[0].length; j++){
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

function drawMap(map){
	console.log("Rendering map - "+map.seed);

	ctx.fillStyle = map.colours[0];
	ctx.fillRect(0,0,MAX_X,MAX_Y);

	for(let c=1;c<map.colours.length;c++){
		ctx.fillStyle = map.colours[c];
		for(let p=0;p<map[map.colours[c]].length;p++){
			ctx.fillRect(map[map.colours[c]][p][0],map[map.colours[c]][p][1],1,1);
		}
	}
}

function drawOptimizedMap(map){
	console.log("Rendering map - "+map.seed);

	ctx.fillStyle = map.colours[0];
	ctx.fillRect(0,0,MAX_X,MAX_Y);

	for(let c=1;c<map.colours.length;c++){
		ctx.fillStyle = map.colours[c];
		for(let p=0;p<map[map.colours[c]].length;p++){
			ctx.fillRect(map[map.colours[c]][p][0]*map.resolution,map[map.colours[c]][p][1]*map.resolution,1*map.resolution,map[map.colours[c]][p][2]*map.resolution);
		}
	}
}
