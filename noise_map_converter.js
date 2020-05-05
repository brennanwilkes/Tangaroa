

function compress(map,factor){

	if(factor===1){
		return map;
	}

	const o_x = map.length;
	const o_y = map[0].length;

	const n_x = o_x/factor;
	const n_y = o_y/factor;

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
	comp.resolution = factor;
	comp.raw_data = map.raw_data;

	return comp;
}


function split_map(map){

	let data = new Object();

	data.seed = map.seed;
	data.resolution = map.resolution;

	data.raw_data = map.raw_data;

	data.colours = ["DarkBlue","#2D5BA4","#297900","#D0AB76"];

	//lightblue
	data["#2D5BA4"] = new Array();

	//darkblue
	//data["DarkBlue"] = new Array();

	//green
	data["#297900"] = new Array();

	//beach
	data["#D0AB76"] = new Array();

	for(let x=0;x<map.length;x++){
		for(let y=0;y<map[x].length;y++){
			if(map[x][y]<0.1){
				continue;
			}
			else if(map[x][y]<0.3){
				data["#2D5BA4"].push([x,y]);
			}
			else if(map[x][y] < 0.35){
				data["#D0AB76"].push([x,y]);
			}
			else{
				data["#297900"].push([x,y]);
			}
		}
	}
	return data;
}

function optimize(map){
	let temp, strip, amt;

	for(let c=1;c<map.colours.length;c++){
		temp = new Array();
		for(let p=0;p<map[map.colours[c]].length;p++){
			strip = [map[map.colours[c]][p][0],map[map.colours[c]][p][1]];
			amt = 1;
			for(;p<map[map.colours[c]].length-1;p++){
				if(map[map.colours[c]][p][0] === map[map.colours[c]][p+1][0] &&
				map[map.colours[c]][p][1]+1 === map[map.colours[c]][p+1][1]){
					amt++;
				}
				else{
					break;
				}
			}
			strip.push(amt);
			temp.push(strip);
		}
		map[map.colours[c]] = temp;
	}

	return map;
}

function regenerate(map, resolution){
	return optimize(split_map(compress(gen_island(1000,1000,map.seed),resolution)));
}
