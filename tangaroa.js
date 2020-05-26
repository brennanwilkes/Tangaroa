/*

	COOL SEEDS


*/


const MAX_Y = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
const MAX_X = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);


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
	player.space = false;

	player.particles = new Array();
	player.events = new Array();

	world = new Map(false,3);
	world.regenerate(RESOLUTION);
	map = world.get(player.wx,player.wy);


	addEventListener("keydown",key_down);
	addEventListener("keyup",key_up);
	intervalID = setInterval(tick,4);

}

function key_down(event){
	if(event.key.substring(0,5) === "Arrow"){
		player[event.key.substring(5).toLowerCase()] = true;
	}
	else if(event.code==="Space"){
		player.space = true;
	}
}
function key_up(event){
	if(event.key.substring(0,5) === "Arrow"){
		player[event.key.substring(5).toLowerCase()] = false;
	}
	else if(event.code==="Space"){
		player.space = false;
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

	for(let b = 0; b < Boid.totalBoids; b++){
		Boid.boids[b].draw(ctx,player.x*-1 + MAX_X/2,player.y*-1 + MAX_Y/2);
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
	if(player.space){
		map_tick(event);
	}
	else{
		game_tick(event);
	}
}

function map_tick(event){
	world.draw(ctx);
}

function game_tick(event){


	//move in world
	if((player.rx < Math.max(MAX_X,map.size[0])*-1) || (player.rx > Math.max(MAX_X,map.size[0])*2) || (player.ry < Math.max(MAX_Y,map.size[1])*-1) || (player.ry > Math.max(MAX_Y,map.size[1])*2)){

		//go left
		if(player.rx < Math.max(MAX_X,map.size[0])*-1){
			player.wx--;
			map = world.get(player.wx,player.wy);
			player.rx = Math.max(MAX_X,map.size[0])*3/2;
			player.ry = Math.max(MAX_Y,map.size[1])/2;
		}
		//go right
		else if(player.rx > Math.max(MAX_X,map.size[0])*2){
			player.wx++;
			map = world.get(player.wx,player.wy);
			player.rx = Math.max(MAX_X,map.size[0])*-0.5;
			player.ry = Math.max(MAX_Y,map.size[1])/2;
		}

		//go up
		else if(player.ry < Math.max(MAX_Y,map.size[1])*-1){
			player.wy--;
			map = world.get(player.wx,player.wy);
			player.rx = Math.max(MAX_X,map.size[0])/2;
			player.ry = Math.max(MAX_Y,map.size[1])*3/2;
		}
		//go down
		else if(player.ry > Math.max(MAX_Y,map.size[1])*2){
			player.wy++;
			map = world.get(player.wx,player.wy);
			player.rx = Math.max(MAX_X,map.size[0])/2;
			player.ry = Math.max(MAX_Y,map.size[1])*-0.5;
		}

		for(let p=0;p<player.particles.length;p++){
			player.particles[p].x = Math.round(player.rx - (player.x - player.particles[p].x));
			player.particles[p].y = Math.round(player.ry - (player.y - player.particles[p].y));
		}
		for(let boi=0; boi<Boid.totalBoids; boi++){
			Boid.boids[boi].position[0] = Math.round(player.rx - (player.x - Boid.boids[boi].position[0]));
			Boid.boids[boi].position[1] = Math.round(player.ry - (player.y - Boid.boids[boi].position[1]));
		}

		player.x = Math.round(player.rx);
		player.y = Math.round(player.ry);

	}

	if(player.right){
		player.rot = (player.rot+(Math.PI/400))%(Math.PI*2);
	}
	if(player.left){
		player.rot = (player.rot-(Math.PI/400))%(Math.PI*2);
	}

	if(player.onground){
		player.speed = Math.max(0,player.speed-0.0625);
	}
	if(player.left || player.right){
		if(player.up){
			if(player.speed > 4){
				player.speed = Math.max(4,player.speed-0.025);
			}
		}
		else{
			player.speed = Math.max(0,player.speed-0.025);
		}
	}
	if(player.up){
		player.speed = Math.min(16,player.speed+(player.speed < 4 ? 0.004 : 0.0125));
	}
	else{
		player.speed = Math.max(0,player.speed-0.025);
	}
	if(player.speed > 1 && tickCount%18==0){
		if(!player.onbeach && !player.onground){
			for(let i=0.05;i<1;i+=0.25){
				player.particles.push(new Particle(player.x, player.y, player.speed*(i*i)/2, player.rot, true, (30 + 5*(1-i)*player.speed*12),Math.round(6*(1-i)/1) ));
				player.particles.push(new Particle(player.x, player.y, player.speed*(i*i)/2, player.rot, false, (30 + 5*(1-i)*player.speed*12) ,Math.round(6*(1-i)/1) ));
			}
		}
	}
	if((tickCount%60 === 0 && player.speed < 6) || (player.speed >=6 && tickCount%60 < (player.speed-6)*4)){
		let part_x, part_y;
		for(let iter = 0; iter < 25; iter++){
			part_x = player.speed < 6 ? ran_b(player.x-MAX_X/2,player.x+MAX_X/2) : ran_b(Math.round(player.x-MAX_X/1.5),Math.round(player.x+MAX_X/1.5)) ;
			part_y = player.speed < 6 ? ran_b(player.y-MAX_Y/2,player.y+MAX_Y/2) : ran_b(Math.round(player.y-MAX_Y/1.5),Math.round(player.y+MAX_Y/1.5)) ;
			if(!map.onbeach(part_x,part_y) && !map.onground(part_x,part_y)){
				player.particles.push(new Particle(part_x,part_y, 0, 0, false, 400 , 4));
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

	player.xs = player.speed*Math.cos(player.rot)/4;
	player.ys = player.speed*Math.sin(player.rot)/4;

	//random waves
	if(player.speed > 4){

		if(tickCount%240 === 0){
			player.push = (Math.random()*0.01-0.005) * Math.PI;
		}
		else if(tickCount%240 < 90){
			player.rot += player.push/3;
		}
	}

	if(player.speed > 4 && Boid.totalBoids < 5 && map.is_transit) {
		let num_new_boids = ran_b(5,20);
		for(let n=0;n<num_new_boids;n++){
			new Boid(player.x+(MAX_X*3/4*Math.cos(player.rot)) + ran_b(-100,100), player.y+(MAX_Y*3/4*Math.sin(player.rot)) + ran_b(-100,100), Math.cos(player.rot) * Math.sqrt(player.speed)*-10 + ran_b(-2,2), Math.sin(player.rot) * Math.sqrt(player.speed)*-10 + ran_b(-2,2));
		}
	}

	if(Boid.totalBoids > 0){
		Boid.boids[tickCount%Boid.totalBoids].ai_tick();
		player.particles.push(new Particle(Boid.boids[tickCount%Boid.totalBoids].position[0],Boid.boids[tickCount%Boid.totalBoids].position[1], 0, 0, false, 50 , 4));
	}


	for(let b = 0; b < Boid.totalBoids; b++){
		if(player.speed > 4 && Boid.boids[b].slowdown === 0 ){
			Boid.boids[b].turn(Boid.boids[b].get_ang([player.x,player.y]),0.1);
		}
		Boid.boids[b].tick();


		if(player.speed <= 1){
			Boid.boids[b].slowdown=-1;
		}

		if((Math.abs(player.x-Boid.boids[b].position[0]) > MAX_X*3/4 || Math.abs(player.y-Boid.boids[b].position[1]) > MAX_Y*3/4) && Boid.boids[b].slowdown <= 0 ){
			Boid.boids[b].kill();
			b--;
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
