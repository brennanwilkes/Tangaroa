

//------------------------------------HELPER FUNCTIONS--------------------------------------



function dist(x,y,w,h){
	return Math.max(normalize(0.5-Math.sqrt(Math.pow(Math.abs(0.5-(x/w)),2)+Math.pow(Math.abs(0.5-(y/h)),2)),0,0.5),0);
}


/**
	Generates a random integer between min_b and max_b inclusively
	@param {number} min_b Minimum bound
	@param {number} max_b Maximum bound
	@returns {number} Random integer min_b <= num <= max_b
*/
function ran_b(min_b,max_b){
	return Math.floor( min_b + Math.random()*(max_b+1) );
}



//nomralize a value to between 0 and 1 based on min and max
function normalize(val, min, max){
	return (val-min)/(max-min);
}

//nomralize a 2d array to between 0 and 1 based on min and max
function normalize_2d_array(arr,minHeight,maxHeight){
	for(let x=0;x<arr.length;x++){
		for(let y=0;y<arr[x].length;y++){
			arr[x][y] = normalize(arr[x][y],minHeight, maxHeight);
		}
	}
	return arr;
}




function gen_noise_map(width, height, scale, oct, persist, lac, seed){
	noise.seed(seed);

	let xx,yy;
	let map = new Array(width);

	let maxHeight = Number.NEGATIVE_INFINITY;
	let minHeight = Number.POSITIVE_INFINITY;

	for(let x=0;x<width;x++){
		map[x] = new Array(height);
		for(let y=0;y<height;y++){

			//initialize
			map[x][y] = 0;
			let amp = 1;
			let freq = 1;

			//iterate over octaves
			for(let i=0; i < oct; i++){

				//adjust coordinates
				xx = x / scale * freq
				yy = y / scale * freq;

				//generate base noise
				map[x][y] += (noise.perlin2(xx, yy)*2-1) * amp;

				//update modifiers
				amp *= persist;
				freq *= lac;
			}

			//update minimax
			maxHeight = Math.max(maxHeight, map[x][y]);
			minHeight = Math.min(minHeight, map[x][y]);
		}
	}

	//normalize
	return normalize_2d_array(map,minHeight,maxHeight);
}


function rgb(r,g,b){
	return "rgb("+r+", "+g+", "+b+")";
}


function hash(num){
	let hash = 0x12345678;

	while (num > 0) {
		hash ^= (hash << 16) | (hash << 19);
		hash += num % 10;
		hash ^= (hash << 26) | (hash << 13);
		num = num / 10;
	}
	return Math.abs(hash);
}


//-------------------------------------ISLAND CLASS------------------------------------------

const MOTU_GRAD = [0.075,0.15,0.15,0.25];
const ISL_SHRK = 0.25;
const ISL_MASK = [0.15,0.2];

const MOTU_SCALE = 500;
const MOTU_OCT = 1;
const MOTU_PERSIST = 2;
const MOTU_LAC = 0.95;

const REEF_SCALE = 50;
const REEF_OCT = 1;
const REEF_PERSIST = 2;
const REEF_LAC = 0.95;

const ISL_SCALE = 25;
const ISL_OCT = 8;
const ISL_PERSIST = 2;
const ISL_LAC = 0.7;


let SMALL_SIZES = [256, 384, 512, 640, 768, 896, 1024, 1152, 1280, 1408];

let SIZES = [256, 384, 512, 640, 768, 896, 1024, 1152, 1280, 1408, 1536, 1664, 1792, 1920, 2048, 2176, 2304, 2432, 2560, 2688, 2816, 2944, 3072];

let ARC_SIZES = [2048, 2176, 2304, 2432, 2560, 2688, 2816, 2944, 3072, 3200, 3328, 3456, 3584, 3712, 3840, 3968, 4096, 4224, 4352, 4480, 4608, 4736, 4864, 4992];


class Island{
	constructor(type=-1, seed=Math.random()*1000000, size_x=-1, size_y=-1, x=0, y=0, LAC_SCALE_DOWN=1) {

		this.replicable_seed = seed;
		this.seed = hash(seed);

		this.type = type===-1 ? hash(seed+5)%2 : type;

		this.x = x;
		this.y = y;

		this.resolution = 1;

		this.size = [size_x,size_y];
		const size_type = [SIZES,ARC_SIZES];
		if(this.size[0] === -1){
			this.size[0] = size_type[this.type][hash(seed)%size_type[this.type].length];
		}
		if(this.size[1] === -1){
			this.size[1] = size_type[this.type][hash(seed)%size_type[this.type].length];
		}

		this.size.push(normalize((this.size[0]+this.size[1])/2,SIZES[0],SIZES[SIZES.length-1]));

		this.colours = ["DarkBlue","#2D5BA4","#297900","#D0AB76"];

		this.LAC_SCALE_DOWN = LAC_SCALE_DOWN;

		this.raw_data;

		if(this.type === 0){
			this.gen_island_data();
		}
		else if(this.type === 1){
			this.gen_arc_data();
		}


		this.display_data;
		this.gen_display_data(this.compress(this.resolution));
	}

	compress(factor){
		if(factor===1){
			return this.raw_data;
		}

		const n_x = this.size[0]/factor;
		const n_y = this.size[1]/factor;

		let comp = new Array(n_x);
		for(let i=0;i<n_x;i++){
			comp[i] = new Array(n_y);
			for(let j=0;j<n_y;j++){
				comp[i][j] = 0;
			}
		}

		let pixel = new Array(factor);
		for(let i=0;i<factor;i++){
			pixel[i] = new Array(factor);
		}

		for(let x=0;x<n_x;x++){
			for(let y=0;y<n_y;y++){
				for(let xx=0;xx<factor;xx++){
					for(let yy=0;yy<factor;yy++){
						comp[x][y] = Math.max(this.raw_data[x*factor+xx][y*factor+yy], comp[x][y]);
					}
				}
			}
		}
		return comp;
	}

	gen_display_data(raw_data){

		this.display_data = new Array();

		//lightblue
		this.display_data["#2D5BA4"] = new Array();

		//green
		this.display_data["#297900"] = new Array();

		//beach
		this.display_data["#D0AB76"] = new Array();

		for(let x=0;x<raw_data.length;x++){
			for(let y=0;y<raw_data[0].length;y++){

				if(raw_data[x][y]<0.1){
					continue;
				}
				else if(raw_data[x][y]<0.3){
					this.display_data["#2D5BA4"].push([x,y]);
				}
				else if(raw_data[x][y] < 0.35){
					this.display_data["#D0AB76"].push([x,y]);
				}
				else{
					this.display_data["#297900"].push([x,y]);
				}
			}
		}

		this.optimize_display_data();
	}

	optimize_display_data(){
		let temp, strip, amt;

		for(let c=1;c<this.colours.length;c++){
			temp = new Array();
			for(let p=0;p<this.display_data[this.colours[c]].length;p++){
				strip = [this.display_data[this.colours[c]][p][0],this.display_data[this.colours[c]][p][1]];
				amt = 1;
				for(;p<this.display_data[this.colours[c]].length-1;p++){
					if(this.display_data[this.colours[c]][p][0] === this.display_data[this.colours[c]][p+1][0] &&
					this.display_data[this.colours[c]][p][1]+1 === this.display_data[this.colours[c]][p+1][1]){
						amt++;
					}
					else{
						break;
					}
				}
				strip.push(amt);
				temp.push(strip);
			}
			this.display_data[this.colours[c]] = temp;
		}
	}
	regenerate(resolution){
		this.resolution = resolution;
		this.gen_display_data(this.compress(resolution));
	}

	gen_arc_data(){

		console.log("generating cluster",this.size[0]+"x"+this.size[0],this.replicable_seed);

		this.raw_data = new Array(this.size[0]);
		for(let i=0; i<this.size[0]; i++){
			this.raw_data[i] = new Array(this.size[1]);
			for(let j=0; j<this.size[1]; j++){
				this.raw_data[i][j] = 0;
			}
		}

		let island, size, x, y, valid, tries;
		let max = 32+(hash(this.seed-10)%Math.round(this.size[0]/512));
		for(let isl = 0; isl < max; isl++){
			size = SMALL_SIZES[hash(this.seed*isl+this.size[0])%SMALL_SIZES.length];
			island = new Island(0, hash(this.seed*isl), size, size, 0, 0, 0.925);

			valid = false;
			tries = 0;
			while(!valid){

				if(tries>500){
					break;
				}

				x = hash(this.seed*isl-1)%(this.size[0]-island.size[0]);
				y = hash(this.seed*isl-2)%(this.size[1]-island.size[1]);

				valid = true;

				//replace 0.2 and 0.8 with calculations
				for(let i=Math.round(x+island.size[0]*0.2);i<x+island.size[0]*0.8; i += 16){
					for(let j=Math.round(y+island.size[1]*0.2);j<y+island.size[1]*0.8; j += 16){
						if(this.raw_data[i][j] >= 0.1){
							valid = false;
							break;
						}
					}
					tries++;
				}
			}
			if(valid){
				this.blend(island,x,y);
			}
		}
	}

	blend(island,x,y){
		for(let i=0; i<island.size[0]; i++){
			for(let j=0; j<island.size[1]; j++){
				if(island.raw_data[i][j] > 0.1){
					this.raw_data[x+i][y+j] = island.raw_data[i][j];
				}
			}
		}
	}


	//25,8,8,0.75
	gen_island_data(){

		console.log("generating island",this.size[0]+"x"+this.size[0],this.replicable_seed);

		const HAS_MOTU = this.seed%2 === 0;
		const HAS_REEF = this.seed%4 === 0;

		//generate base map
		this.raw_data = gen_noise_map(this.size[0], this.size[1], ISL_SCALE,ISL_OCT,ISL_PERSIST,(ISL_LAC + 0.15*(1-this.size[2]))*this.LAC_SCALE_DOWN,hash(this.seed));

		//Raise the height
		this.raw_data = normalize_2d_array(this.raw_data,-0.5,1);



		let mapMASK = new Array(this.size[0]);

		//Motu and styling
		let motu_noise, reef_noise;

		if(HAS_MOTU){
			motu_noise =  gen_noise_map(this.size[0], this.size[1], MOTU_SCALE,MOTU_OCT,MOTU_PERSIST,MOTU_LAC,hash(this.seed+1));
			motu_noise = normalize_2d_array(motu_noise,-2,1);

			if(HAS_REEF){
				reef_noise =  gen_noise_map(this.size[0], this.size[1], REEF_SCALE,REEF_OCT,REEF_PERSIST,REEF_LAC,hash(this.seed+2));
			}
		}

		let seed_scale = normalize(hash(this.seed+3)%250+750,0,1000);

		for(let x=0;x<this.size[0];x++){
			mapMASK[x] = new Array(this.size[1]);
			for(let y=0;y<this.size[1];y++){

				//lower edges
				this.raw_data[x][y] *= dist(x,y,this.size[0],this.size[1]);

				//update mask
				if(this.raw_data[x][y] > ISL_MASK[0] && this.raw_data[x][y] < ISL_MASK[1]){
					mapMASK[x][y] = 1;
				}
				else if(this.raw_data[x][y] < ISL_MASK[0]){
					mapMASK[x][y] = 0.5;
				}
				else if(this.raw_data[x][y] < 0.35){
					mapMASK[x][y] = 0.25;
				}
				else{
					mapMASK[x][y] = 0;
				}

				//apply motu styling
				if(HAS_MOTU){

					//shrink visible land size
					if(this.raw_data[x][y]>ISL_SHRK){
						this.raw_data[x][y]-=0.1;
					}

					//cut away lagoon
					if(this.raw_data[x][y] > MOTU_GRAD[2] && this.raw_data[x][y] < MOTU_GRAD[3]){
						this.raw_data[x][y] -= 0.15;
					}

					//raise motus
					else if(this.raw_data[x][y] > MOTU_GRAD[0] && this.raw_data[x][y] < MOTU_GRAD[1]){
						this.raw_data[x][y] += motu_noise[x][y]*0.2;
					}


					//apply reef
					if(HAS_REEF){
						if(mapMASK[x][y] === 0.25){
							this.raw_data[x][y] += reef_noise[x][y] > 0.55 ? 0.15 : 0;
						}
					}

					//normalize deep water
					if(this.raw_data[x][y]<0.1){
						this.raw_data[x][y] = 0.05;
					}

					//raise water inside motus
					if(mapMASK[x][y] === 1){
						this.raw_data[x][y]+=0.1;
					}

					//cut away water outside motus
					else if(mapMASK[x][y] === 0.5 && this.raw_data[x][y]<0.275){
						this.raw_data[x][y]=0.05;
					}
				}
			}
		}
	}

	draw(ctx, offsetx, offsety){

		ctx.save();
		ctx.translate(offsetx, offsety);


		for(let c=1;c<this.colours.length;c++){
			ctx.fillStyle = this.colours[c];

			for(let p=0;p<this.display_data[this.colours[c]].length;p++){
				ctx.fillRect(this.display_data[this.colours[c]][p][0]*this.resolution, this.display_data[this.colours[c]][p][1]*this.resolution, this.resolution, this.display_data[this.colours[c]][p][2]*this.resolution);
			}
		}
		ctx.restore();
	}



	onbeach(x,y){
		return (x > 0 && x < this.size[0] && y > 0 && y < this.size[1]) && (this.raw_data[x][y] >= 0.3) && (this.raw_data[x][y] < 0.35);
	}

	onground(x, y){
		return (x > 0 && x < this.size[0] && y > 0 && y < this.size[1]) && (this.raw_data[x][y] >= 0.35);
	}

}
