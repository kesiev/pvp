GAMEMODEMODULES.arcadeMode={

	// Game mode initialization
	onGameModeSet:function(data) {
		for (var k in DEFAULT_CONFIGS.gameplay)
			data[k]=DEFAULT_CONFIGS.gameplay[k];
		data.startHp=100;
		data.healing=QMATH.ceil(data.startHp/4);
		data.invulnerabilityTime=data.FPS;
		data.damagePercent=1;
		data.useHotspot=true;
		data.camperingLimit=4;
		data.camperingNotice=2;
		data.camperingDistance=5;

		data.orderScale=1+((data.players.length-1)*0.5);
		data.maxLevels=20;

		data.droneStart={
			bonusPerLevel:100,
			pointsPerDrone:10,
			droneSpeed:0.50/data.speedRatio,
			droneSight:10,
			droneSpawnDistance:5,
			droneExplodeDistance:1,
			droneDamage:30.00, // 1/6 standard drone damage : 180 / 6 = 30
			droneDamageRatio:0.5,
			droneMaxDistance:1,
			droneHealth:100,
			droneAggroTime:data.speedRatio*3,
			droneIntensity:5+QMATH.ceil(data.players.length*5),
			droneFloatTime:data.speedRatio,
			droneFloatTimer:0
		}
		data.droneEnd={
			bonusPerLevel:3000,
			pointsPerDrone:1000,
			droneSpeed:5/data.speedRatio
		}

		data.collectables=[];
		for (var i=0;i<10;i++)
			data.collectables.push(data.RC.prepareSprite({
				pickable:false,
				width:0.5,
				height:0.5,
				textures:SPRITETEXTURES				
			}));

		data.droneDelta={};
		for (var k in data.droneEnd)
			data.droneDelta[k]=(data.droneEnd[k]-data.droneStart[k])/data.maxLevels;

		// Apply starting drones configuration
		for (var k in data.droneStart)
			data[k]=data.droneStart[k];

	},
	onMatchBegin:function(data) {
		data.order={running:false,type:"_wait"};
		data.dronesKilledLevel=0;
		data.comboTimerLength=data.speedRatio*5;
		data.orderSequence=[];
		data.orderLevel=0;
		data.startHp=100;
		data.orderWait=3;
		data.levelLabel="";
		data.score=0;
		data.animateLights=false;
		data.orderWaitText="Get ready!";
		data.defaultAimRatio=data.aimRatio;
		data.defaultDoorOpeningTime=data.doorOpeningTime;
		data.defaultRadarDistance=data.radarDistance;
		
		data.lives=3;
		data.livesText="";
		for (var i=0;i<data.lives;i++)
			data.livesText+=LIVES_SYMBOL;
		data.livesGap=CANVAS.pixelStrLen(FONT,data.livesText);

		// Constants
		data.LIGHTSSPEED=QMATH.ceil(data.speedRatio/2);
		data.LIGHTS={
			tintColorR:{suffix:"TintColorR"},
			tintColorG:{suffix:"TintColorG"},
			tintColorB:{suffix:"TintColorB"},
			overallLight:{suffix:"OverallLight"},
			overallTint:{suffix:"OverallTint"},
			ceilingLight:{suffix:"CeilingLight"},
			ceilingTint:{suffix:"CeilingTint"},
			tintBase:{suffix:"TintBase"},
			tintRamp:{suffix:"TintRamp"},
			skyboxTint:{suffix:"SkyboxTint"},
			skyboxLight:{suffix:"SkyboxLight"},
			floorLight:{suffix:"FloorLight"},
			floorTint:{suffix:"FloorTint"},
			wallLight:{suffix:"WallLight"},
			wallTint:{suffix:"WallTint"},
			wallCornerLight:{suffix:"WallCornerLight"},
			wallCornerTint:{suffix:"WallCornerTint"},
			spritesLight:{suffix:"SpritesLight"},
			spritesTint:{suffix:"SpritesTint"},
			shadowLight:{suffix:"ShadowLight"},
			shadowTint:{suffix:"ShadowTint"}
		};
		for (var k in data.LIGHTS) {
			var value=data.RC["get"+data.LIGHTS[k].suffix]();
			data.LIGHTS[k].default=value;
			data.LIGHTS[k].set=value;
			data.LIGHTS[k].current=value;
			data.LIGHTS[k].setter="set"+data.LIGHTS[k].suffix;
		}
		data.WEAPONSLIST=[];
		for (var k in WEAPONS) data.WEAPONSLIST.push(k);
		data.FONTCOLORSLIST=[];
		for (var k in FONTPALETTE) data.FONTCOLORSLIST.push(FONTPALETTE[k]);
	},
	onCreatePlayer:function(data,player) {
		player.team=0;
		player.combo=0;
		player.comboTimer=0;
		player.campering=1;
		player.isCampering=false;
	},

	// Mission cycle managers
	endMission:function(data,success,loselife,send) {
		if (data.netEnabled&&send) data.broadcastGameModeEvent("endMission",[success,loselife]);
		
		// Announce & manage lives
		if (data.order.running||loselife) {
			if (success) {
				data.playAnnouncer("speak_missioncleared");
				data.orderWaitText="Success!";
				data.orderWait=4;
				data.playEffect("point");
				data.players.forEach(player=>{
					data.playerLog(player,data.LOGLEVEL_IMPORTANT_GOOD,"CLEARED",true);
				});
				if (data.netMaster)
					data.triggerGameModeEvent("increaseScore",[
						data,
						QMATH.ceil(data.bonusPerLevel*data.dronesKilledLevel),
						true
					]);
				// Heal for all
				data.players.forEach(player=>{
					if (!player.isDead) {
						if (player.isLocal) {
							player.health+=data.healing;
							if (player.health>data.startHp) player.health=data.startHp;
						}
						data.giveInvulnerability(player,data.invulnerabilityTime,true);
					}
				});
			} else {
				if (data.order.running) data.playAnnouncer("speak_youfailed");			
				else data.playAnnouncer("speak_fragno0");
				if (loselife) {
					// Life lost
					data.lives--;
					if (data.lives<=0) data.lives=0;
					data.livesText="";
					for (var i=0;i<data.lives;i++)
						data.livesText+=LIVES_SYMBOL;
					data.livesGap=CANVAS.pixelStrLen(FONT,data.livesText);
				} else {
					// Damage for all
					data.players.forEach(player=>{
						if (!player.isDead&&player.isLocal) {
							var damage=QMATH.floor(player.health*0.25);
							data.giveDamage(0,player,damage,SUICIDE_SYMBOL);
						}
					});
				}
				if (data.lives==0) {
					data.endGame();
					data.playAnnouncer("speak_gameover");
					data.players.forEach(player=>{
						data.playerLog(player,data.LOGLEVEL_ENDGAME_BAD,"GAME OVER",true);
					});
					data.orderWaitText="Sorry...";
				} else {
					data.players.forEach(player=>{
						data.playerLog(player,data.LOGLEVEL_IMPORTANT_BAD,loselife?"LIFE LOST":"FAILURE",true);
					});
					data.orderWaitText=loselife?"Life lost!":"Failure!";
					data.orderWait=QMATH.floor(data.DEAD_TIME/data.speedRatio)+3;
				}
			}
		}

		// Reset running mission
		if (data.order.running) {
			data.order={running:false,type:"_wait"};

			// Evolve drones
			for (var k in data.droneDelta)
				data[k]=data.droneStart[k]+(data.droneDelta[k]*data.orderLevel);

			// Restore game attributes
			data.animateLights=true;
			for (var k in data.LIGHTS)
				data.LIGHTS[k].set=data.LIGHTS[k].default;
			data.players.forEach(player=>{
				player.fireButton="fire";
				player.actionButton="action";	
				player.defaultFriction=0.7;
				player.defaultZ=0;
				player.defaultPitch=0;
				player.maxSpeed=player.defaultMovementSpeed;
				player.isOnHotspot=false;
				player.friction=0.7;			
				if (!player.isDead) {
					player.sprite.z=0;
					player.sprite.pitch=0;
				}
			});
			data.goldDrones=0;
			data.damagePercent=1;
			data.aimRatio=data.defaultAimRatio;
			data.doorOpeningTime=data.defaultDoorOpeningTime;
			data.radarDistance=data.defaultRadarDistance;
			data.radarAngle=0;
			data.reticleMode=0;
			data.droneIntensity=data.droneStart.droneIntensity;
			data.droneSight=data.droneStart.droneSight;

			// Remove collectables
			data.collectables.forEach(collectable=>{
				collectable.pickable=false;
				data.RC.removeSprite(collectable);
			});
		}
	},
	showCollectable:function(data,id,x,y,itemTextureX,itemTextureY,itemAnimated,send) {
		if (data.netEnabled&&send) data.broadcastGameModeEvent("showCollectable",[id,x,y,itemTextureX,itemTextureY,itemAnimated]);
		var collectable=data.collectables[id];
		collectable.pickable=true;
		collectable.x=x;
		collectable.y=y;
		collectable.textureX=itemTextureX;
		collectable.textureY=itemTextureY;
		collectable.spriteShineSpeed=itemAnimated&&4;
		collectable.spriteShineLight=itemAnimated&&0.3;
		collectable.spriteFloat=itemAnimated&&0.03;
		collectable.spriteFloatSpeed=itemAnimated&&4;
		data.RC.addSprite(collectable);
	},
	collectCollectable:function(data,id,send) {
		if (data.netEnabled&&send) data.broadcastGameModeEvent("collectCollectable",[id]);
		var collectable=data.collectables[id];
		if (collectable.pickable) {
			collectable.pickable=false;
			data.RC.removeSprite(collectable);	
			data.playEffect("point",collectable.x,collectable.y);
		}
		// The master updates the amount of collectables left.
		if (data.netMaster)
			data.triggerGameModeEvent("decreaseCounter",[data,"findCollectables",data.order.onFindCollectablesSuccess,true]);
	},

	startMission:function(data,mission,send) {
		data.orderLevel++;
		data.levelLabel="Lv."+data.orderLevel;
		data.levelGap=CANVAS.pixelStrLen(FONT,data.levelLabel);

		if (data.netEnabled&&send) data.broadcastGameModeEvent("startMission",[mission]);
		switch (mission.id) {
			case "reticleMode":{
				data.order={
					type:"reticleMode",
					label:"Reticle on",
					time:30,
					onTimeSuccess:true
				}
				data.reticleMode=1;
				break;
			}
			case "radarAngle":{
				data.order={
					type:"radarAngle",
					label:mission.label,
					time:30,
					onTimeSuccess:true
				}
				data.radarAngle=mission.radarAngle;
				break;
			}
			case "radarDistance":{
				data.order={
					type:"radarDistance",
					label:mission.label,
					time:30,
					onTimeSuccess:true
				}
				data.radarDistance*=mission.radarDistanceRatio;
				break;
			}
			case "invertButtons":{
				data.order={
					type:"invertButtons",
					label:"Invert buttons",
					time:30,
					onTimeSuccess:true
				}
				data.players.forEach(player=>{
					player.fireButton="action";
					player.actionButton="fire";
				})
				break;
			}
			case "setFriction":{
				data.order={
					type:"setFriction",
					label:mission.label,
					time:30,
					onTimeSuccess:true
				}
				data.players.forEach(player=>{
					player.friction=mission.friction;
					player.defaultFriction=mission.friction;
				})
				break;
			}
			case "killGoldDrones":{
				data.order={
					type:"killGoldDrones",
					goldDrones:mission.goldDrones,
					onGoldDronesSuccess:true,
					time:60,
					onTimeSuccess:false
				}
				data.goldDrones=mission.goldDrones+2;
				data.droneIntensity=QMATH.ceil(data.droneIntensity*1.5)+mission.goldDrones;
				break;
			}
			case "distract":{
				data.order={
					type:"distract",
					label:"Distract",
					time:30,
					onTimeSuccess:true
				}
				data.players.forEach(player=>{
					player.defaultPitch=0.3;
					player.sprite.pitch=0.3;
				})
				break;
			}
			case "shrink":{
				data.order={
					type:"shrink",
					label:"Shrink",
					time:30,
					onTimeSuccess:true
				}
				data.players.forEach(player=>{
					player.defaultZ=player.fallHeight;
					player.sprite.z=player.fallHeight;
				})
				break;
			}
			case "findCollectables":{
				data.order={
					type:"findCollectables",
					findCollectables:mission.collectablesAmount,
					onFindCollectablesSuccess:true,
					item:mission.item,
					time:90,
					onTimeSuccess:false
				}
				// Netmaster decides collectables position and send to other players
				if (data.netMaster)
					for (var i=0;i<mission.collectablesAmount;i++) {
						var position=data.mapData.freepoints[QMATH.floor(QMATH.random()*data.mapData.freepoints.length)];
						data.triggerGameModeEvent("showCollectable",[
							data,
							i,
							position.x+0.5,
							position.y+0.5,
							mission.itemTextureX,
							mission.itemTextureY,
							mission.itemAnimated,
							true
						]);					
					}
				break;
			}
			case "alternateKillDrones":{
				data.order={
					type:"alternateKillDrones",
					alternateKillDrones:mission.alternateKillDrones,
					onAlternateKillDronesSuccess:true,
					time:60,
					onTimeSuccess:false
				}
				break;
			}
			case "dontGetDamage":{
				data.order={
					type:"dontGetDamage",
					label:"No damage",
					checkDamage:true,
					onCheckDamageSuccess:false,
					time:60,
					onTimeSuccess:true
				}
				break;
			}
			case "killDontMiss":{
				data.order={
					type:"killDontMiss",
					checkMissed:true,
					onMissSuccess:false,
					droneAmount:mission.droneAmount,
					onDroneAmountSuccess:true,
					time:60,
					onTimeSuccess:false
				}
				break
			}
			case "droneSpeed":{
				data.order={
					type:"droneSpeed",
					label:mission.label,
					time:30,
					onTimeSuccess:true
				}
				data.droneSpeed*=mission.droneSpeed;
				break
			}
			case "lights":{
				data.order={
					type:"lights",
					label:mission.label,
					time:30,
					onTimeSuccess:true
				}
				data.animateLights=true;
				for (var k in mission.lights) data.LIGHTS[k].set=mission.lights[k];
				break;
			}
			case "killDrones":{
				data.order={
					type:"killDrones",
					droneAmount:QMATH.ceil(mission.droneAmount*data.orderScale),
					onDroneAmountSuccess:true,
					time:60,
					onTimeSuccess:false
				}
				break;
			}
			case "onlyWeapon":{
				data.order={
					type:"onlyWeapon",
					label:WEAPONS[mission.weapon].shortLabel+" only",					
					onlyWeapon:mission.weapon,
					time:60,
					onTimeSuccess:true
				}
				data.players.forEach(player=>{
					if (player.weapon&&(player.weapon!=mission.weapon))
						data.giveWeapon(player,mission.weapon);
				});
				break;
			}
			case "unlimitedAmmo":{
				data.order={
					type:"unlimitedAmmo",
					label:INFINITE_SYMBOL+" Ammo",
					infiniteAmmo:true,
					time:30,
					onTimeSuccess:true
				}
				break;
			}
			case "reloadTimeRatio":{
				data.order={
					type:"reloadTimeRatio",
					label:mission.label,
					reloadTimeRatio:mission.reloadTimeRatio,
					time:30,
					onTimeSuccess:true
				};
				break;
			}
			case "moveSpeedRatio":{
				data.order={
					type:"moveSpeedRatio",
					label:mission.label,
					time:60,
					onTimeSuccess:true
				}
				data.players.forEach(player=>{
					player.maxSpeed=player.defaultMovementSpeed*mission.moveSpeedRatio;
				})
				break;
			}
			case "fireAndRandom":{
				data.order={
					type:"fireAndRandom",
					label:"Fire & Random",
					fireAndRandom:true,
					time:30,
					onTimeSuccess:true
				};
				break;
			}
			case "doorStuck":{
				data.order={
					type:"doorStuck",
					label:"Door stuck",
					doorStuck:true,
					time:30,
					onTimeSuccess:true
				};
				break;
			}
			case "damagePercent":{
				data.order={
					type:"damagePercent",
					label:mission.label,
					time:60,
					onTimeSuccess:true
				};
				data.damagePercent=mission.damagePercent;
				break;
			}
			case "aimRatio":{
				data.order={
					type:"aimRatio",
					label:mission.label,
					time:60,
					onTimeSuccess:true
				};
				data.aimRatio=mission.setAimRatio==undefined?data.defaultAimRatio*mission.aimRatio:mission.setAimRatio;
				break;
			}
			case "noWeapons":{
				data.order={
					type:"noWeapons",
					label:"No weapons",
					noWeapons:true,
					time:30,
					onTimeSuccess:true
				}
				data.players.forEach(player=>{
					if (player.weapon)
						data.removeWeapon(player);
				});
				break;
			}
			case "noDoors":{
				var time=30;
				data.order={
					type:"noDoors",
					label:"No doors",
					time:time,
					onTimeSuccess:true
				}
				data.doorOpeningTime=time*data.speedRatio;
				data.mapData.doors.forEach(door=>{
					data.openDoor(door);
				})
				break;
			}
			case "randomWeapons":{
				data.order={
					type:"randomWeapons",
					label:"Random weapon",
					randomWeapons:true,
					time:60,
					onTimeSuccess:true
				}
				break;
			}
			case "droneIntensity":{
				data.order={
					type:"droneIntensity",
					label:mission.label,
					time:60,
					onTimeSuccess:true
				}
				data.droneIntensity*=mission.droneIntensity;
				break;
			}
			case "getCombo":{
				data.order={
					type:"getCombo",
					label:"Get combo x"+mission.getCombo,
					getCombo:mission.getCombo,
					time:30,
					onTimeSuccess:false
				}
				break;
			}
			case "reachPoint":{
				data.order={
					type:"reachPoint",
					label:mission.label,
					reach:mission.reach,
					onReachSuccess:true,
					time:30,
					onTimeSuccess:false
				}
				break;
			}
			case "hotspotPoints":{
				data.order={
					type:"hotspotPoints",
					hotspotPoints:mission.hotspotPoints,
					useHotspot:true,
					onHotspotPointsSuccess:true,
					time:30,
					onTimeSuccess:false
				}
				break;
			}
			case "killDronesOnHotspot":{
				data.order={
					type:"killDronesOnHotspot",
					useHotspot:true,
					killDronesOnHotspot:mission.killDronesOnHotspot,
					onKillDronesOnHotspotSuccess:true,
					time:60,
					onTimeSuccess:false
				}
				break;
			}
			case "stealthFrags":{
				data.order={
					type:"stealthFrags",
					stealthFrags:mission.stealthFrags,
					onStealthFragsSuccess:true,
					time:60,
					onTimeSuccess:false
				};
				data.droneSight/=2;
				break;
			}
		}
		data.playAnnouncer("speak_newmission");
		data.dronesKilledLevel=0;
		if (mission.time!==undefined) data.order.time=mission.time;
		if (mission.color!==undefined) data.order.color=mission.color;
		data.order.running=true;
		data.players.forEach(player=>{
			if (player.isLocal) data.playerLog(player,data.LOGLEVEL_IMPORTANT_GOOD,"NEW MISSION");	
		})
	},
	clearGame:function(data,send) {
		if (data.netEnabled&&send) data.broadcastGameModeEvent("clearGame",[]);
		data.endGame();
		data.playAnnouncer("speak_cleared");
		data.players.forEach(player=>{
			if (player.isLocal) data.playerLog(player,data.LOGLEVEL_ENDGAME_GOOD,"CLEARED",true);
		});
		data.orderWaitText="Well done!";
	},
	newOrder:function(data) {
		// Level up		
		if (data.orderLevel+1>data.maxLevels)
			data.triggerGameModeEvent("clearGame",[data,true]);
		else {
			if (data.netMaster) {
				if (!data.orderSequence.length) {
					data.orderSequence=[
						// Shared missions - triggers are shared via netplay
						{
							id:"reticleMode"
						},						
						{
							id:"hotspotPoints",
							hotspotPoints:10
						},
						{
							id:"killDronesOnHotspot",
							killDronesOnHotspot:3
						},
						{
							id:"stealthFrags",
							stealthFrags:5
						},
						{
							id:"killDontMiss",
							droneAmount:5
						},
						{
							id:"dontGetDamage"
						},
						{
							id:"alternateKillDrones",
							alternateKillDrones:5
						},
						{
							id:"findCollectables",
							item:"sleeper",
							itemTextureX:6,
							itemTextureY:3,
							time:60,
							itemAnimated:false,
							collectablesAmount:1,
						},
						{
							id:"findCollectables",
							item:"cards",
							itemTextureX:4,
							itemTextureY:4,
							itemAnimated:true,
							collectablesAmount:5,
						},
						{
							id:"killGoldDrones",
							goldDrones:3
						},

						// Shared missions + special netMaster instructions
						{
							id:"killDrones",
							droneAmount:10
						},

						// netMaster only missions
						{
							id:"droneIntensity",
							label:"Invasion",
							droneIntensity:2
						},

						// Per-player missions - no trigger exchange needed
						{
							id:"damagePercent",
							damagePercent:1000,
							label:"Instagib"
						},
						{
							id:"damagePercent",
							damagePercent:2,
							label:"Damage x2"
						},
						{
							id:"damagePercent",
							damagePercent:4,
							label:"Damage x4"
						},
						{
							id:"damagePercent",
							damagePercent:0.5,
							label:"Half damage"
						},
						{
							id:"droneSpeed",
							label:"Panic!",
							droneSpeed:2
						},
						{ id:"noWeapons" },
						{ id:"noDoors"},
						{ id:"doorStuck"},
						{
							id:"radarAngle",
							label:"Broken radar",
							radarAngle:QMATH.PI
						},
						{id:"shrink"},
						{
							id:"radarDistance",
							label:"No radar",
							radarDistanceRatio:0
						},
						{
							id:"radarDistance",
							label:"Super radar",
							radarDistanceRatio:2
						},
						{id:"distract"},
						{id:"invertButtons"},
						{id:"setFriction",label:"No stop moving",friction:1},
						{id:"setFriction",label:"Slippery floor",friction:0.9},
						{id:"lights",label:"Very hot",lights:{
							tintColorR:PALETTE.WHITE[0],tintColorG:PALETTE.WHITE[0],tintColorB:PALETTE.WHITE[0],
							tintBase:0.01,tintRamp:0,
							overallLight:0.72,overallTint:1,
							skyboxTint:0,skyboxLight:1,
							floorLight:0.85,floorTint:1,
							ceilingLight:0.95,ceilingTint:1,
							wallLight:1,wallTint:1,
							wallCornerLight:0.53,wallCornerTint:1,
							spritesLight:2,spritesTint:100,
							shadowLight:0.67,shadowTint:1
						}},	
						{id:"lights",label:"Fog",lights:{
							tintColorR:PALETTE.WHITE[0],tintColorG:PALETTE.WHITE[0],tintColorB:PALETTE.WHITE[0],
							tintBase:0, tintRamp:0.39,
							overallLight:1,overallTint:0.85,
							skyboxLight:1.02,skyboxTint:0.13,
							floorLight:1.04,floorTint:0.84,
							ceilingLight:1,ceilingTint:1.27,
							wallLight:1.07,wallTint:1,
							wallCornerLight:1,wallCornerTint:1,
							spritesLight:1,spritesTint:0,
							shadowLight:1,shadowTint:1
						}},
						
						{id:"lights",label:"Pitch black",lights:{
							tintColorR:PALETTE.BLACK[0],tintColorG:PALETTE.BLACK[0],tintColorB:PALETTE.BLACK[0],
							overallLight:0.36,
							tintRamp:0.43,
							overallTint:0.62,
							skyboxLight:0,
							tintBase:0,
							spritesLight:0.34,
							floorLight:0.74,
							shadowLight:0.2,
							wallTint:2
						}},
						{id:"unlimitedAmmo"},
						{
							id:"reloadTimeRatio",
							label:"Fast reload",
							reloadTimeRatio:0.5
						},
						{
							id:"reloadTimeRatio",
							label:"Slow reload",
							reloadTimeRatio:1.5
						},
						{id:"fireAndRandom"},
						{
							id:"moveSpeedRatio",
							label:"Slow move",
							moveSpeedRatio:0.5
						},
						{
							id:"moveSpeedRatio",
							label:"Fast move",
							moveSpeedRatio:1.5
						},	
						{
							id:"getCombo",
							getCombo:3
						},
						
						{
							id:"aimRatio",
							label:"No aiming",
							setAimRatio:1
						},
						{
							id:"aimRatio",
							label:"Slow aiming",
							aimRatio:0.1
						},
						{id:"randomWeapons"}

					];

					// Weapon-based missions
					for (var w in WEAPONS)
						data.orderSequence.push({id:"onlyWeapon",weapon:w})

					// Reach spawnpoints missions
					data.mapData.spawnpoints.forEach((spawnpoint,playerid)=>{
							data.orderSequence.push({
								id:"reachPoint",
								label:"Go "+PLAYERSDATA[playerid].label+" base",
								color:PLAYERSDATA[playerid].fontColor,
								reach:[
									[spawnpoint.sprite.x-0.5,spawnpoint.sprite.y-0.5,spawnpoint.sprite.x+0.5,spawnpoint.sprite.y+0.5]
								]
							})
					});

					// Reach hotspot mission
					var reachHotspotMission={
						id:"reachPoint",
						label:"Go to hotspot",
						reach:[]
					};
					data.hotspots.forEach(hotspot=>{
						reachHotspotMission.reach.push([hotspot[0],hotspot[1],hotspot[0]+1,hotspot[1]+1])
					});
					data.orderSequence.push(reachHotspotMission);
				}
				var mission=data.orderSequence.splice(QMATH.floor(QMATH.random()*data.orderSequence.length),1)[0];
				data.triggerGameModeEvent("startMission",[data,mission,true]);
			}			
		}
	},

	// Score & counters syncronization
	increaseScore:function(data,by,send) {
		if (by) {
			if (data.netEnabled&&send) data.broadcastGameModeEvent("increaseScore",[by]);
			data.score+=by;
		}
	},
	decreaseCounter:function(data,variable,onsuccess,send) {
		if (data.netEnabled&&send) data.broadcastGameModeEvent("decreaseCounter",[variable,onsuccess]);
		if (data.order[variable]>0) {
			var newvalue=--data.order[variable];
			data.playEffect("point");
			if (data.netMaster&&!newvalue)
				data.triggerGameModeEvent("endMission",[data,onsuccess,false,true]);
		} else data.order[variable]=0;		
	},
	
	// Broadcasted events - check if is local player
	onDamaged:function(data,player,amount) {
		if (player.isHuman) {
			if (player.isLocal&&data.order.checkDamage) {
				data.order.checkDamage=false;
				data.triggerGameModeEvent("endMission",[data,data.order.onCheckDamageSuccess,false,true]);
			}
			data.giveInvulnerability(player,data.invulnerabilityTime,true);
		}
	},
	onSuicide:function(data,player) {
		if (player.isLocal)
			data.triggerGameModeEvent("endMission",[data,false,true,true]);
	},
	onKillEnemy:function(data,player,enemy) {
		if (enemy.isLocal&&(enemy.team==0)) data.triggerGameModeEvent("endMission",[data,false,true,true]);
	},
	onSecondPassed:function(data) {
		if (data.orderWait!==undefined) {
			data.orderWait--;
			if (!data.orderWait)
				if (data.netMaster) data.triggerGameModeEvent("newOrder",[data]);
				else data.orderWait=1; // Other players will wait the master new order
		} 
		if (data.order.time!==undefined) {
			data.order.time--;
			if (!data.order.time) {
				if (data.netMaster) data.triggerGameModeEvent("endMission",[data,data.order.onTimeSuccess,false,true]);
				// Other players will wait master endMission
			} else
				if (data.order.time<4) data.playAnnouncer("speak_countdown"+data.order.time);
		}
		if (data.order.useHotspot) {
			var scorePoint=false;
			for (var i=0;i<data.players.length;i++) {
				var player=data.players[i];
				var onHotSpot=false;
				if (!player.isDead)
					for (var j=0;j<data.hotspots.length;j++) {
						var hotspot=data.hotspots[j];
						if ((player.tileX==hotspot[0])&&(player.tileY==hotspot[1])) {
							onHotSpot=true;
							scorePoint=true;
							break;
						}
					}
				player.isOnHotspot=onHotSpot;
			}
			// Hotspot is checked by netmaster only
			if (data.netMaster&&data.order.hotspotPoints&&scorePoint)
				data.triggerGameModeEvent("decreaseCounter",[data,"hotspotPoints",data.order.onHotspotPointsSuccess,true]);				
		}
	},
	onRespawn:function(data,player,first) {
		delete player.camperingX;
		delete player.camperingY;
		player.campering=1;
		player.isCampering=false;
	},
	onPlayerKilledDrone:function(data,drone,fromplayer) {
		// Score for local player only - score gain is broadcasted
		if (fromplayer.isLocal) {
			fromplayer.combo++;
			data.dronesKilledLevel++;
			if (fromplayer.isCampering) fromplayer.campering++;
			else fromplayer.campering=1;		
			fromplayer.camperingX=fromplayer.sprite.x;
			fromplayer.camperingY=fromplayer.sprite.y;
			if (data.order.getCombo&&(fromplayer.combo>=data.order.getCombo)) {
				data.order.getCombo=0;
				data.triggerGameModeEvent("endMission",[data,true,false,true]);
			}
			fromplayer.comboTimer=data.comboTimerLength;
			data.triggerGameModeEvent("increaseScore",[
				data,
				QMATH.ceil((data.pointsPerDrone+data.pointsPerDrone*fromplayer.combo*0.5)*(drone.isGold?3:1)/(fromplayer.campering<data.camperingLimit?1:fromplayer.campering)),
				true
			]);
			if (data.order.droneAmount) data.triggerGameModeEvent("decreaseCounter",[data,"droneAmount",data.order.onDroneAmountSuccess,true]);
			if (data.order.killDronesOnHotspot&&fromplayer.isOnHotspot) data.triggerGameModeEvent("decreaseCounter",[data,"killDronesOnHotspot",data.order.onKillDronesOnHotspotSuccess,true]);
			if (data.order.stealthFrags&&!drone.aggroTimer) data.triggerGameModeEvent("decreaseCounter",[data,"stealthFrags",data.order.onStealthFragsSuccess,true]);
			if (data.order.alternateKillDrones&&(data.order.time%2)) data.triggerGameModeEvent("decreaseCounter",[data,"alternateKillDrones",data.order.onAlternateKillDronesSuccess,true]);
			if (data.order.goldDrones&&drone.isGold) data.triggerGameModeEvent("decreaseCounter",[data,"goldDrones",data.order.onGoldDronesSuccess,true]);
		}
	},

	// Only local events
	onPlayerOpenDoor:function(data,player,x,y) {
		if (data.order.doorStuck) return true;
	},
	onPlayerFire:function(data,player) {
		if (data.order.infiniteAmmo) player.ammo+=player.weapon.ammoPerShot;
		if (data.order.reloadTimeRatio) {
			player.weaponReloading=QMATH.ceil(player.weaponReloading*data.order.reloadTimeRatio);
			player.weaponSpriteAnimationSpeed=QMATH.ceil(player.weaponSpriteAnimationSpeed*data.order.reloadTimeRatio);
			player.weaponSpriteAnimationFrames=QMATH.ceil(player.weaponSpriteAnimationFrames*data.order.reloadTimeRatio);
		}
		if (data.order.fireAndRandom)
			data.giveWeapon(player,data.WEAPONSLIST[QMATH.floor(QMATH.random()*data.WEAPONSLIST.length)],true);
	},
	onPlayerPickWeapon:function(data,player,weapon) {
		if (data.order.noWeapons) return "_NONE_";
		else if (data.order.onlyWeapon) return data.order.onlyWeapon;
		else if (data.order.randomWeapons) return data.WEAPONSLIST[QMATH.floor(QMATH.random()*data.WEAPONSLIST.length)];
	},	
	onPlayerMissed:function(data,player) {
		if (data.order.checkMissed) data.triggerGameModeEvent("endMission",[data,data.order.onMissSuccess,false,true]);
	},	
	onFrame:function(data) {
		if (data.animateLights) {
			data.animateLights=false;
			for (var k in data.LIGHTS) {
				if (data.LIGHTS[k].current!=data.LIGHTS[k].set) {
					data.animateLights=true;
					if (QMATH.abs(data.LIGHTS[k].current-data.LIGHTS[k].set)<0.01)
						data.LIGHTS[k].current=data.LIGHTS[k].set;
					else
						data.LIGHTS[k].current+=(data.LIGHTS[k].set-data.LIGHTS[k].current)/data.LIGHTSSPEED;
					data.RC[data.LIGHTS[k].setter](data.LIGHTS[k].current);
				}
			}
		}
		// Check reach point only for local players
		if (data.order.reach!==undefined) {
			var done=false;
			for (var i=0;i<data.players.length;i++) {
				var player=data.players[i];
				if (player.isLocal)
					for (var j=0;j<data.order.reach.length;j++) {
						var reach=data.order.reach[j];
						if (
							(player.sprite.x>=reach[0])&&(player.sprite.x<=reach[2])&&
							(player.sprite.y>=reach[1])&&(player.sprite.y<=reach[3])
						) {
							done=true;
							data.triggerGameModeEvent("endMission",[data,data.order.onReachSuccess,false,true]);
							break;
						}
					}
				if (done) break;
			}
		}
		// Check collectables only for local players
		if (data.order.findCollectables) {
			for (var i=0;i<data.collectables.length;i++) {
				var collectable=data.collectables[i];
				if (collectable.pickable)
					for (var j=0;j<data.players.length;j++) {
						var player=data.players[j];
						if (player.isLocal)
							if (!player.isDead&&SPRITE.isColliding(player.sprite,collectable)) {
								data.triggerGameModeEvent("collectCollectable",[data,i,true]);
								break;
							}
					}
			}
		}
	},

	// Hud drawing
	onDrawHud:function(data,player,ctx,cameraWidth,cameraHeight) {
		if (player.camperingX!==undefined)
			player.isCampering=TRIGO.getDistance(player.camperingX,player.camperingY,player.sprite.x,player.sprite.y)<data.camperingDistance;
		else
			player.isCampering=false;
		var text=data.orderWaitText,color=data.order.color||FONTPALETTE.WHITE;
		if (player.comboTimer) {
			player.comboTimer--;
			if (!player.comboTimer) player.combo=0;
		}
		if (data.gameRunning)
			switch (data.order.type) {
				case "killGoldDrones":{
					text=data.order.goldDrones+" gold frag"+DOT_SYMBOL+TIME_SYMBOL+data.order.time;
					break;
				}
				case "findCollectables":{
					text="Get "+data.order.findCollectables+" "+data.order.item+DOT_SYMBOL+TIME_SYMBOL+data.order.time;
					break;
				}
				case "killDontMiss":{
					text=data.order.droneAmount+" no miss frag"+DOT_SYMBOL+TIME_SYMBOL+data.order.time;
					break;
				}
				case "stealthFrags":{
					text=data.order.stealthFrags+" frag unseen"+DOT_SYMBOL+TIME_SYMBOL+data.order.time;					
					break;
				}
				case "killDronesOnHotspot":{
					text=data.order.killDronesOnHotspot+" hotspot frag"+DOT_SYMBOL+TIME_SYMBOL+data.order.time;					
					break;
				}
				case "hotspotPoints":{
					text=TIME_SYMBOL+data.order.hotspotPoints+" on hotspot"+DOT_SYMBOL+TIME_SYMBOL+data.order.time;					
					break;
				}
				case "killDrones":{
					text=data.order.droneAmount+" frag"+DOT_SYMBOL+TIME_SYMBOL+data.order.time;					
					break;
				}
				case "alternateKillDrones":{
					if (data.order.time%2) {
						text=data.order.alternateKillDrones+" frag NOW!"+DOT_SYMBOL+TIME_SYMBOL+data.order.time;						
						color=data.FONTCOLORSLIST[QMATH.floor(QMATH.random()*data.FONTCOLORSLIST.length)];
					} else {
						text="Waaaiiit..."+DOT_SYMBOL+TIME_SYMBOL+data.order.time;
						color=FONTPALETTE.BLACK;
					}
					
					break;
				}
				case "_wait":{
					text=data.orderWaitText+DOT_SYMBOL+TIME_SYMBOL+data.orderWait;
					color=FONTPALETTE.BLACK;
					break;
				}
				default:{
					text=data.order.label+DOT_SYMBOL+TIME_SYMBOL+data.order.time;					
				}
			}
		CANVAS.print(ctx,FONT,player.fontColor,player.cameraRenderX+2,player.cameraRenderY+2,VICTORY_SYMBOL+data.score);
		CANVAS.print(ctx,FONT,color,player.cameraRenderX+2,player.cameraRenderY+FONT.tileHeight+2,text);
		if (player.combo>1) CANVAS.print(ctx,FONTSMALL,data.FONTCOLORSLIST[QMATH.floor(QMATH.random()*data.FONTCOLORSLIST.length)],player.cameraRenderX+2,player.cameraRenderY+FONT.tileHeight*2+2,"COMBO x"+player.combo);
		if (player.isCampering&&(player.campering>data.camperingNotice))
			CANVAS.print(
				ctx,
				FONTSMALL,FONTPALETTE.BLACK,
				player.cameraRenderX+2,player.cameraRenderY+FONT.tileHeight*2+9,
				player.campering>data.camperingLimit?"CAMP PUNISHER x"+player.campering:"CAMPERING..."
			);			

		CANVAS.print(ctx,FONT,player.fontColor,player.cameraRenderX+cameraWidth-2-data.levelGap,player.cameraRenderY+cameraHeight-2-FONT.tileHeight*2,data.levelLabel);
		CANVAS.print(ctx,FONT,player.fontColor,player.cameraRenderX+cameraWidth-2-data.livesGap,player.cameraRenderY+cameraHeight-2-FONT.tileHeight,data.livesText);
		if (data.netEnabled) {
			var py=player.cameraRenderY+FONT.tileHeight*2+16;
			data.players.forEach(player2=>{
				if (player.id!=player2.id) {
					CANVAS.print(ctx,FONTSMALL,player2.fontColor,player.cameraRenderX+2,py,player2.label);
					py+=FONTSMALL.tileHeight-1;
				}
			})
		}
	}
};