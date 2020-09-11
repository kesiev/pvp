function LocalMultiplayer() {

	const
		MENUCOLOR=PALETTE.BLACK;

	var setupGame,joinBox;

	this.reset=function() {
		setupGame.reset();
		joinBox.reset();
	}

	this.initialize=function() {
		setupGame=new SetupGame(
			"title",
			GAMESETTINGS,
			STORAGE_PREFIX+"match"
		);
		joinBox=new JoinBox(
			true,
			"Waiting for players...",
			"All joined players hold fire to start!",
			"Starting the game in ",
			"Get ready!",
			"PRESS FIRE"
		)
		setupGame.initialize();
		joinBox.initialize();
		this.reset();
	};

	this.show=function() {
		TRANSITION.start();
		setupGame.show();
		joinBox.show();
	}

	this.quit=function() {
		TRANSITION.end(-1);
		setupGame.quit();
		joinBox.quit();
	}

	this.end=function(ret) {
		AUDIOPLAYER.stopMusic();
		TRANSITION.end(ret);
		setupGame.end();
		joinBox.end();
	}

	this.frame=function(){
		if (setupGame.frame(TRANSITION.isFree)==SETUPGAME_QUIT) this.quit();
		if (joinBox.frame(TRANSITION.isFree)==JOINBOX_READY) {
			// Start game
			var ret={
				players:joinBox.joinedPlayers,
				modules:[],
				settings:{
					goBackTo:GAMESTATE_LOCALMULTIPLAYER
				}
			};
			GAMESETTINGS.forEach((option,id)=>{
				if (setupGame.enabledOptions[option.id]) {
					var onSet=option.values[setupGame.setup[option.id]].onSet;
					if (onSet.modules)
						onSet.modules.forEach(module=>{
							if (ret.modules.indexOf(module)==-1) ret.modules.push(module);
						});
					if (onSet.settings)
						for (var k in onSet.settings)
							ret.settings[k]=onSet.settings[k];							
				}
			});
			for (var k in CONFIG)
				if (ret.settings[k]==undefined) ret.settings[k]=CONFIG[k];

			if (ret.settings.map==-1) ret.settings.map=QMATH.floor(QMATH.random()*MAPS.length);

			this.end(ret);
		}
		return TRANSITION.getState();
	}
	this.render=function(ctx) {
		CANVAS.fillRect(ctx,MENUCOLOR,1,0,0,SCREEN_WIDTH, SCREEN_HEIGHT);
		joinBox.render(ctx);
		setupGame.render(ctx);
		TRANSITION.render(ctx);
	}
}