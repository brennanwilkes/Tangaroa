const ALN_FORCE = 0.02;
const COH_FORCE = 0.06;
const SEP_FORCE = -0.075;

const PLAYER_ALN_FORCE = 0;//.05;
const PLAYER_COH_FORCE = 0.015;
const PLAYER_VEL_FORCE = 0.001;

const TARGET_RAN_FORCE = 0.2;
const TARGET_FORCE = 0.05;
const TARGET_VEL_FORCE = 0.001;

const VIEW_DIST = 250;
const VIEW_ANG = Math.PI;

const MOVE_SPEED = 0.1;

function boid_dist(a,b){
	return Math.sqrt(Math.pow(a[0]-b[0],2)+Math.pow(a[1]-b[1],2));
}

function bound_ang(a){
	return (a+(Math.PI*2)) % (Math.PI*2);
}

class Boid{

	constructor(x, y, xs, ys, slowdown, target=false){

		this.position = [x, y];
		this.velocity = [xs, ys];
		this.dir = bound_ang(this.get_ang(this.velocity));

		this.flee = 0;

		this.img = new Image();
		this.boidTypeID = 0;

		this.slowdown = slowdown;
		this.target_md = target;

		Boid.boids.push(this);
		Boid.totalBoids++;
	}

	distance(boi){
		return boid_dist(this.position,boi.position);
	}

	get_ang(pos){
		if(pos===undefined){
			return Math.atan2(this.velocity[1],this.velocity[0]);
		}
		return Math.atan2((pos[1]-this.position[1]),(pos[0]-this.position[0]));
	}

	turn(ang,force){
		this.velocity[0] += force * Math.cos(ang);
		this.velocity[1] += force * Math.sin(ang);
	}

	match_vel(vel, force){
		this.velocity[0] += force * (vel[0] - this.velocity[0]);
		this.velocity[1] += force * (vel[1] - this.velocity[1]);
	}

	within_sight(boi){
		return Math.abs(this.get_ang()-this.get_ang(boi.position)) < VIEW_ANG;
	}

	within_player_sight(player){
		return Math.abs(this.get_ang()-this.get_ang([player.x,player.y])) < VIEW_ANG/2 || boid_dist(this.position,[player.x,player.y]) < VIEW_DIST;
	}

	target_tick(target,target_vel){
		this.turn(this.get_ang([target[0],target[1]]),TARGET_FORCE);
		this.match_vel([0,0],TARGET_VEL_FORCE);
	}

	player_tick(player){
		if(this.flee === 1){
			this.turn(this.get_ang([player.x,player.y]),-1*PLAYER_COH_FORCE);
			this.turn(player.rot+(this.get_ang() > player.rot ? Math.PI/2 : Math.PI/-2),2*PLAYER_ALN_FORCE);
		}
		else if(this.flee === 2){
			this.turn(this.get_ang([player.x,player.y]),-10*PLAYER_COH_FORCE);
		}
		else{
			this.turn(this.get_ang([player.x, player.y]),PLAYER_COH_FORCE);
			this.turn(player.rot,PLAYER_ALN_FORCE);
			if(VIEW_DIST > boid_dist(this.position,[player.x,player.y])){
				this.match_vel([player.xs,player.ys],PLAYER_VEL_FORCE);
			};
		}
	}

	ai_tick(){
		let avg_ang = 0;
		let avg_pos = [0,0];
		let total_local_boids = 0;

		for(let b=0; b < Boid.totalBoids; b++){
			if(Boid.boids[b] === this){
				continue;
			}

			if(this.distance(Boid.boids[b]) < VIEW_DIST){ 	//within radius
				if(this.within_sight(Boid.boids[b])){ 				//within vision

					//alignment
					total_local_boids++;
					avg_ang += Boid.boids[b].get_ang();

					//separation
					//console.log((1-(this.distance(Boid.boids[b]) / VIEW_DIST)),Math.pow((1-(this.distance(Boid.boids[b]) / VIEW_DIST)),0.5))
					this.turn(this.get_ang(Boid.boids[b].position),(this.distance(Boid.boids[b])<25 ? 10 : 1 ) * (this.target_md ? 0.15 : 1)*SEP_FORCE*Math.pow((1-(this.distance(Boid.boids[b]) / VIEW_DIST)),0.1));

					//cohesion
					avg_pos[0] += Boid.boids[b].position[0];
					avg_pos[1] += Boid.boids[b].position[1];


				}

			}
		}

		if(total_local_boids > 0){

			//Allignment
			this.turn(avg_ang/total_local_boids,ALN_FORCE);

			//Cohesion
			avg_pos[0] = avg_pos[0] / total_local_boids;
			avg_pos[1] = avg_pos[1] / total_local_boids;
			this.turn(this.get_ang(avg_pos),(this.target_md ? 0.25 : 1)*COH_FORCE);

		}
	}


	tick(){
		if(this.slowdown > 0) {
			this.slowdown--;
		}
		else if(this.slowdown === -1 ){
			this.velocity[0] *= 1.001;
			this.velocity[1] *= 1.001;
		}

		this.position[0] += this.velocity[0] * MOVE_SPEED;
		this.position[1] += this.velocity[1] * MOVE_SPEED;

	}

	draw(ctx,offsetx,offsety){} //overload me

	kill(all=false){
		if(all){
			Boid.boids = new Array();
			Boid.totalBoids = 0;
		}
		else{
			Boid.boids.splice(Boid.boids.indexOf(this), 1);
			Boid.totalBoids--;
		}
	}
}
Boid.boids = new Array();
Boid.totalBoids = 0;
