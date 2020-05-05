

function compress(map,factor){

	const o_x = map.length;
	const o_y = map[0].length;

	const n_x = o_x/factor;
	const n_y = o_y/factor;

	console.log("Compressing map of size "+o_x+"x"+o_y+" to "+n_x+"x"+n_y);

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
					comp[x][y] = Math.max(map[x*factor+xx][y*factor+yy], comp[x][y]);
				}
			}
		}
	}

	comp.seed = map.seed;

	return comp;
}
