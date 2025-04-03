
function MainMenu() {
	let
		MENUCOLOR=PALETTE.BLACK,
		CAMERADISTANCE=1,
		LOGOWIDTH=116,
		LOGOHEIGHT=106,
		CREDITSCOLOR=FONTPALETTE.BLACK,
		CREDITSX=HSCREEN_WIDTH,
		LOGOTRANSITIONTIME=FPS,
		BLINKTIME=FPS,
		NETMENUY=QMATH.floor(SCREEN_HEIGHT*0.605),
		MENUY=QMATH.floor(SCREEN_HEIGHT*0.64),
		LOGOY=QMATH.floor((MENUY-LOGOHEIGHT)/2)-4,
		CLEANDISTANCE=0.5,
		LOGOX=(SCREEN_WIDTH-LOGOWIDTH)/2,
		LOGOCX=LOGOX+QMATH.floor(LOGOWIDTH/2),
		LOGOCY=LOGOY+QMATH.floor(LOGOHEIGHT/2);

	var camera,menu,creditsy,logotimer,blinktimer,cameraX,cameraY,frameCounter;

	this.initialize=function() {
		
		var options=[
			{label:"Local multiplayer",id:GAMESTATE_LOCALMULTIPLAYER}
		];
		if (NETPLAY.isAvailable)
			options.push({label:"Netplay multiplayer",id:GAMESTATE_NETPLAY});
		options.push({label:"Arcade single player",id:GAMESTATE_SCOREATTACK});
		options.push({label:"Settings",id:GAMESTATE_SETTINGS});
		options.push({label:"Credits",id:GAMESTATE_CREDITS});
		if (KIOSKMODE.isKioskMode())
			options.push({label:"Quit",id:GAMESTATE_QUIT});
		if (PLAYLIGHT.isPlayLightMode())
			options.push({label:"More games!",id:GAMESTATE_MOREGAMES});

		creditsy=QMATH.ceil(SCREEN_HEIGHT-(FONT.tileHeight*FOOTERCREDITS.length));
		menu=new KeyMenu({
			menuY:(NETPLAY.isAvailable?NETMENUY:MENUY)-(KIOSKMODE.isKioskMode() || PLAYLIGHT.isPlayLightMode()?6:0),
			noGoBack:true
		});


		menu.setMenu({
			options:options
		})
	}
	this.show=function() {
		AUDIOPLAYER.play("rocket");
		frameCounter=0;
		logotimer=0;
		blinktimer=0;
		AUDIOPLAYER.playMusic("title");
		var loadedData=MAPLOADER.load(QMATH.floor(QMATH.random()*MAPS.length),RC,[],{});
		cameraX=loadedData.flagX;
		cameraY=loadedData.flagY;
		
		// Remove sprites around the camera for better view...
		var sprites=RC.getSprites();
		sprites.forEach(sprite=>{
			if (TRIGO.getDistance(sprite.x,sprite.y,cameraX,cameraY)<CLEANDISTANCE)
				sprite.visible=false;
		});
		// ...and also sprites embedded in tiles
		var cameraTX=QMATH.floor(cameraX-CLEANDISTANCE);
		var cameraTY=QMATH.floor(cameraY-CLEANDISTANCE);
		for (var y=0;y<CLEANDISTANCE*2;y++)
			for (var x=0;x<CLEANDISTANCE*2;x++) {
				var tile=RC.getTile(cameraTX+x,cameraTY+y);
				if (tile[POS_sprite]) tile[POS_sprite].visible=false;
			}

		var player=PLAYERSDATA[QMATH.floor(QMATH.random()*PLAYERSDATA.length)];
		RC.addSprite({
			angle:QMATH.PI,
			x:cameraX,
			y:cameraY,
			textures:player.textures,
			textureX:0,
			textureY:5,
			spriteTint:LIGHTS.player.tint,
			spriteLight:LIGHTS.player.light,
			orient:true
		});
		RC.addSprite({
			x:cameraX,
			y:cameraY,
			textures:SPRITETEXTURES,
			textureX:1,
			textureY:7,
			drawPriority:500
		});
		camera=RC.Camera({w:SCREEN_WIDTH,h:SCREEN_HEIGHT,planeY:0.66,id:0});
		TRANSITION.start();
		menu.reset();
	}
	this.frame=function() {		
		frameCounter++;
		if (logotimer<LOGOTRANSITIONTIME) {
			logotimer++;
			if (logotimer==LOGOTRANSITIONTIME) {
				AUDIOPLAYER.play("explosion");
				TRANSITION.particles.addParticlesCluster(80,LOGOCX,LOGOCY,0,0,PALETTE.WHITE);
			}
		} else {
			if (blinktimer<BLINKTIME) {
				blinktimer++;
				if (blinktimer==BLINKTIME) AUDIOPLAYER.play("speak_title");
			}
		}
		camera.setPosX(cameraX);
		camera.setPosY(cameraY);
		camera.setPosZ(QMATH.sin_(frameCounter/100)*0.12-0.12);
		camera.setAngleRot(frameCounter/120);
		camera.advanceBy(-CAMERADISTANCE);
		camera.rotateBy(0.4);
		switch (menu.frame(TRANSITION.isFree)) {
			case MENU_CONFIRM:{
				TRANSITION.end(menu.selectedOption.id);
				break;
			}
		}
		return TRANSITION.getState();
	}
	this.render=function(ctx) {
		var logoTime=logotimer/LOGOTRANSITIONTIME;
		if (logotimer==LOGOTRANSITIONTIME) {
			RC.tick();
			if (blinktimer!=BLINKTIME) {
				var blinkTime=blinktimer/BLINKTIME;
				RC.setOverallLight(0.45+(1-blinkTime)*2);
			}
			camera.render();
			camera.blit(ctx,0,0);
		} else CANVAS.fillRect(ctx,MENUCOLOR,1,0,0,SCREEN_WIDTH, SCREEN_HEIGHT);
		CANVAS.blit(ctx,HUD.node,0,0,(1-logoTime)*20,logoTime,logoTime,"difference",0,0,LOGOWIDTH,LOGOHEIGHT,LOGOX,LOGOY,LOGOWIDTH,LOGOHEIGHT);
		FOOTERCREDITS.forEach((line,id)=>{
			CANVAS.printCenter(ctx,FONT,CREDITSCOLOR,CREDITSX,creditsy+(id*FONT.tileHeight),line);
		});
		menu.render(ctx);
		TRANSITION.render(ctx);
	}
}