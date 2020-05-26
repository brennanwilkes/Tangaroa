const ALN_FORCE = 0.0075;
const COH_FORCE = 0.01;
const SEP_FORCE = -0.001;

const VIEW_DIST = 500;
const VIEW_ANG = Math.PI/2;

const MOVE_SPEED = 0.1;

function dist(a,b){
	return Math.sqrt(Math.pow(a[0]-b[0],2)+Math.pow(a[1]-b[1],2));
}

function bound_ang(a){
	return (a+(Math.PI*2)) % (Math.PI*2);
}

class Boid{

	constructor(x, y, xs, ys){

		this.position = [x, y];
		this.velocity = [xs, ys];
		this.dir = bound_ang(this.get_ang(this.velocity));

		this.img = new Image();
		this.img.src = "boid.png";

		this.slowdown = 360;

		Boid.boids.push(this);
		Boid.totalBoids++;
	}

	distance(boi){
		return dist(this.position,boi.position);
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

	within_sight(boi){
		return Math.abs(this.get_ang()-this.get_ang(boi.position)) < VIEW_ANG;
	}


	tick(){

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
					this.turn(this.get_ang(Boid.boids[b].position),SEP_FORCE*(1-(this.distance(Boid.boids[b]) / VIEW_DIST)));

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
			this.turn(this.get_ang(avg_pos),COH_FORCE);

		}

		if(this.slowdown > 0) {
			if(this.slowdown < 5){
				this.velocity[0] *= 0.995;
				this.velocity[1] *= 0.995;
			}
			this.slowdown--;
		}

		this.position[0] += this.velocity[0] * MOVE_SPEED;
		this.position[1] += this.velocity[1] * MOVE_SPEED;

	}

	draw(ctx,offsetx,offsety){
		ctx.save();
		ctx.translate(offsetx+this.position[0], offsety+this.position[1]);

		ctx.scale(0.05,0.05);
		ctx.translate(this.img.width*0.025,this.img.height*0.025);
		ctx.rotate(this.get_ang()-Math.PI/2);
		ctx.translate(this.img.width/-2,this.img.height/-2);

		ctx.drawImage(this.img, 0, 0);

		ctx.restore();
	}

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
Boid.centerPoint = [0,0];
