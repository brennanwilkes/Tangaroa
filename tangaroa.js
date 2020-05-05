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
	player.rx = 0;
	player.ry = 0;
	player.x = 0;
	player.y = 0;
	player.rot = Math.PI/2;
	player.xs = 0;
	player.ys = 0;
	player.speed = 0;

	player.onbeach = false;
	player.onground = false;

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

function draw_tri(){
	ctx.save();
	ctx.fillStyle = "brown";
	ctx.translate(MAX_X/2,MAX_Y/2);
	ctx.rotate(player.rot);
	ctx.rotate(Math.PI*-0.5);
	ctx.beginPath();

	ctx.lineTo(10, 0);
	ctx.lineTo(0, -10);
	ctx.lineTo(-10, 0);
	ctx.fill();
	ctx.restore();
}

function tick(event){
	if(player.right){
		player.rot = (player.rot+(Math.PI/100))%(Math.PI*2);
	}
	if(player.left){
		player.rot = (player.rot-(Math.PI/100))%(Math.PI*2);
	}

	else if(player.onground){
		player.speed = Math.max(0,player.speed-0.25);
	}
	else if(player.up){
		if(player.left || player.right){
			if(player.speed > 4){
				player.speed = Math.max(4,player.speed-0.1);
			}
		}
		else{
			player.speed = Math.min(12,player.speed+0.05);
		}

	}
	else{
		player.speed = Math.max(0,player.speed-0.1);
	}

	if(player.onbeach){
		if(player.speed > 1){
			player.speed = Math.max(1,player.speed-1);
		}
	}

	player.xs = player.speed*Math.cos(player.rot);
	player.ys = player.speed*Math.sin(player.rot);

	player.rx = player.rx-player.xs;
	player.ry = player.ry-player.ys;

	player.x = Math.round(player.rx);
	player.y = Math.round(player.ry);


	drawOptimizedMap(map);

	draw_tri();

	if(player.x > 0 && player.x < map.raw_data.length && player.y > 0 && player.y< map.raw_data[player.x].length){
		player.onbeach = (map.raw_data[player.x][player.y] >= 0.3) && (map.raw_data[player.x][player.y] < 0.35);
		player.onground = (map.raw_data[player.x][player.y] >= 0.35);
	}



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
			ctx.fillRect(map[map.colours[c]][p][0]*map.resolution - player.x + MAX_X/2, map[map.colours[c]][p][1]*map.resolution - player.y + MAX_Y/2, 1*map.resolution, map[map.colours[c]][p][2]*map.resolution);
		}
	}
}

//if(keyPressMap["Thrust"])
