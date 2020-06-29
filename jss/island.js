

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
	return Math.floor( min_b + Math.random()*((max_b-min_b)+1) );
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




function gen_noise_map(width, height, scale, oct, persist, lac, seed, normalize=true){
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
	if(!normalize){
		map.minHeight = minHeight;
		map.maxHeight = maxHeight;
	}

	//normalize
	return normalize ? normalize_2d_array(map,minHeight,maxHeight) : map;
}


function rgb(r,g,b){
	return "rgb("+r+", "+g+", "+b+")";
}

function hash_arr(arr){
	let hash = 0x12345678;

	while (arr.length > 0) {
		hash ^= (hash << 16) | (hash << 19);
		hash += arr.pop();
		hash ^= (hash << 26) | (hash << 13);
	}
	return Math.abs(hash);
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


function get_lighting(peak,coord){
	let val0 = (is_town(peak[2]) ? remove_town(peak[2]) : peak[2]);
	let val1 = (is_town(coord[2]) ? remove_town(coord[2]) : coord[2]);
	return (val0-val1+0.2)*(1-(Math.pow(pixel_distance(peak,coord),1.25)/LIGHTING_DISTANCE));
}
function pixel_distance(peak,coord){
	return Math.sqrt(Math.pow(coord[0]-peak[0],2)+Math.pow(coord[1]-peak[1],2));
}

function colour_round(colour){
	if(is_town(colour)){
		return 4;
	}
	else if(colour <0.1){
		return 0;
	}
	else if(colour <0.3){
		return 1;
	}
	else if(colour  < 0.35){
		return 2;
	}
	else if(colour  < 0.45){
		return 3;
	}
	else if(colour  < 0.6){
		return 5;
	}
	else if(colour  < 0.75){
		return 6;
	}
	else if(colour < 0.9 && colour > 0.89){
		return 9;
	}
	else if(colour < 0.925){
		return 8;
	}
	return 7;
}

function is_town(val){
	return (Math.floor(val)%TOWN_HEIGHT === 0 && Math.floor(val) > 0);
}

function remove_town(val){
	while(val > TOWN_HEIGHT){
		val -= TOWN_HEIGHT;
	}
	return val;
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

const ISLAND_PIXEL_SCALE = 4;
var LIGHTING_DISTANCE = 15;


const TOWN_HEIGHT = 36;
const SPRITE_SIZE = 8;


let SMALL_SIZES = [256, 384, 512, 640, 768, 896, 1024, 1152, 1280, 1408];

let SIZES = [256, 384, 512, 640, 768, 896, 1024, 1152, 1280, 1408, 1536, 1664, 1792, 1920, 2048, 2176, 2304, 2432, 2560, 2688, 2816, 2944, 3072];

let CLUSTER_SIZES = [2048, 2176, 2304, 2432, 2560, 2688, 2816, 2944, 3072];//, 3200, 3328, 3456, 3584, 3712, 3840, 3968, 4096, 4224, 4352, 4480, 4608, 4736, 4864, 4992];


class IslandSettings{
	seed=Math.random()*1000000;
	size_x=-1;
	size_y=-1;
	x=0;
	y=0;
	type = 0;
}


function generate_random_island(settings=new IslandSettings()){
	return new Island(0,settings.seed,settings.size_x,settings.size_y,settings.x,settings.y);
	/*
	if(settings.type === 0){
		return new Island(0,settings.seed,settings.size_x,settings.size_y,settings.x,settings.y);
	}
	else if(settings.type === 1){
		return new IslandCluster(settings.seed,settings.size_x,settings.size_y,settings.x,settings.y);
	}
	*/
}

class IslandCopy{
	constructor(isl,size){
		this.colours = [DEEP_OCEAN, SHALLOW_OCEAN, LAND_ONE, LAND_TWO, LAND_THREE, BEACH, VILLAGE, ROCK_ONE, ROCK_TWO, LAVA_ONE, LAVA_TWO];
		this.raw_data;
		this.display_data;

		if(isl !== undefined){
			this.is_map_island = true;
			this.size = size;
			this.raw_data = isl.raw_data;
			this.gen_display_data(this.compress(Math.ceil(Math.min(this.raw_data.length,this.raw_data[0].length)*ISLAND_PIXEL_SCALE/this.size)));
		}
	}
	compress(factor){
		if(factor===1){
			return this.raw_data;
		}



		const n_x = Math.floor(this.raw_data.length/factor);
		const n_y = Math.floor(this.raw_data[0].length/factor);

		let comp = new Array(n_x);
		for(let i=0;i<n_x;i++){
			comp[i] = new Array(n_y);
			for(let j=0;j<n_y;j++){
				comp[i][j] = 0;
			}
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
		this.display_data[SHALLOW_OCEAN] = new Array();

		//green
		this.display_data[LAND_ONE] = new Array();

		//green
		this.display_data[LAND_TWO] = new Array();

		//green
		this.display_data[LAND_THREE] = new Array();

		//beach
		this.display_data[BEACH] = new Array();

		//town
		this.display_data[VILLAGE] = new Array();

		//mountain
		this.display_data[ROCK_ONE] = new Array();
		this.display_data[ROCK_TWO] = new Array();

		//volcano
		this.display_data[LAVA_ONE] = new Array();
		this.display_data[LAVA_TWO] = new Array();

		let adjusted_height;
		for(let x=0;x<raw_data.length;x++){
			for(let y=0;y<raw_data[0].length;y++){

				adjusted_height = (is_town(raw_data[x][y]) ? remove_town(raw_data[x][y]) : raw_data[x][y] );

				if(adjusted_height<0.1){
					continue;
				}
				else if(adjusted_height<0.3){
					this.display_data[SHALLOW_OCEAN].push([x,y]);
				}
				else if(adjusted_height < 0.35){
					this.display_data[BEACH].push([x,y]);
				}
				else if(adjusted_height < 0.45){
					this.display_data[LAND_ONE].push([x,y]);
				}
				else if(adjusted_height < 0.6){
					this.display_data[LAND_TWO].push([x,y]);
				}
				else if(adjusted_height < 0.75){
					this.display_data[LAND_THREE].push([x,y]);
				}
				else if(adjusted_height < 0.9 && adjusted_height > 0.89){
					this.display_data[ROCK_ONE].push([x,y]);
				}
				else if(adjusted_height < 0.925){
					this.display_data[ROCK_TWO].push([x,y]);
				}
				else if(adjusted_height < 1.1){
					this.display_data[LAVA_ONE].push([x,y]);
				}
				else{
					this.display_data[LAVA_TWO].push([x,y]);
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
				strip.push(1);
				temp.push(strip);
			}
			this.display_data[this.colours[c]] = temp;
		}
	}

	draw(ctx, offsetx, offsety){
		if(this.canvas_img === undefined){
			this.gen_ctx_img();
		}
		if(this.canvas_ready || this.is_map_island){
			ctx.drawImage(this.canvas_img, offsetx, offsety);
		}
	}

	draw_objects(ctx,offsetx,offsety){
		if(this.objects_img === undefined){
			this.objects_img = document.createElement('canvas');
			this.objects_img.width = this.size[0];
			this.objects_img.height = this.size[1];

			let ctx_img = this.objects_img.getContext("2d");
			if(this.town != undefined && this.town.length === 2 && this.objects!=undefined){
				for(let b=0; b < this.objects.length; b++){
					ctx_img.drawImage(Island.graphics[this.objects[b][2]], this.objects[b][0] - Island.graphics[this.objects[b][2]].width/2, this.objects[b][1] - Island.graphics[this.objects[b][2]].height/2, Island.graphics[this.objects[b][2]].width, Island.graphics[this.objects[b][2]].height);
				}
			}
		}
		else{
			ctx.drawImage(this.objects_img, offsetx, offsety);
		}

	}

	draw_lighting(ctx, offsetx, offsety){
		if(!this.is_map_island){
			if(this.lighting_img === undefined){
				this.bake_lighting();
			}
			if(this.lighting_ready){
				ctx.drawImage(this.lighting_img, offsetx, offsety);
			}
		}
	}

	blend(island,x,y){
		for(let i=0; i<island.size[0]/ISLAND_PIXEL_SCALE; i++){
			for(let j=0; j<island.size[1]/ISLAND_PIXEL_SCALE; j++){
				if(island.raw_data[i][j] > 0.1){
					for(let xx=0;xx<ISLAND_PIXEL_SCALE;xx++){
						for(let yy=0;yy<ISLAND_PIXEL_SCALE;yy++){
							this.raw_data[x+(i*ISLAND_PIXEL_SCALE)+xx][y+(j*ISLAND_PIXEL_SCALE)+yy] = island.raw_data[i][j];
						}
					}
				}
			}
		}
	}


	//25,8,8,0.75
	gen_island_data(){

		const HAS_MOTU = this.seed%2 === 0;
		const HAS_REEF = this.seed%4 === 0;
		const IS_ATOLL = this.seed%2 === 0 && hash(this.seed-100)%4 === 0;
		const IS_VOLCANO =this.seed%2 === 1 && hash(this.seed-66)%4 === 0;

		let HAS_TOWN = this.GEN_TOWN;// === 0 ? hash(this.seed+11)%2 : 1;



		if(IS_VOLCANO || IS_ATOLL){
			this.LAC_SCALE_DOWN = 0.8;
		}

		//generate base map
		this.raw_data = gen_noise_map(this.size[0], this.size[1], ISL_SCALE,ISL_OCT,ISL_PERSIST,(ISL_LAC + 0.15*(1-this.size[2]))*this.LAC_SCALE_DOWN,hash(this.seed), false);




		let TOWN_SPAWN_X, TOWN_SPAWN_Y;
		if(HAS_TOWN === 0){
			TOWN_SPAWN_X = hash(this.seed-23)%2 === 0;
			TOWN_SPAWN_Y = hash(this.seed-24)%2 === 0;
		}

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

				this.raw_data[x][y] = normalize(this.raw_data[x][y], this.raw_data.minHeight, this.raw_data.maxHeight);

				if(IS_ATOLL){
					//Lower the height
					this.raw_data[x][y] = normalize(this.raw_data[x][y], 0, 1.75);
				}
				else if(this.size[0] >= 512){
					//Raise the height
					this.raw_data[x][y] = normalize(this.raw_data[x][y], -0.5, 1);
				}




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

					//raise water inside motus
					if(mapMASK[x][y] === 1){
						this.raw_data[x][y]+=0.1;
					}

					//cut away water outside motus
					else if(mapMASK[x][y] === 0.5 && this.raw_data[x][y]<0.275){
						this.raw_data[x][y]=0.05;
					}
				}
				else if(IS_VOLCANO){
					if(this.raw_data[x][y]>0.6){
						this.raw_data[x][y] *= 1.25;
					}
				}

				//normalize deep water
				if(this.raw_data[x][y]<0.1){
					this.raw_data[x][y] = 0.05;
				}

				if(this.raw_data[x][y]>0.925){
					this.has_volcano = true;
				}

				if(HAS_TOWN === 0){
					if(Math.abs(this.raw_data[x][y]-(TOWN_HEIGHT/100))<0.01 && ( TOWN_SPAWN_X ? (x > this.size[0]/2) : (x < this.size[0]/2) ) && ( TOWN_SPAWN_Y ? (y > this.size[1]/2) : (y < this.size[1]/2) ) ){
						HAS_TOWN = -1;
						this.town = [x,y];

					}
				}
			}
		}
		this.objects = new Array();
		if(HAS_TOWN === -1){
			let town_buildings = (this.seed-12)%4 + 4;
			this.gen_obj(0,Island.numVillageGraphics,town_buildings,6,6,0.3,0.45,500,this.town[0],this.town[1]);

			if(this.objects.length <= 3 && this.objects.length > 0){
				this.objects[0][2] = 0;
			}

			this.num_villagers = 3 + hash(this.seed+169)%3;

		} else{
			this.num_villagers = 0;
		}

		let numTrees = (this.seed-12)%500 + 500;
		this.gen_obj(Island.shiftTreeGraphics,Island.numTreeGraphics,numTrees,-1,-1,0.35,0.4,700,Math.floor(this.size[0]/2),Math.floor(this.size[1]/2));

		let numPlants = (this.seed-12)%100+250;
		this.gen_obj(Island.shiftPlantGraphics,Island.numPlantGraphics,numPlants,-1,-1,0.375,0.425,700,Math.floor(this.size[0]/2),Math.floor(this.size[1]/2));



	}

	gen_obj(graphicStart,graphicShift,numObj,spreadX,spreadY,rangeMin,rangeMax,hashShift,originX,originY){
		spreadX = (spreadX===-1 ? Math.floor(this.size[0]/SPRITE_SIZE/ISLAND_PIXEL_SCALE/2) : spreadX);
		spreadY = (spreadY===-1 ? Math.floor(this.size[1]/SPRITE_SIZE/ISLAND_PIXEL_SCALE/2) : spreadY);
		let shift = 0;
		let obj_coord;
		let a,b,c;
		let len = this.objects.length;
		for(let t=len;t<numObj+len;t++){
			do{
				a = hash(hash(this.seed-12)-(t+shift))%spreadX-Math.floor(spreadX/2);
				a =  originX+a*ISLAND_PIXEL_SCALE*SPRITE_SIZE;
				b = hash(hash(this.seed-13)-(t+shift+hashShift))%spreadY-Math.floor(spreadY/2);
				b = originY+b*ISLAND_PIXEL_SCALE*SPRITE_SIZE;
				c = hash(hash(this.seed-13)-(t+shift+hashShift))%graphicShift + graphicStart;
				this.objects[t] = [a,b,c];
				shift++;
				if(a < 0 || a >= this.size[0]*3/4 || b < 0 || b >= this.size[1]*3/4){
					obj_coord = -1;
				}
				else{
					obj_coord = this.raw_data[a][b];
				}
			}
			while((obj_coord > rangeMax || obj_coord < rangeMin || obj_coord===-1) && shift < 200 + numObj*2);
			if(shift >= numObj*2){
				this.objects.splice(t,this.objects.length-t);
				break;
			}
			this.cast_shadow(this.objects[t]);
		}
	}

	cast_shadow(shadow){
		if(Island.graphics[shadow[2]].shadowScale < 0.05){
			return;
		}

		let scl = 3 / Island.graphics[shadow[2]].shadowScale;
		for(let x=Math.floor(Island.graphics[shadow[2]].width/(-1*scl));x<Math.floor(Island.graphics[shadow[2]].width/scl);x++){
			for(let y=Math.floor(Island.graphics[shadow[2]].height/(-1*scl));y<Math.floor(Island.graphics[shadow[2]].height/scl);y++){
				if(Math.abs(x+y) <= 2 ){
					this.raw_data[shadow[0]+x][shadow[1]+y] += TOWN_HEIGHT;
				}
			}
		}
	}

	bake_strip(maxsize, y, ctx_img){
		let peak, nextpeak, h, hn, xx,yy;

		peak = undefined;
		nextpeak = undefined;
		for(let x=0;x<maxsize;x+=ISLAND_PIXEL_SCALE){
			xx = Math.floor(x/ISLAND_PIXEL_SCALE);
			yy = Math.floor(y/ISLAND_PIXEL_SCALE) + xx;

			//ANGLE MODE
			//yy = Math.floor(y/ISLAND_PIXEL_SCALE)+Math.floor(Math.tan(LIGHTING_ANGLE)*xx);

			//REFERENCE
			//xx2 = Math.ceil(x/ISLAND_PIXEL_SCALE);
			//yy2 = Math.ceil(y/ISLAND_PIXEL_SCALE)+Math.ceil(Math.tan(LIGHTING_ANGLE)*xx2);


			if(xx+1 >= this.raw_data.size || xx <= 0 || this.raw_data===undefined || this.raw_data[xx+1] ===undefined || yy+1 >= this.raw_data[xx+1].size || yy <= 0 ){
				continue;
			}

			h = this.raw_data[xx][yy];
			hn = this.raw_data[xx+1][yy+1];


			//ANGLE MODE
			//hn = this.raw_data[xx+1][yy+Math.floor(Math.tan(LIGHTING_ANGLE)*1)];

			if(colour_round(h) > colour_round(hn) && (colour_round(hn) > 2 || colour_round(h)===4)){
				nextpeak = [xx*ISLAND_PIXEL_SCALE,yy*ISLAND_PIXEL_SCALE,h];
			}

			if( peak!=undefined && (colour_round(peak[2]) > 2 && colour_round(peak[2]) > colour_round(h) || ( colour_round(peak[2])===4 && colour_round(h)===4)  )){
				ctx_img.fillStyle = "rgba(0, 0, 0, "+get_lighting(peak,[xx*ISLAND_PIXEL_SCALE,yy*ISLAND_PIXEL_SCALE,h])+")";
				ctx_img.fillRect(xx*ISLAND_PIXEL_SCALE,yy*ISLAND_PIXEL_SCALE,ISLAND_PIXEL_SCALE,ISLAND_PIXEL_SCALE);

				//REFERENCE
				/*
				if(claimed_pixels[hash_arr([xx,yy])] === undefined ){
					claimed_pixels[hash_arr([xx,yy])] = 1;
					ctx_img.fillRect(xx*ISLAND_PIXEL_SCALE,yy*ISLAND_PIXEL_SCALE,ISLAND_PIXEL_SCALE,ISLAND_PIXEL_SCALE);
				}*/
			}
			peak = nextpeak;
		}
	}

	unload(){
		delete this.canvas_img;
		delete this.lighting_img;
		this.lighting_ready = false;
		this.canvas_ready = false;
	}

	bake_lighting(rebake = false){

		let ctx_img, temp_canvas;
		if(rebake){
			temp_canvas = document.createElement('canvas');
			temp_canvas.width = this.size[0];
			temp_canvas.height = this.size[1];
			ctx_img = temp_canvas.getContext("2d");
		}
		else{
			this.lighting_img = document.createElement('canvas');
			this.lighting_img.width = this.size[0];
			this.lighting_img.height = this.size[1];
			ctx_img = this.lighting_img.getContext("2d");
		}

		//REFERENCE
		//let claimed_pixels = new Object();

		let maxsize = Math.max(this.size[0],this.size[1])-ISLAND_PIXEL_SCALE;

		let temp_this = this;
		let delay = 1;
		for(let y=maxsize*-1;y<maxsize;y+=ISLAND_PIXEL_SCALE){
			setTimeout(function(){
				temp_this.bake_strip(maxsize,y, ctx_img);
			},delay+=5);
		}
		setTimeout(function(){
			if(rebake){
				temp_this.lighting_img = temp_canvas;
			}
			temp_this.lighting_ready = true;
		},delay+5);
	}

	gen_ctx_colour(c,ctx_img){
		ctx_img.fillStyle = this.colours[c];
		for(let p=0;p<this.display_data[this.colours[c]].length;p++){
			ctx_img.fillRect(this.display_data[this.colours[c]][p][0]*ISLAND_PIXEL_SCALE, this.display_data[this.colours[c]][p][1]*ISLAND_PIXEL_SCALE, this.display_data[this.colours[c]][p][3]*ISLAND_PIXEL_SCALE, this.display_data[this.colours[c]][p][2]*ISLAND_PIXEL_SCALE);
		}
	}


	gen_ctx_img(){
		this.canvas_img = document.createElement('canvas');
		if(this.is_map_island){
			this.canvas_img.width = this.size;
			this.canvas_img.height = this.size;
		}
		else{
			this.canvas_img.width = this.size[0];
			this.canvas_img.height = this.size[1];
		}
		let ctx_img = this.canvas_img.getContext("2d");

		let temp_this = this;
		let delay = 1;
		for(let c=1;c<this.colours.length;c++){
			if(this.is_map_island){
				this.gen_ctx_colour(c,ctx_img);
				continue;
			}
			setTimeout(function(){
				temp_this.gen_ctx_colour(c,ctx_img);
			},delay+=25);
		}
		if(this.is_map_island){
			this.canvas_ready = true;
			return;
		}

		setTimeout(function(){
			temp_this.canvas_ready = true;
		},delay+25);
	}
}


class Island extends IslandCopy{
	constructor(type=0, seed=Math.random()*1000000, size_x=-1, size_y=-1, x=0, y=0, LAC_SCALE_DOWN=1, GEN_TOWN=0) {

		super();

		this.canvas_img;
		this.canvas_ready = true;

		this.lighting_img;
		this.lighting_ready = false;

		this.replicable_seed = seed;
		this.seed = hash(seed);

		this.type = (type===-1 ? 0 : type);

		this.town = [-1,-1];
		this.visited = false;

		this.has_volcano = false;
		this.name = NAMES_LIST[hash(seed*seed)%NAMES_LIST.length];

		this.x = x;
		this.y = y;

		this.size = [size_x,size_y];
		const size_type = [SIZES,CLUSTER_SIZES];
		let temp = hash(seed)%size_type[this.type].length;
		if(this.size[0] === -1){
			this.size[0] = size_type[this.type][temp + (temp+3 >= size_type[this.type].length ? 0 : hash(seed+2)%4)];
		}
		if(this.size[1] === -1){
			this.size[1] = size_type[this.type][temp + (temp+3 >= size_type[this.type].length ? 0 : hash(seed+1)%4)];
		}

		this.size.push(normalize((this.size[0]+this.size[1])/2,SIZES[0],SIZES[SIZES.length-1]));


		this.LAC_SCALE_DOWN = LAC_SCALE_DOWN;
		this.GEN_TOWN = GEN_TOWN;



		if(this.type === 0){
			this.gen_island_data();
		}
		if(type === 0){
			this.raw_data = this.compress(ISLAND_PIXEL_SCALE);
			this.gen_display_data(this.raw_data);
		}
	}

	onbeach(x,y){
		return (x > 0 && x < this.size[0] && y > 0 && y < this.size[1]) && (remove_town(this.raw_data[Math.floor(x/ISLAND_PIXEL_SCALE)][Math.floor(y/ISLAND_PIXEL_SCALE)]) >= 0.3) && (remove_town(this.raw_data[Math.floor(x/ISLAND_PIXEL_SCALE)][Math.floor(y/ISLAND_PIXEL_SCALE)]) < 0.35);
	}

	onground(x, y){
		return (x > 0 && x < this.size[0] && y > 0 && y < this.size[1]) && (remove_town(this.raw_data[Math.floor(x/ISLAND_PIXEL_SCALE)][Math.floor(y/ISLAND_PIXEL_SCALE)]) >= 0.35);
	}

	onvillagerland(x,y){
		return (x > 0 && x < this.size[0] && y > 0 && y < this.size[1]) && (remove_town(this.raw_data[Math.floor(x/ISLAND_PIXEL_SCALE)][Math.floor(y/ISLAND_PIXEL_SCALE)]) >= 0.3) && (remove_town(this.raw_data[Math.floor(x/ISLAND_PIXEL_SCALE)][Math.floor(y/ISLAND_PIXEL_SCALE)]) <= 0.45);

	}

	attown(x, y){
		return this.onbeach(x, y) && (Math.abs(x-this.town[0]) < 100) && (Math.abs(y-this.town[1]) < 100);
	}
}


class IslandCluster extends Island{
	constructor(seed=Math.random()*1000000, size_x=-1, size_y=-1, x=0, y=0, LAC_SCALE_DOWN=1) {
		super(1,seed,size_x,size_y,x,y,LAC_SCALE_DOWN);

		this.gen_cluster_data();
		this.raw_data = this.compress(ISLAND_PIXEL_SCALE);
		this.gen_display_data(this.raw_data);
	}

	gen_cluster_data(){

		this.raw_data = new Array(this.size[0]);
		for(let i=0; i<this.size[0]; i++){
			this.raw_data[i] = new Array(this.size[1]);
			for(let j=0; j<this.size[1]; j++){
				this.raw_data[i][j] = 0;
			}
		}

		let island, size_x, size_y, x, y, valid, tries, temp;
		let max = 16;


		for(let isl = 0; isl < max; isl++){

			temp = hash(this.seed*isl)%SMALL_SIZES.length;
			size_x = SMALL_SIZES[temp + (temp+3 >= SMALL_SIZES.length ? 0 : hash(this.seed*isl+2)%4)];
			size_y = SMALL_SIZES[temp + (temp+3 >= SMALL_SIZES.length ? 0 : hash(this.seed*isl+1)%4)];

			valid = false;
			tries = 0;
			while(!valid){

				if(tries>100){
					break;
				}

				x = hash(this.seed*isl*tries-1)%(this.size[0]-size_x);
				y = hash(this.seed*isl*tries-2)%(this.size[1]-size_y);

				valid = true;

				//replace 0.2 and 0.8 with calculations
				for(let i=Math.round(x+size_x*0.2);i<x+size_x*0.8; i += 32){
					for(let j=Math.round(y+size_y*0.2);j<y+size_y*0.8; j += 32){
						if(this.raw_data[i][j] >= 0.1){
							valid = false;
							break;
						}
					}
					tries++;
				}
			}
			if(valid){

				island = new Island(0, hash(this.seed*isl), size_x, size_y, 0, 0, 0.925, this.town[0]===-1 ? 0 : 1);

				this.has_volcano = this.has_volcano | island.has_volcano;

				if(island.town[0] != -1){
					this.town[0] = x+island.town[0];
					this.town[1] = y+island.town[1];
					this.objects = island.objects;
				}
				this.blend(island,x,y);
			}
		}
	}
}

var TRANSIT_ISLAND_SIZE = 4096;

class TransitIsland{
	constructor(){
		this.colours = [DEEP_OCEAN];
		this.has_volcano = 0;
		this.size = [TRANSIT_ISLAND_SIZE,TRANSIT_ISLAND_SIZE];

		this.is_transit = true;

		this.raw_data = new Array(TRANSIT_ISLAND_SIZE);
		for(let x=0; x<TRANSIT_ISLAND_SIZE;x++){
			this.raw_data[x] = new Array(TRANSIT_ISLAND_SIZE);
			for(let y=0; y<TRANSIT_ISLAND_SIZE;y++){
				this.raw_data[x][y] = 0;
			}
		}
	}

	draw(ctx, offsetx, offsety){}
	draw_lighting(ctx, offsetx, offsety){}
	draw_objects(ctx, offsetx, offsety){}
	onbeach(x,y){
		return false;
	}

	onground(x, y){
		return false;
	}

	onvillagerland(x,y){
		return false;
	}

	attown(x, y){
		return false;
	}

}

Island.graphics = new Array();
for(let img = 0; img<8; img++){
	Island.graphics[img] = new Image();
	Island.graphics[img].origin="anonymous";
	Island.graphics[img].crossorigin="anonymous";

}


Island.numVillageGraphics = 3;
Island.graphics[0].src = "assets/town/fale.png";
Island.graphics[0].shadowScale = 0.8;
Island.graphics[1].src = "assets/town/fale2.png";
Island.graphics[1].shadowScale = 0.8;
Island.graphics[2].src = "assets/town/stones.png";
Island.graphics[2].shadowScale = 0;
//Island.graphics[3].src = "assets/town/chief-fale.png";
//Island.graphics[3].shadowScale = 0.8;

Island.numTreeGraphics = 3;
Island.shiftTreeGraphics = 4;
Island.graphics[4].src = "assets/trees/coconut-tree.png";
Island.graphics[4].shadowScale = 1;
Island.graphics[5].src = "assets/trees/coconut-tree2.png";
Island.graphics[5].shadowScale = 1;
Island.graphics[6].src = "assets/trees/coconut-tree3.png";
Island.graphics[6].shadowScale = 1;

Island.numPlantGraphics = 1;
Island.shiftPlantGraphics = 7;
Island.graphics[7].src = "assets/trees/taro.png";
Island.graphics[7].shadowScale = 0.25;
