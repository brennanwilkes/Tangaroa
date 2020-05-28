

function QuickPlay(event){
	world = new Map(true);
	start_game();
}

function NewGame(event){
	world = new Map(false,3);
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
