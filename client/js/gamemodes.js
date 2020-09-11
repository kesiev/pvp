
const
	// TIPS: Set "offlineOnly:true" to values available for offline play only.
	GAMESETTINGS=[
		// Map
		{
			id:"map",
			label:"Map",
			arrows:true,
			values:[
				{
					label:"Random",
					description:["Let the PvP Leaders choose your next training.","",""],
					onSet:{
						settings:{map:-1}
					}		
				}
			]
		},

		// Game modes
		{
			id:"mode",
			label:"Mode",
			arrows:true,
			values:[
				{
					default:true,
					label:"Deathmatch",
					description:["Earn 1 point for every frag, lose 1 point for suicide!"],
					onSet:{
						modules:["_default","deathMatch","time"],
						settings:{ scoreSymbol: VICTORY_SYMBOL }
					},
					enable:["map","mode","variant","time","health","damage","weapons","fragsLimit"]
				},
				{
					label:"Bloodlust",
					description:["When a Player dies he gets x4 damage and loses 1HP/sec!"],
					onSet:{
						modules:["_default","deathMatch","time","bloodlust"],
						settings:{ scoreSymbol: VICTORY_SYMBOL }
					},
					enable:["map","mode","variant","time","health","damage","weapons","fragsLimit"]
				},
				{
					label:"The One",
					description:["He has perks and frags for points. Kill him and be The One!"],
					onSet:{
						modules:["_default","time","allVsAll","theOne"],
						settings:{ scoreSymbol: VICTORY_SYMBOL }
					},
					enable:["map","mode","perk0","perk1","perk2","time","health","damage","weapons","fragsLimit"]
				},
				{
					label:"King of the hill",
					description:["Earn 1 point for every second you stand on the hotspot!"],
					onSet:{
						modules:["_default","kingOfTheHill","time"],
						settings:{ scoreSymbol: VICTORY_SYMBOL, useHotspot:true }
					},
					enable:["map","mode","variant","time","health","damage","weapons","kingOfTheHillLimit"]
				},
				{
					label:"Capture the flag",
					description:["Bring the flag at the hotspot to your home for 1 point!"],
					onSet:{
						modules:["_default","captureTheFlag","time"],
						settings:{ scoreSymbol: VICTORY_SYMBOL, useHotspot:true, useFlag:true, respawnPolicy:0 }
					},
					enable:["map","mode","variant","time","health","damage","weapons","captureTheFlagLimit"]
				},
				{
					label:"Last man standing",
					description:["Lose all lives and you're out! The last man standing wins!"],
					onSet:{
						modules:["_default","lastManStanding","time"],
						settings:{ scoreSymbol: LIVES_SYMBOL }
					},
					enable:["map","mode","variant","time","health","damage","weapons","lives"]
				},
				{
					label:"Horde Versus",
					description:["The map fills up with drones. Kill anything to earn points!"],
					onSet:{
						modules:["_default","horde","hordeTimed","time","deathMatch","hordeVersus"],
						settings:{ scoreSymbol: VICTORY_SYMBOL }
					},
					enable:["map","mode","variant","time","health","damage","weapons"]
				},
				{
					label:"Horde Co-op",
					description:["Share lives, kill drones and go for the highest score!"],
					onSet:{
						modules:["horde","hordeTimed","time","hordeCoop" ],
						settings:{ scoreSymbol: VICTORY_SYMBOL }
					},
					enable:["map","mode","time","health","damage","weapons","lives"]
				},
				{
					label:"Arcade Co-op",
					description:["Clear missions. Fight as a team. Fail as a team."],
					onSet:{
						modules:["horde","arcadeMode","time" ],
						settings:{ scoreSymbol: VICTORY_SYMBOL, gameSpeed:3 }
					},
					enable:["map","mode"]
				}
			]
		},

		// Perks 1
		{id:"perk0",arrows:true,label:"Perk 1",values:[]},

		// Perks 2
		{id:"perk1",arrows:true,label:"Perk 2",values:[]},

		// Perks 2
		{id:"perk2",arrows:true,label:"Perk 3",values:[]},

		// Variants
		{
			id:"variant",
			label:"Variant",
			arrows:true,
			values:[
				{
					default:true,
					label:"All vs. all",
					description:["You vs. the other Players!"],
					onSet:{
						modules:["allVsAll"]
					}
				},
				{
					label:"Team vs.",
					description:["Red/Blue vs. Green/Yellow"],
					onSet:{
						modules:["team"]
					}
				},
				{
					label:"Vs. Champion",
					description:["Red vs. Blue/Green/Yellow"],
					onSet:{
						modules:["champion"]
					}
				}
			]
		},

		// Mode-specific settings
		{
			id:"fragsLimit",
			label:"Frags",
			arrows:true,
			values:[
				{
					default:true,
					label:"No limit",
					onSet:{}
				},
				{
					label:"3 frags",
					onSet:{ settings:{ scoreLimit:3 } }
				},
				{
					label:"5 frags",
					onSet:{ settings:{ scoreLimit:5 } }
				},
				{
					label:"10 frags",
					onSet:{ settings:{ scoreLimit:10 } }
				},
				{
					label:"15 frags",
					onSet:{ settings:{ scoreLimit:15 } }
				},
				{
					label:"20 frags",
					onSet:{ settings:{ scoreLimit:20 } }
				}
			]
		},
		{
			id:"captureTheFlagLimit",
			label:"Points",
			arrows:true,
			values:[
				{
					default:true,
					label:"No limit",
					onSet:{}
				},
				{
					label:"3 points",
					onSet:{ settings:{ scoreLimit:3 } }
				},
				{
					label:"6 points",
					onSet:{ settings:{ scoreLimit:6 } }
				},
				{
					label:"9 points",
					onSet:{ settings:{ scoreLimit:9 } }
				},
				{
					label:"12 points",
					onSet:{ settings:{ scoreLimit:12 } }
				},
				{
					label:"15 points",
					onSet:{ settings:{ scoreLimit:15 } }
				}
			]
		},
		{
			id:"kingOfTheHillLimit",
			label:"Limit",
			arrows:true,
			values:[
				{
					default:true,
					label:"No points limit",
					onSet:{}
				},
				{
					label:"10 points",
					onSet:{ settings:{ scoreLimit:10 } }
				},
				{
					label:"20 points",
					onSet:{ settings:{ scoreLimit:20 } }
				},
				{
					label:"30 points",
					onSet:{ settings:{ scoreLimit:30 } }
				},
				{
					label:"40 points",
					onSet:{ settings:{ scoreLimit:40 } }
				},
				{
					label:"50 points",
					onSet:{ settings:{ scoreLimit:50 } }
				},
				{
					label:"60 points",
					onSet:{ settings:{ scoreLimit:60 } }
				}
			]
		},
		{
			id:"lives",
			label:"Lives",
			arrows:true,
			values:[
				{
					label:"1",
					onSet:{ settings:{ startLives:1 } }
				},
				{
					label:"2",
					onSet:{ settings:{ startLives:2 } }
				},
				{
					default:true,
					label:"3",
					onSet:{ settings:{ startLives:3 } }
				},
				{
					label:"4",
					onSet:{ settings:{ startLives:4 } }
				},
				{
					label:"5",
					onSet:{ settings:{ startLives:5 } }
				},
				{
					label:"10",
					onSet:{ settings:{ startLives:10 } }
				}
			]
		},

		// All game modes settings
		{
			id:"time",
			label:"Time",
			arrows:true,
			values:[
				{
					label:"No time limit",
					onSet:{}
				},
				{
					label:"1 minute",
					onSet:{ settings:{ timeLimit:60 } }
				},
				{					
					label:"2 minutes",
					onSet:{ settings:{ timeLimit:120 } }
				},
				{
					label:"3 minutes",
					onSet:{ settings:{ timeLimit:180 } }
				},
				{
					label:"4 minutes",
					onSet:{ settings:{ timeLimit:240 } }
				},
				{
					label:"5 minutes",
					default:true,
					onSet:{ settings:{ timeLimit:300 } }
				},
				{
					label:"6 minutes",
					onSet:{ settings:{ timeLimit:360 } }
				},
				{
					label:"7 minutes",
					onSet:{ settings:{ timeLimit:420 } }
				},
				{
					label:"8 minutes",
					onSet:{ settings:{ timeLimit:480 } }
				},
				{
					label:"9 minutes",
					onSet:{ settings:{ timeLimit:540 } }
				},
				{
					label:"10 minutes",
					onSet:{ settings:{ timeLimit:600 } }
				}
			]
		},

		// Gameplay settings
		{
			id:"health",
			label:"Health",
			arrows:true,
			values:[
				{
					label:"1 HP",
					onSet:{ settings:{ startHp:1 } }
				},
				{
					label:"50 HP",
					onSet:{ settings:{ startHp:50 } }
				},
				{
					default:true,
					label:"100 HP",
					onSet:{ settings:{ startHp:100 } }
				},
				{
					label:"150 HP",
					onSet:{ settings:{ startHp:150 } }
				},
				{
					label:"200 HP",
					onSet:{ settings:{ startHp:200 } }
				}
			]
		},	
		{
			id:"damage",
			label:"Damage",
			arrows:true,
			values:[
				{
					label:"25%",
					onSet:{ settings:{ damagePercent:0.25 } }
				},
				{
					label:"50%",
					onSet:{ settings:{ damagePercent:0.5 } }
				},
				{
					default:true,
					label:"100%",
					onSet:{ settings:{ damagePercent:1 } }
				},
				{
					label:"125%",
					onSet:{ settings:{ damagePercent:1.25 } }
				},
				{
					label:"150%",
					onSet:{ settings:{ damagePercent:1.5 } }
				},
				{
					label:"175%",
					onSet:{ settings:{ damagePercent:1.75 } }
				},
				{
					label:"200%",
					onSet:{ settings:{ damagePercent:2 } }
				},
				{
					label:"Instagib",
					onSet:{ settings:{ damagePercent:1000 } }
				}
			]
		},
		{
			id:"weapons",
			label:"Weapons",
			arrows:true,
			values:[
				{
					default:true,
					label:"Map specific",
					onSet:{}		
				}
			]
		},
		{id:"gameSpeed",arrows:true,label:"Speed",values:[
			{
				label:"25%",
				onSet:{ settings:{ gameSpeed:0.25 } }
			},
			{
				label:"50%",
				onSet:{ settings:{ gameSpeed:0.5 } }
			},
			{
				label:"75%",
				onSet:{ settings:{ gameSpeed:0.75 } }
			},
			{
				label:"100%",default:true,
				onSet:{ settings:{ gameSpeed:1 } }
			},
			{
				label:"125%",
				onSet:{ settings:{ gameSpeed:1.25 } }
			},
			{
				label:"150%",
				onSet:{ settings:{ gameSpeed:1.5 } }
			},
			{
				label:"175%",
				onSet:{ settings:{ gameSpeed:1.75 } }
			},
			{
				label:"200%",
				onSet:{ settings:{ gameSpeed:2 } }
			},
		]},

	],
	GAMEPERKS=[
		{label:"None"},
		{label:"Only 1HP"},
		{label:"Restore health"},
		{label:"Max health x2"},
		{label:"Max health x3",default:0},
		{label:"Damage x2",default:1},
		{label:"Damage x3"},
		{label:"Damage x4"},
		{label:"Unlimited ammo"},
		{label:"Earn 1pts/sec."},
		{label:"Lose 1HP/sec."},
		{label:"Invisibility"},
		{label:"Add to radar",default:2},
		{weapons:true}
	];
	GAMEMODEMODULES={
		// Common code
		_default:{			
			onMatchBegin:function(data) {
				data.leaderboardMargin=0;
				data.triggerGameModeEvent("updateLeaderboard",[data]);
				data.markerBlink=0;
				data.markerBlinkSize=QMATH.floor(FPS/2);
			},
			onGameEnd:function(data) {
				data.triggerGameModeEvent("updateLeaderboard",[data]);
				data.players.forEach(player=>{
					var logline,good=false;
			    	if (data.lastRank==1) logline="DRAW";
			    	else if (player.rank==1) {
			    		logline="YOU WON";
			    		good=true;
			    	} else if (player.rank==data.lastRank) logline="YOU LOSE";
			    	else logline="YOU RANKED #"+player.rank;
			    	data.playerLog(player,good?data.LOGLEVEL_ENDGAME_GOOD:data.LOGLEVEL_ENDGAME_BAD,logline,true);
			    });			
			    data.playAnnouncer("speak_gameover");
			},
			updateLeaderboard:function(data) {
			    var lastScore;
				data.leaderboard=[];
				data.lastRank=0;
				data.players.forEach(player=>{
					data.leaderboard.push({id:player.id,score:player.score,dataPlayer:player});
				});
				data.leaderboard.sort(function(a,b){
			    	if (a.score==b.score) return 0;
			    	if (a.score<b.score) return 1;
			    	else return -1;
			    });
			    data.leaderboard.forEach(player=>{
			    	var dataPlayer=player.dataPlayer;
			    	if ((lastScore==undefined)||(player.score!=lastScore)) {
			    		data.lastRank++;
			    		lastScore=player.score;
			    	}
			    	dataPlayer.rank=data.lastRank;
			    	dataPlayer.rankedFirst=data.lastRank==1;
			    	switch (dataPlayer.rank) {
			    		case 1:{
			    			dataPlayer.rankLabel="st";
			    			break;
			    		}
			    		case 2:{
			    			dataPlayer.rankLabel="nd";
			    			break;
			    		}
			    		case 3:{
			    			dataPlayer.rankLabel="rd";
			    			break;
			    		}
			    		default:{
			    			dataPlayer.rankLabel="th";
			    			break;
			    		}
			    	}
			    	dataPlayer.scoreRow=data.scoreSymbol+dataPlayer.score+(data.scoreLimit?"/"+data.scoreLimit:"");
			    	dataPlayer.subScoreRow=dataPlayer.rank+dataPlayer.rankLabel+" "+(dataPlayer.rankedFirst?"+"+(data.leaderboard[1]?dataPlayer.score-data.leaderboard[1].score:"0"):dataPlayer.score-data.leaderboard[0].score)+"pts.";
			    	dataPlayer.rankingRow=dataPlayer.score+(data.scoreLimit?"/"+data.scoreLimit:"")+" "+dataPlayer.label;
			    });			    
			},
			rawGivePoints:function(data,playerid,amount,send) {
				if (data.netEnabled&&send) data.broadcastGameModeEvent("rawGivePoints",[playerid,amount]);
				var player=data.players[playerid];
				player.score+=amount;
				if (amount>0) data.playEffect("point");
				if (player.score<0) player.score=0;
				if (data.netMaster&&data.scoreLimit&&(player.score>=data.scoreLimit)) data.endGame();
				data.triggerGameModeEvent("updateLeaderboard",[data]);
				data.triggerGameModeEvent("onScoreUpdated",[data,player]);
			},
			givePoints:function(data,playerid,amount) {
				var player=data.players[playerid];
				data.players.forEach(toplayer=>{
					if (player.team==toplayer.team)
						data.triggerGameModeEvent("rawGivePoints",[data,toplayer.id,amount,true]);
				});
			},
			onDrawHud:function(data,player,ctx,cameraWidth,cameraHeight) {
				data.markerBlink=(data.markerBlink+1)%FPS;
				CANVAS.print(ctx,FONT,player.fontColor,player.cameraRenderX+2,player.cameraRenderY+2,player.scoreRow);
				CANVAS.print(ctx,FONTSMALL,player.rankedFirst?FONTPALETTE.WHITE:player.fontColor,player.cameraRenderX+2,player.cameraRenderY+FONT.tileHeight,player.subScoreRow);
				if (player.marker)
					CANVAS.print(ctx,FONT,data.markerBlink<data.markerBlinkSize?FONTPALETTE.WHITE:player.fontColor,player.cameraRenderX+2,player.cameraRenderY+2,player.marker);
				if (data.netEnabled) {
					var py=player.cameraRenderY+7+FONT.tileHeight;
					data.leaderboard.forEach(player2=>{
						if (player.id!=player2.id) {
							CANVAS.print(ctx,FONTSMALL,player2.dataPlayer.fontColor,player.cameraRenderX+2+data.leaderboardMargin,py,player2.dataPlayer.rankingRow);
							if (player2.dataPlayer.marker)
								CANVAS.print(ctx,FONTSMALL,data.markerBlink<data.markerBlinkSize?FONTPALETTE.WHITE:player2.dataPlayer.fontColor,player.cameraRenderX+2,py,player2.dataPlayer.marker);
							py+=FONTSMALL.tileHeight-1;
						}
					})
				}
			}
		},
		// Variants
		allVsAll:{
			onCreatePlayer:function(data,player) {
				player.team=player.id;
			}
		},
		team:{
			onCreatePlayer:function(data,player) {
				player.team=player.id<2?0:1;
			}
		},
		champion:{
			onCreatePlayer:function(data,player) {
				player.team=player.id==0?0:1;
			}
		},		
		// Game modes
		lastManStanding:{
			onCreatePlayer:function(data,player) {
				player.score=data.startLives;
			},
			onScoreUpdated:function(data,player) {
				if (!player.score) data.kickPlayer(player);
			},
			onDead:function(data,player) {			
				if (data.netMaster)
					data.triggerGameModeEvent("givePoints",[data,player.id,-1]);				
			},
			onFrame:function(data) {
				var teamsAlive={},teamsAliveCount=0;
				data.players.forEach(player=>{
					if ((!player.isDead||(player.score>0))&&!teamsAlive[player.team]) {
						teamsAlive[player.team]=1;
						teamsAliveCount++;
					}
				});	
				if (teamsAliveCount<2) data.endGame();			
			}
		},
		deathMatch:{
			onKillEnemy:function(data,killer,victim) {
				// Kills are always broadcasted, no need to process non-local scores.
				if (data.netMaster) {
					if (killer.isHuman) {
						// If victim human (drone) and by same team
						if (victim.isHuman&&(killer.team==victim.team))
							// Lose points
							data.triggerGameModeEvent("givePoints",[data,killer.id,-1]);
						else
							// Gain point (killed a non human (drone) or other team)
							data.triggerGameModeEvent("givePoints",[data,killer.id,1]);
					} else if (victim.isHuman) {
						// If the killer is not human (drone) and...
						// the victim is a local human...
						// ...the victim loses points
						data.triggerGameModeEvent("givePoints",[data,victim.id,-1]);
					}
				}
			},
			onSuicide:function(data,player) {
				if (data.netMaster)
					data.triggerGameModeEvent("givePoints",[data,player.id,-1]);
			}
		},
		hordeVersus:{
			onPlayerKilledDrone:function(data,drone,fromplayer) {
				// Points given by kills are not rebroadcasted - all players receive the drone kill signal
				if (data.netMaster)
					data.triggerGameModeEvent("givePoints",[data,fromplayer.id,1]);
			}
		},
		hordeCoop:{
			onGameEnd:function(data) {
				var message,good=false;
				if (data.lives<=0) {
					message="GAME OVER";
					data.playAnnouncer("speak_gameover");
				} else {
					message="CLEARED";
					good=true;
					data.playAnnouncer("speak_cleared");
				}
				data.players.forEach(player=>{
					data.playerLog(player,good?data.LOGLEVEL_ENDGAME_GOOD:data.LOGLEVEL_ENDGAME_BAD,message,true);
				});
			},
			onPlayerKilledDrone:function(data,drone,fromplayer) {
				data.playEffect("point");
				data.score++;
				if (data.score<0) data.score=0;				
			},
			onMatchBegin:function(data) {
				data.score=0;
				data.lives=data.startLives;
			},
			onCreatePlayer:function(data,player) {
				player.team=0;
			},
			onDead:function(data,player) {
				data.lives--;
				if (data.lives<=0) {
					data.lives=0;
					data.endGame();
				}
			},
			onDrawHud:function(data,player,ctx,cameraWidth,cameraHeight) {
				CANVAS.print(ctx,FONT,player.fontColor,player.cameraRenderX+2,player.cameraRenderY+2,data.scoreSymbol+data.score);
				CANVAS.print(ctx,FONT,player.fontColor,player.cameraRenderX+2,player.cameraRenderY+FONT.tileHeight+2,LIVES_SYMBOL+data.lives);
				if (data.netEnabled) {
					var py=player.cameraRenderY+13+FONT.tileHeight;
					data.players.forEach(player2=>{
						if (player.id!=player2.id) {
							CANVAS.print(ctx,FONTSMALL,player2.fontColor,player.cameraRenderX+2,py,player2.label);
							py+=FONTSMALL.tileHeight-1;
						}
					})
				}
			}
		},
		hordeTimed:{
			onMatchBegin:function(data) {
				var maxTime=600; // 10 Minutes
				data.droneStartDifficulty=1*(0.25*(data.droneSpeed+1))/data.speedRatio;
				data.droneEndDifficulty=10*(0.25*(data.droneDifficulty+1))/data.speedRatio;
				data.droneSpeed=data.droneStartDifficulty/data.speedRatio;
				data.difficultyPerSecond=(data.droneEndDifficulty-data.droneStartDifficulty)/maxTime;
				data.droneSight=20*(0.25*(data.droneSight+1));
				data.droneSpawnDistance=5;
				data.droneExplodeDistance=1;
				data.droneDamage=QMATH.ceil(data.startHp*1.80*(0.25*(data.droneDamage+1)));
				data.droneDamageRatio=0.5;
				data.droneMaxDistance=1;
				data.droneHealth=QMATH.ceil(data.startHp*2*(0.25*(data.droneHealth+1)));
				data.droneIntensity=QMATH.ceil((10+data.players.length*10)*(0.25*(data.droneIntensity+1)));
				data.droneFloatTime=data.speedRatio;
				data.droneFloatTimer=0;
			},
			onSecondPassed:function(data) {
				if (data.droneSpeed<data.droneEndDifficulty)
					data.droneSpeed+=data.difficultyPerSecond;
			}			
		},
		horde:{
			onCreatePlayer:function(data,player) {
				player.aimedByDrones=[];
			},
			solveNetId:function(data,id) {
				return data.drones[id];
			},			
			onMatchBegin:function(data) {
				data.drones=[];
				data.droneUpdates=[];
				for (var i=0;i<DRONES_MAXCOUNT;i++) {
					var drone={
						id:i,
						radarY:RADAR_DRONE,
						available:true,
						isLocal:data.netMaster?true:false,
						playing:true,
						effectOnHurt:["dronehit"],
						onHitGib:"metal",
						onHitGibsCount:2,
						onKillGib:"metal",
						onKillGibsCount:3,
						painTime:data.PAIN_TIME,
						move:{angle:0,speed:0}
					};
					var sprite=data.RC.prepareSprite({
						visible:false,
						player:drone,
						width:0.7,
						height:0.7,
						textures:SPRITETEXTURES,
						textureX:6,
						aimable:true
					});	
					drone.sprite=sprite;
					data.drones.push(drone);



				}
				data.dronesCount=0;
				data.droneZ=0;
				data.goldDrones=0;
				data.droneRecoil=-1;
				data.droneFloatSize=0.06;
				data.droneAggroTime=data.speedRatio*3;				
			},			
			spawnDrone:function(data,id,x,y,angle,isGold,send) {
				data.dronesCount++;
				if (data.netEnabled&&send) data.broadcastGameModeEvent("spawnDrone",[id,x,y,angle,isGold]);
				var drone=data.drones[id];
				drone.available=false;
				drone.pain=0;
				drone.isGold=isGold,
				drone.label=isGold?"G.Drone":"Drone";
				drone.damageMultiplier=isGold?2:1,
				drone.isDead=false,				
				drone.health=data.droneHealth*(isGold?2:1),
				drone.aggroTimer=0,
				drone.aggroPlayer=0,
				drone.move.speed=data.droneSpeed;
				drone.move.angle=angle;
				drone.sprite.visible=true;
				drone.sprite.x=x;
				drone.sprite.y=y;
				drone.sprite.textureY=isGold?4:3;
				// Sparks are not broadcasted - spawnDrones is received by all players.
				// Teleport sound is not played when playing local multiplayer - too noisy.
				data.addSpark(
					x,y,0,data.SPARKS.teleport,
					data.localPlayer?"teleport":0,
					0,true
				);
				data.shootables.push(drone);
				data.RC.addPreparedSprite(drone.sprite);
			},
			setDroneAggro:function(data,id,playerid,set,send) {				
				if (data.netEnabled&&send) data.broadcastGameModeEvent("setDroneAggro",[id,playerid,set]);				
				var drone=data.drones[id];

				// Unlink aimed player
				var player=drone.aggroPlayer;
				if (player) {
					if (data.radarPolicy>=2) data.removeFromRadar(player,drone);
					var pos=player.aimedByDrones.indexOf(drone);
					if (pos!=1) player.aimedByDrones.splice(pos,1);
				}

				if (set) {
					player=data.players[playerid];
					if (data.radarPolicy>=2) data.addToRadar(player,drone);
					var pos=player.aimedByDrones.indexOf(drone);
					if (pos==1) player.aimedByDrones.push(drone);
					drone.aggroTimer=data.droneAggroTime;

					drone.sprite.textureX=7;
					drone.aggroPlayer=player;
				} else {
					drone.sprite.textureX=6;
					drone.aggroPlayer=0;					
				}
			},
			onSecondPassed:function(data) {
				if (data.netMaster) {
					var qty=QMATH.min(data.droneIntensity,DRONES_MAXCOUNT);
					if (data.dronesCount<qty) {
						var valid;
						for (var i=0;i<10;i++) {
							// 10 attempts
							var spawnpoint=data.mapData.freepoints[QMATH.floor(QMATH.random()*data.mapData.freepoints.length)];
							valid=true;
							for (var j=0;j<data.players.length;j++) {
								var player=data.players[j];
								if (!player.isDead&&TRIGO.getDistance(player.sprite.x,player.sprite.y,spawnpoint.x,spawnpoint.y)<data.droneSpawnDistance) {
									valid=false;
									break;
								}
							}
							if (valid) {
								var isGold=false;
								if (data.goldDrones) {
									data.goldDrones--;
									isGold=true;
								}
								for (var id=0;id<DRONES_MAXCOUNT;id++)
									if (data.drones[id].available) break;
								data.triggerGameModeEvent("spawnDrone",[
									data,
									id,
									spawnpoint.x+0.5,spawnpoint.y+0.5,
									QMATH.random()*QMATH.PI,
									isGold,
									true
								]);
								break;
							}
						}
						if (!valid) console.log("Can't spawn drone...");
					}
				}
			},
			netDroneUpdate:function(data,updates) {
				updates.forEach(update=>{
					var drone=data.drones[update[0]];
					data.predictorPrepare(true,drone);
					drone.sprite.x=update[1];
					drone.sprite.y=update[2];
					drone.updated=1;
					data.predictorPrepare(false,drone);					
				});				
			},
			onFrame:function(data) {
				if (data.droneFloatTimer) data.droneFloatTimer--;
				else data.droneFloatTimer=data.droneFloatTime;
				data.droneZ=QMATH.sin(QMATH.PI*2*data.droneFloatTimer/data.droneFloatTime)*data.droneFloatSize-data.droneFloatSize;

				// Net master moves drones
				var angle,dx,explode;
				data.droneUpdates.length=0;
				for (var i=0;i<DRONES_MAXCOUNT;i++) {
					var drone=data.drones[i];
					if (!drone.available) {
						drone.sprite.vMove=data.droneZ;

						if (drone.pain) {
							drone.pain--;
							drone.sprite.textureX=8;

							// Only master moves drones
							if (data.netMaster) {
								SPRITE.advanceBy(
									drone.sprite,
									drone.move.angle,
									drone.move.speed*data.droneRecoil,
									0,
									data.checkDroneWalkable
								);
							}
						} else {
							if (drone.aggroPlayer) drone.sprite.textureX=7;
							else drone.sprite.textureX=6;

							explode=false;

							// Only master moves drones
							if (data.netMaster) {								
								if (drone.aggroTimer) {
									drone.aggroTimer--;
									var aiming=drone.aggroPlayer;
									dx=TRIGO.getDistance(aiming.sprite.x,aiming.sprite.y,drone.sprite.x,drone.sprite.y);
									if (dx<data.droneExplodeDistance) explode=true;
									else {
										drone.move.angle=TRIGO.getAngleTo(drone.sprite.x,drone.sprite.y,aiming.sprite.x,aiming.sprite.y);
										if (!drone.aggroTimer)
											data.triggerGameModeEvent("setDroneAggro",[data,i,0,false,true]);
									}
								} else {
									var player;
									for (var p=0;p<data.players.length;p++) {
										player=data.players[p];
										if (!player.isDead) {
											dx=TRIGO.getDistance(player.sprite.x,player.sprite.y,drone.sprite.x,drone.sprite.y);
											if (dx<data.droneSight) {
												angle=TRIGO.getAngleTo(drone.sprite.x,drone.sprite.y,player.sprite.x,player.sprite.y);
												if (data.castRay(drone.sprite.x,drone.sprite.y,angle,1,dx,data.checkDroneWalkable).miss) {
													data.triggerGameModeEvent("setDroneAggro",[data,i,player.id,true,true]);
													break;
												}
											}
										}
									}
								}
								
								if (explode) {
									data.triggerGameModeEvent("onDroneKilled",[data,drone,drone]);
									if (data.netEnabled) data.broadcastGameModeEvent("netDroneDestroy",[drone.id]);
								} else {								
									var hit=SPRITE.advanceBy(
										drone.sprite,
										drone.move.angle,
										drone.move.speed,
										0,
										data.checkDroneWalkable
									);
									if (hit) data.bounce(drone.move,hit,1);
								}
							}
						}

													
						if (data.netMaster&&data.netEnabled)
							data.droneUpdates.push([i,drone.sprite.x,drone.sprite.y]);
					}
				}

				if (data.netEnabled)
					if (data.netMaster) {
						if (data.NETPLAY.sendFullData)
							data.broadcastGameModeEvent("netDroneUpdate",[data.droneUpdates]);
					} else {
						// Predict drones missing positions
						data.drones.forEach(drone=>{
							if (!drone.available)
								if (drone.updated) drone.updated=0;
								else data.predictorApply(drone,0,data.checkDroneWalkable);
						})
					}
				
			},

			onDead:function(data,player) {
				player.aimedByDrones.forEach(drone=>{
					drone.aggroTimer=0;
					drone.aggroPlayer=0;
					// Kills are broadcasted, no network needed
					data.triggerGameModeEvent("setDroneAggro",[data,drone.id,0,false]);
				});
				player.aimedByDrones.length=0;
			},
			netDroneDestroy:function(data,droneid) {
				// Triggered by self-destructing drones
				var drone=data.drones[droneid];
				if (!drone.isDead)
					data.triggerGameModeEvent("onDroneKilled",[data,drone]);
				else
					console.warn("Killed drone: but was already dead")
			},
			onDroneKilled:function(data,drone,fromplayer) {
				drone.isDead=1;
				// Kills are broadcasted, no network needed
				data.sprayDamage(
					drone.sprite.x,drone.sprite.y,
					data.droneDamage,
					data.droneMaxDistance,
					data.droneDamageRatio,
					fromplayer||drone,
					DRONE_SYMBOL
				);
				data.addSpark(drone.sprite.x,drone.sprite.y,0,data.SPARKS.explosion,"explosion",0,true);
				data.RC.removeSprite(drone.sprite);
				data.removeShootable(drone);
				data.triggerGameModeEvent("setDroneAggro",[data,drone.id,0,false]);
				drone.available=true;
				drone.sprite.visible=false;
				data.dronesCount--;
				if (fromplayer&&fromplayer.isHuman) data.triggerGameModeEvent("onPlayerKilledDrone",[data,drone,fromplayer]);				
			}
		},
		bloodlust:{
			onMatchBegin:function(data) {
				data.bloodlustPlayer=0;
				data.leaderboardMargin=5;
			},
			onSecondPassed:function(data) {
				if (data.bloodlustPlayer&&(data.bloodlustPlayer.health>0))
					data.bloodlustPlayer.health--;
			},
			setBloodlust:function(data,playerid,send) {
				if (data.netEnabled&&send) data.broadcastGameModeEvent("setBloodlust",[playerid]);
				data.bloodlustPlayer=0;						
				data.players.forEach(player=>{
					if (player.id==playerid) {
						player.marker=LIVES_SYMBOL;
						data.showMarker(player);
					} else {
						player.marker=0;
						data.hideMarker(player);
					}
					data.setDamageMultiplier(player,1,true); // Call already broadcasted, do not rebroadcast
					if (player.id==playerid) data.bloodlustPlayer=player;
				});				
			},
			onRespawn:function(data,player,first) {
				if (player.isLocal&&(player==data.bloodlustPlayer)) {
					data.playAnnouncer("speak_bloodlust");
					data.playerLog(player,data.LOGLEVEL_IMPORTANT_GOOD,"BLOODLUST",true);
					data.setDamageMultiplier(player,4);
				}
			},
			onKillEnemy:function(data,killer,victim) {
				if (data.netMaster&&victim.isHuman)
					data.triggerGameModeEvent("setBloodlust",[data,victim.id,true]);
			},	
			onSuicide:function(data,player) {
				if (data.netMaster&&(player==data.bloodlustPlayer))
					data.triggerGameModeEvent("setBloodlust",[data,-1,true]);
			},
		},
		theOne:{
			assignPerk:function(data,player,perk) {
				switch (perk.id) {
					case 1:{
						player.health=1;
						break;
					}
					case 2:{
						player.health=data.startHp;
						break;
					}
					case 3:{
						player.health=data.startHp*2;
						break;
					}
					case 4:{
						player.health=data.startHp*3;
						break;
					}
					case 5:{
						data.setDamageMultiplier(player,2,true); // Call already broadcasted, do not rebroadcast
						break;
					}
					case 6:{
						data.setDamageMultiplier(player,3,true); // Call already broadcasted, do not rebroadcast
						break;
					}
					case 7:{
						data.setDamageMultiplier(player,4,true); // Call already broadcasted, do not rebroadcast
						break;
					}
					case 8:{
						player.unlimitedAmmo=true;						
						break;
					}
					case 9:{
						player.earnPtsSecond=true;						
						break;
					}
					case 10:{
						player.loseHpSecond=true;
						break;
					}
					case 11:{
						player.sprite.spriteInvisibleLight=0.2;
						player.sprite.spriteInvisibleSpeed=4;
						data.hideMarker(player);
						break;
					}
					case 12:{
						player.radarRange=RADARRANGE_UNLIMITED;
						// If players are always on radar, keep the radar as it is
						if ((data.radarPolicy>=1)&&(data.radarPolicy<3))
							data.players.forEach(player2=>{
								if (player2==player) data.removeFromRadar(player2,player);
								else data.addToRadar(player2,player);
							});	
						break;
					}
					case 13:{
						player.onlyWeapon=perk.weapon;
						if (player.weapon&&(player.weapon!=player.onlyWeapon))
							data.giveWeapon(player,player.onlyWeapon);
						break;
					}
				}
			},
			onMatchBegin:function(data) {
				data.leaderboardMargin=5;
				data.theOnePlayer=0;
			},
			onRespawn:function(data,player,first) {
				data.setDamageMultiplier(player,1);
				player.unlimitedAmmo=false;
				player.earnPtsSecond=false;
				player.loseHpSecond=false;
				player.onlyWeapon=false;
				player.sprite.spriteInvisibleLight=0;
				player.sprite.spriteInvisibleSpeed=0;
				player.radarRange=0;
				if (!first)
					if ((data.radarPolicy>=1)&&(data.radarPolicy<3))
						data.players.forEach(player2=>{ data.removeFromRadar(player2,player); });	
				if (data.theOnePlayer==player) data.theOnePlayer=0;
			},
			onSecondPassed:function(data) {
				if (data.netMaster) {
					if (!data.theOnePlayer) {
						var pool=[];
						data.players.forEach(player=>{
							if (!player.isDead) pool.push(player.id);
						});
						if (pool.length)
							data.triggerGameModeEvent("setTheOne",[data,pool[QMATH.floor(QMATH.random()*pool.length)],true]);
					}
				}
				data.players.forEach(player=>{
					if (!player.isDead) {
						if (data.netMaster&&player.earnPtsSecond)
							data.triggerGameModeEvent("givePoints",[data,player.id,1]);
						if (player.loseHpSecond&&(player.health>0))
							player.health--;
					}
				});
			},
			setTheOne:function(data,playerid,send) {
				if (data.netEnabled&&send) data.broadcastGameModeEvent("setTheOne",[playerid]);
				data.theOnePlayer=0;						
				data.players.forEach(player=>{
					if (player.id==playerid) {
						player.marker=LIVES_SYMBOL;
						data.showMarker(player);
					} else {
						player.marker=0;
						data.hideMarker(player);
					}
					if (player.id==playerid) {
						data.theOnePlayer=player;
						if (player.isLocal) {
							data.playAnnouncer("speak_youaretheone");
							data.playerLog(player,data.LOGLEVEL_IMPORTANT_GOOD,"YOU ARE THE ONE",true);							
						}
					}
				});
				if (data.theOnePlayer) {
					data.triggerGameModeEvent("assignPerk",[data,data.theOnePlayer,data.perk0,true]);
					data.triggerGameModeEvent("assignPerk",[data,data.theOnePlayer,data.perk1,true]);
					data.triggerGameModeEvent("assignPerk",[data,data.theOnePlayer,data.perk2,true]);
				}
			},
			onKillEnemy:function(data,killer,victim) {
				// Kills are always broadcasted, no need to process non-local scores.
				if (killer.isHuman) {
					if (data.netMaster) {
						if (killer==data.theOnePlayer)
							data.triggerGameModeEvent("givePoints",[data,killer.id,1]);
						else if (victim==data.theOnePlayer) {
							data.triggerGameModeEvent("setTheOne",[data,killer.id,true]);
						}
					}
				}			
			},	
			onSuicide:function(data,player) {
				// Unset The One. Will be decided soon by the netMaster
				if (player==data.theOnePlayer) data.theOnePlayer=0;
			},
			onPlayerFire:function(data,player) {
				if (player.unlimitedAmmo) player.ammo+=player.weapon.ammoPerShot;
			},
			onPlayerPickWeapon:function(data,player,weapon) {
				if (player.onlyWeapon) return player.onlyWeapon;
			}
		},
		kingOfTheHill:{
			onCreatePlayer:function(data,player) {
				if (data.radarPolicy>=1) data.addToRadar(player,data.hotspot);
			},
			onSecondPassed:function(data) {
				if (data.netMaster) {
					var prizedTeams={};				
					data.players.forEach(player=>{
						data.hotspots.forEach(hotspot=>{
							if (!player.isDead&&!prizedTeams[player.team]&&(player.tileX==hotspot[0])&&(player.tileY==hotspot[1])) {
								data.triggerGameModeEvent("givePoints",[data,player.id,1]);
								prizedTeams[player.team]=true;
							}					
						});
					});
				}
			}
		},
		captureTheFlag:{
			onMatchBegin:function(data) {
				data.triggerGameModeEvent("setFlagState",[data,0,0,0,0,false]);
				data.leaderboardMargin=5;
			},
			setFlagState:function(data,state,x,y,playerid,send) {
				if (data.netEnabled&&send) data.broadcastGameModeEvent("setFlagState",[state,x,y,playerid]);
				data.playEffect("flagaction");
				var slowdownPlayerId=-1;
				var youlogline,logline,onRadar=false;
				switch (state) {
					// Home
					case 0:{
						delete data.flagOwnedBy;
						data.flag.sprite.visible=true;
						data.flagPickable=true;
						data.flag.sprite.x=data.flagSpawnX;
						data.flag.sprite.y=data.flagSpawnY;							
						data.playAnnouncer("speak_flagback");
						youlogline=logline="Flag is back!";
						onRadar=1;
						break;
					}
					// Owned
					case 1:{
						data.flagOwnedBy=data.players[playerid];
						data.flagPickable=false;
						data.flag.sprite.visible=false; // Shown by frame
						data.playAnnouncer("speak_flagtaken");
						slowdownPlayerId=playerid;
						logline=data.flagOwnedBy.label+" got the flag!";
						youlogline="You got the flag!";
						onRadar=2;
						break;
					}
					// Around
					case 2:{
						delete data.flagOwnedBy;
						data.flag.sprite.visible=true;
						data.flagPickable=true;
						data.flag.sprite.x=x;
						data.flag.sprite.y=y;
						data.playAnnouncer("speak_flaglost");
						youlogline=logline="Flag is lost!";
						data.flagTimer=data.speedRatio*6;
						onRadar=1;
						break;
					}
					// Point scored
					case 3:{
						delete data.flagOwnedBy;
						data.flag.sprite.visible=false;
						data.flagPickable=false;
						data.flagTimer=data.speedRatio*6;
						data.playAnnouncer("speak_pointscored");
						logline=data.players[playerid].label+" scored.";
						youlogline="Point scored!";
						onRadar=0;
						break;
					}
				}
				data.flagState=state;
				data.players.forEach(player=>{
					player.marker=player==data.flagOwnedBy?FLAG_SYMBOL:0;
					player.maxSpeed=player.defaultMovementSpeed*(player.id==slowdownPlayerId?data.flagWeight*0.25:1);
					if (logline&&player.isLocal)
						data.playerLog(player,data.LOGLEVEL_GAMEEVENTS,player.id==playerid?youlogline:logline,true);
					if (data.radarPolicy>=1) {
						if (onRadar==1) {
							data.addToRadar(player,data.flag);
							data.removeFromRadar(player,player.base);
						} else if (onRadar==2) {
							if (player.id==playerid) {
								data.removeFromRadar(player,data.flag);
								data.addToRadar(player,player.base);
							} else {
								data.addToRadar(player,data.flag);
								data.removeFromRadar(player,player.base);
							}
						} else {
							data.removeFromRadar(player,data.flag);
							data.removeFromRadar(player,player.base);
						}
					}
				});
			},			
			onFrame:function(data) {
				if (data.netMaster&&data.flagPickable) {
					for (var i=0;i<data.players.length;i++)
						if (!data.players[i].isDead)
							if (SPRITE.isColliding(data.players[i].sprite,data.flag.sprite)) {
								data.triggerGameModeEvent("setFlagState",[data,1,0,0,i,true]);
								break;
							}
				}

				switch (data.flagState) {
					// Owned
					case 1:{
						var owner=data.flagOwnedBy;
						data.flag.sprite.visible=true;
						data.flag.sprite.x=data.flagOwnedBy.sprite.x+QMATH.cos(-data.flagOwnedBy.sprite.angle)*0.2;
						data.flag.sprite.y=data.flagOwnedBy.sprite.y-QMATH.sin(-data.flagOwnedBy.sprite.angle)*0.2;
						if (data.netMaster&&(owner.tileX==owner.baseX)&&(owner.tileY==owner.baseY)) {
							data.triggerGameModeEvent("givePoints",[data,owner.id,1]);
							data.triggerGameModeEvent("setFlagState",[data,3,0,0,owner.id,true]);
						}
						break;
					}
					// Around
					case 2:{
						data.flagTimer--;
						if (data.flagTimer<data.speedRatio*3) data.flag.sprite.visible=!data.flag.sprite.visible;
						if (data.netMaster&&(data.flagTimer<=0))
							data.triggerGameModeEvent("setFlagState",[data,0,0,0,0,true]);
						break;
					}
					// Point scored
					case 3:{
						if (data.netMaster) {
							data.flagTimer--;
							if (data.flagTimer<=0)
								data.triggerGameModeEvent("setFlagState",[data,0,0,0,0,true]);
						}
						break;
					}
				}
			},
			onDead:function(data,player) {
				if (data.netMaster&&(player==data.flagOwnedBy))
					data.triggerGameModeEvent("setFlagState",[data,2,player.sprite.x,player.sprite.y,0,true]);
			}
		},
		
		// Basic setup
		time:{
			onMatchBegin:function(data) {
				data.time=data.timeLimit;
				data.timeText=TIME_SYMBOL+data.time;
				data.timeWidth=QMATH.floor(CANVAS.pixelStrLen(FONT,data.timeText)/2);
			},
			onCreatePlayer:function(data,player) {
				player.timerX=player.cameraRenderX+QMATH.floor(player.cameraScreenWidth/2);
				player.timerY=player.cameraRenderY+2;
			},
			onSecondPassed:function(data) {
				if (data.timeLimit)
					if (data.time) {
						data.time--;
						if (data.time<11)
							data.playAnnouncer("speak_countdown"+data.time);
						data.timeText=TIME_SYMBOL+data.time;
						data.timeWidth=QMATH.floor(CANVAS.pixelStrLen(FONT,data.timeText)/2);
					} else data.endGame();
			},
			onDrawHud:function(data,player,ctx,cameraWidth,cameraHeight) {
				if (data.timeLimit)
					CANVAS.print(ctx,FONT,player.fontColor,player.timerX-data.timeWidth,player.timerY,data.timeText);
			}
		}
	};

var NETPLAYGAMESETTINGS;
var GameModes=function() {

	const
		DESCRIPTIONCUT_KEYMENU=60;

	function splitLines(text,chars,minlines) {
		text=text.split(" ");
		var out=[],line="";
		text.forEach(word=>{
			if (line.length+word.length+1>chars) {
				out.push(line);
				line="";
			}
			line+=(line.length?" ":"")+word;
		});
		out.push(line);
		while (out.length<minlines) out.push("");
		return out;
	}

	function findSetting(id) {
		for (var i=0;i<GAMESETTINGS.length;i++) {
			if (GAMESETTINGS[i].id==id) return i;
		}
	}

	this.initialize=function() {
		var settingid;

		["perk0","perk1","perk2"].forEach((perkid,idx)=>{
			var perkvalues=GAMESETTINGS[findSetting(perkid)].values;
			GAMEPERKS.forEach((perk,id)=>{
				if (perk.weapons) {
					for (var w in WEAPONS) {
						var onset={};
						onset[perkid]={id:id,weapon:w}
						perkvalues.push({
							label:WEAPONS[w].label+" only",
							onSet:{ settings:onset }
						});
					}
				} else {
					var onset={};
					onset[perkid]={id:id}
					perkvalues.push({
						label:perk.label,
						onSet:{ settings:onset },
						default:perk.default==idx
					});
				}
			})
		})

		settingid=findSetting("map");
		MAPS.forEach((map,id)=>{
			map.descriptionKeymenu=splitLines(map.description||"Not filed in PvP central database.",DESCRIPTIONCUT_KEYMENU,3);
			GAMESETTINGS[settingid].values.push({
				label:map.label,
				default:id==0,
				description:map.descriptionKeymenu,
				onSet:{
					settings:{map:id}
				}
			})
		});

		settingid=findSetting("weapons");
		for (var w in WEAPONS) {
			GAMESETTINGS[settingid].values.push({
				label:WEAPONS[w].label+" only",
				onSet:{
					settings:{onlyWeapon:w}
				}
			});
		}

		NETPLAYGAMESETTINGS=DOM.clone(GAMESETTINGS);
		NETPLAYGAMESETTINGS.forEach(setting=>{
			for (var i=0;i<setting.values.length;i++)
				if (setting.values[i].offlineOnly) {
					setting.values.splice(i,1);
					i--;
				}
		})
	}
}