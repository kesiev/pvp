
function ScoreAttack() {
	const
		NOTICEX=HSCREEN_WIDTH,
		NOTICEY=QMATH.floor(SCREEN_HEIGHT-FONT.tileHeight*1.5),
		NOTICETEXTY=NOTICEY+QMATH.floor(FONT.tileHeight/2),
		MENUCOLOR=PALETTE.BLACK,
		CAMERAROTATION=QMATH.PI/FPS/20,
		MENUY=SCREEN_HEIGHT-QMATH.floor(FONT.tileHeight*6),
		MAPLABELX=QMATH.floor(SCREEN_WIDTH/2),
		MAPLABELY=4+FONT.tileHeight,
		HISCOREY=4+FONT.tileHeight*3,
		HISCOREMESSAGEY=4+FONT.tileHeight*5,
		STARTTIMER_TIME=FPS*3,
		HISCORE_TIME=FPS*3,
		SCOREATTACK_STORAGE_PREFIX=STORAGE_PREFIX+"high-";

	var
		camera,menu,menuValues,currentMapData,quitMessage,startTimer,joinedController,hiscoreNotify;

	function setHiScore(id,score) {
		var mapKey=SCOREATTACK_STORAGE_PREFIX+MAPS[id].label;
		localStorage[mapKey]=score;
	}

	function getHiScore(id) {
		var mapKey=SCOREATTACK_STORAGE_PREFIX+MAPS[id].label;
		return localStorage[mapKey]*1||0;
	}

	function selectMap(id) {
		currentMap=id;
		currentMapData=MAPS[id];
		currentMapHighScore=getHiScore(id);
		var loadedData=MAPLOADER.load(id,RC,[],{});
		RC.setOverallLight(0.45);
		camera=RC.Camera({w:SCREEN_WIDTH,h:SCREEN_HEIGHT,planeY:0.66,id:0});
		camera.setPosX(loadedData.flagX);
		camera.setPosY(loadedData.flagY);
	}

	this.initialize=function() {
		menuValues={
			map:0
		};
		menu=new KeyMenu({
			valueX:CANVAS.pixelLen(FONT,10),
			menuY:MENUY
		});
		var maps=[];
		MAPS.forEach(map=>{
			maps.push({label:map.label,description:map.descriptionKeymenu})
		});
		menu.setMenu({
			options:[
				{label:"Map",id:"map",arrows:true,values:maps}
			]
		})
	}
	this.show=function(matchEnd) {
		AUDIOPLAYER.playMusic("title");
		hiscoreNotify=0;
		if (matchEnd&&matchEnd.score) {
			if (matchEnd.score>currentMapHighScore) {
				AUDIOPLAYER.play("speak_newhiscore");
				AUDIOPLAYER.play("explosion");
				setHiScore(currentMap,matchEnd.score);
				hiscoreNotify=HISCORE_TIME;
			}
		}
		joinedController=0;
		startTimer=0;
		selectMap(menuValues.map);
		TRANSITION.start();
		menu.reset();
	}
	this.frame=function() {				
		camera.rotateBy(CAMERAROTATION);

		if (TRANSITION.isFree) {

			if (!startTimer)
				for (var c in GAMECONTROLS)
					if (GAMECONTROLS[c].fire>0) joinedController=c;

			if (GAMECONTROLS[joinedController]&&GAMECONTROLS[joinedController].fire) {
				startTimer++;
				if (startTimer>=STARTTIMER_TIME) {
					// Start game
					var ret={
						players:[{isLocal:true,controller:joinedController,label:"You"}],
						modules:["horde","arcadeMode","time"],
						settings:{
							goBackTo:GAMESTATE_SCOREATTACK,
							gameSpeed:3,
							map:menuValues.map
						}
					};				
					for (var k in CONFIG)
						if (ret.settings[k]==undefined) ret.settings[k]=CONFIG[k];
					AUDIOPLAYER.stopMusic();
					TRANSITION.end(ret);
				}
			} else startTimer=0;

		}

		switch (menu.frame(TRANSITION.isFree,menuValues)) {
			case MENU_CHANGED:{
				if (menu.selectedOption.id=="map")
					selectMap(menuValues.map);
				break;
			}
			case MENU_CANCEL:{
				TRANSITION.end(-1);
				break;
			}
		}		
		return TRANSITION.getState();
	}
	this.render=function(ctx) {
		RC.tick();
		camera.render();
		camera.blit(ctx,0,0);
		menu.render(ctx,menuValues);
		CANVAS.printCenter(ctx,FONT,FONTPALETTE.WHITE,MAPLABELX,MAPLABELY,currentMapData.label,0,0,0,1,2);
		CANVAS.printCenter(ctx,FONT,FONTPALETTE.YELLOW,MAPLABELX,HISCOREY, VICTORY_SYMBOL+DOT_SYMBOL+currentMapHighScore);
		 if (startTimer==0)
			CANVAS.printCenter(ctx,FONT,FONTPALETTE.WHITE,NOTICEX,NOTICETEXTY,"Hold down the fire button to start!");
		else {
			CANVAS.fillRect(ctx,PALETTE.GREEN,1,0,NOTICEY,QMATH.floor(SCREEN_WIDTH*(startTimer/STARTTIMER_TIME)),FONT.tileHeight);
			CANVAS.printCenter(ctx,FONT,FONTPALETTE.WHITE,NOTICEX,NOTICETEXTY,"Starting the game in "+QMATH.ceil((STARTTIMER_TIME-startTimer)/FPS)+"sec...");
		}
		if (hiscoreNotify) {
			hiscoreNotify--;
			CANVAS.printCenter(ctx,FONT,hiscoreNotify%2?FONTPALETTE.WHITE:FONTPALETTE.YELLOW,MAPLABELX,HISCOREMESSAGEY,"NEW HIGH SCORE",0,0,0,1,2);
		}
		TRANSITION.render(ctx);
	}
}