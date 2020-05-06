const MAX_Y = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
const MAX_X = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);

const ISL_DEFAULT_SIZE = 2000;

var canvas = document.getElementById("map");
var ctx = canvas.getContext("2d");

const Resolution = Object.freeze({"ultralow":8,"low":4, "medium":2, "high":1})
var RESOLUTION = Resolution.high;

var map;

var player;

var resolutionSlider = document.getElementById("resolution");
resolutionSlider.oninput = function() {
	RESOLUTION = {"1":Resolution.ultralow,"2":Resolution.low,"3":Resolution.medium,"4":Resolution.high}[this.value];
	map.regenerate(RESOLUTION);
	clear_screen();
	map.draw(ctx);
}

function clear_screen(){
	ctx.fillStyle = map.colours[0];
	ctx.fillRect(0,0,MAX_X,MAX_Y);
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


	map = new Island(ISL_DEFAULT_SIZE,ISL_DEFAULT_SIZE,Math.random()*1000);
	//map = optimize(split_map(compress(gen_island(ISL_DEFAULT_SIZE,ISL_DEFAULT_SIZE),RESOLUTION)));
	//map.x = 0;
	//map.y = 0;

	clear_screen();
	map.draw(ctx);

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


	clear_screen();
	map.draw(ctx);

	draw_tri();

	if(player.x > 0 && player.x < map.raw_data.length && player.y > 0 && player.y< map.raw_data[player.x].length){
		player.onbeach = (map.raw_data[player.x][player.y] >= 0.3) && (map.raw_data[player.x][player.y] < 0.35);
		player.onground = (map.raw_data[player.x][player.y] >= 0.35);
	}



}



//if(keyPressMap["Thrust"])
