function calc_boid_center(){
	Boid.centerPoint = [0,0];
	for(let b=0; b < Boid.totalBoids; b++){
		Boid.centerPoint = [Boid.centerPoint[0]+Boid.boids[b].x,Boid.centerPoint[1]+Boid.boids[b].y];
	}
	Boid.centerPoint = [Math.round(Boid.centerPoint[0]/Boid.totalBoids), Math.round(Boid.centerPoint[1]/Boid.totalBoids)];
}

class Boid{

	constructor(x, y, dir, speed){
		this.x = x;
		this.y = y;
		this.dir = dir;
		this.speed = speed;
		Boid.boids.push(this);
		Boid.totalBoids++;
	}

	tick(){
		for(let b=0; b < Boid.totalBoids; b++){

			//align directions
			this.dir += (Boid.boids[b].dir-this.dir > 0 ? Math.PI/0.001 : Math.PI/-0.001);

			xD = Boid.total
			yD =

		}
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
