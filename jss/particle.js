class Particle{
	constructor(x, y, speed, rot, mirror, life = 60, size=4, offset = 0){
		this.size = size;
		this.life = life;
		this.maxlife = life;
		this.rot = rot;

		this.x = x;
		this.y = y;
		this.speed = speed;
		this.shift = 0;
		this.offset = offset;

		this. mirror = mirror;

		Particle.totalParticles++;
		Particle.particles.push(this);

	}
	draw(ctx,offsetx,offsety){

		ctx.save();
		ctx.translate(offsetx+this.x, offsety+this.y);
		ctx.rotate(this.rot);
		ctx.translate(0,this.shift * (this.mirror ? -1 : 1));
		this.shift += Math.sqrt(this.speed/5);

		ctx.fillStyle = "rgba(75,111,174,"+(this.life / this.maxlife)+")";
		ctx.fillRect(5, this.offset + (this.offset===0 ? 2 : 1) * (this.mirror ? -1 : 1),this.size,this.size);

		ctx.restore();

		this.life--;
		return this.life <= 0;
	}

	kill(){
		Particle.particles.splice(Particle.particles.indexOf(this), 1);
		Particle.totalParticles--;
	}

}
Particle.particles = new Array();
Particle.totalParticles = 0;
