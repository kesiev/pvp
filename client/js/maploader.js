const
	TRIGGERSEQUENCE_WAIT=1,
	TRIGGERSEQUENCE_MOVE=2,
	TRIGGERSEQUENCE_GOTO=3,
	TRIGGERSEQUENCE_SET=4,
	TRIGGERSEQUENCE_ADDSPARK=5;

function MapLoader() {
	const
		PI=QMATH.PI,
		PI2=PI*2,
		PI_2=PI/2,

		// Tile types
 		TILETYPES={

			// Lights
			cave:{ floorLight:0.24 /*0.35*/, floorTint:1.68 /*1.76*/, wallLight:0.34 /*0.5*/, wallTint:2.48 /*1.66*/, wallCornerLight:1.53 /*2*/, wallCornerTint:1.59 /*1.05*/ },
			darker:{ wallLight:0.2, ceilingLight:0.2, floorLight:0.15 },
			wallDarker:{wallTint:2, wallLight:0.5 },
			floorLighter:{ floorLight:100 },
			lighter:{wallLight:1.8, floorLight:1.8 },

			// Wall decorations
			waterfall:{ wallScrollY:-0.5 },
			glitchWalls:{ wallGlitch:1},
			higher:{ wallHeight:2},
			lower:{ wallHeight:0 },
			thin:{ wallThin:true, wallThinVertical:"auto" },
			thinVertical:{ wallThin:true, wallThinVertical:true },
			thinHorizontal:{ wallThin:true, wallThinVertical:false },
			wallTop:{  },

			animatedWall:{ wallBlink:16 },
			animatedWall2:{ wallBlink:8 },

			// Sliding/slow down floor
			water:{ dust:"splash", dustTime:0.1, floorScrollY:0.25 },
			jump:{ jumpSpeed:6, bounciness:1,  invisibleFloor:true },
			zerogravity:{ bounciness:1, slideControl:20, slideMaxSpeed:0.5, dust:"smoke", dustTime:0.1, invisibleFloor:true },
			ice:{ friction:0.95, bounciness:0.7, slideControl:20, slideMaxSpeed:0.5, invisibleFloor:true },
			mud:{ friction:0.2, dust:"mud", dustTime:0.2, floorScrollX:0.5, invisibleFloor:true },
			tracker:{ dustTime:0.4, dust:"track" },

			// Rolling floor
			rollFastRight:{ floorScrollX:-4, applyAngle:PI,applySpeed:4.3 },
			rollFastDown:{ floorScrollY:-4, applyAngle:PI_2*3,applySpeed:4.3 },
			rollFastLeft:{ floorScrollX:4, applyAngle:0,applySpeed:4.3 },
			rollFastUp:{ floorScrollY:4, applyAngle:PI_2,applySpeed:4.3 },
			rollRight:{ floorScrollX:-2, applyAngle:PI,applySpeed:2.15 },
			rollDown:{ floorScrollY:-2, applyAngle:PI_2*3,applySpeed:2.15 },
			rollLeft:{ floorScrollX:2, applyAngle:0,applySpeed:2.15 },
			rollUp:{ floorScrollY:2, applyAngle:PI_2,applySpeed:2.15 },

			animatedFloor:{ floorBlink:16 },

			// Hurting floor
			flames:{ onWalk:true, damage:25, tint:10,light:1.5, decoration:true,textureX:2,textureY:4, spriteBlink:2, floorLight:2.5,floorTint:3, dontSpawn:true },
			lava:{ onWalk:true, damage:10, floorScrollX:0.5,floorScrollY:0.5,floorTint:3,floorLight:2.5, dontSpawn:true },
			poison:{ onWalk:true, damage:10, floorScrollX:0.25,floorScrollY:0.25,floorLight:0.5, dontSpawn:true },
			kill:{ onWalk:true, damage:2000, invisibleFloor:true, dontSpawn:true },

			// Objects
			door:{ isDoor:true, linkToMapTile:true, wallThin:true, wallThinVertical:"auto" },

			// --- Sprites

			// Pickables
			pickablePistol:{pickable:true,weapon:"pistol"},
			pickableMachinegun:{pickable:true,weapon:"machinegun"},
			pickableShotgun:{pickable:true,weapon:"shotgun"},
			pickableSniper:{pickable:true,weapon:"sniper"},
			pickableRocketLauncher:{pickable:true,weapon:"rocketLauncher"},
			pickableGrenadeLauncher:{pickable:true,weapon:"grenadeLauncher"},
			pickableKnife:{pickable:true,weapon:"knife"},

			// Large obstacles
			obstacleStalagmite:{obstacle:true,textureX:8,textureY:5,spriteWidth:1,spriteHeight:1,light:0.48 },
			obstaclePike:{obstacle:true,textureX:10,textureY:1,spriteWidth:1,spriteHeight:1 },
			obstacleColumn:{obstacle:true,textureX:10,textureY:0,spriteWidth:1,spriteHeight:1 },
			obstaclePole:{obstacle:true,textureX:0,textureY:3,spriteWidth:1,spriteHeight:1 },
			obstacleBush:{obstacle:true,textureX:1,textureY:3,spriteWidth:1,spriteHeight:1 },
			obstacleFern:{obstacle:true,textureX:9,textureY:3,spriteWidth:1,spriteHeight:1 },
			obstacleStatue:{obstacle:true,textureX:8,textureY:6,spriteWidth:1,spriteHeight:1 },

			// Hazards
			projectile:{projectile:true, textureX:0, textureY:4,spriteWidth:0.5,spriteHeight:0.5, damage:25, spriteBlink:2, projectileSpark:"teleport", projectileEffect:"explosion" },

			// Small obstacles
			smallObstacleDrum:{obstacle:true,textureX:2,textureY:0,spriteWidth:0.5,spriteHeight:0.5 },

			// Decorations
			decorationLeaf:{decoration:true,textureX:2,textureY:3 },
			decorationGrass1:{decoration:true,textureX:9,textureY:4 },
			decorationGrass2:{decoration:true,textureX:10,textureY:4 },
			decorationChandelier:{decoration:true,textureX:7,textureY:6},
			decorationBrokenDrone:{decoration:true,textureX:9,textureY:5},
			decorationBrokenDrones:{decoration:true,textureX:10,textureY:5},
			decorationSkull:{decoration:true,textureX:9,textureY:6},
			decorationBones:{decoration:true,textureX:10,textureY:6},
			decorationEye:{decoration:true,textureX:0,textureY:7},

			// Game cycle elements
			hotspot:{hotspot:true},
			spawnpoint0:{spawnpoint:true,player:0},
			spawnpoint1:{spawnpoint:true,player:1},
			spawnpoint2:{spawnpoint:true,player:2},
			spawnpoint3:{spawnpoint:true,player:3},
			flag:{flag:true,spriteWidth:0.5,spriteHeight:0.5},
			teleport:{teleport:true}

		};

	function getRaycasterValue(mod,key) {
		if (mod[key]==undefined) return RAYCASTER_DEFAULTS[key]; else return mod[key];
	}

	this.initialize=function() {	
	}

	function newLogicMap(ret) {
		ret.logicMap=[];
		for (var y=0;y<ret.mapHeight;y++) {
			for (var x=0;x<ret.mapWidth;x++)
				ret.logicMap.push({});
		}
	}

	function setLogicTile(ret,x,y,k,v) {
		ret.logicMap[(y*ret.mapWidth)+x][k]=v;
	}

	function getLogicTile(ret,x,y) {
		return ret.logicMap[(y*ret.mapWidth)+x];
	}

	this.load=function(id,rc,players,gamemodedata) {
		var loaded=DOM.clone(MAPS[id]);
		var autoVertical=[];
		var ret={
			mapWidth:loaded.wall.grid[0].length,
			mapHeight:loaded.wall.grid.length,
			doors:[],
			freepoints:[],
			triggers:[],
			spawnpoints:[],
			obstacles:[],
			teleports:{},
			logicMap:[],
			hotspots:[]
		};
		var spawnable=DOM.clone(loaded.floor.grid);
		var speedRatio=gamemodedata.speedRatio||FPS;

		rc.resetGlobalTimer();
		rc.setSprites([]);

		// Load map in raycaster
		rc.newMap(ret.mapWidth,ret.mapHeight);
		newLogicMap(ret);

		for (var y=0;y<loaded.wall.grid.length;y++)
			for (var x=0;x<loaded.wall.grid[y].length;x++) {
				var tile=loaded.wall&&loaded.wall.grid[y][x];
				if (tile) {					
					rc.setTile(x,y,"wall",tile-1);
					setLogicTile(ret,x,y,"blockable",tile);
					setLogicTile(ret,x,y,"droneBlockable",tile);
					setLogicTile(ret,x,y,"bulletable",tile);
				}
				
				tile=loaded.ceiling&&loaded.ceiling.grid[y][x];
				if (tile) {
					rc.setTile(x,y,"ceiling",tile-1);
				}

				tile=loaded.floor&&loaded.floor.grid[y][x];
				if (tile) {
					rc.setTile(x,y,"floor",tile-1);
					setLogicTile(ret,x,y,"walkable",tile);
				}
			}		

		loaded.mods.forEach(mod=>{
			
			if (TILETYPES[mod.type]) {
				var width=mod.width||1;
				var height=mod.height||1;
				
				for (var y=0;y<height;y++)
					for (var x=0;x<width;x++) {

						var tx=x+mod.x;
						var ty=y+mod.y;
						var spritex=tx+0.5;
						var spritey=ty+0.5;
						var tileType=DOM.clone(TILETYPES[mod.type]);
						var forceSingleSprite=(QMATH.floor(tx)!=tx)||(QMATH.floor(ty)!=ty);
						var sequence=0;

						if (mod.properties)
							for (var k in mod.properties)
								tileType[k]=mod.properties[k];

						var tile=rc.getTile(tx,ty);
						var isWall=tile&&(tile[0]&MASK_wall);
						var isFloor=tile&&(tile[0]&MASK_floor);

						if (
							((!tileType.skipWalls||!isWall)&&(!tileType.skipFloors||!isFloor))&&
							((!tileType.onlyWalls||isWall)||(!tileType.onlyFloors||isFloor))
						) {

							var spritez=tileType.z||0;

							// Sprites

							if (tileType.sequence) {
								forceSingleSprite=true;
								sequence=[];
								var sequencefirst=0;
								tileType.sequence.forEach((action,id)=>{
									if (action.dontLoop) sequencefirst=id+1;
									if (action.wait) {
										sequence.push({
											type:TRIGGERSEQUENCE_WAIT,
											time:QMATH.ceil(action.wait*speedRatio)
										});
									} else if (action.startProjectile) {
										sequence.push({
											type:TRIGGERSEQUENCE_SET,
											attributes:{
												x:spritex,
												y:spritey,
												vMove:spritez,
												visible:true
											}
										});
									} else if (action.endProjectile) {
										sequence.push({
											type:TRIGGERSEQUENCE_SET,
											attributes:{
												visible:false
											}
										},{
											type:TRIGGERSEQUENCE_ADDSPARK,
											spark:tileType.projectileSpark
										},{
											type:TRIGGERSEQUENCE_GOTO,
											goto:sequencefirst
										});
									} else if (action.reset) {
										sequence.push({
											type:TRIGGERSEQUENCE_SET,
											attributes:{
												x:spritex,
												y:spritey,
												vMove:spritez
											}
										});
									} else if (action.moveBy) {
										var speed=action.speed/speedRatio;
										sequence.push({
											type:TRIGGERSEQUENCE_MOVE,
											time:QMATH.floor(action.moveBy/action.speed*speedRatio),
											dx:speed*QMATH.cos_(action.angle),
											dy:speed*QMATH.sin_(action.angle),
											dz:0
										});
									}  else if (action.moveByZ) {
										var speed=action.speed/speedRatio;
										sequence.push({
											type:TRIGGERSEQUENCE_MOVE,
											time:QMATH.abs(QMATH.floor(action.moveByZ/action.speed*speedRatio)),
											dx:0,
											dy:0,
											dz:speed*(action.moveByZ<1?-1:1)
										});
									} else console.warn("Can't handle action",action,"sequence",tileType.sequence);
								});
							}

							if (tileType.pickable) {

								var effect=0,shadowId=1;
								
								// Single weapon game mode
								if (gamemodedata.onlyWeapon)
									if (tileType.weapon) tileType.weapon=gamemodedata.onlyWeapon;

								var textureX=0,textureY=0;

								if (tileType.weapon) {
									textureX=WEAPONS[tileType.weapon].pickTextureX;
									textureY=WEAPONS[tileType.weapon].pickTextureY;
									effect="reload";
									shadowId=WEAPONS[tileType.weapon].shadowId;
								}

								var shadow=0;
								var sprite=rc.prepareSprite({
									width:0.5,
									height:0.5,
									x:spritex,
									y:spritey,
									vMove:spritez,
									textures:SPRITETEXTURES,
									textureX:textureX,
									textureY:textureY,
									spriteTint:(tileType.tint==undefined?LIGHTS.primary.tint:tileType.tint),
									spriteLight:tileType.light,
									spriteShineSpeed:4,
									spriteShineLight:0.3,
									spriteFloat:0.03,
									spriteFloatSpeed:4									
								});

								if (!tileType.noShadow) {
									shadow=rc.prepareSprite({
										x:spritex,
										y:spritey,
										textures:SPRITETEXTURES,
										textureX:shadowId,
										textureY:7,
										drawPriority:500,
										spriteTint:(tileType.tint==undefined?LIGHTS.primary.tint:tileType.tint),
										spriteLight:tileType.light
									});
								}

								if (forceSingleSprite) {
									rc.addPreparedSprite(sprite);
									rc.addPreparedSprite(shadow);
								} else rc.setSprite(tx,ty,sprite,shadow);

								ret.triggers.push({
									type:TRIGGERS.pickObject,
									mod:tileType,
									sprite:sprite,
									shadow:shadow,
									sequence:sequence,
									effect:effect
								});
							}

							if (tileType.teleport) {
								var sprite=rc.prepareSprite({
									x:spritex,
									y:spritey,
									vMove:spritez,
									angle:tileType.angle,
									width:0.5,
									height:0.5,
									textures:SPRITETEXTURES,
									textureX:8,
									spriteBlink:2,
									spriteTint:(tileType.tint==undefined?LIGHTS.secondary.tint:tileType.tint),
									spriteLight:tileType.light
								})

								if (forceSingleSprite) rc.addPreparedSprite(sprite);
								else rc.setSprite(tx,ty,sprite);

								ret.teleports[tileType.id]={
									data:tileType,
									sprite:sprite
								}
							}

							if (tileType.flag) {
								ret.flagX=spritex;
								ret.flagY=spritey;
								if (gamemodedata.useFlag) {
									gamemodedata.flagSpawnX=spritex;
									gamemodedata.flagSpawnY=spritey;
									gamemodedata.flag={
										radarY:RADAR_FLAG,
										radarRange:RADARRANGE_UNLIMITED,
										sprite:rc.addSprite({
											x:gamemodedata.flagSpawnX,
											y:gamemodedata.flagSpawnY,
											textures:SPRITETEXTURES,
											textureX:7,
											width:tileType.spriteWidth,
											height:tileType.spriteHeight,
											spriteTint:(tileType.tint==undefined?LIGHTS.primary.tint:tileType.tint),
											spriteLight:tileType.light
										})
									};
								}
								if (gamemodedata.useHotspot)
									gamemodedata.hotspot={
										radarY:RADAR_HOTSPOT,
										radarRange:RADARRANGE_UNLIMITED,
										sprite:{
											x:spritex,
											y:spritey
										}
									};
							}

							if (tileType.projectile) {
								var sprite=rc.addSprite({
									x:spritex,
									y:spritey,
									vMove:spritez,
									spriteBlink:tileType.spriteBlink,
									visible:false,
									angle:tileType.angle,
									textures:SPRITETEXTURES,
									textureX:tileType.textureX,
									textureY:tileType.textureY,
									width:tileType.spriteWidth,
									height:tileType.spriteHeight,
									spriteTint:(tileType.tint==undefined?LIGHTS.primary.tint:tileType.tint),
									spriteLight:tileType.light
								});
								var trigger={
									type:TRIGGERS.projectile,
									projectileSpark:tileType.projectileSpark,
									projectileEffect:tileType.projectileEffect,
									damage:tileType.damage,
									sprite:sprite,
									sequence:sequence
								};
								ret.triggers.push(trigger);
								spawnable[ty][tx]=0;
							}

							if (tileType.spawnpoint) {
								var sprite=rc.prepareSprite({
									x:spritex,
									y:spritey,
									vMove:spritez,
									angle:tileType.angle,
									width:0.5,
									height:0.5,
									textures:SPRITETEXTURES,
									textureX:3+tileType.player,
									spriteTint:(tileType.tint==undefined?LIGHTS.player.tint:tileType.tint),
									spriteLight:(tileType.light==undefined?LIGHTS.player.light:tileType.light),
								});
								ret.spawnpoints[tileType.player]={
									radarY:RADAR_HOTSPOT,
									radarRange:RADARRANGE_UNLIMITED,
									sprite:sprite
								};

								if (forceSingleSprite) rc.addPreparedSprite(sprite);
								else rc.setSprite(tx,ty,sprite);

								spawnable[ty][tx]=0;

							}

							if (tileType.obstacle) {
								var sprite=rc.prepareSprite({
									width:tileType.spriteWidth,
									height:tileType.spriteHeight,
									x:spritex,
									y:spritey,
									vMove:spritez,
									textures:SPRITETEXTURES,
									textureX:tileType.textureX,
									textureY:tileType.textureY,
									spriteTint:tileType.tint,
									spriteLight:tileType.light
								});

								if (forceSingleSprite) rc.addPreparedSprite(sprite);
								else rc.setSprite(tx,ty,sprite);

								if ((tileType.spriteWidth==1)&&(tileType.spriteHeight==1)) {
									setLogicTile(ret,tx,ty,"blockable",1);
								} else {
									ret.obstacles.push(sprite);
								}
								spawnable[ty][tx]=0;
							}

							if (tileType.decoration) {
								var sprite=rc.prepareSprite({
									x:spritex,
									y:spritey,
									vMove:spritez,
									spriteBlink:tileType.spriteBlink,
									textures:SPRITETEXTURES,
									textureX:tileType.textureX,
									textureY:tileType.textureY,
									spriteTint:tileType.tint,
									spriteLight:tileType.light
								})

								if (forceSingleSprite) rc.addPreparedSprite(sprite);
								else rc.setSprite(tx,ty,sprite);
							}

							// Tiles

							if (tileType.hotspot) {
								if (gamemodedata.useHotspot) {
									ret.hotspots.push([tx,ty]);
									spawnable[ty][tx]=0;
								}
							}

							if (tileType.onWalk) setLogicTile(ret,tx,ty,"onwalk",DOM.clone(tileType));
							if (tileType.slideControl) {
								setLogicTile(ret,tx,ty,"bounciness",tileType.bounciness);
								setLogicTile(ret,tx,ty,"slideControl",tileType.slideControl);
								setLogicTile(ret,tx,ty,"slideMaxSpeed",tileType.slideMaxSpeed);
							}
							if (tileType.jumpSpeed) {
								setLogicTile(ret,tx,ty,"bounciness",tileType.bounciness);
								setLogicTile(ret,tx,ty,"jumpSpeed",tileType.jumpSpeed);
							}
							if (tileType.invisibleFloor) {
								if (!tile.walkable) setLogicTile(ret,tx,ty,"walkable",-1);
								spawnable[ty][tx]=-1;
							}

							if (tileType.applySpeed!==undefined)
								setLogicTile(ret,tx,ty,"applySpeed",tileType.applySpeed/speedRatio );

							if (tileType.isDoor!==undefined) {
								ret.doors.push([tx,ty]);
								setLogicTile(ret,tx,ty,"blockable",0);
								setLogicTile(ret,tx,ty,"droneBlockable",0);
								setLogicTile(ret,tx,ty,"bulletable",0);
								setLogicTile(ret,tx,ty,"isDoor",true);
								setLogicTile(ret,tx,ty,"open",0);
								spawnable[ty][tx]=0;
							}

							if (tileType.wallThin) {
								if (tileType.wallThinVertical=="auto")
									autoVertical.push({tx:tx,ty:ty});
								else {
									rc.setTile(tx,ty,"open",0);
									if (tileType.wallThinVertical)
										rc.setTile(tx,ty,"wallThinVertical",true);
								}
							}

							if (tileType.dontSpawn)
								spawnable[ty][tx]=0;

							if (tileType.wallHeight!==undefined) {
								if (tileType.wallHeight==0) setLogicTile(ret,tx,ty,"bulletable",0);
								rc.setTile(tx,ty,"wallHeight",tileType.wallHeight);
							}

							[
									"applyAngle",
									"friction","dust","dustTime"
							].forEach(attribute=>{
								if (tileType[attribute]!==undefined)
									setLogicTile(ret,tx,ty,attribute,tileType[attribute]);
							});
	 
	 						[
								
								"floorLight","floorTint","floorScrollX","floorScrollY","floorBlink",
								"wallLight","wallTint","wallThin","wallRound","wallBlink","wallTop","wallScrollX","wallScrollY",
								"wallCornerLight","wallCornerTint",
								"ceilingLight","ceilingTint","wallGlitch"
							].forEach(attribute=>{
								if (tileType[attribute]!==undefined)
									rc.setTile(tx,ty,attribute,tileType[attribute]);
							});

							if (tileType.linkToMapTile)
								setLogicTile(ret,tx,ty,"mapTile",rc.getTile(tx,ty));

						}

					}
			} else console.warn("Can't load mod type",mod);
		});

		// Add hotspot tiles, clearing other texture-affecting effect
		ret.hotspots.forEach(hotspot=>{
			var tx=hotspot[0],ty=hotspot[1];
			rc.setTile(tx,ty,"floor",10);
			rc.setTile(tx,ty,"floorTint",2);
			rc.setTile(tx,ty,"floorBlink",4);
			rc.unsetTile(tx,ty,"floorScrollX");
			rc.unsetTile(tx,ty,"floorScrollY");
		});

		// Orient thin walls automatically
		autoVertical.forEach(tile=>{
			rc.setTile(tile.tx,tile.ty,"open",0);
			if (!getLogicTile(ret,tile.tx+1,tile.ty).blockable)
					rc.setTile(tile.tx,tile.ty,"wallThinVertical",true)
		})

		// Highest Wall
		rc.setHighestWall(loaded.highestWall||0);

		// Sky/floor color
		if (loaded.skybox) rc.setSkybox(RayCaster.createTextures(SKYBOXES[loaded.skybox]));
		else rc.setSkybox(0);
		if (loaded.skyColor) rc.setSkyColor(PALETTE[loaded.skyColor]);
		else rc.setSkyColor(0);
		if (rc.floorColor) rc.setFloorColor(PALETTE[loaded.floorColor]);
		else rc.setFloorColor(0);

		// Light - Global
		if (loaded.skyboxR) rc.setTintColor([loaded.skyboxR,loaded.skyboxG,loaded.skyboxB]);
		else if (loaded.tintColor) rc.setTintColor(PALETTE[loaded.tintColor]);
		else rc.setTintColor(PALETTE.BLACK);
		rc.setTintBase(getRaycasterValue(loaded,"tintBase")); 
		rc.setTintRamp(getRaycasterValue(loaded,"tintRamp"));

		// Light - Overall
		rc.setOverallLight(getRaycasterValue(loaded,"overallLight"));
		rc.setOverallTint(getRaycasterValue(loaded,"overallTint"));

		// Light - Skybox
		rc.setSkyboxTint(getRaycasterValue(loaded,"skyboxTint"));
		rc.setSkyboxLight(getRaycasterValue(loaded,"skyboxLight"));

		// Light - Floor
		rc.setFloorLight(getRaycasterValue(loaded,"floorLight"));
		rc.setFloorTint(getRaycasterValue(loaded,"floorTint"));

		// Light - Ceiling
		rc.setCeilingLight(getRaycasterValue(loaded,"ceilingLight"));
		rc.setCeilingTint(getRaycasterValue(loaded,"ceilingTint"));

		// Light - Walls
		rc.setWallLight(getRaycasterValue(loaded,"wallLight"));
		rc.setWallTint(getRaycasterValue(loaded,"wallTint"));
		rc.setWallCornerLight(getRaycasterValue(loaded,"wallCornerLight"));
		rc.setWallCornerTint(getRaycasterValue(loaded,"wallCornerTint"));

		// Light - Sprites
		rc.setSpritesLight(getRaycasterValue(loaded,"spritesLight"));
		rc.setSpritesTint(getRaycasterValue(loaded,"spritesTint"));

		// Light - Sprites
		rc.setShadowLight(getRaycasterValue(loaded,"shadowLight"));
		rc.setShadowTint(getRaycasterValue(loaded,"shadowTint"));

		// Prepare freepoints
		spawnable.forEach((row,y)=>{
			row.forEach((value,x)=>{
				if (value&&!getLogicTile(ret,x,y).blockable) ret.freepoints.push({x:x,y:y});
			})
		});

		return ret;
	}

}