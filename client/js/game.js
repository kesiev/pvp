function Game() {

	var _DEBUG=false; // Set true for debug & light editor
	var _PACKETS=0;

	const
		PI=QMATH.PI,
		PI2=PI*2,
		PI_2=PI/2,

		// Netplay
		NETEVENT_ABORT=-1,
		NETEVENT_GIVEDAMAGE=1,
		NETEVENT_ADDSPARK=2,
		NETEVENT_ADDBULLET=3,
		NETEVENT_PICKUP=4,
		NETEVENT_PLAYERLOG=5, // Unused by the game ATM
		NETEVENT_OPENDOOR=6,
		NETEVENT_KILLPLAYER=7,
		NETEVENT_ADDSPARKLINE=8,
		NETEVENT_USEDSPAWNPOINT=9,
		NETEVENT_SECONDPASSED=10,
		NETEVENT_GO=11,
		NETEVENT_GAMEMODEEVENT=12,
		NETEVENT_ENDGAME=13,
		NETEVENT_GIVEINVULNERABILITY=14,
		NETEVENT_RESPAWNPLAYER=15,
		NETEVENT_FIRES=16,
		NETEVENT_KICKPLAYER=17,
		NETEVENT_TELEPORTPLAYERAT=18,
		NETEVENT_EXPLODEBULLET=19,
		NETEVENT_SETDAMAGEMULTIPLIER=20,
		
		// Log levels
		LOGLEVEL_WEAPONS=0,
		LOGLEVEL_FRAGS=10,
		LOGLEVEL_PLAYERFRAGS=20,
		LOGLEVEL_GAMEEVENTS=30,
		LOGLEVEL_IMPORTANT_GOOD=100,
		LOGLEVEL_IMPORTANT_BAD=150,
		LOGLEVEL_ENDGAME_GOOD=200,
		LOGLEVEL_ENDGAME_BAD=250,

		// Times
		PLAYERWATCH_TIME=FPS*5,

		// Colors	
		INVULNERABILITY_COLOR=PALETTE.WHITE,
		PAIN_ALPHA=0.7,
		PAIN_COLOR=PALETTE.RED,
		TELEPORT_ALPHA=1,
		TELEPORT_COLOR=PALETTE.GREEN,

		// Audio
		AUDIO_DISTANCE=15,
		AUDIO_NEARDISTANCE=0.2,

		// Sizes
		SPARK_VERTICALRANGE=0.1,
		SPARKPOOL_SIZE=50,
		GIBPOOL_SIZE=20,
		RECOILSIZE=0.10,
		PICKABLE_HEIGHT=-0.3,

		// Vibrations
		VIBRATE_HIT={duration:100,weakMagnitude:0.75,strongMagnitude:0.75},
		VIBRATE_TELEPORT={duration:100,weakMagnitude:0.75,strongMagnitude:0.75},
		VIBRATE_DEATH={duration:500,weakMagnitude:0.75,strongMagnitude:0.75},

		// Tiles
		TILEDEFAULT={blockable:0,walkable:0,droneBlockable:1},

		// Angle
		WEAPONANGLE_RANGE=[-0.05,0.05],

		// Sparks
		SPARKS={
			teleport:{
				id:"teleport",
				textures:SPRITETEXTURES,
				textureX:0,
				textureY:1,
				frames:4,
				speed:0.10
			},
			explosion:{
				id:"explosion",
				textures:SPRITETEXTURES,
				textureX:8,
				textureY:2,
				frames:3,
				speed:0.20
			},
			smoke:{
				id:"smoke",
				textures:SPRITETEXTURES,
				textureX:7,
				textureY:1,
				frames:3,
				speed:0.05
			},
			slowSmoke:{
				id:"slowSmoke",
				textures:SPRITETEXTURES,
				textureX:7,
				textureY:1,
				frames:3,
				speed:0.20
			},
			mud:{
				id:"mud",
				textures:SPRITETEXTURES,
				textureX:3,
				textureY:3,
				frames:3,
				speed:0.05			
			},
			splash:{
				id:"splash",
				textures:SPRITETEXTURES,
				textureX:4,
				textureY:6,
				frames:3,
				speed:0.05			
			},
			track:{
				id:"track",
				textures:SPRITETEXTURES,
				textureX:0,
				textureY:6,
				frames:1,
				speed:5,
				tint:10,
				light:1.2,
				sparkByPlayer:true
			}
		},

		// Bullets
		BULLETS={
			rocket:{
				id:"rocket",
				textures:SPRITETEXTURES,
				textureY:2,
				textureX:0,
				damageRatio:0.5,
				maxDistance:1,
				damage:180,
				speed:8,
				z:0,
				spark:"explosion",
				sound:"explosion",
				spriteFloat:0.1,
				spriteFloatSpeed:5,
				trail:"slowSmoke",
				trailTime:0.1,
				orient:true,
				time:10,
				width:0.2,
				height:0.2,
				safeTimer:0.5,
			},
			grenade:{
				id:"grenade",
				textures:SPRITETEXTURES,
				textureY:5,
				textureX:6,
				damageRatio:0.5,
				maxDistance:1,
				damage:180,
				spark:"explosion",
				sound:"explosion",
				trail:"slowSmoke",
				trailTime:0.1,
				orient:false,
				time:6,
				speed:7.78,
				speedZ:-0.90,
				z:-0.5,
				zGravity:0.24,
				bounciness:1,
				bouncinessZ:0.5,
				floorPosition:0,
				safeTimer:0.5,
				blink:true,
				width:0.4,
				height:0.4
			}
		},

		// Gibs
		GIBS={
			metal:{
				id:"metal",
				time:3,
				textures:SPRITETEXTURES,
				textureY:5,
				textureX:0,
				speedFrom:0.60,
				speedSize:1.20,
				speedZFrom:-0.60,
				speedZSize:-1.20,
				zGravity:0.24,
				bounciness:0.5,
				variants:2,
				textureXFloor:2,
				floorPosition:0.5,
				tint:0
			},
			blood:{
				id:"blood",
				time:6,
				textures:SPRITETEXTURES,
				textureY:5,
				textureX:3,
				speedFrom:0.60,
				speedSize:1.20,
				speedZFrom:-1.80,
				speedZSize:-3.00,
				zGravity:1.20,
				bounciness:0,
				variants:2,
				textureXFloor:5,
				floorPosition:0.5,
				tint:100
			}
		},
		
		// Announcer
		ANNOUNCER={
			speak_youaretheone:ANNOUNCER_GAMEMODEFLOW,
			speak_flagback:ANNOUNCER_GAMEMODEFLOW,
			speak_flaglost:ANNOUNCER_GAMEMODEFLOW,
			speak_flagtaken:ANNOUNCER_GAMEMODEFLOW,
			speak_pointscored:ANNOUNCER_GAMEMODEFLOW,
			speak_bloodlust:ANNOUNCER_GAMEMODEFLOW,

			speak_gameover:ANNOUNCER_MATCHFLOW,
			speak_cleared:ANNOUNCER_MATCHFLOW,
			speak_go:ANNOUNCER_MATCHFLOW,
			speak_ready:ANNOUNCER_MATCHFLOW,
			
			speak_fragno0:ANNOUNCER_KILLS,

			speak_fragyes0:ANNOUNCER_KILLS,
			speak_fragyes1:ANNOUNCER_KILLS,
			speak_fragyes2:ANNOUNCER_KILLS,
			speak_fragyes3:ANNOUNCER_KILLS,
			speak_fragyes4:ANNOUNCER_KILLS,
			speak_fragyes5:ANNOUNCER_KILLS,

			speak_suicide:ANNOUNCER_KILLS,

			speak_machinegun:ANNOUNCER_GAMEPLAY,
			speak_pistol:ANNOUNCER_GAMEPLAY,
			speak_knife:ANNOUNCER_GAMEPLAY,
			speak_rocketlauncher:ANNOUNCER_GAMEPLAY,
			speak_shotgun:ANNOUNCER_GAMEPLAY,
			speak_sniper:ANNOUNCER_GAMEPLAY,
			speak_grenade:ANNOUNCER_GAMEPLAY,

			speak_countdown10:ANNOUNCER_MATCHFLOW,
			speak_countdown9:ANNOUNCER_MATCHFLOW,
			speak_countdown8:ANNOUNCER_MATCHFLOW,
			speak_countdown7:ANNOUNCER_MATCHFLOW,
			speak_countdown6:ANNOUNCER_MATCHFLOW,
			speak_countdown5:ANNOUNCER_MATCHFLOW,
			speak_countdown4:ANNOUNCER_MATCHFLOW,
			speak_countdown3:ANNOUNCER_MATCHFLOW,
			speak_countdown2:ANNOUNCER_MATCHFLOW,
			speak_countdown1:ANNOUNCER_MATCHFLOW,
			speak_countdown0:ANNOUNCER_MATCHFLOW,

			speak_missioncleared:ANNOUNCER_MATCHFLOW,
			speak_youfailed:ANNOUNCER_MATCHFLOW,
			speak_newmission:ANNOUNCER_MATCHFLOW
		},		
		FRAGYESAUDIO=[
			"speak_fragyes0","speak_fragyes1","speak_fragyes2","speak_fragyes3",
			"speak_fragyes4","speak_fragyes5"
		];
		FRAGNOAUDIO=[
			"speak_fragno0"
		];
		FRAGTEXT=[
			"FRAGGED","KILLED","ERASED","DELETED","REMOVED","SCRAPPED"
		];


		// Tile status
		NOTILE={},
		
		// Positions
		READYGOSCALE=3,
		NOTICEY=QMATH.floor(SCREEN_HEIGHT-FONT.tileHeight*1.5),
		NOTICETEXTY=NOTICEY+QMATH.floor(FONT.tileHeight/2),

		// Angles
		ANGLE_UP=0,
		ANGLE_DOWN=PI*2*(4/8),
		ANGLE_DOWNLEFT=PI*2*(3/8),
		ANGLE_DOWNRIGHT=PI*2*(5/8),
		ANGLE_LEFT=PI*2*(2/8),
		ANGLE_RIGHT=PI*2*(6/8),
		ANGLE_UPLEFT=PI*2*(1/8),
		ANGLE_UPRIGHT=PI*2*(7/8);

	// Second times
	var READY_TIME,
		GO_TIME,
		RESPAWN_TIME,
		DEAD_TIME,
		OBJECTRESPAWN_TIME,
		LOG_TIME,
		MESSAGE_TIME,
		ABORT_TIME,
		PAIN_TIME,
		FALL_TIME,
		TELEPORT_TIME,

		// Sub-second times
		FASTBLINK_TIME,
		BLINK_TIME,
		DAMAGE_TIME,
		FIRINGSPRITE_TIME,
		STEPPING_TIME,
		RECOIL_TIME,
	 	WEAPON_WAVESPEED,

	 	// Forces
	 	SPEEDZ_LIMIT;

	// ---
	// Settings
	var settings,reticleColor;
	// Map attributes
	var spawnpoints,obstacles,blockable,logicMap,mapWidth,mapHeight;
	// Game mode attributes
	var gameMode,gameModeCount,gameModeData;
	// Timers and triggers
	var gameTimer,readyGoTimer,triggers,teleports,gameState,abortTimer;
	// Game speed
	var speedRatio,doorOpeningSpeed,maxMovementSpeed;
	// Analog controller
	var analogDeadZone,analogSensitivity,analogRange;
	// Movement ratio
	var analogRotationSpeed,buttonRotationSpeed,mouseSensitivity,weaponAngleSpeed;
	// Player-related data
	var players,playersCount,localPlayersCount,player,shootables,freepoints,drawPanel,drawPanelX,drawPanelY,drawPanelWidth,drawPanelHeight;
	var vibrateOnWeapon,vibrateOnHit,vibrateOnTeleport;
	// Announcer
	var lastAnnounce,lastAnnouncePriority,quitNotice;
	// Sparks pool
	var sparksPool,sparkLast;
	// Gibs pool
	var gibsPool,gibLast;
	// Bullets index
	var bulletIndex;
	// Timer
	var secondTimer;
	// Netplay
	var netEnabled,localPlayer,localPlayerId;
	// Music/audio
	var music,effectsDistance;

	// (Debug only)
	function roundNumber(num) {
		return QMATH.floor(num*1000)/1000;
	}

	// Misc
	function getRandomString(set) {
		return set[QMATH.floor(QMATH.random()*set.length)];
	}

	// Audio
	function playMusic() {
		if (music) AUDIOPLAYER.playMusic(music.id);
	}
	function stopMusic() {
		AUDIOPLAYER.stopMusic();
	}
	function playEffect(id,x,y) {
		if (settings.sfx) {
			if ((x===undefined)||!localPlayer) AUDIOPLAYER.play(id);
			else {
				var distance=TRIGO.getDistance(
					localPlayer.sprite.x,localPlayer.sprite.y,
					x,y
				);
				if (
					(distance<AUDIO_DISTANCE)&&( // Is in the hearing range and...
						AUDIOPLAYER.audioIsEnded(id)|| // It's not playing or...
						(distance<AUDIO_NEARDISTANCE)|| // Is near the player or...
						(distance<effectsDistance[id])|| // Is nearer the already playing sound...
						(effectsDistance[id]-distance<AUDIO_NEARDISTANCE) // The same audio is played nearby
					)
				) {
					effectsDistance[id]=distance;
					AUDIOPLAYER.play(id,false,AUDIOPLAYER.configuration.volume*(1-distance/AUDIO_DISTANCE));
				}
			}
		}
	}
	function playAnnouncer(id) {
		if (lastAnnounce&&AUDIOPLAYER.audioIsEnded(lastAnnounce)) lastAnnounce=0;
		var priority=ANNOUNCER[id];
		if (priority>settings.announcer&&(!lastAnnounce||(lastAnnouncePriority<=priority))) {
			AUDIOPLAYER.stop(lastAnnounce);
			AUDIOPLAYER.play(id);
			lastAnnounce=id;
			lastAnnouncePriority=priority;
		}
	}

	// Logic-only raycaster
	function castRay(x,y,angle,step,maxdistance,collisionchecker) {
		var px=x,
			py=y,
			gx=-step*QMATH.cos_(angle),
			gy=-step*QMATH.sin_(angle),
			dist=0;

		while (dist<maxdistance) {
			if (collisionchecker(x,y)) return {x:px,y:py};
			else {
				px=x;
				py=y;
				x+=gx;
				y+=gy;
				dist+=step;
			}
		}

		return {x:px,y:py,miss:true};
	}

	// Game flow specific

	function createNetId(object) {
		if (object==undefined) return -1;
		else if (object.isHuman) return object.id;
		else return object.id+10;
	}
	function solveNetId(id) {
		if (id==-1) return undefined;
		else if (id<10) return players[id];
		else return triggerGameModeEvent("solveNetId",[gameModeData,id-10]);
	}

	function sendGameModeEvent(toplayer,event,args) {
		if (netEnabled) NETPLAY.sendEventTo(toplayer,[NETEVENT_GAMEMODEEVENT,event,args])
	}
	function broadcastGameModeEvent(event,args) {
		if (netEnabled) NETPLAY.broadcastEvent([NETEVENT_GAMEMODEEVENT,event,args]);
	}
	function triggerGameModeEvent(event,args) {
		var ret,mode;
		for (var i=0;i<gameModeCount;i++) {
			mode=gameMode[i];
			if (GAMEMODEMODULES[mode][event])
				ret=ret||GAMEMODEMODULES[mode][event].apply(this,args);
		}
		return ret;
	}
	function setGameMode(ids,defaults) {
		gameModeData={
			players:players,
			shootables:shootables,
			freepoints:freepoints,
			netEnabled:netEnabled,
			localPlayer:localPlayer,
			netMaster:!netEnabled||NETPLAY.isMaster,
			gameRunning:true,
			
			// Constants
			speedRatio:speedRatio,
			FPS:FPS,
			PAIN_TIME:PAIN_TIME,
			LOGLEVEL_WEAPONS:LOGLEVEL_WEAPONS,
			LOGLEVEL_FRAGS:LOGLEVEL_FRAGS,
			LOGLEVEL_PLAYERFRAGS:LOGLEVEL_PLAYERFRAGS,
			LOGLEVEL_GAMEEVENTS:LOGLEVEL_GAMEEVENTS,
			LOGLEVEL_IMPORTANT_GOOD:LOGLEVEL_IMPORTANT_GOOD,
			LOGLEVEL_IMPORTANT_BAD:LOGLEVEL_IMPORTANT_BAD,
			LOGLEVEL_ENDGAME_GOOD:LOGLEVEL_ENDGAME_GOOD,
			LOGLEVEL_ENDGAME_BAD:LOGLEVEL_ENDGAME_BAD,
			FONT:FONT,
			LIGHTS:LIGHTS,
			SPARKS:SPARKS,
			GIBS:GIBS,
			DEAD_TIME:DEAD_TIME,
			NETPLAY:NETPLAY,
			RC:RC,

			// Methods functions
			predictorPrepare:predictorPrepare,
			predictorApply:predictorApply,
			setDamageMultiplier:setDamageMultiplier,
			giveInvulnerability:giveInvulnerability,
			showMarker:showMarker,
			hideMarker:hideMarker,
			solveNetId:solveNetId,
			createNetId:createNetId,
			kickPlayer:kickPlayer,
			endGame:endGame,
			sendGameModeEvent:sendGameModeEvent,
			broadcastGameModeEvent:broadcastGameModeEvent,
			openDoor:openDoor,
			giveWeapon:giveWeapon,
			removeWeapon:removeWeapon,
			removeFromRadar:removeFromRadar,
			addToRadar:addToRadar,
			castRay:castRay,
			bounce:bounce,
			addSpark:addSpark,
			sprayDamage:sprayDamage,
			giveDamage:giveDamage,
			removeShootable:removeShootable,
			checkObstacles:checkObstacles,
			checkBlocksFloor:checkBlocksFloor,
			checkDroneWalkable:checkDroneWalkable,
			checkBlocks:checkBlocks,
			checkWalls:checkWalls,
			playEffect:playEffect,
			playAnnouncer:playAnnouncer,
			triggerGameModeEvent:triggerGameModeEvent,
			playerLog:playerLog
		};
		for (var k in defaults)
			gameModeData[k]=defaults[k];
		gameMode=ids;
		gameModeCount=gameMode.length;
		triggerGameModeEvent("onGameModeSet",[gameModeData]);	
	}	

	// Map specific
	function getLogicTile(wallX,wallY) {
		if (!((wallX<0)||(wallX>=mapWidth)||(wallY<0)||(wallY>=mapHeight)))
			return logicMap[(wallY*mapWidth)+wallX];
		else
			return TILEDEFAULT;
	}
	
	// Game-entity specific
	function addBullet(x,y,angle,moveby,bullettype,fromplayer,symbol,bulletuid,nonet) {
		if (!bulletuid) bulletuid=localPlayerId+QMATH.floor(QMATH.random()*1000000);
		if (netEnabled&&!nonet)
			NETPLAY.broadcastEvent([
				NETEVENT_ADDBULLET,
				x,y,angle,
				moveby,
				bullettype.id,
				createNetId(fromplayer),
				symbol,
				bulletuid
			]);
		var sprite=RC.addSprite({
			x:x,
			y:y,
			width:bullettype.width,
			height:bullettype.height,
			angle:angle,
			textures:bullettype.textures,
			textureX:bullettype.textureX,
			textureY:bullettype.textureY,
			vMove:bullettype.z,
			orient:bullettype.orient,
			spriteTint:LIGHTS.primary.tint,
			spriteFloat:bullettype.spriteFloat,
			spriteFloatSpeed:bullettype.spriteFloatSpeed
		});
		SPRITE.moveBy(sprite,angle,moveby);
		var bulletLife=QMATH.ceil(bullettype.time*speedRatio);
		var trigger={
			type:TRIGGERS.bullet,
			fromplayer:fromplayer,
			bulletUid:bulletuid,
			symbol:symbol,

			sprite:sprite,

			// On-explosion event
			spark:bullettype.spark,

			// On-explosion damage
			safeTimer:QMATH.ceil(bullettype.safeTimer*speedRatio),
			damage:bullettype.damage,
			damageRatio:bullettype.damageRatio,
			maxDistance:bullettype.maxDistance,

			// Bullet life
			exploded:false,
			nonet:false,
			timer:bulletLife,

			// Blinking
			textureX:bullettype.textureX,
			blinkTime:bullettype.blink?QMATH.ceil(bulletLife/8):0,
			blinkFrame:0,

			// Bullet trails
			trailTimer:0,
			trail:settings.trails?SPARKS[bullettype.trail]:0,
			trailTime:settings.trails?QMATH.ceil(bullettype.trailTime*speedRatio):0,

			// Bullet movement
			z:bullettype.z,
			speed:bullettype.speed/speedRatio,
			angle:angle,
			
			// Physics-based movement
			isMoving:true,
			speedZ:bullettype.speedZ/speedRatio,
			zGravity:bullettype.zGravity/speedRatio,
			bounciness:bullettype.bounciness,
			bouncinessZ:bullettype.bouncinessZ,
			floorPosition:bullettype.floorPosition
		}
		triggers.push(trigger);
		bulletIndex[bulletuid]=trigger;
	}	
	function addGib(x,y,z,gibtype,qty) {
		while (qty--) {
			var gib=gibsPool[gibLast],
				sprite=gib.sprite,
				trigger=gib.trigger,
				textureXvariant=gibtype.textureX+QMATH.floor(QMATH.random()*gibtype.variants);
				
			sprite.x=x;
			sprite.y=y;
			sprite.vMove=z;
			sprite.textures=gibtype.textures;
			sprite.textureX=textureXvariant;
			sprite.textureY=gibtype.textureY;
			sprite.tint=gibtype.tint;

			trigger.timer=QMATH.ceil(gibtype.time*speedRatio);
			trigger.isMoving=true;
			trigger.textureX=textureXvariant;
			trigger.angle=PI2*QMATH.random();
			trigger.speed=(gibtype.speedFrom+QMATH.random()*gibtype.speedSize)/speedRatio;
			trigger.speedZ=(gibtype.speedZFrom+QMATH.random()*gibtype.speedZSize)/speedRatio;
			trigger.zGravity=gibtype.zGravity/speedRatio;
			trigger.bounciness=gibtype.bounciness;
			trigger.textureXFloor=gibtype.textureXFloor;
			trigger.floorPosition=gibtype.floorPosition;
			trigger.frames=gibtype.frames;
			gibLast=(gibLast+1)%GIBPOOL_SIZE;
			RC.addPreparedSprite(sprite);
			triggers.push(trigger);
		}		
	}
	function addSpark(x,y,vmove,sparktype,sound,fromplayer,nonet) {
		if (netEnabled&&!nonet) NETPLAY.broadcastEvent([NETEVENT_ADDSPARK,x,y,vmove,sparktype.id,sound,createNetId(fromplayer)]);
		if (sound) playEffect(sound,x,y);
		var spark=sparksPool[sparkLast],
			sprite=spark.sprite,
			trigger=spark.trigger,
			textureX=sparktype.textureX;
		if (sparktype.sparkByPlayer&&fromplayer) textureX+=fromplayer.id;
		sprite.x=x;
		sprite.y=y;
		sprite.vMove=vmove;
		sprite.hideFromCamera=fromplayer?fromplayer.id:-1;
		sprite.textures=sparktype.textures;
		sprite.textureX=textureX;
		sprite.textureY=sparktype.textureY;
		sprite.spriteTint=sparktype.tint;
		sprite.spriteLight=sparktype.light;
		trigger.speed=QMATH.ceil(speedRatio*sparktype.speed);
		trigger.frames=sparktype.frames;
		trigger.timer=0;
		trigger.textureX=textureX;
		sparkLast=(sparkLast+1)%SPARKPOOL_SIZE;
		RC.addPreparedSprite(sprite);
		triggers.push(trigger);
		return sprite;
	}
	function addSparkLine(x1,y1,x2,y2,count,sparktype,nonet) {
		if (netEnabled&&!nonet) NETPLAY.broadcastEvent([NETEVENT_ADDSPARKLINE,x1,y1,x2,y2,count,sparktype.id]);		
		var gx=(x2-x1)/count,
			gy=(y2-y1)/count;

		for (var i=0;i<count;i++) {
			addSpark(x1,y1,0,sparktype,0,0,true);
			x1+=gx;
			y1+=gy;
		}
	}
	function sprayDamage(x,y,damage,maxdistance,damageratio,fromplayer,symbol) {
		var missed=true;
		shootables.forEach(player=>{
			if (player.playing&&!player.isDead) {
				var distance=TRIGO.getDistance(x,y,player.sprite.x,player.sprite.y);
				if (distance<maxdistance) {
					missed=false; 
					var playerdamage=QMATH.ceil(damage*damageratio/(distance||1));
					if (playerdamage>damage) playerdamage=damage;
					if (player.isLocal)
						giveDamage(fromplayer,player,playerdamage,symbol);
				}
			}
		});
		return missed;
	}
	function removeShootable(obj) {
		var pos=shootables.indexOf(obj);
		if (pos!=-1) shootables.splice(pos,1);
	}

	// Collision checkers
	function checkBlocks(x,y) {
		var tile=getLogicTile(QMATH.floor(x),QMATH.floor(y));
		return tile.blockable||(tile.isDoor&&(tile.isOpen!=1));
	}
	function checkBlocksFloor(x,y) {
		var tile=getLogicTile(QMATH.floor(x),QMATH.floor(y));
		return !tile.walkable||tile.blockable||(tile.isDoor&&tile.isOpen!=1);
	}
	function checkDroneWalkable(x,y) {
		var tile=getLogicTile(QMATH.floor(x),QMATH.floor(y));
		return tile.droneBlockable||(tile.isDoor&&tile.isOpen!=1);
	}
	function checkWalls(x,y) {
		var tile=getLogicTile(QMATH.floor(x),QMATH.floor(y));
		return tile.bulletable||(tile.isDoor&&(tile.isOpen!=1));
	}
	function checkObstacles(sprite,dx,dy) {
		for (var i=0;i<obstacles.length;i++)
			if (SPRITE.isCollidingDelta(sprite,dx,dy,obstacles[i]))
				return true;
	}
	function checkExplodables(sprite,dx,dy,except) {
		// Shootables...
		for (var i=0;i<shootables.length;i++)
			if ((shootables[i]!=except)&&shootables[i].playing&&!shootables[i].isDead&&SPRITE.isCollidingDelta(sprite,dx,dy,shootables[i].sprite))
				return true;
		// Obstacles...
		for (var i=0;i<obstacles.length;i++)
			if ((obstacles[i]!=except)&&SPRITE.isCollidingDelta(sprite,dx,dy,obstacles[i]))
				return true;
	}

	// Netplay position predictor (to reduce lag effects)
	function predictorPrepare(phase,player) {
		if (phase) {
			if (player._x1!==undefined) {
				player._x2=player._x1;
				player._y2=player._y1;
				// Predict 1 second of missing packets
				player._predictions=FPS;
			}
			player._x1=player.sprite.x;
			player._y1=player.sprite.y;	
		}
	}

	function predictorApply(player,checkObstacles,checkWalls) {
		// Position prediction
		if (player._predictions) {
			player._predictions--;
			var
				distance10=TRIGO.getDistance(
					player._x1,player._y1,
					player.sprite.x,player.sprite.y
				)
			if (distance10&&(distance10>PREDICTOR_DISTANCETOLLERANCE[0])&&(distance10<PREDICTOR_DISTANCETOLLERANCE[1])) {
				var
					angle10=TRIGO.getAngleTo(
						player._x1,player._y1,
						player.sprite.x,player.sprite.y
					),
					angle21=TRIGO.getAngleTo(
						player._x2,player._y2,
						player._x1,player._y1
					),
					deltaangle=TRIGO.getShortestAngle(angle21,angle10);
				if ((deltaangle<PREDICTOR_ANGLETOLLERANCE[0])||(deltaangle>PREDICTOR_ANGLETOLLERANCE[1]))
					deltaangle=0;
				player._x2=player._x1;
				player._y2=player._y1;
				player._x1=player.sprite.x;
				player._y1=player.sprite.y;	
				SPRITE.advanceBy(player.sprite,angle10+deltaangle,distance10*NETPLAY.predictorStrength,checkObstacles,checkWalls);
			}
		}
	}

	// Player specific
	function applyShake(player,strength,time) {
		if (settings.cameraShake)
			if (!player.shakeTime||(strength>player.shakeStrength)) {
				player.shakeTime=time;
				player.shakeStrength=strength;
			}
	}
	function showMarker(player) {
		player.sprite.spriteOverlayX=5;
		player.sprite.spriteOverlayY=6;
		player.sprite.spriteOverlayBlink=8;
	}
	function hideMarker(player) {
		player.sprite.spriteOverlayX=0;
		player.sprite.spriteOverlayY=0;
		player.sprite.spriteOverlayBlink=0;
	}
	function pickup(triggerid,nonet) {
		if (netEnabled&&!nonet) NETPLAY.broadcastEvent([NETEVENT_PICKUP,triggerid]);
		var trigger=triggers[triggerid];
		playEffect(trigger.effect,trigger.sprite.x,trigger.sprite.y);
		trigger.sprite.visible=false;
		if (trigger.shadow) trigger.shadow.visible=false;
		trigger.spawning=true;
		trigger.wait=OBJECTRESPAWN_TIME;
	}
	function addToRadar(player,object) {
		if (player.radar) {
			var pos=player.radar.indexOf(object);
			if (pos==-1) player.radar.push(object);		
		}
	}
	function removeFromRadar(player,object) {
		if (player.radar) {
			var pos=player.radar.indexOf(object);
			if (pos!=-1) player.radar.splice(pos,1);
		}
	}
	function playerLog(player,priority,line,nonet) {
		if (netEnabled&&!nonet&&!player.isLocal) NETPLAY.sendEventTo(player,[NETEVENT_PLAYERLOG,createNetId(player),priority,line]);
		if (priority>99) {
			var isBad=(priority==LOGLEVEL_IMPORTANT_BAD)||(priority==LOGLEVEL_ENDGAME_BAD);
			if (isBad) {
				player.messageColor1=FONTPALETTE.BLACK;
				player.messageColor2=FONTPALETTE.BLACK;
				if (player.isLocal&&settings.guiParticles) player.particles.addParticlesCluster(player.particles.maxParticles,player.messageX,player.messageY,0,1,PALETTE.BLACK);
			}
			else {
				player.messageColor1=player.fontColor;
				player.messageColor2=FONTPALETTE.WHITE;
				if (player.isLocal&&settings.guiParticles) player.particles.addParticlesCluster(player.particles.maxParticles,player.messageX,player.messageY,0,0,player.color);
			}
			player.message=line;
			player.messageTimer=0;
			player.messageVolatile=priority<200;
		} else if (!player.log||(player.logPriority<=priority)) {
			player.logPriority=priority;
			player.log=line;
			player.logTimer=0;
		}
	}
	function giveWeapon(player,weapon,mute,nonet) {
		removeWeapon(player);
		var trigger=triggerGameModeEvent("onPlayerPickWeapon",[gameModeData,player,weapon]);
		if (trigger!==undefined) weapon=trigger;
		var weapon=WEAPONS[weapon];
		if (weapon) { 
			player.camera.setAiming(weapon.aimWidth,weapon.aimHeight,10);
			player.weaponX=QMATH.floor(player.cameraRenderX+player.cameraScreenWidth*weapon.weaponX-(player.weaponWidth/2));
			player.weapon=weapon;
			player.ammo=weapon.defaultAmmo;
			player.weaponAnimate=false;
			playerLog(player,LOGLEVEL_WEAPONS,weapon.label,true);
			if (!mute) playAnnouncer(weapon.announce);		
		}
	}
	function removeWeapon(player) {
		player.camera.setAiming(1,1,1);
		player.weapon=0;
		player.weaponReloading=0;
		player.ammo=0;
		player.weaponFrame=0;
		player.weaponAnimate=false;
		player.weaponAnimationFrame=0;		
		player.weaponSpriteAnimation=0;
	}
	function teleportPlayerAt(player,x,y,angle,nonet) {
		if (netEnabled&&!nonet) NETPLAY.broadcastEvent([NETEVENT_TELEPORTPLAYERAT,createNetId(player),x,y,angle]);
		addSpark(player.sprite.x,player.sprite.y,0,SPARKS.teleport,"teleport");
		addSpark(x,y,0,SPARKS.teleport,0);
		// Teleport is broadcasted and so invulnerability - no need to rebreoadcast
		giveInvulnerability(player,TELEPORTINVULNERABILITY_TIME,true);
		player.sprite.z=player.defaultZ;
		player.sprite.x=x;
		player.sprite.y=y;
		player.floating=false;
		player.walking=false;
		player.sprite.pitch=player.defaultPitch;
		player.sprite.friction=player.defaultFriction;
		SPRITE.setAngle(player.sprite,angle);
		if (player.isLocal) {
			player.teleportTimer=TELEPORT_TIME;
			player.move.speed=0;
			player.move.angle=0;
			player.current.angle=0;
			player.current.speed=0;
		}
	}

	function removePlayer(player) {
		player.playing=false;
		player.watchPlayerId=-1;
		player.watchPlayer=0;
		player.watchTime=0;
		player.watchOn=0;
		player.sprite.visible=false;	
		players.forEach((player2,id)=>{ removeFromRadar(player2,player); });	
	}

	function kickPlayer(player,nonet) {
		// Kick a player. Kills it, make it disappear and never respawn
		if (netEnabled&&!nonet) NETPLAY.broadcastEvent([NETEVENT_KICKPLAYER,createNetId(player)]);
		if (!player.isKicked) {
			player.isKicked=true;
			if (gameModeData.gameRunning) {
				playerLog(player,LOGLEVEL_ENDGAME_BAD,"YOU'RE OUT",true);
				player.damageAnimation=0;
				player.isDead=1;
				player.fallTimer=FALL_TIME;
				player.sprite.pitch=0;
			}
		}
	}

	function giveInvulnerability(player,time,nonet) {
		// Broadcast the event
		if (netEnabled&&!nonet) NETPLAY.broadcastEvent([NETEVENT_GIVEINVULNERABILITY,createNetId(player),time]);
		player.invulnerability=time;
	}

	function setDamageMultiplier(player,multiplier,nonet) {
		// Broadcast the event
		if (netEnabled&&!nonet) NETPLAY.broadcastEvent([NETEVENT_SETDAMAGEMULTIPLIER,createNetId(player),multiplier]);
		player.damageMultiplier=multiplier;
	}

	function fires(player,time,weapon,nonet) {

		// Broadcast the event
		if (netEnabled&&!nonet) NETPLAY.broadcastEvent([NETEVENT_FIRES,createNetId(player),time,weapon.id]);

		player.weaponSpriteAnimation=time;
		playEffect(weapon.sound,player.sprite.x,player.sprite.y);
	}

	function killPlayer(player,fromplayer,symbol,nonet) {

		if (!player.isDead) {

			// Broadcast the event
			if (netEnabled&&!nonet) NETPLAY.broadcastEvent([
				NETEVENT_KILLPLAYER,
				createNetId(player),
				createNetId(fromplayer),
				symbol
			]);

			// Graphics effects & feedback (immediate and the same on all clients - not broadcasted)
			if (settings.gibs&&player.onKillGib)
				addGib(player.sprite.x,player.sprite.y,player.sprite.vMove,GIBS[player.onKillGib],player.onKillGibsCount);
			player.health=0;
			player.damageAnimation=0;
			player.isDead=1;
			player.fallTimer=FALL_TIME;
			player.sprite.pitch=0;
			
			if (player.effectOnDie) playEffect(player.effectOnDie[QMATH.floor(QMATH.random()*player.effectOnDie.length)],player.sprite.x,player.sprite.y);
			
			// Notify (local only since kills are always broadcasted)
			var isFrag=fromplayer&&(!fromplayer.isHuman||!player.isHuman||(fromplayer.id!=player.id));
			players.forEach(player2=>{
				if (player2.isLocal) {
					if (player2==player) {
						// Notifying the local player
						if (isFrag) {
							playAnnouncer(getRandomString(FRAGNOAUDIO));
							playerLog(player2,LOGLEVEL_PLAYERFRAGS,fromplayer.label+" "+symbol+" You",true);
						} else {
							playAnnouncer("speak_suicide");
							playerLog(player2,LOGLEVEL_PLAYERFRAGS,SUICIDE_SYMBOL+" Suicided "+SUICIDE_SYMBOL,true);
						}
					} else if (player2==fromplayer) {
						// Notify the killer
						if (player.isHuman) {
							if (localPlayer) playAnnouncer(getRandomString(FRAGYESAUDIO));
							playerLog(player2,LOGLEVEL_IMPORTANT_GOOD,getRandomString(FRAGTEXT)+" "+player.label,true);
						}
						else
							playerLog(player2,LOGLEVEL_PLAYERFRAGS,FRAG_SYMBOL+" "+player.label,true);
					} else {
						// Notify other players
						if (isFrag)
							playerLog(player2,LOGLEVEL_FRAGS,fromplayer.label+" "+symbol+" "+player.label,true);
						else
							playerLog(player2,LOGLEVEL_FRAGS,player.label+" "+SUICIDE_SYMBOL,true);
					}
				}
			});

			if (player.isHuman) {

				// Killed a human player
				if (player.isLocal) {
					if (vibrateOnHit&&player.controller) CONTROLS.vibrate(player.controller,VIBRATE_DEATH);
					removeWeapon(player);
				}

				if (isFrag) {					
					// Events happen on all clients
					player.killedBy=fromplayer&&fromplayer.isHuman?fromplayer:0;
					triggerGameModeEvent("onKillEnemy",[gameModeData,fromplayer,player]);
					triggerGameModeEvent("onKilledByEnemy",[gameModeData,player,fromplayer]);
				} else {
					player.killedBy=0;
					triggerGameModeEvent("onSuicide",[gameModeData,player]);				
				}
				triggerGameModeEvent("onDead",[gameModeData,player]);
			} else
				triggerGameModeEvent("onDroneKilled",[gameModeData,player,fromplayer]);
		}

	}

	function giveDamage(fromplayer,player,amount,symbol,nonet) {

		if (!player.invulnerability&&!player.isDead) {

			// Broadcast the event
			if (netEnabled&&!nonet)
				NETPLAY.broadcastEvent([
					NETEVENT_GIVEDAMAGE,
					createNetId(fromplayer),
					createNetId(player),
					amount,
					symbol
				]);

			// Graphics effects & feedback (immediate and the same on all clients - not broadcasted)
			triggerGameModeEvent("onDamaged",[gameModeData,player,amount]);
			player.pain=player.painTime;
			if (settings.gibs&&player.onHitGib)
				addGib(player.sprite.x,player.sprite.y,player.sprite.vMove,GIBS[player.onHitGib],player.onHitGibsCount);
			player.damageAnimation=DAMAGE_TIME;

			// Game logic (only on local players)
			// Killplayer will be eventually broadcasted by the player taking the damage.
			if (player.isLocal) {
				if (fromplayer) amount=QMATH.ceil(gameModeData.damagePercent*amount*fromplayer.damageMultiplier);
				player.health-=amount;
				if (player.health<=0)
					killPlayer(player,fromplayer,symbol);
				else {
					if (vibrateOnHit&&player.controller) CONTROLS.vibrate(player.controller,VIBRATE_HIT);
					if (player.effectOnHurt) playEffect(player.effectOnHurt[QMATH.floor(QMATH.random()*player.effectOnHurt.length)],player.sprite.x,player.sprite.y);
					if (settings.recoilOnHurt) player.recoilTimer=4*(amount>gameModeData.startHp?RECOIL_TIME:QMATH.ceil(RECOIL_TIME*(amount/gameModeData.startHp)));					
				}
			} else				
				if (player.effectOnHurt) playEffect(player.effectOnHurt[QMATH.floor(QMATH.random()*player.effectOnHurt.length)],player.sprite.x,player.sprite.y);

		}
	}

	function resetSpawnpointsBag() {
		gameModeData.spawnpointsBag.length=0;
		for (var i=0;i<spawnpoints.length;i++)
			gameModeData.spawnpointsBag.push(i);
	}

	function removeFromSpawnpointsBag(spawnId) {
		var pos=gameModeData.spawnpointsBag.indexOf(spawnId);
		if (pos!=-1) gameModeData.spawnpointsBag.splice(pos,1);
	}

	function respawnPlayer(player,x,y,angle,first,nonet) {

		var waitRespawn=false;

		// Decide spawnpoint
		if (x==-1) {
			// Except for the first respawn, net players will decide the spawnpoint by they own. Let the client wait...
			if (!first&&!player.isLocal) {
				x=0;
				y=0;
				angle=0;
				waitRespawn=true;
			} else {
				var spawnId,spawnpoint;

				// Spawnpoint selection - first respawn is always at player base
				switch (first?0:gameModeData.respawnPolicy) {
					case 0:{ // Player base
						spawnId=player.id;
						break;
					}
					case 1:{ // Randomly (with bag system)
						if (gameModeData.spawnpointsBag.length==0) resetSpawnpointsBag();
						var spawnId=gameModeData.spawnpointsBag[QMATH.floor(QMATH.random()*gameModeData.spawnpointsBag.length)];
						if (netEnabled) NETPLAY.broadcastEvent([NETEVENT_USEDSPAWNPOINT,spawnId]);
						break;
					}
				}

				// Spawnpoint removal
				switch (gameModeData.respawnPolicy) {
					case 1:{ // Randomly (with bag system)
						removeFromSpawnpointsBag(spawnId);
						break;
					}
				}

				// Apply spawnpoint
				spawnpoint=spawnpoints[spawnId].sprite;
				x=spawnpoint.x;
				y=spawnpoint.y;
				angle=spawnpoint.angle;
				if (netEnabled&&!nonet) NETPLAY.broadcastEvent([NETEVENT_RESPAWNPLAYER,createNetId(player),x,y,angle,first]);
			}
		}

		// Sprite logic (Local & Net)
		player.waitRespawn=waitRespawn;
		player.isDead=0;
		player.killedBy=0;		
		player.damageAnimation=0;
		player.floating=false;
		player.walking=false;
		player.sprite.orient=true;
		player.sprite.aimable=true;
		player.sprite.visible=true;
		player.sprite.x=x;
		player.sprite.y=y;
		SPRITE.setAngle(player.sprite,angle);
		player.tileX=QMATH.floor(player.sprite.x);
		player.tileY=QMATH.floor(player.sprite.y);
		player.tile=NOTILE;
		giveInvulnerability(player,RESPAWN_TIME,true);	

		// HUD elements (Local only)
		if (player.isLocal) {
			// Damage multiplier is hard-synched by the player			
			setDamageMultiplier(player,1);
			player.fallTimer=0;
			player.dustTimer=0;
			player.health=gameModeData.startHp;
			player.pain=0;
			player.recoilTimer=0;
			// Weapon position
			player.weaponAngle=0;
			player.weaponWave=0;
			player.weaponWaveRatio=0;
			player.aimPercent=0;
			player.shakeTime=0;
			player.shakeStrength=0;
			// Move settings
			player.move={speed:0,angle:0};
			player.current={speed:0,angle:0};
			player.apply={speed:0,angle:0};
			player.defaultMovementSpeed=maxMovementSpeed;
			player.maxSpeed=maxMovementSpeed;
			player.cameraLight=0;
			player.cameraLightRamp=0;
			player.sprite.z=player.defaultZ;
			player.sprite.pitch=player.defaultPitch;
			player.sprite.friction=player.defaultFriction;
			// Camera
			player.camera.setLight(player.cameraLight);
			player.camera.setPosX(player.sprite.x);
			player.camera.setPosY(player.sprite.y);
			player.camera.setPitch(player.sprite.pitch);
			player.camera.setAngleRot(player.sprite.angle);			
			removeWeapon(player);
		}

		triggerGameModeEvent("onRespawn",[gameModeData,player,first]);
	}
	function sumVector(from,tox,angle,force,maxspeed) {
		var dx= force * QMATH.cos_(angle) + from.speed * QMATH.cos_(from.angle);
		var dy= force * QMATH.sin_(angle) + from.speed * QMATH.sin_(from.angle);

		tox.angle=QMATH.atan2(dy,dx);
		tox.speed=QMATH.sqrt( dx*dx + dy*dy );

		if (tox.speed>maxspeed) tox.speed=maxspeed;
		if (tox.speed<-maxspeed) tox.speed=-maxspeed;
	}

	function bounce(from,hit,bounciness) {
		var dx= QMATH.cos_(from.angle)*(hit&1?-1:1);
		var dy= QMATH.sin_(from.angle)*(hit&2?-1:1);
		from.angle=QMATH.atan2(dy,dx);
		from.speed*=bounciness;
	}
	// Weapon specific
	function weaponCanHit(sprite,weapon,target) {
		var distance=TRIGO.getDistance(
			sprite.x,sprite.y,
			target.x,target.y
		);
		var angle=QMATH.abs(TRIGO.getShortestAngle(
			TRIGO.getAngleTo(
				sprite.x,sprite.y,
				target.x,target.y
			),
			sprite.angle
		));
		return angle<weapon.angle*(weapon.distanceRatio/distance);
	}

	// Doors
	function openDoor(coord,nonet) {
		if (netEnabled&&!nonet) NETPLAY.broadcastEvent([NETEVENT_OPENDOOR,coord]);
		var tile=getLogicTile(coord[0],coord[1]);
		if (tile.isDoor) {
			if (tile.isBusy) {
				delete tile.trigger.wait;
				delete tile.trigger.status;
			} else {
				playEffect("door",coord[0],coord[1]);
				var trigger={type:TRIGGERS.openDoor,tile:tile,coord:coord,tile:tile,x:coord[0]+0.5,y:coord[1]+0.5,hWidth:0.5,hHeight:0.5};
				triggers.push(trigger);
				tile.isBusy=true;
				tile.trigger=trigger;
			}
		}
	}

	// Game flow
	function endGame(nonet) {
		if (netEnabled&&!nonet) NETPLAY.broadcastEvent([NETEVENT_ENDGAME]);
		gameModeData.gameRunning=false;
	}

	function abortGame() {
		if (gameState<100) {
			gameModeData.gameRunning=false;
			gameState=200;
			TRANSITION.end({goBackTo:gameModeData.goBackTo});				
		}
	}

	this.initialize=function() {};
	this.show=function(gamesettings) {
		settings=gamesettings.settings;

		TRANSITION.start();
		secondTimer=FPS;
		netEnabled=NETPLAY.isEnabled;
		abortTimer=0;
		gameState=0;
		gameTimer=0;

		// Game speed unaware
		ABORT_TIME=FPS*3;

		// Prepare game timings
		speedRatio=QMATH.ceil(FPS/((settings.gameSpeed+1)*0.23));

		// Second times
		READY_TIME=FPS*2;
		readyGoTimer=READY_TIME;
		GO_TIME=FPS;
		RESPAWN_TIME=FPS*3;
		DEAD_TIME=FPS*2;
		OBJECTRESPAWN_TIME=speedRatio*5;
		LOG_TIME=FPS*2;
		MESSAGE_TIME=FPS*1.5;
		MESSAGEZOOM_TIME=QMATH.ceil(MESSAGE_TIME*0.1);
		PAIN_TIME=FPS;
		TELEPORT_TIME=FPS;
		TELEPORTINVULNERABILITY_TIME=speedRatio;

		// Sub-second times
		FALL_TIME=QMATH.ceil(DEAD_TIME/2);
		FASTBLINK_TIME=QMATH.ceil(FPS/25);
		BLINK_TIME=QMATH.ceil(FPS/16);
		DAMAGE_TIME=QMATH.ceil(FPS/4);
		FIRINGSPRITE_TIME=QMATH.ceil(speedRatio/4);
		STEPPING_TIME=QMATH.ceil(speedRatio/2);
		RECOIL_TIME=QMATH.ceil(speedRatio/3);	
		WEAPON_WAVESPEED=PI*1.6/speedRatio;	

		// Speeds
		var doorOpeningTime=speedRatio*3;
		maxMovementSpeed=5/speedRatio;
		doorOpeningSpeed=1.50/speedRatio;
		weaponAngleSpeed=WEAPONANGLE_RANGE[1]/speedRatio*2;
		SPEEDZ_LIMIT=1.50/speedRatio;

		// Colors
		reticleColor=settings.reticleColor?PALETTE[PALETTEINDEX[settings.reticleColor-1]]:0;

		// Controls
		analogRotationSpeed=PI*((settings.analogRotationSpeed+1)*0.1)/speedRatio;
		buttonRotationSpeed=PI*((settings.buttonRotationSpeed+1)*0.1)/speedRatio;
		mouseSensitivity=0.0004*(settings.mouseSensitivity+1);

		// Setup players
		players=DOM.clone(gamesettings.players);
		playersCount=players.length;

		localPlayersCount=0;
		players.forEach((player,id)=>{
			if (player.isLocal) {
				localPlayersCount++;
				localPlayer=player;
				localPlayerId="P"+id+"_";
			}
		});

		if (localPlayersCount!=1) localPlayer=0;

		shootables=[];
		var cameraWidth=localPlayersCount>2?HSCREEN_WIDTH:SCREEN_WIDTH;
		var cameraHeight=localPlayersCount==1?SCREEN_HEIGHT:HSCREEN_HEIGHT;
		waveHeight=QMATH.ceil(localPlayersCount>2?HSCREEN_WIDTH/64:HSCREEN_WIDTH/32);
		waveWidth=QMATH.ceil(localPlayersCount>2?HSCREEN_HEIGHT/66:HSCREEN_HEIGHT/40);
		switch (localPlayersCount) {
			case 1:{
				messageScale=2.3;
				break;
			}
			case 2:{
				messageScale=1.80;
				break;
			}
			default:{
				messageScale=1.3;
			}
		}

		var planeY=localPlayersCount==2?1.32:0.66;

		quitNotice="Hold \""+CONTROLS.buttonToLabel(CONTROLTYPE_KEYBOARD,INPUTTYPE_KEY,CONTROLSSETTINGS.KEYBOARD.systemCancel)+"\" key or cancel button to quit"

		// Prepare game mode
		setGameMode(gamesettings.modules,settings);
		gameModeData.aimRatio=0.15+(settings.slowDown*0.1);
		gameModeData.doorOpeningTime=doorOpeningTime;
		gameModeData.spawnpointsBag=[];
		gameModeData.radarDistance=(settings.radarDistance+1)*5;
		gameModeData.radarAngle=0;
		
		// Prepare sound effects
		lastAnnounce=0;
		effectsDistance={};

		// Prepare music
		switch (settings.music) {
			case 0:{
				music=0;
				break;
			}
			case 1:{
				music=SONGS[QMATH.floor(QMATH.random()*SONGS.length)];
				break;
			}
			default:{
				music=SONGS[settings.music-2];
				break;
			}
		}

		// Prepare controllers
		analogDeadZone=settings.analogDeadZone*0.1;
		var analogSensitivity=(settings.analogRange+1)*0.1;
		analogRange=analogSensitivity-analogDeadZone;
		if (analogRange<0) analogRange=0;

		vibrateOnTeleport=settings.vibrationMode==0;
		vibrateOnWeapon=settings.vibrationMode==0;
		vibrateOnHit=settings.vibrationMode>=0;

		// Prepare bullets index
		bulletIndex={};

		// Load map
		var loadedData=MAPLOADER.load(
			settings.map,
			RC,players,gameModeData
		);
		gameModeData.mapData=loadedData;
		gameModeData.hotspots=loadedData.hotspots;
		logicMap=loadedData.logicMap;
		mapWidth=loadedData.mapWidth;
		mapHeight=loadedData.mapHeight;
		obstacles=loadedData.obstacles;
		teleports=loadedData.teleports;
		triggers=loadedData.triggers;
		spawnpoints=loadedData.spawnpoints;
		freepoints=loadedData.freepoints;
		resetSpawnpointsBag();

		// Reset sparks pool
		sparksPool=[];
		sparkLast=0;
		for (var x=0;x<SPARKPOOL_SIZE;x++) {
			var sprite=RC.prepareSprite({
				spriteTint:LIGHTS.secondary.tint
			});
			sparksPool.push({
				sprite:sprite,
				trigger:{
					type:TRIGGERS.spark,
					sprite:sprite
				}
			});
		}

		// Reset gibs pool
		gibsPool=[];
		gibLast=0;
		for (var x=0;x<GIBPOOL_SIZE;x++) {
			var sprite=RC.prepareSprite({
				spriteTint:LIGHTS.secondary.tint,
				width:0.1,
				height:0.1,
				spriteTint:LIGHTS.primary.tint
			});
			gibsPool.push({
				sprite:sprite,
				trigger:{
					type:TRIGGERS.gibs,
					sprite:sprite
				}
			});
		}

		// Initialize player
		var lastLocalPlayer=0;
		players.forEach((player,id)=>{

			shootables.push(player);
			player.id=id;
			player.isKicked=false;
			player.score=0;
			player.isHuman=true;
			player.playing=true;
			player.onHitGib="blood";
			player.onHitGibsCount=2;
			player.onKillGib="blood";
			player.onKillGibsCount=5;
			player.radarY=RADAR_PLAYER;
			player.base=spawnpoints[player.id];
			player.aimPercent=0;
			player.shakeTime=0;
			player.shakeStrength=0;
			player.painTime=PAIN_TIME;
			player.baseX=QMATH.floor(player.base.sprite.x);
			player.baseY=QMATH.floor(player.base.sprite.y);
			
			// Sounds
			player.effectOnDie=["die"];
			player.effectOnHurt=["hit0","hit1","hit2","hit3","hit4"];

			// Labels & colors
			for (var k in PLAYERSDATA[id])
				if (player[k]==undefined) player[k]=PLAYERSDATA[id][k];

			// Sprite
			player.sprite=RC.addSprite({
				player:player,
				textures:player.textures,
				textureX:2,
				textureY:1,
				hideFromCamera:id,
				spriteTint:LIGHTS.player.tint,
				spriteLight:LIGHTS.player.light,
				visible:false
			});	


			// Interface details (Local only)
			if (player.isLocal) {

				// General
				player.radar=[];
				player.lastTeleport=0;

				// Commands
				player.fireButton="fire";
				player.actionButton="action";
				// Movement
				player.defaultZ=0;
				player.defaultPitch=0;
				player.defaultFriction=player.friction;
				player.friction=0.7;

				// Camera
				player.camera=new RC.Camera({
					w:cameraWidth,
					h:cameraHeight,
					planeY:planeY,
					id:id
				});
				player.cameraScreenWidth=cameraWidth;
				player.cameraScreenHeight=cameraHeight;

				// Camera position on screen
				player.cameraRenderY=(lastLocalPlayer%2)*player.cameraScreenHeight;
				player.cameraRenderX=QMATH.floor(lastLocalPlayer/2)*player.cameraScreenWidth;

				// Log & messages positions
				player.logX=player.cameraRenderX+QMATH.floor(player.cameraScreenWidth/2);
				player.logY=player.cameraRenderY+player.cameraScreenHeight-2-QMATH.floor(FONT.tileHeight/2);

				// Log & messages positions
				player.watchX=player.cameraRenderX+QMATH.floor(player.cameraScreenWidth/2);
				player.watchY=player.cameraRenderY+player.cameraScreenHeight-FONT.tileHeight*2-2;

				player.messageX=player.cameraRenderX+QMATH.floor(player.cameraScreenWidth/2);
				player.messageY=player.cameraRenderY+QMATH.floor(player.cameraScreenHeight*0.29);
				player.messageScale=messageScale;

				// Camera related sizes
				player.fallHeight=0.4;		
				player.reticleX=QMATH.floor(player.cameraRenderX+player.cameraScreenWidth/2)-1;
				player.reticleY=QMATH.floor(player.cameraRenderY+player.cameraScreenHeight/2)-1;
				player.particles=new Particles(localPlayersCount>2?20:40,player.cameraRenderX,player.cameraRenderY,cameraWidth,cameraHeight);

				// Radar
				player.radarCX=QMATH.floor(player.cameraRenderX+(player.cameraScreenWidth/2))-4;
				player.radarCY=QMATH.floor(player.cameraRenderY+(player.cameraScreenHeight/2))-4;
				player.radarSize=QMATH.floor(QMATH.min(player.cameraScreenWidth,player.cameraScreenHeight)*0.3);

				// Weapon
				var weaponScale=QMATH.floor(QMATH.min(player.cameraScreenWidth/WEAPONSSPRITES.tileWidth,player.cameraScreenHeight/WEAPONSSPRITES.tileHeight));
				player.weaponWidth=WEAPONSSPRITES.tileWidth*weaponScale;
				player.weaponHeight=WEAPONSSPRITES.tileHeight*weaponScale;
				player.weaponY=player.cameraRenderY+player.cameraScreenHeight-player.weaponHeight+weaponScale;
				player.weaponAngle=0;
				player.weaponTilt=cameraHeight;
				player.aimMovement=QMATH.ceil(cameraHeight/15);

				lastLocalPlayer++;

			}

			respawnPlayer(player,-1,-1,-1,true);
			triggerGameModeEvent("onCreatePlayer",[gameModeData,player]);

		});

		if (settings.radarPolicy>=3)
			players.forEach((player,id)=>{
				players.forEach((player2,id2)=>{
					if (player2.id!=id) addToRadar(player2,player);
				});
			});


		// If 3-players game draw a black panel on the 4th space
		drawPanel=localPlayersCount==3;
		drawPanelX=cameraWidth;
		drawPanelY=cameraHeight;
		drawPanelWidth=cameraWidth;
		drawPanelHeight=cameraHeight;
		
		// Initialize game mode
		triggerGameModeEvent("onMatchBegin",[gameModeData]);

		if (_DEBUG) RC.showLightsEditor(PALETTE,RAYCASTER_DEFAULTS);
	}

	function manageLogic() {		
		if (gameModeData.gameRunning) {
			for (var i=0;i<triggers.length;i++) {
				var trigger=triggers[i];
				triggerAlive=true;
				if (trigger.sequence) {
					var working=true;
					while (working) {
						if (!trigger.sequenceTimer) {
							if (trigger.currentActionId===undefined)
								trigger.currentActionId=0;
							else
								trigger.currentActionId=(trigger.currentActionId+1)%trigger.sequence.length;
							trigger.currentAction=trigger.sequence[trigger.currentActionId];
							trigger.sequenceTimer=trigger.currentAction.time||0;
						} else trigger.sequenceTimer--;
						switch (trigger.currentAction.type) {
							case TRIGGERSEQUENCE_WAIT:{
								working=false;
								break;
							}
							case TRIGGERSEQUENCE_MOVE:{
								trigger.sprite.x-=trigger.currentAction.dx;
								trigger.sprite.y-=trigger.currentAction.dy;
								trigger.sprite.vMove+=trigger.currentAction.dz;
								if (trigger.shadow) {
									trigger.shadow.x-=trigger.currentAction.dx;
									trigger.shadow.y-=trigger.currentAction.dy;
								}
								working=false;
								break;
							}
							case TRIGGERSEQUENCE_GOTO:{
								trigger.currentActionId=trigger.currentAction.goto-1;
								break;
							}
							case TRIGGERSEQUENCE_SET:{
								for (var k in trigger.currentAction.attributes)
									trigger.sprite[k]=trigger.currentAction.attributes[k];
								break;
							}
							case TRIGGERSEQUENCE_ADDSPARK:{
								// No network spawn since each client is running the sequence
								addSpark(trigger.sprite.x,trigger.sprite.y,0,SPARKS[trigger.currentAction.spark],0,false,true);
								break;
							}
							default:{
								working=false;
							}
						}
					}
				}
				switch (trigger.type) {
					case TRIGGERS.gibs:{
						if (trigger.timer) {
							trigger.timer--;
							if (trigger.isMoving) {
								var hit=SPRITE.advanceBy(trigger.sprite,trigger.angle,trigger.speed,0,checkBlocks);
								if (hit) bounce(trigger,hit,trigger.bounciness);							
								trigger.sprite.vMove+=trigger.speedZ;
								if (trigger.sprite.vMove>trigger.floorPosition) {
									trigger.sprite.vMove=trigger.floorPosition;
									trigger.sprite.textureX=trigger.textureXFloor;
									if (QMATH.abs(trigger.speedZ)<SPEEDZ_LIMIT) trigger.isMoving=false;
									else trigger.speedZ*=-trigger.bounciness;
								} else {
									trigger.speedZ+=trigger.zGravity;
									trigger.sprite.textureX=trigger.textureX;
								}
							}
						} else {
							RC.removeSprite(trigger.sprite);
							triggerAlive=false;
						}
						break;
					}
					case TRIGGERS.bullet:{

						// Visual effects
						trigger.timer--;
						if (trigger.trail&&trigger.isMoving) {
							trigger.trailTimer++;
							if (trigger.trailTimer>=trigger.trailTime) {
								// No network spawn since each client is running the bullet
								addSpark(trigger.sprite.x,trigger.sprite.y,trigger.sprite.vMove-trigger.z,trigger.trail,0,false,true);
								trigger.trailTimer=0;
							}
						}

						if (trigger.blinkTime) {
							trigger.blinkTime--;
							if (!trigger.blinkTime) {
								trigger.blinkFrame=(trigger.blinkFrame+1)%2;
								trigger.sprite.textureX=trigger.textureX+trigger.blinkFrame;
								trigger.blinkTime=QMATH.ceil(trigger.timer/8);
							}
						}

						// Movement / Logic

						if (!trigger.exploded) {
							if (trigger.isMoving) {
								var hit=SPRITE.advanceBy(trigger.sprite,trigger.angle,trigger.speed,0,checkBlocks);
								if (trigger.speedZ) {
									if (hit) bounce(trigger,hit,trigger.bounciness);							
									trigger.sprite.vMove+=trigger.speedZ;
									if (trigger.sprite.vMove>trigger.floorPosition) {
										trigger.sprite.vMove=trigger.floorPosition;
										if (QMATH.abs(trigger.speedZ)<SPEEDZ_LIMIT) trigger.isMoving=false;
										else trigger.speedZ*=-trigger.bouncinessZ;
									} else trigger.speedZ+=trigger.zGravity;
								} else
									trigger.exploded=hit;
							}
							if (!trigger.exploded) {
								if (trigger.safeTimer) trigger.safeTimer--;
								trigger.exploded=checkExplodables(trigger.sprite,0,0,trigger.safeTimer?trigger.fromplayer:0);
							}
						}

						if (trigger.exploded||(trigger.timer<=0)) {

							// Network damage is disabled since the rocket exists in all game clients
							var missed=sprayDamage(trigger.sprite.x,trigger.sprite.y,trigger.damage,trigger.maxDistance,trigger.damageRatio,trigger.fromplayer,trigger.symbol,true);
							if (missed&&trigger.fromplayer&&trigger.fromplayer.isLocal&&trigger.fromplayer.isHuman) triggerGameModeEvent("onPlayerMissed",[gameModeData,trigger.fromplayer]);
							triggerAlive=false;
							// Rockets explodes just before the walls
							if (!trigger.speedZ) SPRITE.moveBy(trigger.sprite,trigger.sprite.angle,-0.5);
							// No network spawn since each client is running the sequence
							addSpark(trigger.sprite.x,trigger.sprite.y,0,SPARKS[trigger.spark],"explosion",false,true);
							RC.removeSprite(trigger.sprite);
							if (netEnabled&&!trigger.nonet) NETPLAY.broadcastEvent([NETEVENT_EXPLODEBULLET,trigger.bulletUid]);
							delete bulletIndex[trigger.bulletUid];
						}
						break;
					}
					case TRIGGERS.projectile:{
						if (trigger.sprite.visible&&(trigger.sprite.vMove>PICKABLE_HEIGHT))
							for (var j=0;j<playersCount;j++) {
								if (!players[j].fake&&!players[j].isDead&&SPRITE.isColliding(players[j].sprite,trigger.sprite)) {
									giveDamage(0,players[j],trigger.damage,SUICIDE_SYMBOL);
									// Network spawn for spark on collision to give other players feedback since projectile sequence may be out of sync.
									addSpark(trigger.sprite.x,trigger.sprite.y,trigger.sprite.vMove,SPARKS[trigger.projectileSpark],trigger.projectileEffect);
									trigger.sprite.visible=false;									
									break;
								}
							}
						break;
					}
					case TRIGGERS.spark:{
						trigger.timer++;
						if (trigger.timer>=trigger.frames*trigger.speed) {
							triggerAlive=false;
							RC.removeSprite(trigger.sprite);
						} else
							trigger.sprite.textureX=trigger.textureX+QMATH.floor(trigger.timer/trigger.speed);
						break;
					}
					case TRIGGERS.openDoor:{
						if (trigger.wait) trigger.wait--; else {
							switch (trigger.status) {
								case 2:{
									var open=trigger.tile.mapTile[POS_open];
									if (open>0) {
										open-=doorOpeningSpeed;
										if (open<0) open=0;
									} else {
										trigger.tile.isOpen=false;
										trigger.tile.isBusy=false;
										triggerAlive=false;
										delete trigger.tile.trigger;
									}
									trigger.tile.mapTile[POS_open]=open;
									break;
								}
								case 1:{
									var close=true;
									for (var p=0;p<playersCount;p++) {
										player=players[p];
										if (SPRITE.isColliding(player.sprite,trigger))
											close=false;
									};
									if (close) trigger.status=2;
									break;
								}
								default:{
									var open=trigger.tile.mapTile[POS_open];
									if (open<1) {
										open+=doorOpeningSpeed;
										if (open>1) open=1;
										trigger.tile.mapTile[POS_open]=open;
									} else {
										trigger.tile.isOpen=true;
										trigger.status=1;
										trigger.wait=gameModeData.doorOpeningTime;
									}
								}
							}
						}
						break;
					}
					case TRIGGERS.pickObject:{
						if (trigger.wait) trigger.wait--; else {
							var colliding=0;
							if (trigger.sprite.vMove>PICKABLE_HEIGHT)
								for (var p=0;p<playersCount;p++) {
									player=players[p];
									if (!player.fake&&!player.isDead&&SPRITE.isColliding(player.sprite,trigger.sprite)) {
										colliding=player;
										break;
									}
								};
							if (trigger.spawning) {
								if (!colliding) trigger.spawning=false;
							} else {
								if (colliding) {
									if (trigger.mod.weapon)
										giveWeapon(colliding,trigger.mod.weapon);
									pickup(i);
								} else {
									trigger.sprite.visible=true;
									if (trigger.shadow) trigger.shadow.visible=true;
								}
							}
						}
						break;
					}
				}
				if (!triggerAlive) {
					triggers.splice(i,1);
					i--;
				}
			}
		} else if (!gameModeData.gameClosed) {
			readyGoTimer=0;
			gameState=100;
			gameModeData.gameClosed=true;
			triggerGameModeEvent("onGameEnd",[gameModeData,players]);
		}

		for (var p=0;p<playersCount;p++) {
			player=players[p];
			var camera=player.camera;

			if (player.playing) {
				var
					sprite=player.sprite,
					weapon=player.weapon,
					zoomIn=0,
					shakeX=0,
					shakeY=0;
				
				// Misc animations (Local only)
				if (player.isLocal) {
					if (player.cameraLight>0.01) player.cameraLight*=player.cameraLightRamp;
					else player.cameraLight=0;
					if (player.recoilTimer) player.recoilTimer--;

					player.particles.frame();
				}

				// Dead animation (Local & net)
				if (player.isDead) {
					var deadFrame=QMATH.floor((player.isDead-1)/3);
					player.pain=PAIN_TIME;
					if (player.fallTimer) {
						player.fallTimer--;
						sprite.z=player.fallHeight-(player.fallTimer/FALL_TIME*player.fallHeight);
					}
					if (player.killedBy)
						SPRITE.setAngle(player.sprite,TRIGO.getAngleTo(
							player.sprite.x,player.sprite.y,
							player.killedBy.sprite.x,player.killedBy.sprite.y
						));
					sprite.aimable=false;
					sprite.orient=false;
					sprite.textureY=6;
					if (deadFrame<5) sprite.textureX=deadFrame;
					player.isDead++;
					if (player.isDead>DEAD_TIME)
						if (player.isKicked) removePlayer(player);
						else if (gameModeData.gameRunning) respawnPlayer(player,-1,-1,-1);
				}

				// Logic
				if (!player.isDead) {

					// Run game only on player not waiting respawn
					if (!player.waitRespawn) {
						if (gameModeData.gameRunning) {
							
							// Controls (Local plugged controller only)
							var control=GAMECONTROLS[player.controller];
							if (control) {

								var
									walking=0,									
									slowDown=control[player.actionButton]>0?gameModeData.aimRatio:1;
								
								zoomIn=weapon&&(slowDown<1)?weapon.aimSpeed:0;

								if (weapon&&player.ammo&&!player.weaponReloading)
									if ((weapon.canHoldTrigger&&(control[player.fireButton]>0))||(control[player.fireButton]==1)) {
										var frontx=sprite.x-QMATH.cos(-sprite.angle)*0.8;
										var fronty=sprite.y+QMATH.sin(-sprite.angle)*0.8;
										if (weapon.fireSpark) addSpark(frontx,fronty,0,SPARKS[weapon.fireSpark],0);
										if (weapon.shakeTime) applyShake(player,weapon.shakeStrength,QMATH.ceil(weapon.shakeTime*FPS));
										if (vibrateOnWeapon&&weapon.rumble) CONTROLS.vibrate(player.controller,weapon.rumble);
										if (settings.flashes) {
											player.cameraLight=weapon.cameraLight;
											player.cameraLightRamp=weapon.cameraLightRamp;
										}									
										if (weapon.isRay) {
											var missed=true;
											var bullets=weapon.smokeCount;
											var aimables=weapon.aimCount;
											for (var j=camera.aiming.length-1;j>=0;j--) { // Nearest targets first
												var target=camera.aiming[j];
												if (weaponCanHit(sprite,weapon,target)) {
													missed=false;
													var distance=TRIGO.getDistance(
														sprite.x,sprite.y,
														target.x,target.y
													);
													var damage=QMATH.ceil(weapon.damage*weapon.damageRatio/distance);
													if (damage>weapon.damage) damage=weapon.damage;
													if (settings.trails&&weapon.bulletTrail) addSparkLine(frontx,fronty,target.x,target.y,weapon.bulletTrail,SPARKS[weapon.bulletTrailSpark]);
													giveDamage(player,target.player,damage,weapon.fragSymbol);
													aimables--;
													bullets--;
													if (!aimables) break;
												}
											};
											for (var i=0;i<bullets;i++) {
												var ray=castRay(sprite.x,sprite.y,sprite.angle+weapon.angle-(QMATH.random()*weapon.angle*2),0.2,10,checkWalls);
												if (settings.trails&&weapon.bulletTrail)
													addSparkLine(frontx,fronty,ray.x,ray.y,weapon.bulletTrail,SPARKS[weapon.bulletTrailSpark]);
												else if (!ray.miss)
													addSpark(ray.x,ray.y,SPARK_VERTICALRANGE-(QMATH.random()*SPARK_VERTICALRANGE*2),SPARKS.smoke,0);
											}
											if (missed) triggerGameModeEvent("onPlayerMissed",[gameModeData,player]);
										} if (weapon.isBullet)
											addBullet(sprite.x,sprite.y,sprite.angle,sprite.width*2,BULLETS[weapon.bullet],player,weapon.fragSymbol);
										else if (weapon.isMelee)
											shootables.forEach(shootable=>{
												if ((shootable!=player)&&!shootable.isDead&&(TRIGO.getDistance(frontx,fronty,shootable.sprite.x,shootable.sprite.y)<weapon.distance))
													giveDamage(player,shootable,weapon.damage,weapon.fragSymbol);
											});
										player.recoilTimer=QMATH.ceil(RECOIL_TIME*weapon.recoil);										
										player.weaponAnimate=true;
										player.weaponAnimationFrame=0;
										player.weaponFrame=0;
										player.weaponReloading=QMATH.ceil(weapon.reloadTime*speedRatio);
										player.weaponSpriteAnimationSpeed=QMATH.ceil(weapon.spriteAnimationSpeed*speedRatio);
										player.weaponSpriteAnimationFrames=QMATH.ceil(weapon.spriteAnimationFrames*speedRatio)
										player.ammo-=weapon.ammoPerShot;
										fires(player,FIRINGSPRITE_TIME,weapon);
										triggerGameModeEvent("onPlayerFire",[gameModeData,player]);
										if (player.ammo<=0) player.ammo=0;
									}
								if (control[player.actionButton]==1) {
									var coord=SPRITE.getTileInFront(sprite);
									var tile=getLogicTile(coord[0],coord[1]);
									if (tile.isDoor) {
										var block=triggerGameModeEvent("onPlayerOpenDoor",[gameModeData,player,coord[0],coord[1]]);
										if (!(tile.isBusy||block))
											openDoor(coord);
									}
								}							
								// Then move

								var strafing=control.strafe>0;
								var rotation=0;

								if (!strafing) {
									if (control.rotateRight>0) rotation=-buttonRotationSpeed;
									if (control.rotateLeft>0) rotation=buttonRotationSpeed;									
								}
								if (control.rotateAxis) {
									var len=control.rotateAxis[0];
									if (QMATH.abs(len)>analogDeadZone) {
										rotation=-((len-analogDeadZone)/analogRange)*analogRotationSpeed;
										if (rotation>analogRotationSpeed) rotation=analogRotationSpeed;
										if (rotation<-analogRotationSpeed) rotation=-analogRotationSpeed;										
									}
								}

								if (control.moveAxis) {
									var len=QMATH.sqrt( (control.moveAxis[1]*control.moveAxis[1]) + (control.moveAxis[0]*control.moveAxis[0]) );
									if (len>analogDeadZone) {
										walking=1;								
										player.move.speed=((len-analogDeadZone)/analogRange)*player.maxSpeed*slowDown;
										if (player.move.speed>player.maxSpeed) player.move.speed=player.maxSpeed;
										player.move.angle=QMATH.atan2(-control.moveAxis[0],-control.moveAxis[1])+sprite.angle;
									}
								}

								if (control.aimPointer)
									rotation=-control.aimPointer[0]*mouseSensitivity;									
								
								if (rotation) SPRITE.rotateBy(sprite,rotation*slowDown);

								var strafeUp=strafing?control.moveForward>0:control.strafeForward>0,
									strafeDown=strafing?control.moveBackward>0:control.strafeBackward>0,
									strafeRight=strafing?control.rotateRight>0:control.strafeRight>0,
									strafeLeft=strafing?control.rotateLeft>0:control.strafeLeft>0;

								if (strafeUp||strafeDown||strafeLeft||strafeRight) {
									if (strafeUp>0) {
										walking=1;
										if (strafeRight) player.move.angle=sprite.angle+ANGLE_UPRIGHT;
										else if (strafeLeft) player.move.angle=sprite.angle+ANGLE_UPLEFT;
										else player.move.angle=sprite.angle+ANGLE_UP;
									} else if (strafeDown>0) {
										walking=1;
										if (strafeRight) player.move.angle=sprite.angle+ANGLE_DOWNRIGHT;
										else if (strafeLeft) player.move.angle=sprite.angle+ANGLE_DOWNLEFT;
										else player.move.angle=sprite.angle+ANGLE_DOWN;
									} else if (strafeRight>0) {
										walking=1
										player.move.angle=sprite.angle+ANGLE_RIGHT;
									} else if (strafeLeft>0) {
										walking=1
										player.move.angle=sprite.angle+ANGLE_LEFT;
									}
									if (walking) player.move.speed=player.maxSpeed*slowDown;
								} else {
									if (control.moveForward>0) {
										walking=1;
										player.move.speed=player.maxSpeed*slowDown;
										player.move.angle=sprite.angle;
									} else if (control.moveBackward>0) {
										walking=1;
										player.move.speed=-player.maxSpeed*slowDown;
										player.move.angle=sprite.angle;
									}
								}

								// Calculate player movement vector

								if (player.tile.jumpSpeed) {
									
									player.move.speed=0;
									player.current.speed=player.tile.jumpSpeed/speedRatio;

								} else if (player.tile.slideControl) {

									player.weaponWave=0;
									player.weaponWaveRatio=0;
							
									sumVector(
										player.current,
										player.current,
										player.move.angle,
										player.move.speed/player.tile.slideControl,
										player.maxSpeed*player.tile.slideMaxSpeed
									);
									if (!walking&&player.tile.friction) player.current.speed*=player.tile.friction;

									player.move.speed=0;

								} else {

									if (!walking&&player.move.speed) {
										walking=1;
										player.move.speed*=player.friction;
										if (QMATH.abs(player.move.speed)<0.001) player.move.speed=0;
									}

									if (walking) {
										player.weaponWave=(player.weaponWave+WEAPON_WAVESPEED)%PI2;
										player.weaponWaveRatio=QMATH.abs(player.move.speed/player.maxSpeed);
										player.current.angle=player.move.angle;
										player.current.speed=player.move.speed;
									}
									else {
										player.weaponWave=0;
										player.weaponWaveRatio=0;
										player.current.angle=0;
										player.current.speed=0;
									}

								}

								// Apply friction and player-decided movement effects

								if (player.tile.friction)
									player.current.speed*=player.tile.friction;

								if (player.tile.dust&&player.current.speed) {
									if (player.dustTimer) player.dustTimer--;
									else {
										player.dustTimer=QMATH.ceil(player.tile.dustTime*speedRatio);
										addSpark(sprite.x,sprite.y,0,SPARKS[player.tile.dust],0,player);
									}
								}

								// Sum environmental effects before applying

								if (QMATH.abs(player.current.speed)<0.001) player.current.speed=0;

								if (player.tile.applyAngle!==undefined) {
									sumVector(
										player.current,
										player.apply,
										player.tile.applyAngle,
										player.tile.applySpeed,
										player.maxSpeed
									)
								} else {
									player.apply.angle=player.current.angle;
									player.apply.speed=player.current.speed;
								}

								if (settings.weaponDrift)
									if (rotation<0) {
										if (player.weaponAngle<WEAPONANGLE_RANGE[1]) player.weaponAngle+=weaponAngleSpeed*(player.weaponAngle<0?2:1);
									} else if (rotation>0) {
										if (player.weaponAngle>WEAPONANGLE_RANGE[0]) player.weaponAngle-=weaponAngleSpeed*(player.weaponAngle>0?2:1);
									} else {
										if (QMATH.abs(player.weaponAngle)<weaponAngleSpeed) player.weaponAngle=0;
										else if (player.weaponAngle>0)player.weaponAngle-=weaponAngleSpeed;
										else player.weaponAngle+=weaponAngleSpeed;
									}

								// Apply final speed
								player.walking=walking;
								var hit=SPRITE.advanceBy(sprite,player.apply.angle,player.apply.speed,checkObstacles,checkBlocksFloor);
								if (hit&&player.tile.bounciness) bounce(player.current,hit,player.tile.bounciness);							
							}

							// Movement logic (Net only)
							if (player.isLocal) {
								// Stepping lava/acid/etc.

								if (gameTimer%STEPPING_TIME==0) {
									if (player.tile.onwalk) {
										if (player.tile.onwalk.damage) giveDamage(0,player,player.tile.onwalk.damage,SUICIDE_SYMBOL);
									}
								}
								// Teleports
								if (player.lastTeleport) {
									if (!SPRITE.isColliding(sprite,teleports[player.lastTeleport].sprite))
										player.lastTeleport=0;
								} else
									for (var k in teleports) {
										if (SPRITE.isColliding(sprite,teleports[k].sprite)) {
											var destination=teleports[k].data.gotoTeleport;
											player.lastTeleport=destination;
											if (vibrateOnTeleport) CONTROLS.vibrate(player.controller,VIBRATE_TELEPORT);
											teleportPlayerAt(
												player,
												teleports[destination].sprite.x,
												teleports[destination].sprite.y,
												teleports[destination].sprite.angle
											);
											players.forEach(subplayer=>{
												if (
													(subplayer.id!=player.id)&&
													!subplayer.isDead&&
													SPRITE.isColliding(sprite,subplayer.sprite)
												)
													killPlayer(subplayer,player,TELEPORT_SYMBOL);
											})
											break;
										}
									}
							}

						}

						// Invulnerability (Local & net)
						if (player.invulnerability) {
							player.invulnerability--;
							sprite.visible=player.invulnerability%2;
						} else sprite.visible=true;

						// Screen shake
						if (player.shakeTime) {
							player.shakeTime--;
							shakeX=-player.shakeStrength+(QMATH.random()*player.shakeStrength*2);
							shakeY=-player.shakeStrength+(QMATH.random()*player.shakeStrength*2);
						}

						// Frame decision & sprite animations (Local & net)
						player.floating=player.floating=player.tile.jumpSpeed||(player.tile.walkable==-1);
						if (player.damageAnimation) {
							player.damageAnimation--;
							sprite.textureX=7;
							sprite.textureY=6;
							sprite.orient=false;
						} else {
							sprite.orient=true;
							if (player.weaponSpriteAnimation) sprite.textureY=5;
							else if (player.floating) sprite.textureY=2;
							else if (player.walking) sprite.textureY=1+QMATH.floor((gameTimer/5)%4);
							else sprite.textureY=0;
						}
						if (player.weaponSpriteAnimation) player.weaponSpriteAnimation--;

						// HUD animations (Local only)
						if (player.isLocal) {
							if (player.weaponReloading) player.weaponReloading--;
							if (weapon) {
								if (player.weaponAnimate) {
									player.weaponFrame=1+QMATH.floor(player.weaponAnimationFrame/player.weaponSpriteAnimationSpeed);
									player.weaponAnimationFrame++;
									if (player.weaponAnimationFrame>player.weaponSpriteAnimationFrames) {
										player.weaponFrame=0;
										player.weaponAnimate=false;
										if (!player.ammo) removeWeapon(player);
									}
								}						
							}					
						}
					}
				}

				// Force hidden sprite if it's waiting for position (Net only)
				if (player.waitRespawn) {
					sprite.visible=false;
					sprite.aimable=false;
				} else {

					if (zoomIn) {
						player.aimPercent+=zoomIn;
						if (player.aimPercent>1) player.aimPercent=1;
					} else 
						if (player.aimPercent<0.1) player.aimPercent=0;
						else player.aimPercent*=0.5;

					// Player helpers update (Local & net)
					player.tileX=QMATH.floor(sprite.x);
					player.tileY=QMATH.floor(sprite.y);
					player.tile=getLogicTile(player.tileX,player.tileY);

					// Camera update (Local only)
					if (player.isLocal) {						
						camera.setLight(player.cameraLight);
						camera.setPosZ(-sprite.z);
						camera.setPosX(sprite.x);
						camera.setPosY(sprite.y);
						camera.setPitch(shakeX+sprite.pitch+RECOILSIZE*(player.recoilTimer/RECOIL_TIME));
						camera.setAngleRot(shakeY+sprite.angle);
						camera.setDirX(-1-(weapon.aimScale||0)*player.aimPercent);
					}

				}
			} else if (player.isLocal) {
				if (gameModeData.gameRunning) {
					if (player.watchPlayer&&!player.watchPlayer.isDead&&player.watchTime) player.watchTime--;
					else {
						player.watchOn=false;
						for (var k=0;k<playersCount;k++) {
							player.watchPlayerId=(player.watchPlayerId+1)%playersCount;
							player.watchPlayer=players[player.watchPlayerId];
							if (!player.watchPlayer.isLocal&&!player.watchPlayer.isDead) {
								player.watchOn=true;
								player.watchTime=PLAYERWATCH_TIME;
								break;
							}
						}
					}
					if (player.watchOn) {
						camera.setLight(0);
						camera.setPosZ(0);
						camera.setPosX(player.watchPlayer.sprite.x);
						camera.setPosY(player.watchPlayer.sprite.y);
						camera.setPitch(0);
						camera.setAngleRot(player.watchPlayer.sprite.angle);
					}
				} else player.watchOn=false;
			}
		};
		if (gameModeData.gameRunning) {
			triggerGameModeEvent("onFrame",[gameModeData]);
			if (!netEnabled||NETPLAY.isMaster) {
				secondTimer--;
				if (!secondTimer) {
					secondTimer=FPS;
					triggerGameModeEvent("onSecondPassed",[gameModeData]);
					if (netEnabled) NETPLAY.broadcastEvent([NETEVENT_SECONDPASSED]);
				}
			}
		}
	}

	function manageRendering(ctx) {
		if (gameModeData.gameRunning) RC.tick();
		for (var p=0;p<playersCount;p++) {
			player=players[p];
			var camera=player.camera;
			var weapon=player.weapon;

			if (!player.fake) {

				if (player.playing) {
					// Camera
					camera.render();
					// Render camera
					camera.blit(ctx,player.cameraRenderX,player.cameraRenderY);
					if (player.invulnerability) {
						var alpha=0.7+QMATH.sin_(player.invulnerability/2)*0.3
						CANVAS.fillRect(
							ctx,INVULNERABILITY_COLOR,alpha,player.cameraRenderX,player.cameraRenderY+player.cameraScreenHeight-4,player.cameraScreenWidth,4
						);
						CANVAS.fillRect(
							ctx,INVULNERABILITY_COLOR,alpha,player.cameraRenderX,player.cameraRenderY,player.cameraScreenWidth,4
						);
						CANVAS.fillRect(
							ctx,INVULNERABILITY_COLOR,alpha,player.cameraRenderX,player.cameraRenderY+4,4,player.cameraScreenHeight-8
						);
						CANVAS.fillRect(
							ctx,INVULNERABILITY_COLOR,alpha,player.cameraRenderX+player.cameraScreenWidth-4,player.cameraRenderY+4,4,player.cameraScreenHeight-8
						);
					}

					// Render weapon			
					if (weapon)	{
						var wavex=QMATH.sin(player.weaponWave)*waveHeight*player.weaponWaveRatio;
						var wavey=QMATH.abs(QMATH.sin(player.weaponWave+PI_2))*waveWidth*player.weaponWaveRatio;
						CANVAS.blit(
							ctx,WEAPONSSPRITES.node,0,0,
							player.weaponAngle,1,
							1+(0.5*player.aimPercent)+(player.recoilTimer/RECOIL_TIME),
							0,
							player.weaponFrame*WEAPONSSPRITES.tileWidth,
							weapon.spriteY*WEAPONSSPRITES.tileHeight,
							WEAPONSSPRITES.tileWidth,
							WEAPONSSPRITES.tileHeight,
							player.weaponX+wavex,
							QMATH.floor(player.weaponY+QMATH.abs(player.weaponAngle*player.weaponTilt)+(player.aimMovement*weapon.aimScale*player.aimPercent)+wavey),
							player.weaponWidth,player.weaponHeight
						);
						if (reticleColor&&(weapon.reticle||gameModeData.reticleMode)&&!player.weaponReloading)
							CANVAS.fillRect(ctx,reticleColor,1,QMATH.floor(player.reticleX+wavex),QMATH.floor(player.reticleY+wavey),2,2);
					}

					// Render effects
					if (player.pain) {
						CANVAS.fillRect(
							ctx,
							PAIN_COLOR,player.pain/PAIN_TIME*PAIN_ALPHA,
							player.cameraRenderX,player.cameraRenderY,
							player.cameraScreenWidth,player.cameraScreenHeight
						);
						player.pain--;
					}
					if (player.teleportTimer) {
						CANVAS.fillRect(
							ctx,
							TELEPORT_COLOR,player.teleportTimer/TELEPORT_TIME*TELEPORT_ALPHA,
							player.cameraRenderX,player.cameraRenderY,
							player.cameraScreenWidth,player.cameraScreenHeight
						);
						player.teleportTimer--;
					}
					// Render radar
					player.radar.forEach(item=>{
						var distance=TRIGO.getDistance(player.sprite.x,player.sprite.y,item.sprite.x,item.sprite.y);
						if (distance<(item.radarRange||gameModeData.radarDistance)) {
							var angle=TRIGO.getAngleTo(player.sprite.x,player.sprite.y,item.sprite.x,item.sprite.y)-player.sprite.angle+gameModeData.radarAngle;
							var rx=player.radarSize*QMATH.sin(angle);
							var ry=player.radarSize*QMATH.cos(angle);
							CANVAS.blit(ctx,HUD.node,0,0,0,1,1,0,distance<3?121:distance<6?125:129,item.radarY,4,4,QMATH.floor(player.radarCX-rx),QMATH.floor(player.radarCY-ry),4,4);
						}
					});
					// Render hud
					CANVAS.print(ctx,FONT,player.fontColor,player.cameraRenderX+2,player.cameraRenderY+player.cameraScreenHeight-FONT.tileHeight-2,HEALTH_SYMBOL+player.health);
					if (player.damageMultiplier!=1)
						CANVAS.print(ctx,FONT,QMATH.floor(gameTimer/BLINK_TIME)&2?player.fontColor:FONTPALETTE.WHITE,player.cameraRenderX+2,player.cameraRenderY+player.cameraScreenHeight-FONT.tileHeight*3-1,"DMG x"+player.damageMultiplier);
					if (weapon)
						CANVAS.print(ctx,FONT,player.fontColor,player.cameraRenderX+2,player.cameraRenderY+player.cameraScreenHeight-FONT.tileHeight*2-1,AMMO_SYMBOL+player.ammo);
				} else {
					if (player.watchOn) {
						camera.render();
						camera.blit(ctx,player.cameraRenderX,player.cameraRenderY);
						CANVAS.printCenter(ctx,FONT,player.watchPlayer.fontColor,player.watchX,player.watchY,"Watch "+player.watchPlayer.label);
					} else CANVAS.fillRect(ctx,PALETTE.DARKPURPLE,1,player.cameraRenderX,player.cameraRenderY,player.cameraScreenWidth,player.cameraScreenHeight);
				}
				
				triggerGameModeEvent("onDrawHud",[gameModeData,player,ctx,player.cameraScreenWidth,player.cameraScreenHeight]);

				// Particles
				player.particles.render(ctx);

				// Logging
				if (player.log) {
					CANVAS.printCenter(ctx,FONT,FONTPALETTE.WHITE,player.logX,player.logY,player.log);
					player.logTimer++;
					if (player.logTimer>LOG_TIME) player.log=0;
				}

				// Zooming message
				if (player.message) {			
					CANVAS.printCenter(
						ctx,FONT,
						QMATH.floor(gameTimer/BLINK_TIME)&2?player.messageColor1:player.messageColor2,
						player.messageX,player.messageY,
						player.message,
						0,0,0,1,
						player.messageTimer<MESSAGEZOOM_TIME?
							(player.messageScale*(player.messageTimer/MESSAGEZOOM_TIME))||0.01
						:
							player.messageScale
					);
					if (player.messageTimer<MESSAGE_TIME) player.messageTimer++;
					else if (player.messageVolatile) player.message=0;
				}

				// Debug
				if (_DEBUG) {

					var isaiming=false,distance=0,angle=0,aimIds="";

					if (weapon) {

						camera.aiming.forEach(target=>{
							var sprite=player.sprite;

							var distance=TRIGO.getDistance(
								sprite.x,sprite.y,
								target.x,target.y
							);
							var angle=QMATH.abs(TRIGO.getShortestAngle(
								TRIGO.getAngleTo(
									sprite.x,sprite.y,
									target.x,target.y
								),
								sprite.angle
							));
							if (angle>3) debugger;
							if ((angle<weapon.angle*(weapon.distanceRatio/distance))) {
								isaiming=true;
								aimIds+="*"+target.player.label.substr(0,1)+" ";	
							} else aimIds+="_"+target.player.label.substr(0,1)+" ";	
							
						})
					}

					CANVAS.print(
						ctx,FONT,
						isaiming?FONTPALETTE.YELLOW:FONTPALETTE.WHITE,
						player.cameraRenderX,player.cameraRenderY+(FONT.tileHeight*2),
						"Aim:"+aimIds
					);
					CANVAS.print(
						ctx,FONT,
						isaiming?FONTPALETTE.YELLOW:FONTPALETTE.WHITE,
						player.cameraRenderX,player.cameraRenderY+(FONT.tileHeight*3),
						"D:"+roundNumber(distance)+" A:"+roundNumber(angle)
					);
					CANVAS.print(
						ctx,FONT,
						FONTPALETTE.WHITE,
						player.cameraRenderX,player.cameraRenderY+(FONT.tileHeight*4),
						"YOU:A:"+roundNumber(player.sprite.angle)
					);
					CANVAS.print(
						ctx,FONT,
						FONTPALETTE.BLUE,
						player.cameraRenderX,player.cameraRenderY+(FONT.tileHeight*5),
						"PACK:"+_PACKETS
					);
				}
			}
		};
		if (drawPanel)
			CANVAS.fillRect(ctx,PALETTE.BLACK,1,drawPanelX,drawPanelY,drawPanelWidth,drawPanelHeight);
	}

	this.frame=function(){
		if (netEnabled) NETPLAY.startFrame(players,predictorPrepare,predictorApply,checkObstacles,checkBlocksFloor);
		var triggerAlive;
		gameTimer=(gameTimer+1)%400;

		switch (gameState) {
			case 0:{ // Ready
				if (readyGoTimer==READY_TIME) {
					playAnnouncer("speak_ready");
					if (settings.guiParticles) TRANSITION.particles.addParticlesCluster(40,HSCREEN_WIDTH,HSCREEN_HEIGHT,0,1,PALETTE.YELLOW);
				}
				if (!netEnabled||NETPLAY.isMaster) {
					if (readyGoTimer) readyGoTimer--;
					else {	
						readyGoTimer=GO_TIME;
						gameState++;
						if (netEnabled) NETPLAY.broadcastEvent([NETEVENT_GO]);
					}
				} else readyGoTimer=1;
				break;
			}
			case 1:{ // Go!
				if (readyGoTimer==GO_TIME) {
					playAnnouncer("speak_go");
					playMusic()
					if (settings.guiParticles) TRANSITION.particles.addParticlesCluster(40,HSCREEN_WIDTH,HSCREEN_HEIGHT,0,0,PALETTE.YELLOW);
				}
				if (readyGoTimer) readyGoTimer--;
				else gameState++;
				manageLogic();
				break;
			}
			case 2:{ // Play
				manageLogic();
				break;
			}
			case 100:{ // Game over
				if (TRANSITION.isFree) {
					if (readyGoTimer==0) {
						stopMusic();
						readyGoTimer=1;
					} else {
						var quitting=true;
						if (SYSTEMCONTROLS.cancel)
							quitting=true;
						else
							for (var p=0;p<playersCount;p++) {
								player=players[p];
								if (player.controller&&(!GAMECONTROLS[player.controller]||!GAMECONTROLS[player.controller].fire)) {
									quitting=false;
									break;
								}
							}
						if (quitting) abortTimer++;
						else abortTimer=0;
						if (abortTimer>=ABORT_TIME) {
							TRANSITION.end(gameModeData);
						}
					}
					manageLogic();
				}
				break;
			}
			case 200:{ // Abort
				stopMusic();
				break;
			}
		}

		if (gameState<100)
			if (SYSTEMCONTROLS.cancel>0) {
				abortTimer++;
				if (abortTimer>=ABORT_TIME) abortGame();
			} else abortTimer=0;

		// Netplay
		if (netEnabled) {
			var events=NETPLAY.endFrame(players);
			if (_DEBUG) _PACKETS=events?events.length:0;
			if (events)
				events.forEach(event=>{
					switch (event[0]) {
						case NETEVENT_GIVEDAMAGE:{							
							giveDamage(solveNetId(event[1]),solveNetId(event[2]),event[3],event[4],true);
							break;
						}
						case NETEVENT_ADDSPARK:{
							addSpark(event[1],event[2],event[3],SPARKS[event[4]],event[5],solveNetId(event[6]),true);
							break;
						}
						case NETEVENT_ADDBULLET:{
							addBullet(event[1],event[2],event[3],event[4],BULLETS[event[5]],solveNetId(event[6]),event[7],event[8],true);
							break;
						}
						case NETEVENT_PICKUP:{
							pickup(event[1],true);
							break;
						}
						case NETEVENT_ABORT:{
							abortGame();							
							break;
						}
						case NETEVENT_OPENDOOR:{
							openDoor(event[1],true);
							break;
						}
						case NETEVENT_PLAYERLOG:{
							playerLog(solveNetId(event[1]),event[2],event[3],true);
							break;
						}
						case NETEVENT_KILLPLAYER:{
							killPlayer(solveNetId(event[1]),solveNetId(event[2]),event[3],true);
							break;
						}
						case NETEVENT_ADDSPARKLINE:{
							addSparkLine(event[1],event[2],event[3],event[4],event[5],SPARKS[event[6]],true);
							break;
						}
						case NETEVENT_USEDSPAWNPOINT:{
							removeFromSpawnpointsBag(event[1]);
							break;
						}
						case NETEVENT_SECONDPASSED:{
							triggerGameModeEvent("onSecondPassed",[gameModeData]);
							break;
						}
						case NETEVENT_GO:{
							readyGoTimer=GO_TIME;
							gameState=1;
							break;
						}
						case NETEVENT_GAMEMODEEVENT:{
							event[2].unshift(gameModeData);
							triggerGameModeEvent(event[1],event[2]);	
							break;
						}
						case NETEVENT_ENDGAME:{
							endGame(true);
							break;
						}
						case NETEVENT_GIVEINVULNERABILITY:{
							giveInvulnerability(solveNetId(event[1]),event[2],true);
							break;
						}
						case NETEVENT_SETDAMAGEMULTIPLIER:{
							setDamageMultiplier(solveNetId(event[1]),event[2],true);
							break;
						}
						case NETEVENT_FIRES:{
							fires(solveNetId(event[1]),event[2],WEAPONS[event[3]],true);
							break;
						}
						case NETEVENT_RESPAWNPLAYER:{
							respawnPlayer(solveNetId(event[1]),event[2],event[3],event[4],event[5],true);
							break;
						}
						case NETEVENT_KICKPLAYER:{
							kickPlayer(solveNetId(event[1]),true);
							break;
						}
						case NETEVENT_TELEPORTPLAYERAT:{
							teleportPlayerAt(solveNetId(event[1]),event[2],event[3],event[4],true);
							break;
						}
						case NETEVENT_EXPLODEBULLET:{
							var trigger=bulletIndex[event[1]];
							if (trigger) {
								trigger.exploded=true;
								trigger.nonet=true;
							}
							break;
						}
					}
			});
			NETPLAY.flushFrame();
		}

		return TRANSITION.getState();
	}

	this.render=function(ctx) {

		manageRendering(ctx);

		switch (gameState) {
			case 0:{ // Ready				
				CANVAS.printCenter(
					ctx,FONT,QMATH.floor(gameTimer/BLINK_TIME)&2?FONTPALETTE.YELLOW:FONTPALETTE.WHITE,
					HSCREEN_WIDTH,HSCREEN_HEIGHT,
					"READY",
					0,0,0,1,READYGOSCALE
				);
				CANVAS.fillRect(ctx,PALETTE.BLACK,1,0,NOTICEY,SCREEN_WIDTH,FONT.tileHeight);
				CANVAS.printCenter(ctx,FONT,FONTPALETTE.WHITE,HSCREEN_WIDTH,NOTICETEXTY,quitNotice);
				break;
			}
			case 1:{ // Go!
				CANVAS.printCenter(
					ctx,FONT,QMATH.floor(gameTimer/FASTBLINK_TIME)&2?FONTPALETTE.YELLOW:FONTPALETTE.WHITE,
					HSCREEN_WIDTH,HSCREEN_HEIGHT,
					"GO",
					0,0,0,1,READYGOSCALE
				);
				break;
			}
			case 100:{
				if (!abortTimer) {
					CANVAS.fillRect(ctx,PALETTE.BLACK,1,0,NOTICEY,SCREEN_WIDTH,FONT.tileHeight);		
					CANVAS.printCenter(ctx,FONT,FONTPALETTE.WHITE,HSCREEN_WIDTH,NOTICETEXTY,"All Players hold fire to quit.");
				}
				break;
			}
		}

		// Abort bar
		if (abortTimer) {				
			CANVAS.fillRect(ctx,PALETTE.BLACK,1,0,NOTICEY,SCREEN_WIDTH,FONT.tileHeight);
			CANVAS.fillRect(ctx,PALETTE.RED,1,0,NOTICEY,QMATH.floor(SCREEN_WIDTH*(abortTimer/ABORT_TIME)),FONT.tileHeight);
			CANVAS.printCenter(ctx,FONT,FONTPALETTE.WHITE,HSCREEN_WIDTH,NOTICETEXTY,"Quitting game in "+QMATH.ceil((ABORT_TIME-abortTimer)/FPS)+"sec...");
		}

		TRANSITION.render(ctx);

	}
}