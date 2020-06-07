class Manta extends Boid{
	constructor(x, y, xs, ys, slowdown, target=false){
		super(x,y,xs,ys,slowdown,target);

		this.boidTypeID = 2;

		this.img.src = "assets/manta/manta-sprite-sheet.png"

		this.depth = ran_b(30,60)/100;

		this.animspeed = 80;

		this.totalframes = 10;
		this.frame = ran_b(0,this.totalframes-1);

	}

	draw(ctx,offsetx,offsety){
		ctx.save();
		ctx.translate(offsetx+this.position[0], offsety+this.position[1]);

		ctx.rotate(this.get_ang()-Math.PI*3/2);

		ctx.translate(this.img.width/this.totalframes/-2,this.img.height/-2);

		ctx.globalAlpha = this.depth;

		ctx.drawImage(this.img, this.img.width/this.totalframes * this.frame, 0, this.img.width/this.totalframes, this.img.height, 0, 0, this.img.width/this.totalframes, this.img.height);

		ctx.globalAlpha = 1;

		ctx.restore();
	}

	tick(tickCount){
		super.tick();
		if(tickCount % this.animspeed === 0){
			this.frame = (this.frame+1)%this.totalframes;
		}
	}

}
