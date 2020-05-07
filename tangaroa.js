/*

	COOL SEEDS


*/


const MAX_Y = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
const MAX_X = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);

const ISL_DEFAULT_SIZE = 2000;

var canvas = document.getElementById("map");
var ctx = canvas.getContext("2d");

const Resolution = Object.freeze({"ultralow":8,"low":4, "medium":2, "high":1})
var RESOLUTION = Resolution.low;

var map;
var player;
var intervalID;

var resolutionSlider = document.getElementById("resolution");
resolutionSlider.oninput = function() {
	RESOLUTION = {"1":Resolution.ultralow,"2":Resolution.low,"3":Resolution.medium,"4":Resolution.high}[this.value];
	map.regenerate(RESOLUTION);
	draw_screen();
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
	player.rot = 5/4*Math.PI;
	player.xs = 0;
	player.ys = 0;
	player.speed = 0;

	player.img = new Image();
	player.img.src = "canoe.png";


	player.onbeach = false;
	player.onground = false;

	player.left = false;
	player.right = false;
	player.up = false;
	player.down = false;


	let settings = new IslandSettings();
	settings.type = 0;
	map = generate_random_island(settings);
	map.regenerate(RESOLUTION);

	addEventListener("keydown",key_down);
	addEventListener("keyup",key_up);
	intervalID = setInterval(tick,16);
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


function draw_screen(){
	clear_screen();
	map.draw(ctx,player.x*-1 + MAX_X/2,player.y*-1 + MAX_Y/2);

	ctx.save();
	ctx.translate(MAX_X/2,MAX_Y/2);
	ctx.scale(0.05,0.05);

	ctx.translate(player.img.width*0.025,player.img.height*0.025);


	ctx.rotate(player.rot);
	ctx.rotate(Math.PI*-0.5);

	ctx.translate(player.img.width/-2,player.img.height/-2);


	ctx.drawImage(player.img, 0, 0);
	ctx.restore();
}

function tick(event){
	if(player.right){
		player.rot = (player.rot+(Math.PI/100))%(Math.PI*2);
	}
	if(player.left){
		player.rot = (player.rot-(Math.PI/100))%(Math.PI*2);
	}

	if(player.onground){
		player.speed = Math.max(0,player.speed-0.25);
	}
	if(player.left || player.right){
		if(player.up){
			if(player.speed > 4){
				player.speed = Math.max(4,player.speed-0.1);
			}
		}
		else{
			player.speed = Math.max(0,player.speed-0.1);
		}
	}
	if(player.up){
		player.speed = Math.min(12,player.speed+0.05);
	}
	else{
		player.speed = Math.max(0,player.speed-0.1);
	}

	if(player.onbeach){
		if(player.speed > 1){
			player.speed = Math.max(1,player.speed-1);
		}

		if(!map.visted){
			if(map.attown(player.x,player.y)){
				console.log("Welcome to "+map.name);
				map.visted = true;
			}
		}
	}

	player.xs = player.speed*Math.cos(player.rot);
	player.ys = player.speed*Math.sin(player.rot);

	player.rx = player.rx-player.xs;
	player.ry = player.ry-player.ys;

	player.x = Math.round(player.rx);
	player.y = Math.round(player.ry);


	draw_screen()


	player.onbeach = map.onbeach(player.x,player.y);
	player.onground = map.onground(player.x,player.y);

}
