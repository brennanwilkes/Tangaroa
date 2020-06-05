class Albatross extends Boid{
	constructor(x, y, xs, ys, slowdown, target=false){
		super(x,y,xs,ys,slowdown,target);

		this.img.src = "albatross-sprite-sheet.png"
		this.totalframes = 10;
		this.frame = ran_b(0,this.totalframes-1);
		this.animspeed = ran_b(12,20);
	}

	draw(ctx,offsetx,offsety){
		ctx.save();
		ctx.translate(offsetx+this.position[0], offsety+this.position[1]);

		//ctx.translate(this.img.width*0.025,this.img.height*0.025);
		ctx.rotate(this.get_ang()-Math.PI*3/2);
		ctx.translate(this.img.width/-2,this.img.height/-2);

		ctx.translate(this.img.width/this.totalframes/-2,this.img.height/-2);
		ctx.drawImage(this.img, this.img.width/this.totalframes * this.frame, 0, this.img.width/this.totalframes, this.img.height, 0, 0, this.img.width/this.totalframes, this.img.height);

		ctx.restore();
	}

	tick(tickCount){
		super.tick();
		if(tickCount % this.animspeed === 0){
			this.frame = (this.frame+1)%this.totalframes;
		}
	}

}
