var scrollId;
var scrollAmt;

function QuickPlay(event){
	world = new Map(true);
	start_game();
}

function NewGame(event){
	world = new Map(false,1);
	start_game();
}



function start_game(){
	let menu = document.getElementsByClassName("menu");
	for(let i=0;i<menu.length;i++){
		menu[i].classList.add("menu_hide");
	}

	if(Boid.totalBoids > 0){
		Boid.boids[0].kill(true);
	}


	map = world.get(player.wx,player.wy);

	addEventListener("keydown",key_down);
	addEventListener("keyup",key_up);
	clearInterval(intervalID);
	intervalID = setInterval(tick,4);
}

function About(){
	scrollAmt = 95;
	scrollId = setInterval(scroll,4,1);
}

function Back(){
	scrollAmt = 95;
	scrollId = setInterval(scroll,4,-1);
}

function scroll(mult){
	let menu = document.getElementsByClassName("menu");
	for(let i=0;i<menu.length;i++){
		menu[i].style.top = getComputedStyle(menu[i]).top.substring(0,getComputedStyle(menu[i]).top.length-2)-(MAX_Y/100*mult)+"px";
	}
	scrollAmt--;
	if(scrollAmt <= 0){
		clearInterval(scrollId,mult);
	}
}
