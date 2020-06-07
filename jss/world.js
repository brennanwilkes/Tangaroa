const MAP_SCALE = 0.25;
const MAP_OCT = 8;
const MAP_PERSIST = 2.5;
const MAP_LAC = 0.6;

class Map{
	constructor(dummy=false,size=1,seed = Math.random()*10000){
		this.size = size;
		this.replicable_seed = seed;
		this.seed = hash(seed);

		this.dummy = dummy;

		this.settings = new IslandSettings();
		this.settings.seed = this.seed;

		this.raw_data;
		this.islands;
		this.total_islands = 0;
		this.transit_island = new TransitIsland();

		this.canvas_img;

		this.generate_map_data();
		this.generate_islands();
	}

	generate_map_data(){
		if(this.size===1){
			this.raw_data = [[1]];
			return;
		}

		this.raw_data = gen_noise_map(this.size, this.size, MAP_SCALE, MAP_OCT, MAP_PERSIST, MAP_LAC, this.seed);
		for(let x=0; x<this.size;x++){
			for(let y=0; y<this.size;y++){
				if(this.raw_data[x][y] < 0.45){
					this.raw_data[x][y] = 0;
				}
				else{
					if(x%2===0 && y%2===0){
						this.raw_data[x][y] = 1;
						this.total_islands++;
					}
					else{
						this.raw_data[x][y] = 0.5;
					}

				}
			}
		}
	}


	generate_islands(){

		let tit = document.title;
		let total = 0;

		this.islands = new Array(this.size);
		for(let x=0; x<this.size;x++){
			this.islands[x] = new Array(this.size);
			for(let y=0; y<this.size;y++){

				if(this.dummy){
					this.raw_data[x][y] = 0;
				}

				if(this.raw_data[x][y] === 1){
					total++;
					document.title = "Loading - " + ( (x===0 && y < 2) ? "Tangaroa" : (Math.round(100*total/this.total_islands)+"%") );

					this.settings.seed = hash((this.settings.seed+x*y)*hash(this.seed));
					this.settings.type = hash(this.settings.seed)%4 === 0 ? 1 : 0;
					this.settings.x = x;
					this.settings.y = y;
					if(this.size === 1){
						this.settings.size_x = (this.settings.type===0 ? 1024 : 2048);
						this.settings.size_y = (this.settings.type===0 ? 1024 : 2048);
					}

					console.log("loading ["+x+", "+y+"] - "+Math.round(100*total/this.total_islands)+"%");
					this.islands[x][y] = generate_random_island(this.settings);
				}
			}
		}
		document.title = tit;
	}

	get(x,y){
		if( x<0 || x>=this.size || y<0 || y>=this.size){
			return this.transit_island;
		}
		return (this.raw_data[x][y] === 1 ? this.islands[x][y] : this.transit_island);
	}

	gen_canvas_img(ctx){
		this.canvas_img = document.createElement('canvas');
		this.canvas_img.width = ctx.canvas.width;	//screen maxes
		this.canvas_img.height = ctx.canvas.height;	//screen maxes

		let ctx_img = this.canvas_img.getContext("2d");

		let sqr = Math.round(Math.min(ctx.canvas.width,ctx.canvas.height)*0.75 / this.size);
		let w = Math.round(ctx.canvas.width/2-(sqr*this.size/2));
		let h = Math.round(ctx.canvas.height/2-(sqr*this.size/2));

		ctx_img.fillStyle = "#654321";
		ctx_img.fillRect(w-10,h-10,sqr*this.size+20,sqr*this.size+20);
		ctx_img.fillStyle = DEEP_OCEAN;
		ctx_img.fillRect(w,h,sqr*this.size,sqr*this.size);
		ctx_img.fillStyle = "#604321";
		ctx_img.strokeStyle = "#453311";
		ctx_img.lineWidth = 2;

		let b_x, b_y;

		let tmp_isl;

		for(let x=0; x<this.size;x++){
			for(let y=0; y<this.size;y++){
				if(this.raw_data[x][y] === 1){
					b_x = Math.round(w+x*sqr);
					b_y = Math.round(h+y*sqr);
					tmp_isl = new IslandCopy(this.get(x,y),sqr);
					tmp_isl.draw(ctx_img,b_x,b_y);
				}
			}
		}
	}

	draw(ctx){
		if(this.canvas_img === undefined ){
			this.gen_canvas_img(ctx);
		}

		ctx.drawImage(this.canvas_img, 0, 0);

		let current = this.get(player.wx,player.wy);
		if(current.is_transit){
			return;
		}



		ctx.beginPath();

		let sqr = Math.round(Math.min(ctx.canvas.width,ctx.canvas.height)*0.75 / this.size);
		let w = Math.round(ctx.canvas.width/2-(sqr*this.size/2));
		let h = Math.round(ctx.canvas.height/2-(sqr*this.size/2));

		let x = Math.round(w+player.wx*sqr);
		let y = Math.round(h+player.wy*sqr);
		ctx.arc(x+player.x/current.size[0]*sqr, y+player.y/current.size[1]*sqr, 5, 0, 2 * Math.PI, false);
		ctx.lineWidth = 2;
		ctx.strokeStyle = "#FFC922";
		if(player.x> 0 && player.y > 0 && player.x < current.size[0] && player.y < current.size[1]){
			ctx.stroke();
		}

	}
}
