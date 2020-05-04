function normalize(val, min, max){
	return (val-min)/(max-min);
}

function gen_noise_map(width, height, scale, oct, persist, lac){

	let xx,yy;

	let maxHeight = Number.NEGATIVE_INFINITY;
	let minHeight = Number.POSITIVE_INFINITY;

	let map = new Array(width);
	for(let x=0;x<width;x++){
		map[x] = new Array(height);
		for(let y=0;y<height;y++){
			map[x][y] = 0;
			let amp = 1;
			let freq = 1;

			for(let i=0; i < oct; i++){
				xx = x / scale * freq
				yy = y / scale * freq;
				map[x][y] += (noise.perlin2(xx, yy)*2-1) * amp;
				amp *= persist;
				freq *= lac;
			}

			maxHeight = Math.max(maxHeight, map[x][y]);
			minHeight = Math.min(minHeight, map[x][y]);
		}
	}
	for(let x=0;x<width;x++){
		for(let y=0;y<height;y++){
			map[x][y] = normalize(map[x][y],minHeight, maxHeight);
		}
	}
	return map;
}
