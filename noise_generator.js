
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

//25,8,8,0.75
function gen_island(width, height){
	let map = gen_noise_map(width, height, 25,8,8,0.75);
	map.maxHeight = 1;
	map.minHeight = -0.5;
	map = normalize_map(map);

	for(let x=0;x<width;x++){
		for(let y=0;y<height;y++){
			map[x][y] *= dist(x,y,width,height);
		}
	}


	return map;
}
