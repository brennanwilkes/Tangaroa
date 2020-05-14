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
var world;
var player;
var intervalID;
var tickCount = 0;

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
	player.wx = 0;
	player.wy = 0;


	player.rot = 5/4*Math.PI;
	player.xs = 0;
	player.ys = 0;
	player.speed = 0;
	player.push = 0;

	player.img = new Image();
	player.img.src = "canoe.png";


	player.onbeach = false;
	player.onground = false;

	player.left = false;
	player.right = false;
	player.up = false;
	player.down = false;

	player.particles = new Array();

	world = new Map(true);
	world.regenerate(RESOLUTION);
	map = world.get(player.wx,player.wy);


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

	for(let p = 0; p < player.particles.length; p++){
		if(player.particles[p].draw(ctx,player.x*-1 + MAX_X/2,player.y*-1 + MAX_Y/2)){
			player.particles.splice(p, 1);
			p--;
		}
	}

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


	//move in world
	if((player.rx < MAX_X*-1) || (player.rx > MAX_X*2) || (player.ry < MAX_Y*-1) || (player.ry > MAX_Y*2)){

		//go left
		if(player.rx < MAX_X*-2){
			player.wx--;
			map = world.get(player.wx,player.wy);
			player.rx = MAX_X*3/2;
			player.ry = MAX_Y/2;
		}
		//go right
		else if(player.rx > MAX_X*2){
			player.wx++;
			map = world.get(player.wx,player.wy);
			player.rx = MAX_X*-0.5;
			player.ry = MAX_Y/2;
		}

		//go up
		else if(player.ry < MAX_Y*-1){
			player.wy--;
			map = world.get(player.wx,player.wy);
			player.rx = MAX_X/2;
			player.ry = MAX_Y*3/2;
		}
		//go down
		else if(player.ry > MAX_Y*2){
			player.wy++;
			map = world.get(player.wx,player.wy);
			player.rx = MAX_X/2;
			player.ry = MAX_Y*-0.5;
		}

		for(let p=0;p<player.particles.length;p++){
			player.particles[p].x = Math.round(player.rx - (player.x - player.particles[p].x));
			player.particles[p].y = Math.round(player.ry - (player.y - player.particles[p].y));
		}

		player.x = Math.round(player.rx);
		player.y = Math.round(player.ry);

		console.log(player.wx,player.wy);

	}

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
	if(player.speed > 1 && tickCount%3==0){
		if(!map.onbeach(player.x,player.y) && !map.onground(player.x,player.y)){
			for(let i=0.15;i<1;i+=0.25){
				player.particles.push(new Particle(player.x, player.y, player.speed*i, player.rot, true,30 + 5*(1-i)*player.speed ,Math.round(6*(1-i)/1) ));
				player.particles.push(new Particle(player.x, player.y, player.speed*i, player.rot, false,30 + 5*(1-i)*player.speed ,Math.round(6*(1-i)/1) ));
			}
		}
	}
	if((tickCount%20 === 0 && player.speed < 6) || (player.speed >=6 && tickCount%12 < player.speed-5)){
		let part_x, part_y;
		for(let iter = 0; iter < 25; iter++){
			part_x = ran_b(player.x-MAX_X/2,player.x+MAX_X/2);
			part_y = ran_b(player.y-MAX_Y/2,player.y+MAX_Y/2);
			if(!map.onbeach(part_x,part_y) && !map.onground(part_x,part_y)){
				player.particles.push(new Particle(part_x,part_y, 0, 0, false, 100 , 4));
				break
			}
		}
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

	//random waves
	if(player.speed > 2){
		player.xs += Math.sin(tickCount/10)*Math.cos(player.rot+Math.PI/2)*player.speed/12;
		player.ys += Math.sin(tickCount/10)*Math.sin(player.rot+Math.PI/2)*player.speed/12;

		if(tickCount%60 === 0){
			player.push = (Math.random()*0.01-0.005) * Math.PI;
		}
		else if(tickCount%60 < 20){
			player.rot += player.push;
		}
	}






	player.rx = player.rx-player.xs;
	player.ry = player.ry-player.ys;

	player.x = Math.round(player.rx);
	player.y = Math.round(player.ry);


	draw_screen()


	player.onbeach = map.onbeach(player.x,player.y);
	player.onground = map.onground(player.x,player.y);


	tickCount++;
}
