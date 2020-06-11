class Player{
	constructor(){
		this.rx = 0;
		this.ry = 0;
		this.x = 0;
		this.y = 0;
		this.wx = 0;
		this.wy = 0;


		this.rot = 5/4*Math.PI;
		this.xs = 0;
		this.ys = 0;
		this.speed = 0;
		this.push = 0;

		this.anim = 1;
		this.frame = 0;
		this.totalframes = 9;

		this.img = new Image();
		this.img.src = "assets/player/canoe-sprite-Sheet.png";

		this.walkimg = new Image();
		this.walkimg.src = "assets/villager/villager-sprite-sheet.png";
		this.walkspeed = 30;
		this.walkframe = 0;
		this.totalwalkframes = 7;

		this.canoe = new Image();
		this.canoe.src = "assets/player/canoe-empty.png";
		this.canoepos = new Array();


		this.onbeach = false;
		this.onground = false;

		this.left = false;
		this.right = false;
		this.up = false;
		this.down = false;
		this.space = false;
	}

	draw(ctx){

		if(this.canoepos.length === 3){
			ctx.save();

			ctx.translate(MAX_X/2,MAX_Y/2);
			ctx.translate(this.canoepos[0]-this.x,this.canoepos[1]-this.y);

			ctx.rotate(this.canoepos[2] - Math.PI/2);

			ctx.translate(this.canoe.width/-2,this.canoe.height/-2);
			ctx.drawImage(this.canoe, 0,0);

			ctx.restore();
		}

		ctx.save();
		ctx.translate(MAX_X/2,MAX_Y/2);
		ctx.rotate(this.rot - Math.PI/2);
		if(!this.onground && !this.onbeach){
			ctx.translate(this.img.width/this.totalframes/-2,this.img.height/-2);
			ctx.drawImage(this.img, this.img.width/this.totalframes * this.frame, 0, this.img.width/this.totalframes, this.img.height, -2, 0, this.img.width/this.totalframes, this.img.height); //why the -2? I have no idea
		}
		else{
			ctx.translate(this.walkimg.width/this.totalwalkframes/-2,this.walkimg.height/-2);
			ctx.drawImage(this.walkimg, this.walkimg.width/this.totalwalkframes * this.walkframe, 0, this.walkimg.width/this.totalwalkframes, this.walkimg.height, 0, 0, this.walkimg.width/this.totalwalkframes, this.walkimg.height);
		}
		ctx.restore();


	}

	spawnParticles(){
		for(let i=0.05;i<1;i+=0.25){

			//main boat particles
			new Particle(this.x, this.y, this.speed*(i*i)/2, this.rot, true, (30 + 5*(1-i)*this.speed*12), Math.round(6*(1-i)/1));
			new Particle(this.x, this.y, this.speed*(i*i)/2, this.rot, false, (30 + 5*(1-i)*this.speed*12), Math.round(6*(1-i)/1));

			//side boat particles
			new Particle(this.x, this.y, this.speed*(i*i)/3, this.rot, true, (30 + 5*(1-i)*this.speed*2), Math.round(3*(1-i)/1), -10.5);
			new Particle(this.x, this.y, this.speed*(i*i)/3, this.rot, false, (30 + 5*(1-i)*this.speed*2), Math.round(3*(1-i)/1), -10.5);
		}
	}

	tick(tickCount){
		if(this.right){
			this.rot = (this.rot+(Math.PI/400))%(Math.PI*2);
		}
		if(this.left){
			this.rot = (this.rot-(Math.PI/400))%(Math.PI*2);
		}

		if(this.onground && !this.onland){
			this.speed = Math.max(0,this.speed-0.0625);
		}
		if(this.left || this.right){
			if(this.up){
				if(this.speed > 4){
					this.speed = Math.max(4,this.speed-0.025);
				}
			}
			else{
				this.speed = Math.max(0,this.speed-0.025);
			}
		}
		if(this.up){
			this.speed = Math.min(16,this.speed+(this.speed < 4 ? 0.004 : 0.0125));
		}
		else{
			this.speed = Math.max(0,this.speed-0.025);
		}
		if(this.speed > 0.35 && tickCount%18==0 && !this.onbeach && !this.onground){
			this.spawnParticles();
		}
	}

}
