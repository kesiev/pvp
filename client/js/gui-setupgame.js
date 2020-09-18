const
	SETUPGAME_CHANGED=1,
	SETUPGAME_QUIT=2;

function SetupGame(music,gameSettings,storagePrefix) {

	const
		CAMERAROTATION=QMATH.PI/FPS/20,
		MENUY=29,
		CAMERAHEIGHT=63;

	var menu,camera;

	function selectMap(id) {
		var loadedData=MAPLOADER.load(id-1,RC,[],{});
		RC.setOverallLight(0.8);
		camera=RC.Camera({w:SCREEN_WIDTH,h:CAMERAHEIGHT,planeY:1.32,id:0});
		camera.setPosX(loadedData.flagX);
		camera.setPosY(loadedData.flagY);
	}	

	this.setup={};
	this.setSetup=function(setup) {
		this.setup=setup;
		this.updateOptions();
		if (this.setup.map>0) selectMap(this.setup.map);
	}
	this.quit=function() {
		localStorage[storagePrefix]=JSON.stringify(this.setup);
	}
	this.end=function() {
		this.quit();
	}
	this.reset=function() {
		this.setup={};
		gameSettings.forEach(option=>{
			option.values.forEach((value,id)=>{
				if (value.default) this.setup[option.id]=id;
			})
		});
		if (localStorage[storagePrefix]) {
			var loaded=JSON.parse(localStorage[storagePrefix]);
			gameSettings.forEach(option=>{
				if (loaded[option.id]!==undefined) this.setup[option.id]=loaded[option.id];
			})
		}
		this.updateOptions();
		menu.reset();
	}
	this.initialize=function() {
		menu=new KeyMenu({
			valueX:CANVAS.pixelLen(FONT,10),
			menuY:MENUY
		});
		this.reset();
	};
	this.updateOptions=function() {
		this.enabledOptions={};
		gameSettings.forEach(option=>{
			var optionValue=this.setup[option.id];
			if (option.values[optionValue].enable)
				option.values[optionValue].enable.forEach(suboption=>{ this.enabledOptions[suboption]=true; })
		});
		var options=[];
		gameSettings.forEach(option=>{
			if (this.enabledOptions[option.id]) {
				options.push(option);
			}
		});
		menu.setOptions(options);
	}
	this.show=function() {
		AUDIOPLAYER.playMusic(music);
		this.reset();
		if (this.setup.map>0) selectMap(this.setup.map);
	}
	this.frame=function(isFree,show,locked){

		if (this.setup.map>0) camera.rotateBy(CAMERAROTATION);

		// Game settings
		var ret;
		switch (menu.frame(isFree,this.setup,locked)) {
			case MENU_CANCEL:{
				this.end();
				ret=SETUPGAME_QUIT;
				break;
			}
			case MENU_CHANGED:{
				ret=SETUPGAME_CHANGED;
				this.updateOptions();
				if ((menu.selectedOption.id=="map")&&(this.setup.map>0)) selectMap(this.setup.map);
				break;
			}
		}
		return ret;
	}
	this.render=function(ctx,locked,hide) {	
		if (!hide) {
			if (this.setup.map>0) {
				RC.tick();
				camera.render();
				camera.blit(ctx,0,0);
			} else STATICGENERATOR.blit(ctx,0,0,SCREEN_WIDTH,CAMERAHEIGHT,0.2);
		}
		// Menu
		menu.render(ctx,this.setup,locked,hide);
	}
}