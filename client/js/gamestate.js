const
	GAMESTATE_LOCALMULTIPLAYER=1,
	GAMESTATE_CONTROLSSETTINGS=2,
	GAMESTATE_PLAY=3,
	GAMESTATE_MAINMENU=4,
	GAMESTATE_SETTINGS=5,
	GAMESTATE_CREDITS=6,
	GAMESTATE_SCOREATTACK=7,
	GAMESTATE_CONTROLSEXPLAIN=8,
	GAMESTATE_MOREGAMES=98,
	GAMESTATE_QUIT=99,
	GAMESTATE_NETPLAY=100,
	GAMESTATE_BENCHMARK=200,
	GAMESTATE_FIRST=GAMESTATE_CONTROLSEXPLAIN;

/*

// Initialize screen
	
*/

function GameState(master) {

	var offscreen,screen;
	var gameState,currentManager;
	var lastSettings,lastReturn;
	var nextGameState;

	var timeout,nextFrame=0,doResize,frameDone=1,renderSkip=0;

    // Screen management

    function createScreen(onscreen) {
    	return DOM.createCanvas(SCREEN_WIDTH,SCREEN_HEIGHT,onscreen);
    }

    function askResize() { doResize=10; }

    function resize() {
		var screenWidth=document.body.clientWidth;
		var screenHeight=document.body.clientHeight;

		var ratio=QMATH.min(
			QMATH.floor(screenWidth/SCREEN_WIDTH*10)/10,
			QMATH.floor(screenHeight/SCREEN_HEIGHT*10)/10
		);

		var x=QMATH.floor((screenWidth-(ratio*SCREEN_WIDTH))/2);
		var y=QMATH.floor((screenHeight-(ratio*SCREEN_HEIGHT))/2);

		screen.canvas.style.transform="translate("+x+"px,"+y+"px) scale("+ratio+")";
		CONTROLS.resizeScreen(screenWidth,screenHeight);
    }

    // Rendering & logic
    var ts,wait;
	function scheduleNextLogicLoop(loop) {
		//clearTimeout(timeout);
		nextFrame+=MSPF;
		ts=Date.now();
		wait=nextFrame-ts;
		if (wait<=0) {
			wait=1;
			nextFrame=ts;
			renderSkip++;
		}
		timeout = setTimeout(loop, wait);			
	};

	var ret;	
	function logicLoop() {

		// Controls
		CONTROLS.frame();

		// Logic
		if (nextGameState) {
			CONTROLS.registerEventCallback();
			switch (nextGameState) {
				case GAMESTATE_LOCALMULTIPLAYER:{
					currentManager=LOCALMULTIPLAYER;
					currentManager.show(lastReturn);
					lastReturn=0;
					break;
				}
				case GAMESTATE_CONTROLSSETTINGS:{
					currentManager=CONTROLSSETTINGSMENU;
					currentManager.show();
					break;
				}
				case GAMESTATE_PLAY:{
					currentManager=GAME;
					currentManager.show(lastSettings);
					break;
				}
				case GAMESTATE_SETTINGS:{
					currentManager=SETTINGS;
					currentManager.show();
					break;
				}
				case GAMESTATE_MAINMENU:{
					currentManager=MAINMENU;
					currentManager.show();
					break;
				}
				case GAMESTATE_CREDITS:{
					currentManager=CREDITS;
					currentManager.show();
					break;
				}
				case GAMESTATE_SCOREATTACK:{
					currentManager=SCOREATTACK;
					currentManager.show(lastReturn);
					lastReturn=0;
					break;
				}
				case GAMESTATE_CONTROLSEXPLAIN:{
					currentManager=CONTROLSEXPLAIN;
					currentManager.show();
					lastReturn=0;
					break;
				}
				case GAMESTATE_NETPLAY:{
					currentManager=NETPLAY;
					currentManager.show(lastReturn);
					lastReturn=0;
					break;
				}
				case GAMESTATE_BENCHMARK:{
					currentManager=BENCHMARK;
					currentManager.show();
					break;
				}
				case GAMESTATE_MOREGAMES:{
					nextGameState=GAMESTATE_CREDITS;
					currentManager=CREDITS;
					currentManager.show();
					AUDIOPLAYER.stopMusic();
					CONTROLS.disableControls();
					PLAYLIGHT.moreGames();
					break;
				}
				case GAMESTATE_QUIT:{
					currentManager={ render:function(){} };
					close();
					break;
				}
			}
			gameState=nextGameState;
			nextGameState=0;
		}
		switch (gameState) {
			case GAMESTATE_MAINMENU:{
				ret=currentManager.frame();
				if (ret) nextGameState=ret;
				break;
			}
			case GAMESTATE_PLAY:{
				ret=currentManager.frame();
				if (ret) {
					lastReturn=ret;
					nextGameState=ret.goBackTo;
				}
				break;
			}
			case GAMESTATE_CONTROLSSETTINGS:{
				ret=currentManager.frame();
				if (ret==-1) nextGameState=GAMESTATE_SETTINGS;
				break;
			}
			case GAMESTATE_SETTINGS:{
				ret=currentManager.frame();
				if (ret==-1)  nextGameState=GAMESTATE_MAINMENU;
				else if (ret) nextGameState=ret;
				break;
			}
			case GAMESTATE_CREDITS:{
				ret=currentManager.frame();
				if (ret==-1) nextGameState=GAMESTATE_MAINMENU;
				break;
			}
			case GAMESTATE_NETPLAY:{
				ret=currentManager.frame();
				if (ret==-1) nextGameState=GAMESTATE_MAINMENU;
				else if (ret) {
					lastSettings=ret;
					console.log(JSON.stringify(ret));
					nextGameState=GAMESTATE_PLAY;
				}
				break;
			}
			case GAMESTATE_CONTROLSEXPLAIN:{
				ret=currentManager.frame();
				if (ret==-1) nextGameState=GAMESTATE_MAINMENU;
				break;
			}
			case GAMESTATE_LOCALMULTIPLAYER:{
				ret=currentManager.frame();
				if (ret==-1) nextGameState=GAMESTATE_MAINMENU; else
				if (ret) {
					lastSettings=ret;
					console.log(JSON.stringify(ret));
					nextGameState=GAMESTATE_PLAY;
				}
				break;
			}
			case GAMESTATE_BENCHMARK:{
				currentManager.frame();
				break;
			}
			case GAMESTATE_SCOREATTACK:{
				ret=currentManager.frame();
				if (ret==-1) nextGameState=GAMESTATE_MAINMENU;
				else if (ret) {
					lastSettings=ret;
					console.log(JSON.stringify(ret));
					nextGameState=GAMESTATE_PLAY;
				}
				break;
			}
			case GAMESTATE_QUIT:{
				break;
			}
		}
	}

	// Off-screen strategy

	function offscreenDoRenderLoop() {

		// Screen resize
		if (doResize) {
			resize();
			doResize--;
		}

		// Rendering
		screen.ctx.drawImage(offscreen.canvas, 0,0);

		frameDone=1;
	}

	function offscreenDoLogicLoop() {
		logicLoop();

		// Next frame
		if (frameDone) 
			if (renderSkip) renderSkip--;
			else {
				frameDone=0;
				currentManager.render(offscreen.ctx);
				window.requestAnimFrame(offscreenDoRenderLoop);
			}

		// Schedule next frame
		scheduleNextLogicLoop(offscreenDoLogicLoop);
	}

	// Off-screen sync strategy

	function offscreenSyncDoRenderLoop() {

		// Screen resize
		if (doResize) {
			resize();
			doResize--;
		}

		// Rendering
		currentManager.render(offscreen.ctx);
		screen.ctx.drawImage(offscreen.canvas, 0,0);

		frameDone=1;
	}

	function offscreenSyncDoLogicLoop() {
		logicLoop();

		// Next frame
		if (frameDone) 
			if (renderSkip) renderSkip--;
			else {
				frameDone=0;
				window.requestAnimFrame(offscreenSyncDoRenderLoop);
			}

		// Schedule next frame
		scheduleNextLogicLoop(offscreenSyncDoLogicLoop);
	}

	// On-screen strategy

	function onscreenDoRenderLoop() {

		// Screen resize
		if (doResize) {
			resize();
			doResize--;
		}

		// Rendering
		currentManager.render(screen.ctx);
		
		frameDone=1;
	}

	function onscreenDoLogicLoop() {
		logicLoop();

		// Next frame
		if (frameDone) 
			if (renderSkip) renderSkip--;
			else {
				frameDone=0;
				window.requestAnimFrame(onscreenDoRenderLoop);
			}

		// Schedule next frame
		scheduleNextLogicLoop(onscreenDoLogicLoop);
	}

	// Initialization

	this.resize=function() { doResize++; }

	this.setFullScreen=function() {
		DOM.setFullScreen(document.body);
		CONTROLS.resetButtons();
	}

	this.initialize=function() {
		this.screen=screen=createScreen(true);
	}

	this.run=function(startGame) {
		if (master.benchmark) nextGameState=GAMESTATE_BENCHMARK;
		else {
			nextGameState=GAMESTATE_FIRST;
			if (startGame==-1)
				nextGameState=GAMESTATE_BENCHMARK;
			else if (startGame) {
				lastSettings=startGame;
				nextGameState=GAMESTATE_PLAY;
			}
		}
		document.body.appendChild(screen.canvas);
    	screen.canvas.style.transformOrigin="0 0";
    	screen.canvas.style.position="absolute";
		DOM.addEventListener(window,"resize",askResize);
		askResize();
		switch (master.renderingMode) {
			case "offscreen":{
				offscreen=createScreen();
				offscreenDoLogicLoop();
				break;
			}
			case "offscreenSyncDoLogicLoop":{
				offscreen=createScreen();
				offscreenSyncDoLogicLoop();
				break;
			}
			default:{
				onscreenDoLogicLoop();
				break;
			}
		}
	}
}