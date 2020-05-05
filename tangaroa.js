const MAX_Y = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
const MAX_X = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);

var canvas = document.getElementById("map");
var ctx = canvas.getContext("2d");

const Resolution = Object.freeze({"ultralow":8,"low":4, "medium":2, "high":1})
var RESOLUTION = Resolution.high;

var map;

var player;

var resolutionSlider = document.getElementById("resolution");
resolutionSlider.oninput = function() {
	RESOLUTION = {"1":Resolution.ultralow,"2":Resolution.low,"3":Resolution.medium,"4":Resolution.high}[this.value];
	map = regenerate(map, RESOLUTION);
	drawOptimizedMap(map);
}

function setUp(){
	canvas.width = MAX_X;
	canvas.height = MAX_Y;

	player = new Object();
	player.x = Math.round(MAX_X/2);
	player.y = Math.round(MAX_Y/2);
	player.rot = Math.PI/2;
	player.xs = 0;
	player.ys = 0;

	player.left = false;
	player.right = false;
	player.up = false;
	player.down = false;



	map = optimize(split_map(compress(gen_island(1000,1000),RESOLUTION)));

	drawOptimizedMap(map);

	addEventListener("keydown",key_down);
	addEventListener("keyup",key_up);
	setInterval(tick,16);
}

function key_down(event){
	if(event.key.substring(0,5) === "Arrow"){
		player[event.key.substring(5).toLowerCase()] = true;
	}
}
function key_up(event){
	if(event.key.substring(0,5) === "Arrow"){
		player[event.key.substring(5).toLowerCase()] = false;
	}
}

function tick(event){
	if(player.right){
		player.rot = (player.rot+(Math.PI/100))%(Math.PI*2);
	}
	if(player.left){
		player.rot = (player.rot-(Math.PI/100))%(Math.PI*2);
	}

	player.xs = player.xs > 0 ? Math.max(0,player.xs-=0.1) : Math.min(0,player.xs+=0.1);
	player.ys = player.ys > 0 ? Math.max(0,player.ys-=0.1) : Math.min(0,player.ys+=0.1);

	if(player.up){
		player.xs += 0.2*Math.cos(player.rot);
		player.ys += 0.2*Math.sin(player.rot);

		player.xs = Math.max(-4,Math.min(4,player.xs));
		player.ys = Math.max(-4,Math.min(4,player.ys));
	}

	ctx.translate(Math.round(player.xs),Math.round(player.ys));
	drawOptimizedMap(map);
}


function rgb(r,g,b){
	return "rgb("+r+", "+g+", "+b+")";
}

function drawDataMap(map){
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
	ctx.fillStyle = map.colours[0];
	ctx.fillRect(0,0,MAX_X,MAX_Y);

	for(let c=1;c<map.colours.length;c++){
		ctx.fillStyle = map.colours[c];
		for(let p=0;p<map[map.colours[c]].length;p++){
			ctx.fillRect(map[map.colours[c]][p][0]*map.resolution,map[map.colours[c]][p][1]*map.resolution,1*map.resolution,map[map.colours[c]][p][2]*map.resolution);
		}
	}
}

//if(keyPressMap["Thrust"])
