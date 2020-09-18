
function Settings() {
	const
		MENUCOLOR=PALETTE.BLACK,
		SETTINGS_STORAGE_PREFIX=STORAGE_PREFIX+"cfg";
		
	
	var
		menu,currentMenu,stack,defaultConfig={},optionsIndex,filteredOptions,
		MENU_OPTIONS={
			main:{
				title:"Settings",
				options:[
					{submenu:"controls",label:"Controls...",alwaysEnabled:true},
					{submenu:"graphics",label:"Graphics...",alwaysEnabled:true},
					{submenu:"audio",label:"Audio...",alwaysEnabled:true},
					{submenu:"gameplay",label:"Gameplay...",alwaysEnabled:true}
				]
			},
			audio:{
				title:"Settings - Audio",
				options:[
					{id:"sfx",alwaysEnabled:true,arrows:true,label:"Sound effects",values:[
						{label:"Disabled"},
						{label:"Enabled",default:true}
					]},
					{id:"effectsVolume",alwaysEnabled:true,arrows:true,label:"",values:[
						{label:"Off"},
						{label:"10% volume"},
						{label:"20% volume"},
						{label:"30% volume"},
						{label:"40% volume"},
						{label:"50% volume"},
						{label:"60% volume"},
						{label:"70% volume"},
						{label:"80% volume"},
						{label:"90% volume"},
						{label:"100% volume",default:true}
					]},
					{id:"announcer",alwaysEnabled:true,arrows:true,label:"Announcer",values:[
						{label:"Full",default:true},
						{label:"Full, No pickups"},
						{label:"Match"},
						{label:"Match, start/end only"},
						{label:"Off"}
					]},
					{id:"music",alwaysEnabled:true,arrows:true,label:"Music",music:true,values:[
						{label:"Off"},
						{label:"Random",default:true}
					]},
					{id:"musicVolume",alwaysEnabled:true,arrows:true,label:"",values:[
						{label:"Off"},
						{label:"10% volume"},
						{label:"20% volume"},
						{label:"30% volume"},
						{label:"40% volume"},
						{label:"50% volume",default:true},
						{label:"60% volume"},
						{label:"70% volume"},
						{label:"80% volume"},
						{label:"90% volume"},
						{label:"100% volume"}
					]},
					{label:"Reset to default",alwaysEnabled:true,reset:true}
				]
			},
			graphics:{
				title:"Settings - Graphics",
				options:[
					{id:"guiParticles",alwaysEnabled:true,arrows:true,label:"GUI Particles",values:[
						{label:"Disabled"},
						{label:"Enabled",default:true}
					]},
					{id:"trails",alwaysEnabled:true,arrows:true,label:"Trails",values:[
						{label:"Disabled"},
						{label:"Enabled",default:true}
					]},
					{id:"flashes",alwaysEnabled:true,arrows:true,label:"Flashes",values:[
						{label:"Disabled"},
						{label:"Enabled",default:true}
					]},
					{id:"recoilOnHurt",alwaysEnabled:true,arrows:true,label:"Recoil on hurt",values:[
						{label:"Disabled"},
						{label:"Enabled",default:true}
					]},
					{id:"gibs",alwaysEnabled:true,arrows:true,label:"Gibs",values:[
						{label:"Disabled"},
						{label:"Enabled",default:true}
					]},
					{id:"reticleColor",alwaysEnabled:true,arrows:true,label:"Reticle",values:[
						{label:"None"},
						{label:"Light blue"},
						{label:"Purple"},
						{label:"Dark purple"},
						{label:"Brown"},
						{label:"Light pink"},
						{label:"White",default:true},
						{label:"Yellow"},
						{label:"Green"},
						{label:"Orange"},
						{label:"Red"},
						{label:"Pink"},
						{label:"Light purple"},
						{label:"Cyan"},
						{label:"Blue"},
						{label:"Dark green"},
						{label:"Black"},
					]},
					{id:"cameraShake",alwaysEnabled:true,arrows:true,label:"Camera shake",values:[
						{label:"Disabled"},
						{label:"Enabled",default:true}
					]},
					{id:"weaponDrift",alwaysEnabled:true,arrows:true,label:"Weapon drift",values:[
						{label:"Disabled"},
						{label:"Enabled",default:true}
					]},
					{label:"Reset to default",alwaysEnabled:true,reset:true}
				]
			},
			gameplay:{
				title:"Settings - Gameplay",
				options:[
					{id:"gameSpeed",alwaysEnabled:true,arrows:true,label:"Game speed",values:[
						{label:"25%"},
						{label:"50%"},
						{label:"75%"},
						{label:"100%",default:true},
						{label:"125%"},
						{label:"150%"},
						{label:"175%"},
						{label:"200%"},
					]},
					{id:"reticleMode",alwaysEnabled:true,arrows:true,label:"Reticle",values:[
						{label:"Weapon specific",default:true},
						{label:"All weapons"}
					]},
					{id:"respawnPolicy",alwaysEnabled:true,arrows:true,label:"Respawn at",values:[
						{label:"Player base"},
						{label:"Random base",default:true}
					]},
					{id:"radarPolicy",alwaysEnabled:true,arrows:true,label:"Radar",values:[
						{label:"Disabled"},
						{label:"Targets"},
						{label:"Targets, drones",default:true},
						{label:"Targets, drones, players"}
					]},
					{id:"radarDistance",alwaysEnabled:true,arrows:true,label:"",values:[
						{label:"25% distance"},
						{label:"50% distance",default:true},
						{label:"75% distance"},
						{label:"100% distance"},
					]},
					{id:"flagWeight",alwaysEnabled:true,arrows:true,label:"Flag weight",values:[
						{label:"Light"},
						{label:"Very heavy"},
						{label:"Heavy"},
						{label:"Normal",default:true}
					]},
					{id:"droneHealth",alwaysEnabled:true,arrows:true,label:"Drones",values:[
						{label:"25% health"},
						{label:"50% health",default:true},
						{label:"75% health"},
						{label:"100% health"},
						{label:"125% health"},
						{label:"150% health"},
						{label:"175% health"},
						{label:"200% health"},
					]},
					{id:"droneIntensity",alwaysEnabled:true,arrows:true,label:"",values:[
						{label:"25% intensity"},
						{label:"50% intensity",default:true},
						{label:"75% intensity"},
						{label:"100% intensity"},
						{label:"125% intensity"},
						{label:"150% intensity"},
						{label:"175% intensity"},
						{label:"200% intensity"},
					]},				
					{id:"droneSpeed",alwaysEnabled:true,arrows:true,label:"",values:[
						{label:"25% speed"},
						{label:"50% speed",default:true},
						{label:"75% speed"},
						{label:"100% speed"},
						{label:"125% speed"},
						{label:"150% speed"},
						{label:"175% speed"},
						{label:"200% speed"},
					]},
					{id:"droneSight",alwaysEnabled:true,arrows:true,label:"",values:[
						{label:"25% sight"},
						{label:"50% sight",default:true},
						{label:"75% sight"},
						{label:"100% sight"},
						{label:"125% sight"},
						{label:"150% sight"},
						{label:"175% sight"},
						{label:"200% sight"},
					]},
					{id:"droneDamage",alwaysEnabled:true,arrows:true,label:"",values:[
						{label:"25% damage"},
						{label:"50% damage",default:true},
						{label:"75% damage"},
						{label:"100% damage"},
						{label:"125% damage"},
						{label:"150% damage"},
						{label:"175% damage"},
						{label:"200% damage"},
					]},
					{id:"droneDifficulty",alwaysEnabled:true,arrows:true,label:"",values:[
						{label:"25% horde difficulty"},
						{label:"50% horde difficulty",default:true},
						{label:"75% horde difficulty"},
						{label:"100% horde difficulty"},
						{label:"125% horde difficulty"},
						{label:"150% horde difficulty"},
						{label:"175% horde difficulty"},
						{label:"200% horde difficulty"}
					]},
					{label:"Reset to default",alwaysEnabled:true,reset:true}
				]
			},
			controls:{
				title:"Settings - Controls",
				options:[
					{
						id:"controls",
						label:"Configure controls...",
						alwaysEnabled:true,
						goto:GAMESTATE_CONTROLSSETTINGS
					},
					{id:"pointerSensitivity",alwaysEnabled:true,arrows:true,label:"Pointer",values:[
						{label:"25% sensitivity"},
						{label:"50% sensitivity",default:true},
						{label:"75% sensitivity"},
						{label:"100% sensitivity"},
						{label:"125% sensitivity"},
						{label:"150% sensitivity"},
						{label:"175% sensitivity"},
						{label:"200% sensitivity"}
					]},
					{id:"analogRotationSpeed",alwaysEnabled:true,arrows:true,label:"Analogs",values:[
						{label:"10% rotation speed"},
						{label:"20% rotation speed"},
						{label:"30% rotation speed"},
						{label:"40% rotation speed"},
						{label:"50% rotation speed"},
						{label:"60% rotation speed"},
						{label:"70% rotation speed"},
						{label:"80% rotation speed"},
						{label:"90% rotation speed",default:true},
						{label:"100% rotation speed"}
					]},
					{id:"analogDeadZone",alwaysEnabled:true,arrows:true,label:"",values:[
						{label:"0% dead zone"},
						{label:"10% dead zone",default:true},
						{label:"20% dead zone"},
						{label:"30% dead zone"},
						{label:"40% dead zone"},
						{label:"50% dead zone"},
						{label:"60% dead zone"},
						{label:"70% dead zone"},
						{label:"80% dead zone"},
						{label:"90% dead zone"}
					]},
					{id:"analogRange",alwaysEnabled:true,arrows:true,label:"",values:[
						{label:"10% range"},
						{label:"20% range"},
						{label:"30% range"},
						{label:"40% range"},
						{label:"50% range"},
						{label:"60% range"},
						{label:"70% range"},
						{label:"80% range",default:true},
						{label:"90% range"},
						{label:"100% range"},
					]},
					{id:"touchAnalogSensitivity",alwaysEnabled:true,arrows:true,label:"Touch screen",values:[
						{label:"10% analog sensitivity"},
						{label:"20% analog sensitivity"},
						{label:"30% analog sensitivity"},
						{label:"40% analog sensitivity"},
						{label:"50% analog sensitivity",default:true},
						{label:"60% analog sensitivity"},
						{label:"70% analog sensitivity"},
						{label:"80% analog sensitivity"},
						{label:"90% analog sensitivity"},
						{label:"100% analog sensitivity"}
					]},
					{id:"touchSwipeSensitivity",alwaysEnabled:true,arrows:true,label:"",values:[
						{label:"10% swipe sensitivity"},
						{label:"20% swipe sensitivity"},
						{label:"30% swipe sensitivity"},
						{label:"40% swipe sensitivity"},
						{label:"50% swipe sensitivity",default:true},
						{label:"60% swipe sensitivity"},
						{label:"70% swipe sensitivity"},
						{label:"80% swipe sensitivity"},
						{label:"90% swipe sensitivity"},
						{label:"100% swipe sensitivity"}
					]},
					{id:"touchHudOpacity",alwaysEnabled:true,arrows:true,label:"",values:[
						{label:"0% hud opacity"},
						{label:"10% hud opacity"},
						{label:"20% hud opacity",default:true},
						{label:"30% hud opacity"},
						{label:"40% hud opacity"},
						{label:"50% hud opacity"},
						{label:"60% hud opacity"},
						{label:"70% hud opacity"},
						{label:"80% hud opacity"},
						{label:"90% hud opacity"},
						{label:"100% hud opacity"}
					]},
					{id:"buttonRotationSpeed",alwaysEnabled:true,arrows:true,label:"Buttons",values:[
						{label:"10% rotation speed"},
						{label:"20% rotation speed"},
						{label:"30% rotation speed"},
						{label:"40% rotation speed"},
						{label:"50% rotation speed"},
						{label:"60% rotation speed",default:true},
						{label:"70% rotation speed"},
						{label:"80% rotation speed"},
						{label:"90% rotation speed"},
						{label:"100% rotation speed"}
					]},
					{id:"mouseSensitivity",alwaysEnabled:true,arrows:true,label:"Mouse",values:[
						{label:"10% sensitivity"},
						{label:"20% sensitivity"},
						{label:"30% sensitivity"},
						{label:"40% sensitivity"},
						{label:"50% sensitivity",default:true},
						{label:"60% sensitivity"},
						{label:"70% sensitivity"},
						{label:"80% sensitivity"},
						{label:"90% sensitivity"},
						{label:"100% sensitivity"}
					]},
					{id:"vibration",alwaysEnabled:true,arrows:true,label:"Vibration",values:[
						{label:"Off"},
						{label:"Light"},
						{label:"Normal"},
						{label:"Strong",default:true},
						{label:"Very strong"}
					]},
					{id:"vibrationMode",alwaysEnabled:true,arrows:true,label:"",values:[
						{label:"Full mode",default:true},
						{label:"Only on damage/die"}
					]},
					{id:"slowDown",alwaysEnabled:true,arrows:true,label:"Aim button",values:[
						{label:"15% move/aim speed"},
						{label:"25% move/aim speed",default:true},
						{label:"35% move/aim speed"},
						{label:"45% move/aim speed"},
						{label:"55% move/aim speed"},
						{label:"65% move/aim speed"},
						{label:"75% move/aim speed"},
						{label:"85% move/aim speed"},
						{label:"95% move/aim speed"}
					]},
					{label:"Reset to default",alwaysEnabled:true,reset:true}
				]
			}
		};

	function applySettings() {
		AUDIOPLAYER.setVolume(CONFIG.effectsVolume/10);
		AUDIOPLAYER.setMusicVolume(CONFIG.musicVolume/10);
		CONTROLS.setVibrationStrength(CONFIG.vibration*0.25);
		CONTROLS.setTouchAnalogSensitivity((CONFIG.touchAnalogSensitivity+1)*0.1);
		CONTROLS.setTouchSwipeSensitivity((CONFIG.touchSwipeSensitivity+1)*0.1);
		CONTROLS.setTouchHudOpacity(CONFIG.touchHudOpacity*0.1);
		GAMESTATE.resize();
	}

	function updateMenu() {
		var enabledKeys={};
		for (var k in MENU_OPTIONS)
			MENU_OPTIONS[k].options.forEach(option=>{
				if (option.values) {
					var enable=option.values[CONFIG[option.id]].enable;
					if (enable)
						enable.forEach(key=>{
							enabledKeys[key]=1;
						});
				}
			});
		filteredOptions={};
		for (var k in MENU_OPTIONS) {
			var option=MENU_OPTIONS[k];
			filteredOptions[k]={
				title:option.title,
				renderer:option.renderer,
				options:[]
			};
			option.options.forEach(option=>{
				if (option.alwaysEnabled||(enabledKeys[option.id])) filteredOptions[k].options.push(option);
			});
		}
		if (menu) menu.setOptions(filteredOptions[currentMenu].options);
	}

	function saveConfig() {
		var previousValue=localStorage[SETTINGS_STORAGE_PREFIX],
			newValue=JSON.stringify(CONFIG);
		if (previousValue&&(previousValue!=newValue))
			TRANSITION.notify("Got it!","New settings saved");
		localStorage[SETTINGS_STORAGE_PREFIX]=newValue;
	}

	function findOption(id) {
		for (var k in MENU_OPTIONS)
			for (var i=0;i<MENU_OPTIONS[k].options.length;i++) {
				if (MENU_OPTIONS[k].options[i].id==id) return {menu:k,id:i};
			}
	}

	function updateConfigIndexes() {
		optionsIndex={};
		for (var k in MENU_OPTIONS) {
			DEFAULT_CONFIGS[k]={};
			MENU_OPTIONS[k].options.forEach(option=>{
				optionsIndex[option.id]=option;
				if (option.keyboard||option.valueOnly) {
					DEFAULT_CONFIGS[k][option.id]=option.default;
					defaultConfig[option.id]=option.default;
				} else if (option.values)
					option.values.forEach((value,id)=>{
						if (value.default) {
							DEFAULT_CONFIGS[k][option.id]=id;
							defaultConfig[option.id]=id;
						}
					})
			});
		}
	}

	function loadConfig() {
		CONFIG=DOM.clone(defaultConfig);
		if (localStorage[SETTINGS_STORAGE_PREFIX]) {
			var loaded=JSON.parse(localStorage[SETTINGS_STORAGE_PREFIX]);
			for (var k in CONFIG)
				if (loaded[k]!==undefined) CONFIG[k]=loaded[k];
		}
	}

	function resetDefaults(menu) {
		for (var k in DEFAULT_CONFIGS[menu])
			CONFIG[k]=DEFAULT_CONFIGS[menu][k];
	}

	function resetAudio() {
		AUDIOPLAYER.playMusic("title");
	}

	function gotoMenu(nextmenu,skipstack) {
		if (!skipstack) stack.push(currentMenu);
		currentMenu=nextmenu;
		menu.setMenu(filteredOptions[currentMenu]);
		TRANSITION.start();
		menu.reset();
	}

	this.addMenu=function(id,label,options,renderer) {
		MENU_OPTIONS.main.options.push({submenu:id,label:label+"...",alwaysEnabled:true});
		MENU_OPTIONS[id]={
			title:"Settings - "+label,
			renderer:renderer,
			options:options
		};
		updateConfigIndexes();
		loadConfig();
		updateMenu();
	}

	this.getOptionValueById=function(optionid,valueid) {
		if (optionsIndex[optionid]) {
			var option=optionsIndex[optionid];
			if (option.values)
				for (var i=0;i<option.values.length;i++)
					if (valueid==option.values[i].id) return i;
		}
	}

	this.setOptionValue=function(optionid,value) {
		if (optionsIndex[optionid]) {
			var option=optionsIndex[optionid];
			if (option.keyboard) {
				value=value+"";
				if (option.keyboardMaxLength&&(value.length>option.keyboardMaxLength)) return false;
				if (option.keyboardMinLength&&(value.length<option.keyboardMinLength)) return false;
				var validChars=option.keyboard.validChars;
				for (var i=0;i<value.length;i++)
					if (validChars.indexOf(value[i])==-1) return false;
			}
			CONFIG[optionid]=value;
			updateMenu();
			return true;
		}		
	}

	this.initialize=function() {
		updateConfigIndexes();

		var musicoption=findOption("music");
		SONGS.forEach(song=>{
			MENU_OPTIONS[musicoption.menu].options[musicoption.id].values.push({
				label:song.title,
				description:["By "+song.author]
			})
		});
		menu=new KeyMenu({
			valueX:CANVAS.pixelLen(FONT,17)
		});
		stack=[];
		currentMenu="main";
		loadConfig();
		applySettings();
	}
	this.show=function() {
		gotoMenu(currentMenu,true);
		resetAudio();
	}
	this.frame=function() {		
		switch (menu.frame(TRANSITION.isFree,CONFIG)) {
			case MENU_MOVED:{
				resetAudio();
				break;
			}
			case MENU_CHANGED:{
				if (menu.selectedOption.music) {
					switch (CONFIG.music) {
						case 0:
						case 1:{
							resetAudio();
							break;
						}
						default:{
							AUDIOPLAYER.playMusic(SONGS[CONFIG.music-2].id);
							break;
						}
					}
				}
				applySettings();
				updateMenu();
				break;
			}
			case MENU_CONFIRM:{
				if (menu.selectedOption.submenu)
					TRANSITION.end({menu:menu.selectedOption.submenu});
				else if (menu.selectedOption.goto)
					TRANSITION.end({quit:menu.selectedOption.goto});
				else if (menu.selectedOption.onSelect) {
					menu.selectedOption.onSelect();
					applySettings();
					updateMenu();
				} if (menu.selectedOption.reset) {
					resetDefaults(currentMenu);
					applySettings();
					updateMenu();
				}
				break;
			}
			case MENU_CANCEL:{
				resetAudio();
				if (stack.length>0) TRANSITION.end({menu:stack.pop(),skipstack:true});
				else TRANSITION.end({quit:-1});	
				saveConfig();
				break;
			}
		}
		
		var transitionState=TRANSITION.getState();
		if (transitionState) {
			if (transitionState.menu) {
				gotoMenu(transitionState.menu,transitionState.skipstack);
			} else if (transitionState.quit) return transitionState.quit;
		}
	}
	this.render=function(ctx) {
		CANVAS.fillRect(ctx,MENUCOLOR,1,0,0,SCREEN_WIDTH, SCREEN_HEIGHT);
		menu.render(ctx,CONFIG);
		TRANSITION.render(ctx);
	}
}