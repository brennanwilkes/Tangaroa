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

		this.generate_map_data();
		this.generate_islands();
	}

	generate_map_data(){
		this.raw_data = gen_noise_map(this.size, this.size, MAP_SCALE, MAP_OCT, MAP_PERSIST, MAP_LAC, this.seed);
		for(let x=0; x<this.size;x++){
			for(let y=0; y<this.size;y++){
				if(this.raw_data[x][y] < 0.4){
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

	draw(ctx){
		let sqr = Math.round(Math.min(ctx.canvas.width,ctx.canvas.height)*0.75 / this.size);
		let w = Math.round(ctx.canvas.width/2-(sqr*this.size/2));
		let h = Math.round(ctx.canvas.height/2-(sqr*this.size/2));

		ctx.fillStyle = "#654321";
		ctx.fillRect(w-10,h-10,sqr*this.size+20,sqr*this.size+20);
		ctx.fillStyle = "#957351";
		ctx.fillRect(w,h,sqr*this.size,sqr*this.size);
		ctx.fillStyle = "#604321";
		ctx.strokeStyle = "#453311";
		ctx.lineWidth = 2;

		let b_x, b_y;

		for(let x=0; x<this.size;x++){
			for(let y=0; y<this.size;y++){
				if(this.raw_data[x][y] === 1){
					b_x = Math.round(w+x*sqr+sqr/2);
					b_y = Math.round(h+y*sqr+sqr/2);
					if(this.islands[x][y].type === 0){
						ctx.beginPath();
						ctx.arc(b_x,b_y, Math.round(sqr/2.5), 0, 2 * Math.PI);
						ctx.fill();
						ctx.stroke();
					}
					else{
						for(let i=-1;i<2;i+=2){
							for(let j=-1;j<2;j+=2){
								ctx.beginPath();
								ctx.arc(Math.round(b_x+(i*sqr/4)),Math.round(b_y+(j*sqr/4)), Math.round(sqr/5), 0, 2 * Math.PI);
								ctx.fill();
								ctx.stroke();
							}
						}
					}

				}
			}
		}
	}
}
