const MAP_SCALE = 0.25;
const MAP_OCT = 8;
const MAP_PERSIST = 2.5;
const MAP_LAC = 0.6;

class Map{
	constructor(dummy=false,seed = Math.random()*10000, size=1){
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

					this.settings.seed = hash(this.settings.seed+x*y);
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

	regenerate(res){
		for(let x=0; x<this.size;x++){
			for(let y=0; y<this.size;y++){
				if(this.raw_data[x][y] === 1){
					this.islands[x][y].regenerate(res);
				}
			}
		}
	}

	debug_draw(ctx,max){
		clearInterval(1);
		let sqr = max / this.size;
		for(let x=0; x<this.size;x++){
			for(let y=0; y<this.size;y++){
				if(this.raw_data[x][y] === 1){
					ctx.fillStyle = "white";
				}
				else if(this.raw_data[x][y] === 0.5){
					ctx.fillStyle = "black";
				}
				else{
					ctx.fillStyle = "black";
				}
				ctx.fillRect(x*sqr,y*sqr,sqr,sqr);
			}
		}
	}
}
