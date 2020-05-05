
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
const ISL_LAC = 0.75;

//nomralize a value to between 0 and 1 based on min and max
function normalize(val, min, max){
	return (val-min)/(max-min);
}

//nomralize a map to between 0 and 1 based on min and max
function normalize_map(map){
	for(let x=0;x<map.length;x++){
		for(let y=0;y<map[x].length;y++){
			map[x][y] = normalize(map[x][y],map.minHeight, map.maxHeight);
		}
	}
	return map;
}

function gen_noise_map(width, height, scale, oct, persist, lac, seed=Math.random()*1000){

	noise.seed(seed);

	let xx,yy;
	let map = new Array(width);

	map.maxHeight = Number.NEGATIVE_INFINITY;
	map.minHeight = Number.POSITIVE_INFINITY;

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
			map.maxHeight = Math.max(map.maxHeight, map[x][y]);
			map.minHeight = Math.min(map.minHeight, map[x][y]);
		}
	}

	//normalize
	return normalize_map(map);
}


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

function gen_arch(width,height,xIslands,yIslands){

	const size_x = width/xIslands;
	const size_y = height/yIslands;

	let island;
	let map = new Array(width);
	for(let x=0;x<width;x++){
		map[x] = new Array(height);
		for(let y=0;y<height;y++){
			map[x][y] = 0;
		}
	}
	for(let x=0;x<width/size_x;x++){
		for(let y=0;y<height/size_y;y++){

			island = gen_island(size_x,size_y);
			for(let xx=0;xx<size_x;xx++){
				for(let yy=0;yy<size_y;yy++){
					if(map[x*size_x+xx][y*size_y+yy] != 0){
						map[x*size_x+xx][y*size_y+yy] = (map[x*size_x+xx][y*size_y+yy] + island[xx][yy]) /2;
					}
					else{
						map[x*size_x+xx][y*size_y+yy] = island[xx][yy];
					}

				}
			}

		}
	}

	return map;
}


//25,8,8,0.75
function gen_island(width, height,seed=Math.random()*1000){
	console.log("Generating island "+width+"x"+height+" - "+seed);

	const HAS_MOTU = Math.round(seed)%2 === 0;
	const HAS_REEF = Math.round(seed)%4 === 0;

	//generate base map
	let map = gen_noise_map(width, height, ISL_SCALE,ISL_OCT,ISL_PERSIST,ISL_LAC,seed);

	//Raise the height
	map.maxHeight = 1;
	map.minHeight = -0.5;
	map = normalize_map(map);



	let mapMASK = new Array(width);

	//Motu and styling
	let motu_noise, reef_noise;

	if(HAS_MOTU){
		motu_noise =  gen_noise_map(width, height, MOTU_SCALE,MOTU_OCT,MOTU_PERSIST,MOTU_LAC,seed+1);
		motu_noise.maxHeight = 1;
		motu_noise.minHeight = -2;
		motu_noise = normalize_map(motu_noise);

		if(HAS_REEF){
			reef_noise =  gen_noise_map(width, height, REEF_SCALE,REEF_OCT,REEF_PERSIST,REEF_LAC,seed+1);
		}
	}

	let seed_scale = normalize(Math.round(seed)%250+750,0,1000);

	for(let x=0;x<width;x++){
		mapMASK[x] = new Array(height);

		for(let y=0;y<height;y++){


			//lower edges
			map[x][y] *= dist(x,y,width,height);

			//update mask
			if(map[x][y] > ISL_MASK[0] && map[x][y] < ISL_MASK[1]){
				mapMASK[x][y] = 1;
			}
			else if(map[x][y] < ISL_MASK[0]){
				mapMASK[x][y] = 0.5;
			}
			else if(map[x][y] < 0.35){
				mapMASK[x][y] = 0.25;
			}
			else{
				mapMASK[x][y] = 0;
			}

			//apply motu styling
			if(HAS_MOTU){

				//shrink visible land size
				if(map[x][y]>ISL_SHRK){
					map[x][y]-=0.1;
				}

				//cut away lagoon
				if(map[x][y] > MOTU_GRAD[2] && map[x][y] < MOTU_GRAD[3]){
					map[x][y] -= 0.15;
				}

				//raise motus
				else if(map[x][y] > MOTU_GRAD[0] && map[x][y] < MOTU_GRAD[1]){
					map[x][y] += motu_noise[x][y]*0.2;
				}


				//apply reef
				if(HAS_REEF){
					if(mapMASK[x][y] === 0.25){
						map[x][y] += reef_noise[x][y] > 0.55 ? 0.15 : 0;
					}
				}

				//normalize deep water
				if(map[x][y]<0.1){
					map[x][y] = 0.05;
				}

				//raise water inside motus
				if(mapMASK[x][y] === 1){
					map[x][y]+=0.1;
				}

				//cut away water outside motus
				else if(mapMASK[x][y] === 0.5 && map[x][y]<0.275){
					map[x][y]=0.05;
				}
			}
		}
	}

	map.seed = seed;
	map.resolution = RESOLUTION;

	//return [map,mapMASK,motu_noise,reef_noise];
	return map;
}
