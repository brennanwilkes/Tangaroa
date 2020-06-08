/*

	COOL SEEDS


*/


const MAX_Y = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
const MAX_X = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);


var canvas = document.getElementById("map");
var ctx = canvas.getContext("2d");


var map;
var world;
var player;
var menu_target;
var intervalID;
var tickCount = 0;
var gameTime = 0;

var lighting_overlay;


function clear_screen(colour){
	if(colour === undefined){
		colour = map.colours[0];
	}
	ctx.fillStyle = colour;
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

	player.anim = 1;
	player.frame = 0;
	player.totalframes = 9;

	player.img = new Image();
	player.img.src = "assets/player/canoe-sprite-Sheet.png";


	player.onbeach = false;
	player.onground = false;

	player.left = false;
	player.right = false;
	player.up = false;
	player.down = false;
	player.space = false;


	lighting_overlay = document.createElement("div");
	lighting_overlay.id = "lighting_overlay";
	document.body.prepend(lighting_overlay);


	intervalID = setInterval(menu_tick,4);
}

function key_down(event){
	if(event.key.substring(0,5) === "Arrow"){
		player[event.key.substring(5).toLowerCase()] = true;
	}
	else if(event.code==="Space"){
		player.space = true;
	}
	else if(event.code === "Period"){
		gameTime += 10;
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

	//Draw Mantas
	for(let b = 0; b < Manta.totalMantas; b++){
		Manta.mantas[b].draw(ctx,player.x*-1 + MAX_X/2,player.y*-1 + MAX_Y/2);
	}

	for(let p = 0; p < Particle.totalParticles; p++){
		if(Particle.particles[p].draw(ctx,player.x*-1 + MAX_X/2,player.y*-1 + MAX_Y/2)){
			Particle.particles[p].kill();
			p--;
		}
	}

	ctx.save();
	ctx.translate(MAX_X/2,MAX_Y/2);
	//ctx.translate(player.img.width*0.025,player.img.height*0.025);
	ctx.rotate(player.rot);
	ctx.rotate(Math.PI*-0.5);
	ctx.translate(player.img.width/player.totalframes/-2,player.img.height/-2);
	ctx.drawImage(player.img, player.img.width/player.totalframes * player.frame, 0, player.img.width/player.totalframes, player.img.height, -2, 0, player.img.width/player.totalframes, player.img.height); //why the -2? I have no idea
	ctx.restore();


	//Draw Albatrosses
	for(let b = 0; b < Albatross.totalAlbatrosses; b++){
		Albatross.albatrosses[b].draw(ctx,player.x*-1 + MAX_X/2,player.y*-1 + MAX_Y/2);
	}

	map.draw_lighting(ctx,player.x*-1 + MAX_X/2,player.y*-1 + MAX_Y/2);

}

function menu_tick(){
	if(tickCount%10===0){
		new Particle(ran_b(MAX_X/-2,MAX_X/2),ran_b(MAX_Y/-2,MAX_Y/2), 0, 0, false, 400 , 4);
	}

	if(tickCount%25 === 0){
		gameTime++;
		if(gameTime >= 100){
			gameTime *= -1;
		}
		document.getElementById("lighting_overlay").style.opacity = Math.max(Math.abs(gameTime)-45,0)/100;
	}

	//clear and respawn boids
	if(tickCount%2500===0){
		if(Boid.totalBoids > 0){
			Boid.boids[0].kill(true);
		}
		let sx = ran_b(0,1) === 0 ? -1 : 1;
		let sy = ran_b(0,1) === 0 ? -1 : 1;
		menu_target = [sx*MAX_X*-2/3,sy*MAX_Y*-2/3];

		let type = (Math.random() > 0.5);
		let num_new_boids = (type ? ran_b(2,6) : ran_b(6,18));


		for(let n=0;n<num_new_boids;n++){
			if(type){
				new Manta(sx*MAX_X*2/3 + ran_b(-100,100), sy*MAX_X*2/3 + ran_b(-100,100),sx*-1,sy*-1,0,true);
			}
			else{
				new Albatross(sx*MAX_X*2/3 + ran_b(-100,100), sy*MAX_X*2/3 + ran_b(-100,100),sx*-1,sy*-1,0,true);
			}
		}
	}

	Boid.boids[tickCount%Boid.totalBoids].ai_tick();
	for(let b = 0; b < Boid.totalBoids; b++){
		Boid.boids[b].target_tick(menu_target);
		Boid.boids[b].tick(tickCount);
	}




	clear_screen(DEEP_OCEAN);

	for(let p = 0; p < Particle.totalParticles; p++){
		if(Particle.particles[p].draw(ctx,player.x*-1 + MAX_X/2,player.y*-1 + MAX_Y/2)){
			Particle.particles[p].kill();
			p--;
		}
	}

	for(let b = 0; b < Boid.totalBoids; b++){
		Boid.boids[b].draw(ctx,MAX_X/2,MAX_Y/2);
	}


	tickCount++;
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

		if(!map.is_transit){
			map.unload();
		}

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

		for(let p=0;p<Particle.totalParticles;p++){
			Particle.particles[p].x = Math.round(player.rx - (player.x - Particle.particles[p].x));
			Particle.particles[p].y = Math.round(player.ry - (player.y - Particle.particles[p].y));
		}
		for(let boi=0; boi<Boid.totalBoids; boi++){
			Boid.boids[boi].position[0] = Math.round(player.rx - (player.x - Boid.boids[boi].position[0]));
			Boid.boids[boi].position[1] = Math.round(player.ry - (player.y - Boid.boids[boi].position[1]));
		}

		if(!map.is_transit){
			map.bake_lighting();
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
	if(player.speed > 0.35 && tickCount%18==0){
		if(!player.onbeach && !player.onground){
			for(let i=0.05;i<1;i+=0.25){

				//main boat particles
				new Particle(player.x, player.y, player.speed*(i*i)/2, player.rot, true, (30 + 5*(1-i)*player.speed*12), Math.round(6*(1-i)/1));
				new Particle(player.x, player.y, player.speed*(i*i)/2, player.rot, false, (30 + 5*(1-i)*player.speed*12), Math.round(6*(1-i)/1));


				//constructor(x, y, speed, rot, mirror, life = 60, size=4){


				//side boat particles
				new Particle(player.x, player.y, player.speed*(i*i)/3, player.rot, true, (30 + 5*(1-i)*player.speed*2), Math.round(3*(1-i)/1), -10.5);
				new Particle(player.x, player.y, player.speed*(i*i)/3, player.rot, false, (30 + 5*(1-i)*player.speed*2), Math.round(3*(1-i)/1), -10.5);
			}
		}
	}
	if((tickCount%60 === 0 && player.speed < 6) || (player.speed >=6 && tickCount%60 < (player.speed-6)*4)){
		let part_x, part_y;
		for(let iter = 0; iter < 25; iter++){
			part_x = player.speed < 6 ? ran_b(player.x-MAX_X/2,player.x+MAX_X/2) : ran_b(Math.round(player.x-MAX_X/1.5),Math.round(player.x+MAX_X/1.5)) ;
			part_y = player.speed < 6 ? ran_b(player.y-MAX_Y/2,player.y+MAX_Y/2) : ran_b(Math.round(player.y-MAX_Y/1.5),Math.round(player.y+MAX_Y/1.5)) ;
			if(!map.onbeach(part_x,part_y) && !map.onground(part_x,part_y)){
				new Particle(part_x,part_y, 0, 0, false, 400 , 4);
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
		let num_new_boids = ran_b(6,12);
		let type = (Math.random() > 0.5);
		for(let n=0;n<num_new_boids;n++){
			if(type){
				new Manta(player.x+(MAX_X*3/4*Math.cos(player.rot)) + ran_b(-200,200), player.y+(MAX_Y*3/4*Math.sin(player.rot)) + ran_b(-200,200), player.xs * -12, player.ys * -12,360);
			}
			else{
				new Albatross(player.x+(MAX_X*3/4*Math.cos(player.rot)) + ran_b(-200,200), player.y+(MAX_Y*3/4*Math.sin(player.rot)) + ran_b(-200,200), player.xs * -12, player.ys * -12,360);
			}
		}
	}

	//let tmp_boi = Boid.boids[tickCount%Boid.totalBoids];
	if(Boid.totalBoids > 0){
		Boid.boids[tickCount%Boid.totalBoids].ai_tick();
		//player.particles.push(new Particle(tmp_boi.position[0],tmp_boi.position[1], 0, 0, false, 50 , 6));
	}


	for(let b = 0; b < Boid.totalBoids; b++){
		if(!map.is_transit){
			Boid.boids[b].flee = 2;
		}
		if(Boid.boids[b].slowdown === 0){
			if(Boid.boids[b].flee === 0 && (player.speed < 5 || !Boid.boids[b].within_player_sight(player))){
				Boid.boids[b].flee = 1;
			}
			Boid.boids[b].player_tick(player);
		}

		Boid.boids[b].tick(tickCount);


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

	if(player.up){
		player.anim = 1;
	}
	else{
		player.anim = 0;
	}

	if(tickCount % (35-Math.floor(player.speed)) === 0 && (player.anim !== 0 || player.frame !== 0)){
		player.frame = (player.frame+1)%player.totalframes;
		if(player.frame === 0 && player.anim !== 0){
			player.frame++;
		}
	}


	if(tickCount%750 === 0){
		gameTime++;
		if(gameTime >= 100){
			gameTime *= -1;
		}
		LIGHTING_DISTANCE = 10 + Math.max(Math.abs(gameTime)-45,0)*1.5;
		document.getElementById("lighting_overlay").style.opacity = Math.max(Math.abs(gameTime)-45,0)/120;
		if(!map.is_transit){
			map.bake_lighting(true);
		}
	}


	draw_screen();


	player.onbeach = map.onbeach(player.x,player.y);
	player.onground = map.onground(player.x,player.y);


	tickCount++;
}
