class Villager{
	constructor(x,y){
		this.position = [x,y];
		this.img = new Image();
		this.img.origin="anonymous";
		this.img.crossorigin="anonymous";
		this.img.src = "assets/villager/villager-sprite-sheet.png"
		this.state = 1;
		this.frame = 0;
		this.totalFrames = 7;
		this.anim_speed = 30;
		this.walk_speed = 0.1;
		this.rot = Math.random()*Math.PI*2;

		this.walk_time = 200;
		this.current_walk = Math.floor(Math.random()*this.walk_time*11 - this.walk_time*10);

		Villager.totalVillagers++;
		Villager.villagers.push(this);
	}
	tick(tickCount,island){
		if(tickCount%this.anim_speed === 0 && (this.frame !== 0 || this.state === 1)){
			this.frame = (this.frame + 1)%this.totalFrames;
		}
		if(this.frame === 0 && this.state === 1){
			this.frame++;
		}
		if(this.state === 1 || this.frame!== 0){

			if(!island.onvillagerland(this.position[0],this.position[1])){
				this.rot += Math.PI;
			}

			this.position[0] += this.walk_speed * Math.cos(this.rot);
			this.position[1] += this.walk_speed * Math.sin(this.rot);
		}

		this.current_walk--;

		if(this.current_walk === 0){
			this.state = 0;
			this.current_walk -= Math.floor(Math.random()*this.walk_time*5);
		}

		if(this.current_walk < this.walk_time*-10){
			this.state = 1;
			this.current_walk = this.walk_time;
			this.rot = Math.random()*Math.PI*4 - Math.PI*2;
		}

	}
	draw(ctx,offsetx,offsety){
		ctx.save();
		ctx.translate(offsetx+this.position[0], offsety+this.position[1]);
		ctx.rotate(Math.PI/2 + this.rot);
		ctx.translate(this.img.width/this.totalFrames/-2,this.img.height/-2);

		ctx.drawImage(this.img, this.img.width/this.totalFrames * this.frame, 0, this.img.width/this.totalFrames, this.img.height, 0, 0, this.img.width/this.totalFrames, this.img.height);

		ctx.restore();

	}
}
Villager.villagers = new Array();
Villager.totalVillagers = 0;
