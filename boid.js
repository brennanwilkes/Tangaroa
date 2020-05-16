const COLIDE_DEPTH = 10;
const COLIDE_LIMIT = 10;
const ROT_SCALE = 0.0025;

function calc_boid_center(){
	Boid.centerPoint = [0,0];
	for(let b=0; b < Boid.totalBoids; b++){
		Boid.centerPoint = [Boid.centerPoint[0]+Boid.boids[b].position[0],Boid.centerPoint[1]+Boid.boids[b].position[1]];
	}
	Boid.centerPoint = [Math.round(Boid.centerPoint[0]/Boid.totalBoids), Math.round(Boid.centerPoint[1]/Boid.totalBoids)];
}

function dist(a,b){
	return Math.sqrt(Math.pow(a[0]-b[0],2)+Math.pow(a[1]-b[1],2));
}

function bound_ang(a){
	return (a+(Math.PI*2)) % (Math.PI*2);
}

class Boid{

	constructor(x, y, dir, speed){
		this.position = [x, y];
		this.dir = dir;
		this.speed = speed;

		Boid.boids.push(this);
		Boid.totalBoids++;
	}

	distance(boi){
		return dist(this.position,boi.position);
	}

	ang_match(a){
		return (Math.abs(this.dir-a) < Math.abs(this.dir-a-Math.PI));
	}


	tick(){

		let o_pos, t_pos;
		for(let b=0; b < Boid.totalBoids; b++){
			if(Boid.boids[b] === this){
				continue;
			}

			//align directions
			this.dir += (this.ang_match(Boid.boids[b]) ? ROT_SCALE*this.speed : 1*-ROT_SCALE*this.speed);
			this.dir = bound_ang(this.dir);

			//calculate future positions
			o_pos = Boid.boids[b].move(COLIDE_DEPTH);
			t_pos = this.move(COLIDE_DEPTH);

			//if distance is too close, stear opposite way
			if( dist(o_pos, t_pos) < COLIDE_LIMIT){
				this.dir += (this.ang_match(Boid.boids[b]) ? ROT_SCALE*-2*Boid.totalBoids : ROT_SCALE*2*Boid.totalBoids);
			}
		}

		//aim towards center point
		let c_dir = Math.atan2(Boid.centerPoint[1] - this.position[1], Boid.centerPoint[0] - this.position[0]);
		//console.log(Boid.centerPoint[1] - this.position[1], Boid.centerPoint[0] - this.position[0]);
		//console.log(c_dir);
		//console.log("\n")
		this.dir += (this.ang_match(c_dir+Math.PI) ? ROT_SCALE*Boid.totalBoids*this.speed*3 : ROT_SCALE*-3*Boid.totalBoids*this.speed);

		this.dir = bound_ang(this.dir);
		this.position = this.move(1);

	}

	draw(ctx,offsetx,offsety){
		ctx.save();
		ctx.translate(offsetx+this.position[0], offsety+this.position[1]);
		ctx.fillStyle = "rgba(0,0,0)";
		ctx.fillRect(-10, -10, 20,20);
		ctx.restore();
	}

	move(ticks){
		return [this.position[0] + this.speed*Math.cos(this.dir)/4*ticks, this.position[1] + this.speed*Math.sin(this.dir)/4*ticks];
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
