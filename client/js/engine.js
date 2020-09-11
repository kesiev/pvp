function RayCaster(cfg) {

	// Shell sort
	function distanceSorter(ary) {
	  var
	  	inc = QMATH.round(ary.length / 2),i, j, t;

	  while (inc > 0) {
		  for (i = inc; i < ary.length; i++) {
			  t = ary[i];
			  j = i;
			  while (j >= inc && ary[j - inc]._distance < t._distance ) {
				  ary[j] = ary[j - inc];
				  j -= inc;
			  }
			  ary[j] = t;
		  }
		  inc = QMATH.round(inc / 2.2);
	  }

	  return ary;
	}

	const
		// Constants
		PI=QMATH.PI,
		PI2=PI*2,
		PI_4=4/PI,

		// Default tile data
		TILEDEFAULT=[0],

		// Default sprite attributes
		SPRITEDEFAULT={
			textureX:0,
			textureY:0,
			aimable:false,
			pitch:0,
			width:0.2,
			height:0.2,
			uDiv:1,
			vDiv:1,
			vMove:0,
			keepRatio:true,
			visible:true,
			hideFromCamera:-1
		},

		// Attributes
		ATTRIBUTES=[
			"ceiling",
			"floor",
			"wall",
			"ceilingLight",
			"ceilingTint",
			"floorBlink",
			"floorLight",
			"floorScrollX",
			"floorScrollY",
			"floorTint",
			"wallBlink",
			"wallCornerLight",
			"wallCornerTint",
			"wallGlitch",
			"wallHeight",
			"wallLight",
			"wallScrollX",
			"wallScrollY",
			"wallThin",
			"wallThinVertical",
			"wallTint",
			"wallTop",
			"open",
			"sprite",
			"sprite2"
		];

	var
		ATTRIBUTES_MAP={},

		// Textures
		texturesdata,
		texWidth=cfg.textureWidth||64,
		texHeight=cfg.textureHeight||64,
		texWidth_1=texWidth-1,
		texHeight_1=texHeight-1,
		
		// Skybox
		skybox,skyboxSliceX,skyboxWidth,skyboxHeight,skyboxTint,skyboxLight,

		// Sky & floor flat colors
		skyColor,floorColor,

		// Maps
		map,mapw,maph,
		
		// Sprites
		sprites,

		// Global timer for special animations
		globalTimer,
		globalTimerLimit=texWidth*4,

		// Renderer enabled flags
		renderFloor,renderCeiling,renderFloorCeiling,highestWall,

		// Lights
		tintR,tintG,tintB,
		overallLight,overallTint,tintRamp,
		wallCornerLight,spritesLight,floorLight,ceilingLight,shadowLight,wallLight,
		wallCornerTint,spritesTint,floorTint,ceilingTint,shadowTint,wallTint;

	// Pixel-level helpers

	function rgbProportion(fromcolor,tocolor,power,light) {
		return (tocolor+((fromcolor-tocolor)*power))*light;
	}

	var destPixel;
	function colorPixel(imagedatadata,imagewidth,tox,toy,r,g,b,tint,light) {
		destPixel=((toy*imagewidth)+tox)*4;
		if (tint<0) tint=0;
		if (tint>1) tint=1;		
		imagedatadata[destPixel]=rgbProportion(r*tint,tintR,tint,light);
		imagedatadata[destPixel+1]=rgbProportion(g*tint,tintG,tint,light);
		imagedatadata[destPixel+2]=rgbProportion(b*tint,tintB,tint,light);
	}

	function invisiblePixel(imagedatadata,imagewidth,tox,toy,light) {
		destPixel=((toy*imagewidth)+tox)*4;
		imagedatadata[destPixel]*=light;
		imagedatadata[destPixel+1]*=light;
		imagedatadata[destPixel+2]*=light;
	}

	var sourcePixel,alpha;
	function copyPixel(imagedatadata,imagewidth,texturewidth,texturedata,txtx,txty,tox,toy,tint,light,invisible) {
		sourcePixel=((txty*texturewidth)+txtx)*4;
		alpha=texturedata[sourcePixel+3];
		light*=overallLight;
		tint*=overallTint;
		if (alpha!=0) {
			if (invisible) {
				invisiblePixel(
					imagedatadata,imagewidth,
					tox,toy,
					invisible
				)
			} else {
				if (alpha!=255) {
					light=1;
					tint=100;
				}
				colorPixel(
					imagedatadata,imagewidth,
					tox,toy,
					texturedata[sourcePixel],
					texturedata[sourcePixel+1],
					texturedata[sourcePixel+2],
					tint,
					light
				)
			}
			return true;
		}
	}

	function getTint(distance) {
		return tintBase+tintRamp/distance;
	}

	// Map reader

	function getTile(wallX,wallY,outmap) {
		if (!((wallX<0)||(wallX>=mapw)||(wallY<0)||(wallY>=maph)))
			return map[(wallY*mapw)+wallX];
		else
			return outmap;
	}

	// Camera object

	this.Camera=function(camcfg) {
		if (!camcfg) camcfg={};

		var
			// Self reference
			self=this,

			// Camera ID (for hiding sprites)
			cameraId = camcfg.id||0,

			// Camera size
			rw=camcfg.w,
			rh=camcfg.h,
			w=cfg.lowRes?QMATH.floor(rw/2):rw,
			h=cfg.lowRes?QMATH.floor(rh/2):rh,

			hw=QMATH.floor(w/2),
			hh=(h/2),

			// Camera position
			posX=0,
			posY=0,
			posZ=0,
			pitch=0,
			angleRot=0,

			// Default camera perspective
			oDirX = -1,
			oDirY = 0,
			oPlaneX = camcfg.planeX||0,
			oPlaneY = camcfg.planeY||0.66,

			// Current camera perspective
			dirX, dirY, planeX, planeY,

			// Skybox size
			skyboxSliceY=skyboxHeight/(h*2),
			
			// Camera perspective

			// Camera aim area (for aiming sprites)
			aimwidth,aimheight,aimCount,
			aimXStart,aimXEnd,aimYStart,aimYEnd,

			// Camera canvas
			cnv;

		this.width=w;
		this.height=h;

		// Basic getters
		this.getPosX=function() { return posX; }
		this.getPosY=function() { return posY; }
		this.getAngleRot=function() { return angleRot; }

		// Basic setters
		this.setPosX=function(v) { posX=v; }
		this.setPosY=function(v) { posY=v; }
		this.setPosZ=function(v) { posZ=v*h; }

		// Aiming
		this.setAiming=function(width,height,count) {
			aimwidth=width*w;
			aimheight=height*h;
			aimCount=count;
			aimXStart=hw-aimwidth;
			aimXEnd=hw+aimwidth;
			aimYStart=hh-aimheight;
			aimYEnd=hh+aimheight;
		}

		// Camera rotation
		this.setPitch=function(v) { pitch =v*h;}
		this.pitchBy=function(by) { pitch+=by*h; }
		this.setAngleRot=function(v) {
			angleRot=v;
			dirX = oDirX * QMATH.cos_(angleRot) - oDirY * QMATH.sin_(angleRot);
			dirY = oDirX * QMATH.sin_(angleRot) + oDirY * QMATH.cos_(angleRot);
			planeX = oPlaneX * QMATH.cos_(angleRot) - oPlaneY * QMATH.sin_(angleRot);
			planeY = oPlaneX * QMATH.sin_(angleRot) + oPlaneY * QMATH.cos_(angleRot);
		}	
		this.setDirX=function(v) {
			oDirX=v;
			this.setAngleRot(angleRot);
		}
		this.rotateBy=function(rotSpeed) {
			this.setAngleRot((angleRot+rotSpeed)%PI2);
		}

		this.pointAt=function(sprite) {
			this.setAngleRot(QMATH.atan2( posY-sprite.y,posX-sprite.x));
		}

		// Camera movement
		this.placeAt=function(x,y) {
			posX=x;
			posY=y;
		}
		this.advanceBy=function(moveSpeed) {
			posX=posX+(dirX * moveSpeed);
			posY=posY+(dirY * moveSpeed);
		}

		// Blit camera data on screen
		if (cfg.lowRes)
			this.blit=function(dctx,dx,dy) {
				ctx.putImageData(imagedata,0,0);
				dctx.drawImage(cnv,0,0,w,h,dx,dy,rw,rh);
			}
		else
			this.blit=function(dctx,dx,dy) {
				dctx.putImageData(imagedata,dx,dy);
			}
		
		function scheduleSprite(sprite) {
			if (spriteOrder.indexOf(sprite)==-1) {
				if (sprite.visible&&(sprite.hideFromCamera!=cameraId)) {
					sprite._distance=sprite.drawPriority+((posX - sprite.x) * (posX - sprite.x) + (posY - sprite.y) * (posY - sprite.y));  //sqrt not taken, unneeded
					spriteOrder[spriteQty]=sprite;
					spriteQty++;
				}
			}
		}

		// Camera effect
		this.setLight=function(v) { cameraLight=v; }
	
		// Camera rendering
		var 
			// Renderer initialization
			ZBufferStart=[],ZBufferDist=[], // Z-buffer
			spriteOrder=[], // Sprites references array
			spriteQty=0, // Amount of sprites to render
			tileX,tileY, // Camera tile position
			cameraLight=0, // Per-camera additional light

			tint,light, // Tint/light
			rayDirX0,rayDirY0, // Ray direction
			tex,texMask, // Current tex
			startTex, startTexMask, startInternal, // Camera position details
			tx,ty, // Texture pixel position

			// Floor/wall/ceiling rendering
			rayDirX1,
			rayDirY1,

			is_floor, // True if is rendering floor
			camZ, // Camera z-position
			rowDistance, rowDistanceDiv, // Distance of camera
			floorStepX,floorStepY, // Delta movement on floor
			floorX,floorY, // Pixel position on floor
			cellX,cellY, // Current rendered cell
			floorTex,ceilTex, // Textures for floor/ceiling
			drawskybox, // If true render the skybox

			// Wall renderer
			cameraX, // Camera X position
			internal, // Shadow detection
			mapX,mapY,mapDX,mapDY,  // Map traveling
			sideDistX,sideDistY, // length of ray from current position to next x or y-side
			deltaDistX,deltaDistY, //length of ray from one x or y-side to next x or y-side
			perpWallDist, // Wall distance + perspective
			stepX,stepY, //what direction to step in x or y-direction (either +1 or -1)
			texHit, texHit2, // Wall hit
			hit, //was there a wall hit?
			render, // Render?
			texTall, // Texture tall
			open, // Current door open value
			lastDrawStart, // Last draw end
			tintRatio,lightRatio, // Tint/light ratio
			side, //was a NS or a EW wall hit?
			lineHeight, drawStart, drawStartSum, drawStartFirst, drawEnd, // Line rendering
			scrollX,scrollY, // Texture scrolling
			wallX, //where exactly the wall was hit
			step,// How much to increase the texture coordinate per screen pixel
			texPos, // Starting texture coordinate
						
			map_x2,map_y2,slideTexX,adj,ray_mult,rxe2,rye2,true_delta_x,true_delta_y, // Thin wall drawing
			true_y_step,half_step_in_y,true_x_step,half_step_in_x,

			// Sprite renderer
			rendering, // Current rendered sprite
			textureData, // Current rendererd sprite data
			textureX,textureY, // Texture position in spritesheet
			spriteOverlayX,spriteOverlayY, // Texture overlay position in spritesheet
			spriteX, spriteY, // Sprite position on camera
			invDet, transformX, transformY, // Position transform
			vMove, // Vertical sprite position
			angle, // Sprite orientation angle
			spriteScreenX, vMoveScreen, // Sprite position
			drawStartX, drawEndX, drawStartY, drawEndY, // Sprite position on screen
			spriteHeight,spriteWidth, // Sprite size
			aimed, // True if the sprite is aimed
			pixelX,pixelY, // Rendereing pixel on the screen
			zBufStripeStart,zBufStripeDist, // Current stripe of the zBuffer
			stripeDrawEndY, // DrawEndY for current stripe
			stripe, // Rendered stripe

			// generic iterators
			x,y,i,j

		;
		this.aiming=[];

		this.render=function() {

			this.aiming.length=0;
			ZBufferStart.length=0;
			ZBufferDist.length=0;
			spriteQty=0;
			spriteOrder.length=0;
			tileX=QMATH.floor(posX);
			tileY=QMATH.floor(posY);
			startTex=getTile(tileX,tileY,TILEDEFAULT);
			startTexMask=startTex[0];
			startInternal=startTexMask&MASK_ceiling;

			// Floor/ceiling renderer
			if (renderFloorCeiling) {

				// rayDir for leftmost ray (x = 0) and rightmost ray (x = w)
				rayDirX0 = dirX - planeX;
				rayDirY0 = dirY - planeY;
				rayDirX1 = dirX + planeX;
				rayDirY1 = dirY + planeY;

				for(y = 0; y < h; y++) {

					is_floor = y > hh + pitch;

					if ((is_floor&&renderFloor)||(!is_floor&&renderCeiling)) {
					
						// Vertical position of the camera.
						camZ = is_floor ? (hh + posZ) : (hh - posZ);

						// Horizontal distance from the camera to the floor for the current row.
						// 0.5 is the z position exactly in the middle between floor and ceiling.
						// / ... = Current y position compared to the center of the screen (the horizon)
						rowDistanceDiv=is_floor ? (y - hh - pitch) : (hh - y + pitch);
						if (rowDistanceDiv) rowDistance = camZ / rowDistanceDiv;
						else rowDistance=100;

						// calculate the real world step vector we have to add for each x (parallel to camera plane)
						// adding step by step avoids multiplications with a weight in the inner loop
						floorStepX = rowDistance * (rayDirX1 - rayDirX0) / w;
						floorStepY = rowDistance * (rayDirY1 - rayDirY0) / w;

						// real world coordinates of the leftmost column. This will be updated as we step to the right.
						floorX = posX + rowDistance * rayDirX0;
						floorY = posY + rowDistance * rayDirY0;

						for(x = 0; x < w; ++x) {

							// the cell coord is simply got from the integer parts of floorX and floorY
							cellX = QMATH.floor(floorX);
							cellY = QMATH.floor(floorY);

							// get the texture coordinate from the fractional part
							tx = QMATH.floor((texWidth * (floorX - cellX)) & texWidth_1);
							ty = QMATH.floor((texHeight * (floorY - cellY)) & texHeight_1);

							floorX += floorStepX;
							floorY += floorStepY;

							// Initialize renderer parameters
							drawskybox=false;
							tint=getTint(rowDistance);
							light=1;

							tex=getTile(cellX,cellY,TILEDEFAULT);
							texMask=tex[0];
							
							if(is_floor)  {

								// Render floor
								if (texMask&MASK_floor) {

									floorTex=tex[POS_floor];

									tint*=floorTint;
									light*=floorLight;

									// Texture scrolling
									if (texMask&MASK_floorScrollX) {
										tx=QMATH.floor((tx+(tex[POS_floorScrollX]*globalTimer))&texWidth_1);
										if (tx<0) tx=texWidth+tx;
									}
									if (texMask&MASK_floorScrollY) {
										ty=QMATH.floor((ty+(tex[POS_floorScrollY]*globalTimer))&texHeight_1);
										if (ty<0) ty=texHeight+ty;
									}
									// Brightness
									if (texMask&MASK_floorLight) light*=tex[POS_floorLight];
									if (texMask&MASK_floorTint) tint*=tex[POS_floorTint];
									// Blinking
									if ((texMask&MASK_floorBlink)&&((globalTimer/tex[POS_floorBlink])%2<1)) floorTex++;										

									if (texMask&MASK_ceiling) {
										light*=shadowLight;
										tint*=shadowTint;
									}

									if (!copyPixel(
										imagedatadata,w,
										texWidth,texturesdata.textureById[floorTex],
										tx,ty,
										x,y,
										tint,cameraLight+light
									)) drawskybox=true;

								} else if (floorColor) {

									colorPixel(imagedatadata,w,x,y,floorColor[0],floorColor[1],floorColor[2],tint*overallTint,(cameraLight+light)*overallLight);

								} else drawskybox=true;

							} else {

								// Render ceiling
								if (texMask&MASK_ceiling) {

									ceilTex=tex[POS_ceiling];

									light*=ceilingLight;
									tint*=ceilingTint;

									// Brightness
									if (texMask&MASK_ceilingLight) light*=tex[POS_ceilingLight];
									if (texMask&MASK_ceilingTint) tint*=tex[POS_ceilingTint];

									if (!copyPixel(
										imagedatadata,w,
										texWidth,texturesdata.textureById[ceilTex],
										tx,ty,
										x,y,
										tint,cameraLight+light
									))  drawskybox=true;

								} else if (skyColor) {

									colorPixel(imagedatadata,w,x,y,skyColor[0],skyColor[1],skyColor[2],skyboxTint*overallTint,(cameraLight+skyboxLight)*overallLight);
								
								} else drawskybox=true;
							}

							// Render skybox
							if (drawskybox&&skybox) {
								tx =QMATH.floor(skyboxWidth+skyboxSliceX*angleRot-x)%skyboxWidth;
								ty =QMATH.floor((h+y-pitch)*skyboxSliceY);
								if (ty<0) ty=0;
								if (ty>=skyboxHeight) ty=skyboxHeight-1;
								copyPixel(
									imagedatadata,w,
									skyboxWidth,skybox,
									tx,ty,
									x,y,
									skyboxTint,cameraLight+skyboxLight
								);
							}
							
						}
					}
				}

			}

			// Wall renderer
			for( x = 0; x < w; x++) {

				//calculate ray position and direction
				cameraX = 2 * x / w - 1; //x-coordinate in camera space
				rayDirX0 = dirX + planeX * cameraX;
				rayDirY0 = dirY + planeY * cameraX;

				//which box of the map we're in
				mapX = tileX;
				mapY = tileY;
				mapDX=0;
				mapDY=0;

				//length of ray from one x or y-side to next x or y-side
				deltaDistX = QMATH.abs(1 / rayDirX0);
				deltaDistY = QMATH.abs(1 / rayDirY0);

				hit = 0; //was there a wall hit?
				render = 0; // Render?
				texTall=1; // Texture tall
				lastDrawStart = h; // Last draw end
				slideTexX=0;
				scrollX=0;
				scrollY=0;

				//calculate step and initial sideDist
				if (rayDirX0 < 0) {
					stepX = -1;
					sideDistX = (posX - mapX) * deltaDistX;
				} else {
					stepX = 1;
					sideDistX = (mapX + 1 - posX) * deltaDistX;
				}
				if (rayDirY0 < 0) {
					stepY = -1;
					sideDistY = (posY - mapY) * deltaDistY;
				} else {
					stepY = 1;
					sideDistY = (mapY + 1 - posY) * deltaDistY;
				}

				tex=startTex;
				internal=startInternal;			

				//perform DDA
				while (hit == 0) {

					//jump to next map square, OR in x-direction, OR in y-direction
					if (sideDistX < sideDistY) {
						sideDistX += deltaDistX;
						mapX += stepX;
						side = 0;
					} else {
						sideDistY += deltaDistY;
						mapY += stepY;
						side = 1;
					}

					//Check if ray has hit a wall
					tex=getTile(mapX,mapY);

					if (tex==undefined) break;
					else {
						texMask=tex[0];

						if (texMask&MASK_wall) {
							
							texHit2=texHit=tex[POS_wall];

							tintRatio=1;
							lightRatio=1;

							if (internal) {
								lightRatio*=shadowLight;
								tintRatio*=shadowTint;
							}

							// Extended tiles
							if (texMask&MASK_sprite) {
								scheduleSprite(tex[POS_sprite]);
								if (texMask&MASK_sprite2) scheduleSprite(tex[POS_sprite2]);
							} else {
								if (texMask&MASK_wallThin) {
									// Thin walls & doors
									if ((!(texMask&MASK_wallThinVertical)&&(side==1))||((texMask&MASK_wallThinVertical)&&(side==0))) {

										if (!internal&&(texMask&MASK_ceiling)) {
											lightRatio*=shadowLight;
											tintRatio*=shadowTint;
										}

										map_x2=mapX;
										map_y2=mapY;

										if (posX<mapX) map_x2-=1;
										if (posY>mapY) map_y2+=1;
									
										adj=1;
										ray_mult=1;
										if (side==1) {
											adj=map_y2-posY;
											ray_mult=adj/rayDirY0;
										} else {
											adj=(map_x2-posX)+1;
											ray_mult=adj/rayDirX0;
										}
									
										rxe2=posX+rayDirX0*ray_mult;
										rye2=posY+rayDirY0*ray_mult;
										
										true_delta_x=QMATH.sqrt(1+(rayDirY0*rayDirY0)/(rayDirX0*rayDirX0));
										true_delta_y=QMATH.sqrt(1+(rayDirX0*rayDirX0)/(rayDirY0*rayDirY0));
									
										if (QMATH.abs(rayDirX0)<0.01) true_delta_x=100;
										if (QMATH.abs(rayDirY0)<0.01) true_delta_y=100;

										// you only need one x/y component
										// depending on whether you hit a 
										// horizontal or vertical wall
										open=tex[POS_open];

										if (side==0) { // -- vertical north-south

											true_y_step=QMATH.sqrt(true_delta_x*true_delta_x-1);
											half_step_in_y=rye2+(stepY*true_y_step)/2;

											if ((QMATH.floor(half_step_in_y)==mapY)&&(half_step_in_y-mapY>open)) {
												mapDX=stepX/2;
												slideTexX=open;
												render=2;
											}

										} else { // horizontal east-west

											true_x_step=QMATH.sqrt(true_delta_y*true_delta_y-1);
											half_step_in_x=rxe2+(stepX*true_x_step)/2;

											if ((QMATH.floor(half_step_in_x)==mapX)&&(half_step_in_x-mapX>open)) {
												mapDY=stepY/2;
												slideTexX=open;
												render=2;
											}

										}  
									}								
								} else render=1;
								// Brightness
								if (texMask&MASK_wallLight) lightRatio*=tex[POS_wallLight];
								if (texMask&MASK_wallTint) tintRatio*=tex[POS_wallTint];
								// Animation
								if ((texMask&MASK_wallBlink)&&((globalTimer/tex[POS_wallBlink])%2<1)) texHit++;
								if (texMask&MASK_wallScrollY) {
									scrollX=QMATH.floor(tex[POS_wallScrollX]*globalTimer)&texWidth_1;
									if (scrollX<0) scrollX=texWidth+scrollX;
								}
								if (texMask&MASK_wallScrollY) {
									scrollY=QMATH.floor(tex[POS_wallScrollY]*globalTimer)&texHeight_1;
									if (scrollY<0) scrollY=texHeight+scrollY;
								}
								
								// Cheap Multi-height - TODO broken	on higher than 0				
								if (texMask&MASK_wallHeight)  texTall=tex[POS_wallHeight];
								if (texMask&MASK_wallTop) texHit2=tex[POS_wallTop];
								if (texMask&MASK_wallGlitch) texTall+=QMATH.random();
								if (side==1) {
									if (texMask&MASK_wallCornerLight) lightRatio*=tex[POS_wallCornerLight];
									if (texMask&MASK_wallCornerTint) tintRatio*=tex[POS_wallCornerTint];
								}
							}
						}
					}

					// Render the ray
					if (render) {

						//Calculate distance of perpendicular ray (Euclidean distance will give fisheye effect!)
						if (side == 0) perpWallDist = (mapX + mapDX - posX + (1 - stepX) / 2) / rayDirX0;
						else perpWallDist = (mapY + mapDY - posY + (1 - stepY) / 2) / rayDirY0;

						tint=getTint(perpWallDist)*wallTint*(side==1?wallCornerTint:1)*tintRatio;
						light=wallLight*(side==1?wallCornerLight:1)*lightRatio;

						//Calculate height of line to draw on screen
						lineHeight =h / perpWallDist;

						//calculate lowest and highest pixel to fill in current stripe
						drawStartSum = hh + pitch + (posZ / perpWallDist);
						drawStartFirst = QMATH.floor( -lineHeight / 2 + drawStartSum );
						drawStart = QMATH.floor( -(lineHeight*texTall) / 2 + drawStartSum );
						if (drawStart < 0) drawStart = 0;
						drawEnd = QMATH.floor(lineHeight / 2 + hh + pitch + (posZ / perpWallDist));
						if (drawEnd > h) drawEnd = h;

						//calculate value of wallX
						if (side == 0) wallX = posY + perpWallDist * rayDirY0;
						else wallX = posX + perpWallDist * rayDirX0;
						wallX = wallX - QMATH.floor(wallX) - slideTexX;

						//x coordinate on the texture
						tx = QMATH.floor(wallX * texWidth);
						if (
							(side == 0 && rayDirX0 > 0)||
							(side == 1 && rayDirY0 < 0)
						) tx = texWidth_1 - tx;

						// How much to increase the texture coordinate per screen pixel
						step = 1 * texHeight / lineHeight;
						// Starting texture coordinate
						texPos = (drawStart - pitch - (posZ / perpWallDist) - hh + lineHeight / 2) * step;

						if (drawStart<lastDrawStart) {
							if (drawEnd>lastDrawStart) drawEnd=lastDrawStart;
							lastDrawStart=drawStart;
							if (!ZBufferStart[x]) {
								ZBufferStart[x]=[];
								ZBufferDist[x]=[];
							}
							ZBufferStart[x].push(drawStart);
							ZBufferDist[x].push(perpWallDist);

							for(y = drawStart; y<drawEnd; y++) {
								// Cast the texture coordinate to integer, and mask with (texHeight - 1) in case of overflow
								texPos += step;
								copyPixel(
									imagedatadata,w,
									texWidth,texturesdata.textureById[y>drawStartFirst?texHit:texHit2],
									(scrollX+tx)&texHeight_1,(scrollY+QMATH.floor(texPos))&texWidth_1,
									x,y,
									tint,cameraLight+light
								);
							}
						}

						// Reset renderer effects
						if ((render==1)&&(texTall>highestWall)) hit=1;
						else render=0;
						texTall=1;
						mapDX=0;
						mapDY=0;
						scrollX=0;
						scrollY=0;
						slideTexX=0;

					}

					// Store if we're still under the ceiling
					internal=texMask&MASK_ceiling;

				}

			}

			if (startTexMask&MASK_sprite) scheduleSprite(startTex[POS_sprite]);

			// Sprites renderer
			for(x = 0; x < sprites.length; x++)
				scheduleSprite(sprites[x]);

			distanceSorter(spriteOrder);

			//after sorting the sprites, do the projection and draw them
			for(i = 0; i < spriteQty; i++) {

				rendering=spriteOrder[i];
				textureData=rendering.textures;
				spriteOverlayX=0;
				spriteInvisible=0;
				textureX=rendering.textureX;
				textureY=rendering.textureY;

				//translate sprite position to relative to camera
				spriteX = rendering.x - posX;
				spriteY = rendering.y - posY;

				//transform sprite with the inverse camera matrix
				invDet = 1 / (planeX * dirY - dirX * planeY); //required for correct matrix multiplication
				transformX = invDet * (dirY * spriteX - dirX * spriteY);
				transformY = invDet * (-planeY * spriteX + planeX * spriteY); //this is actually the depth inside the screen, that what Z is in 3D

				// Calculate light
				tint=getTint(transformY)*spritesTint;
				light=spritesLight;
				tex=getTile(QMATH.floor(rendering.x),QMATH.floor(rendering.y),TILEDEFAULT);
				if (tex[0]&MASK_ceiling) {
					light*=shadowLight;
					tint*=shadowTint;
				}

				// Extended effects
				vMove=0;
				if (rendering.spriteBlink&&((globalTimer/rendering.spriteBlink)%2<1)) textureX++;
				if (rendering.spriteLight) light*=rendering.spriteLight;
				if (rendering.spriteTint) tint*=rendering.spriteTint;
				if (rendering.spriteShineLight) light+=(1+QMATH.sin((PI2*(globalTimer*rendering.spriteShineSpeed)/globalTimerLimit)%PI2))*rendering.spriteShineLight;
				if (rendering.spriteFloat) vMove-=(1+QMATH.sin((PI2*(globalTimer*rendering.spriteFloatSpeed)/globalTimerLimit)%PI2))*rendering.spriteFloat;
				if (rendering.spriteOverlayY) {
					spriteOverlayX=rendering.spriteOverlayX;
					spriteOverlayY=rendering.spriteOverlayY;
				}
				if (rendering.spriteInvisibleLight) spriteInvisible=1+((QMATH.sin((PI2*(globalTimer*rendering.spriteInvisibleSpeed)/globalTimerLimit)%PI2))*rendering.spriteInvisibleLight);
				if (rendering.spriteOverlayBlink&&((globalTimer/rendering.spriteOverlayBlink)%2<1)) spriteOverlayX++;
					
				// Orient sprite to the right angle
				if (rendering.orient) {
					angle = QMATH.atan2(spriteY, spriteX)-rendering.angle;
					textureX=QMATH.floor((angle*PI_4)+0.5)%8;
					if (textureX<0) textureX=8+textureX;
				}

				// Calculate sprite position
				spriteScreenX = QMATH.floor(hw * (1 + transformX / transformY));
				vMoveScreen = QMATH.floor((rendering.vMove+vMove)*h / transformY) + pitch + posZ / transformY;

				//calculate height of the sprite on screen
				spriteHeight = QMATH.abs(QMATH.floor(h / (transformY)))/rendering.vDiv; //using 'transformY' instead of the real distance prevents fisheye
				
				//calculate lowest and highest pixel to fill in current stripe
				drawStartY = -spriteHeight / 2 + hh +vMoveScreen ;
				if(drawStartY < 0) drawStartY = 0;
				drawEndY = spriteHeight / 2 + hh + vMoveScreen ;
				if(drawEndY > h) drawEndY = h;

				//calculate width of the sprite
				spriteWidth = QMATH.abs( QMATH.floor(h / (transformY)))/rendering.uDiv;
				drawStartX = -spriteWidth / 2 + spriteScreenX;
				if(drawStartX < 0) drawStartX = 0;
				drawEndX = spriteWidth / 2 + spriteScreenX;
				if(drawEndX > w) drawEndX = w;
				
				aimed=false;				

				//loop through every vertical stripe of the sprite on screen
				for(stripe = drawStartX; stripe < drawEndX; stripe++) {
					pixelX=QMATH.floor(stripe);
					zBufStripeStart=ZBufferStart[pixelX];
					zBufStripeDist=ZBufferDist[pixelX];
					tx = QMATH.floor(((stripe - (-spriteWidth / 2 + spriteScreenX)) * textureData.textureWidth / spriteWidth) );
					//the conditions in the if are:
					//1) it's in front of camera plane so you don't see things behind you
					//2) it's on the screen (left)
					//3) it's on the screen (right)
					//4) ZBuffer, with perpendicular distance

					if(transformY > 0 && stripe >= 0 && stripe < w) {
						// Find drawStart
						stripeDrawEndY=drawEndY;							
						if (zBufStripeDist)
							for (j=0;j<zBufStripeDist.length;j++) {
								if (zBufStripeDist[j]>transformY) break;
								else if (stripeDrawEndY>zBufStripeStart[j])
									stripeDrawEndY=zBufStripeStart[j];					
							}

						if (stripeDrawEndY>drawStartY)
							for(y = drawStartY; y < stripeDrawEndY; y++) { //for every pixel of the current stripe
								ty = QMATH.floor(((((y-vMoveScreen) - hh + spriteHeight * 0.5) * textureData.textureHeight) / spriteHeight));
								if (ty>textureData.textureHeight_1) ty=textureData.textureHeight_1;
								if (ty<0) ty=0;

								pixelY=QMATH.floor(y);

								// Aim sprites
								if (
									copyPixel(
										imagedatadata,w,
										textureData.textureWidth,textureData.textureByXY[textureX][textureY],
										tx,ty,pixelX,pixelY,tint,cameraLight+light,spriteInvisible
									)&&
									rendering.aimable&&
									(pixelX>=aimXStart)&&(pixelX<=aimXEnd)&&(pixelY>=aimYStart)&&(pixelY<=aimYEnd)
								) if (!aimed&&(this.aiming.length<aimCount)) {
									aimed=true;
									this.aiming.push(rendering);
								}

								if (spriteOverlayX)
									copyPixel(
										imagedatadata,w,
										textureData.textureWidth,textureData.textureByXY[spriteOverlayX][spriteOverlayY],
										tx,ty,pixelX,pixelY,tint,cameraLight+light
									)
							}
					}
				}
			}
		}

		// Initialize canvas size
		var
			canvas=DOM.createCanvas(w,h),
			cnv=canvas.canvas,
			ctx=canvas.ctx,
			imagedata=ctx.createImageData(w, h),
			imagedatadata=imagedata.data;

		for (x=3;x<w*h*4;x+=4)
			imagedatadata[x]=255;

		// Initialize
		this.setAngleRot(0);
		this.setAiming(camcfg.aimWidth||20,camcfg.aimHeight||20,camcfg.aimCount||1)

		return this;
	}

	var lightEditor;
	this.showLightsEditor=function(palette,defaults) {
		var self=this;
		if (!lightEditor) {

			var lights=[
				{id:"tintBase",suffix:"TintBase"},
				{id:"tintRamp",suffix:"TintRamp"},
				{id:"overallLight",suffix:"OverallLight"},
				{id:"overallTint",suffix:"OverallTint"},
				{id:"skyboxLight",suffix:"SkyboxLight"},
				{id:"skyboxTint",suffix:"SkyboxTint"},
				{id:"floorLight",suffix:"FloorLight"},
				{id:"floorTint",suffix:"FloorTint"},
				{id:"ceilingLight",suffix:"CeilingLight"},
				{id:"ceilingTint",suffix:"CeilingTint"},
				{id:"wallLight",suffix:"WallLight"},
				{id:"wallTint",suffix:"WallTint"},
				{id:"wallCornerLight",suffix:"WallCornerLight"},
				{id:"wallCornerTint",suffix:"WallCornerTint"},
				{id:"spritesLight",suffix:"SpritesLight"},
				{id:"spritesTint",suffix:"SpritesTint"},
				{id:"shadowLight",suffix:"ShadowLight"},
				{id:"shadowTint",suffix:"ShadowTint"}
			];
			
			function updateColor(value,k) {
				value.style.backgroundColor=value.value*1==defaults[k.id]?"lightgreen":"white";
			}

			lightEditor=true;
			var p=document.createElement("div");
			p.style.position="absolute";
			p.style.backgroundColor="white";
			p.style.color="black";
			p.style.right=0;
			p.style.top=0;
			p.style.padding="5px";
			p.style.zIndex=1000;
			p.style.height="200px";
			p.style.overflowY="scroll";

			var color=document.createElement("select");
			for (var c in palette) {
				var opt=document.createElement("option");
				opt.innerHTML=c;
				opt.value=c;
				color.appendChild(opt);
			}
			p.appendChild(color);
			color.onchange=function(c) {
				self.setTintColor(PALETTE[this.value]);
			}
			
			lights.forEach(light=>{
				var row=document.createElement("div");
				row.innerHTML=light.id;
				var slider=document.createElement("input");
				var value=document.createElement("input");
				var setdefault=document.createElement("input");
				var v=this["get"+light.suffix]();
				value.value=v;
				slider.type="range";
				slider.min=0;
				slider.max=200;
				slider.value=QMATH.floor(v*100);
				slider._key=light;
				slider._value=value;
				setdefault.type="button";
				setdefault.value=defaults[light.id];
				setdefault._value=value;
				setdefault._key=light;
				setdefault._slider=slider;
				value._slider=slider;
				value._key=light;
				slider.oninput=function() {
					var v=this.value/100;
					self["set"+this._key.suffix](v);
					this._value.value=v;
					updateColor(this._value,this._key);

				}
				value.onchange=function() {
					var v=(this.value*1)||0;
					self["set"+this._key.suffix](v);
					this._slider.value=v*100;
					updateColor(this,this._key);
				}
				setdefault.onclick=function() {
					var v=defaults[this._key.id];
					self["set"+this._key.suffix](v);
					this._value.value=v;
					this._slider.value=v*100;
					updateColor(this._value,this._key);
				}
				row.appendChild(slider);
				row.appendChild(value);
				row.appendChild(setdefault);
				updateColor(value,light);
				p.appendChild(row);
			})
			document.body.appendChild(p);
		}
	}

	// Environment setters
	this.setRenderCeiling=function(v) {
		renderCeiling=!!v;
		renderFloorCeiling=renderFloor||renderCeiling;
	}
	this.setRenderFloor=function(v) {
		renderFloor=!!v;
		renderFloorCeiling=renderFloor||renderCeiling;
	}
	this.setTextures=function(v) {
		return texturesdata=v;		
	}
	this.setSkybox=function(v) {
		if (v) {
			skyboxSliceX=(v.width/PI2);
			skyboxWidth=v.width;
			skyboxHeight=v.height;
			skybox=v.textureById[0];
		} else skybox=0;
		return skybox;
	}
	this.setSkyColor=function(v) {
		return skyColor=v;
	}
	this.setFloorColor=function(v) {
		return floorColor=v;
	}
	this.setSprites=function(v){
		return this.sprites=sprites=v;
	}

	// Map loader
	var row;
	this.newMap=function(w,h) {
		mapw=w;
		maph=h;
		map=[];
		for (y=0;y<h;y++) {
			for (x=0;x<w;x++)
				map.push([0]);
		}
	}
	this.setTile=function(x,y,k,v) {
		if (ATTRIBUTES_MAP[k]) {
			k=ATTRIBUTES_MAP[k];
			map[(y*mapw)+x][k.pos]=v;
			map[(y*mapw)+x][0]|=k.mask;
		} else debugger;
	}
	this.unsetTile=function(x,y,k,v) {
		if (ATTRIBUTES_MAP[k]) {
			k=ATTRIBUTES_MAP[k];
			map[(y*mapw)+x][0]&=~k.mask;
		} else debugger;
	}
	this.setSprite=function(x,y,sprite,sprite2) {
		this.setTile(x,y,"wall",1);
		this.setTile(x,y,"sprite",sprite);
		if (sprite2) this.setTile(x,y,"sprite2",sprite2);
	}
	this.getTile=getTile;

	// Sprite management
	this.getSprites=function() { return sprites; }

	var k;
	this.prepareSprite=function(spr) {
		spr._uuid=QMATH.random();
		spr._distance=0;
		for (k in SPRITEDEFAULT)
			if (spr[k]===undefined) spr[k]=SPRITEDEFAULT[k];
		if (spr.textures===undefined) spr.textures=texturesdata;
		if (spr.drawPriority===undefined) spr.drawPriority=200;
		if (spr.keepRatio) {
			spr.uDiv=texWidth/spr.textures.textureWidth;
			spr.vDiv=texHeight/spr.textures.textureHeight;
			spr.vMoveDefault=(texHeight-spr.textures.textureHeight)/2;
		} else spr.vMoveDefault=0;
		spr.hWidth=spr.width/2,
		spr.hHeight=spr.height/2;
		return spr;
	}
	this.addPreparedSprite=function(spr) {
		sprites.push(spr);
		return spr;
	}
	this.addSprite=function(spr) {
		spr=this.prepareSprite(spr);
		return this.addPreparedSprite(spr);
	}

	var pos;
	this.removeSprite=function(spr) {
		pos=sprites.indexOf(spr);
		if (pos!=-1) sprites.splice(pos,1);
	}

	// Walls
	this.setHighestWall=function(v) { highestWall=v; }
	this.getHighestWall=function() { return highestWall; }

	// Light - general
	this.setTintColor=function(color) {
		tintR=color[0];
		tintG=color[1];
		tintB=color[2];
	}
	this.setTintColorR=function(v) { tintR=v; }
	this.getTintColorR=function(v) { return tintR; }
	this.setTintColorG=function(v) { tintG=v; }
	this.getTintColorG=function(v) { return tintG; }
	this.setTintColorB=function(v) { tintB=v; }
	this.getTintColorB=function(v) { return tintB; }

	this.setOverallLight=function(v) { overallLight=v; }
	this.getOverallLight=function(v) { return overallLight; }
	this.setOverallTint=function(v) { overallTint=v; }
	this.getOverallTint=function(v) { return overallTint; }
	this.setTintBase=function(v) { tintBase=v; }
	this.getTintBase=function(v) { return tintBase; }
	this.setTintRamp=function(v) { tintRamp=v; }
	this.getTintRamp=function(v) { return tintRamp; }

	// Light - Skybox
	this.setSkyboxTint=function(v) { skyboxTint=v; }
	this.getSkyboxTint=function(v) { return skyboxTint; }
	this.setSkyboxLight=function(v) { skyboxLight=v; }
	this.getSkyboxLight=function(v) { return skyboxLight; }
	
	// Light - Floor
	this.setFloorLight=function(v) { floorLight=v; }
	this.getFloorLight=function(v) { return floorLight; }
	this.setFloorTint=function(v) { floorTint=v; }
	this.getFloorTint=function(v) { return floorTint; }

	// Light - Ceiling
	this.setCeilingLight=function(v) { ceilingLight=v; }
	this.getCeilingLight=function(v) { return ceilingLight; }
	this.setCeilingTint=function(v) { ceilingTint=v; }
	this.getCeilingTint=function(v) { return ceilingTint; }

	// Light - Walls
	this.setWallLight=function(v) { wallLight=v; }
	this.getWallLight=function(v) { return wallLight; }
	this.setWallTint=function(v) { wallTint=v; }
	this.getWallTint=function(v) { return wallTint; }

	// Light - Corners
	this.setWallCornerLight=function(v) { wallCornerLight=v; }
	this.getWallCornerLight=function(v) { return wallCornerLight; }
	this.setWallCornerTint=function(v) { wallCornerTint=v; }
	this.getWallCornerTint=function(v) { return wallCornerTint; }

	// Light - Sprites
	this.setSpritesLight=function(v) { spritesLight=v; }
	this.getSpritesLight=function(v) { return spritesLight; }
	this.setSpritesTint=function(v) { spritesTint=v; }
	this.getSpritesTint=function(v) { return spritesTint; }

	// Light - Shadows
	this.setShadowLight=function(v) { shadowLight=v; }
	this.getShadowLight=function(v) { return shadowLight; }
	this.setShadowTint=function(v) { shadowTint=v; }
	this.getShadowTint=function(v) { return shadowTint; }

	// Global timer
	this.resetGlobalTimer=function() {
		globalTimer=0;
	}
	this.tick=function() {
		globalTimer=(globalTimer+1)%globalTimerLimit;
	}

	// Initialize attributes map
	ATTRIBUTES.forEach((attribute,id)=>{
		var pos=id+1;
		var mask=1<<id;
		ATTRIBUTES_MAP[attribute]={pos:pos,mask:mask};
		window["POS_"+attribute]=pos;
		window["MASK_"+attribute]=mask;
	})

	// Initialize engine
	this.newMap(1,1);
	this.setSkybox();
	this.setHighestWall(0);
	this.setSkyColor([128,128,128]);
	this.setFloorColor([128,128,128]);
	this.setRenderFloor(true);
	this.setRenderCeiling(true);
	this.setSprites([]);

	// Light - Global
	this.setTintColor(PALETTE.BLACK);
	this.setTintBase(0.2);
	this.setTintRamp(0.4);

	// Light - Overall
	this.setOverallLight(1);
	this.setOverallTint(1);

	// Light - Skybox
	this.setSkyboxTint(0.6);
	this.setSkyboxLight(1);

	// Light - Floor
	this.setFloorLight(1.1);
	this.setFloorTint(1);

	// Light - Ceiling
	this.setCeilingTint(1);
	this.setCeilingLight(0.95);

	// Light - Walls
	this.setWallTint(1);
	this.setWallLight(1);
	this.setWallCornerLight(0.75);
	this.setWallCornerTint(1);

	// Light - Sprites
	this.setSpritesLight(1);
	this.setSpritesTint(1);

	// Light - Sprites
	this.setShadowLight(0.86);
	this.setShadowTint(1);

	this.resetGlobalTimer();

	return this;
}

// Texture helpers
RayCaster.createTextures=function(texturesnode,texturewidth,textureheight){
	// Initialize canvas
	var texturescanvas=DOM.createCanvas(texturesnode.width,texturesnode.height);
	if (texturewidth==undefined) texturewidth=texturesnode.width;
	if (textureheight==undefined) textureheight=texturesnode.height;
	texturescanvas.ctx.drawImage(texturesnode,0,0);

	// Split image in textures
	var cols=QMATH.floor(texturesnode.width/texturewidth),
		rows=QMATH.floor(texturesnode.height/textureheight),
		textureById=[],
		textureByXY=[];
	for (var y=0;y<rows;y++)
		for (var x=0;x<cols;x++) {
			if (!textureByXY[x]) textureByXY[x]=[];
			var data=texturescanvas.ctx.getImageData(x*texturewidth,y*textureheight,texturewidth,textureheight).data;
			textureById.push(data);
			textureByXY[x][y]=data;
		}
	return {
		cols:cols,
		rows:rows,
		width:texturesnode.width,
		height:texturesnode.height,
		textureWidth:texturewidth,
		textureHeight:textureheight,
		textureWidth_1:texturewidth-1,
		textureHeight_1:textureheight-1,
		textureById:textureById,
		textureByXY:textureByXY
	};
}

RayCaster.recolorTextures=function(texture,colormap) {

	var
		textureByXY=[],
		textureById=[];

	for (var ty=0;ty<texture.rows;ty++)
		for (var tx=0;tx<texture.cols;tx++) {
			var copy = new Uint8ClampedArray(texture.textureByXY[tx][ty]);
			for (var y=0;y<texture.textureHeight;y++)
				for (var x=0;x<texture.textureWidth;x++) {
					var ox=(x+(y*texture.textureWidth))*4;
					colormap.forEach(change=>{
						if (
							(copy[ox]==change.from[0])&&
							(copy[ox+1]==change.from[1])&&
							(copy[ox+2]==change.from[2])
						) {
							copy[ox]=change.to[0];
							copy[ox+1]=change.to[1];
							copy[ox+2]=change.to[2];
						}
					})
				}
			if (!textureByXY[tx]) textureByXY[tx]=[];
			textureById.push(copy);
			textureByXY[tx][ty]=copy;
		}
	
	return {
		colormap:colormap,
		rows:texture.rows,
		cols:texture.cols,
		width:texture.width,
		height:texture.height,
		textureWidth:texture.textureWidth,
		textureHeight:texture.textureHeight,
		textureWidth_1:texture.textureWidth_1,
		textureHeight_1:texture.textureHeight_1,
		textureById:textureById,
		textureByXY:textureByXY
	}
}

// Sprite helpers
function Sprite() {
	var PI2=QMATH.PI*2;

	this.isColliding=function(sprite,sprite2) {
		if (sprite!==sprite2) {
			return !(
					(sprite.x-sprite.hWidth>sprite2.x+sprite2.hWidth)||
					(sprite.x+sprite.hWidth<sprite2.x-sprite2.hWidth)||
					(sprite.y-sprite.hHeight>sprite2.y+sprite2.hHeight)||
					(sprite.y+sprite.hHeight<sprite2.y-sprite2.hHeight)
				);
		} else return false;
	};

	this.isCollidingDelta=function(sprite,dx,dy,sprite2) {
		if (sprite!==sprite2) {
			return !(
					(sprite.x+dx-sprite.hWidth>sprite2.x+sprite2.hWidth)||
					(sprite.x+dx+sprite.hWidth<sprite2.x-sprite2.hWidth)||
					(sprite.y+dy-sprite.hHeight>sprite2.y+sprite2.hHeight)||
					(sprite.y+dy+sprite.hHeight<sprite2.y-sprite2.hHeight)
				);
		} else return false;
	};
	this.getTileInFront=function(sprite) {
		return [
			QMATH.floor(sprite.x-QMATH.cos(sprite.angle)),
			QMATH.floor(sprite.y-QMATH.sin(sprite.angle))
		];
	};
	this.setAngle=function(sprite,angle) {
		angle=angle%PI2;
		if (angle<0) angle=PI2+angle;
		sprite.angle=angle;
	}
	this.rotateBy=function(sprite,v) {
		this.setAngle(sprite,sprite.angle+v);
	};
	this.pitchBy=function(sprite,v) {
		sprite.pitch+=v;
	};
	this.moveBy=function(sprite,angle,moveSpeed) {
		sprite.x-=moveSpeed*QMATH.cos_(angle);
		sprite.y-=moveSpeed*QMATH.sin_(angle);
	};

	var ret,gx,gy,dx,dy,rx,ry;
	this.advanceBy=function(sprite,angle,moveSpeed,checkObstacles,checkWalls) {
		ret=0;
		gx=-moveSpeed*QMATH.cos_(angle);
		gy=-moveSpeed*QMATH.sin_(angle);

		if (checkObstacles) {
			if (checkObstacles(sprite,gx,0)) {
				gx=0;
				ret|=1;
			}
			if (checkObstacles(sprite,gx,gy)) {
				gy=0;
				ret|=2;
			}
		}

		dx = sprite.x+gx;
		dy = sprite.y+gy;
		rx = dx + (gx<0?-sprite.hWidth:sprite.hWidth);
		ry = dy + (gy<0?-sprite.hHeight:sprite.hHeight);

		if (checkWalls(rx,sprite.y)) {
			ret|=1;
			sprite.x=gx<0?QMATH.ceil(rx)+sprite.hWidth:QMATH.floor(rx)-sprite.hWidth;
		} else
			sprite.x=dx;
		if (checkWalls(sprite.x,ry)) {
			ret|=2;			
			sprite.y=gy<0?QMATH.ceil(ry)+sprite.hHeight:QMATH.floor(ry)-sprite.hHeight;
		} else
			sprite.y=dy;

		return ret;
	}

	return this;
}

// Canvas rendering helpers
function Canvas() {
	var letterWidth;
	this.FONTLETTERS=" ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789?!@,-.:;<=>[\\]/_#$%&'()*+\"~";
	this.fillRect=function(ctx,color,alpha,x,y,width,height) {
		ctx.fillStyle="rgba("+color[0]+","+color[1]+","+color[2]+","+alpha+")";
		ctx.fillRect(x, y, width, height);
	};
	this.initialize=function() {
		this.canvas=DOM.createCanvas(0,0);
	};
	this.createFont=function(node,letterwidth,letterheight,letterspacing) {
		return {
			node:node,
			tileWidth:letterwidth,
			tileHeight:letterheight,
			tileWidthSpaced:letterwidth+letterspacing,
			letterSpacing:letterspacing
		}
	};
	this.createImage=function(node) {
		return {
			node:node,
			tileWidth:0,
			tileHeight:0
		}
	};
	this.createSprites=function(node,tilewidth,tileheight) {
		return {
			node:node,
			tileWidth:tilewidth,
			tileHeight:tileheight
		}
	};
	var tx,ty,fx,fy;
	this.blit=function(ctx,from,flipx,flipy,ang,opacity,scale,composite,sx,sy,sw,sh,dx,dy,dw,dh) {
		dx=QMATH.floor(dx);
		dy=QMATH.floor(dy);
		dw=QMATH.floor(dw);
		dh=QMATH.floor(dh);

		if (flipx||flipy||ang||(opacity<1)||(scale!=1)) {

			tx=dw/2;
			ty=dh/2;
			fx=flipx?-scale:scale;
			fy=flipy?-scale:scale;

			ctx.save();
			ctx.transform(fx,0,0,fy,dx+tx, dy+ty);
			ctx.rotate(ang);
			ctx.translate(-tx, -ty);
			ctx.globalAlpha=opacity;
			if (composite) ctx.globalCompositeOperation=composite;
			ctx.drawImage(from,sx,sy,sw,sh,0,0,dw,dh);
			ctx.restore();
			ctx.globalAlpha=1;

		} else if (composite) {
			ctx.globalCompositeOperation=composite;
			ctx.drawImage(from,sx,sy,sw,sh,dx,dy,dw,dh);
			ctx.globalCompositeOperation="source-over";
		} else ctx.drawImage(from,sx,sy,sw,sh,dx,dy,dw,dh);
	};
	this.blitLine=function(ctx,x,y,x1,y1,color,alpha) {
		ctx.strokeStyle="rgba("+color[0]+","+color[1]+","+color[2]+","+alpha+")";
		ctx.beginPath();
		ctx.moveTo(QMATH.floor(x), QMATH.floor(y));
		ctx.lineTo(QMATH.floor(x1), QMATH.floor(y1));
		ctx.stroke();
	};
	this.printCenter=function(ctx,font,color,x,y,text,flipx,flipy,rotate,opacity,scale,composite) {
		text=text+"";
		scale=scale||1;
		x-=QMATH.floor((this.pixelStrLen(font,text)*scale)/2);
		y-=QMATH.floor((font.tileHeight*scale)/2);
		this.print(ctx,font,color,x,y,text,flipx,flipy,rotate,opacity,scale,composite);
	};
	this.pixelLen=function(font,letters) {
		return (letters*font.tileWidthSpaced)-font.letterSpacing;
	}
	this.pixelStrLen=function(font,str) {
		return this.pixelLen(font,str.length);
	}
	this.print=function(ctx,font,color,x,y,text,flipx,flipy,rotate,opacity,scale,composite) {
		scale=scale||1;
		letterWidth=font.tileWidthSpaced*scale;
		text=text+"";
		for (var i=0;i<text.length;i++) {								
			this.blit(
				ctx,
				font.node,
				flipx||0,flipy||0,rotate||0,opacity||1,1,composite,
				(text.charCodeAt(i)-32)*font.tileWidth,color*font.tileHeight,
				font.tileWidth,font.tileHeight,
				i*letterWidth+x,
				y,
				font.tileWidth*scale,font.tileHeight*scale
			);
		}
	}
}

// Angle & distance helpers
function Trigo() {
	var
		PI=QMATH.PI,
		PI2=QMATH.PI*2,
		angle,dx;
	this.getAngleTo=function(x1,y1,x2,y2) {
		return QMATH.atan2(y1-y2,x1-x2);
	};
	this.getShortestAngle=function(a1,a2) {
		angle=a1-a2;
		return angle+((angle>PI) ? -PI2 : (angle<-PI) ? PI2 : 0);
	} 
	this.getDistance=function(x1,y1,x2,y2) {
		dx=x1-x2,dy=y1-y2;
		return QMATH.sqrt( dx*dx + dy*dy );
	}
	return this;
}

// DOM
var Dom=function() {

	var
		div=document.createElement('div'),
		passiveSupported,
		fullScreen;

	window.requestAnimFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || 0;
	document.exitPointerLock = document.exitPointerLock || document.mozExitPointerLock;

	if (div.requestFullscreen) fullScreen={request:"requestFullscreen",exit:"exitFullscreen",is:"fullscreen",on:"fullscreenchange",error:"fullscreenerror"};
	else if (div.webkitRequestFullscreen) fullScreen={request:"webkitRequestFullScreen",exit:"webkitExitFullscreen",is:"webkitIsFullScreen",on:"webkitfullscreenchange",error:"webkitfullscreenerror"};
	else if (div.mozRequestFullScreen) fullScreen={request:"mozRequestFullScreen",exit:"mozCancelFullScreen",is:"mozFullScreenElement",on:"mozfullscreenchange",error:"mozfullscreenerror"};
	else if (div.msRequestFullscreen) fullScreen={request:"msRequestFullscreen",exit:"msExitFullscreen",is:"msFullscreenElement",on:"MSFullscreenChange",error:"msfullscreenerror"};

	this.isFirefox=navigator.userAgent.toLowerCase().indexOf("firefox") > -1;
	this.isTouch=!!('ontouchstart' in window || navigator.maxTouchPoints);

	if (!window.requestAnimFrame) window.requestAnimFrame = function( callback ){ callback() };

	var passiveSupported = false;

	try {
		var options = {
			get passive() {
				passiveSupported = true;
			}
		};
		window.addEventListener("test", options, options);
		window.removeEventListener("test", options, options);
	} catch(err) {
		passiveSupported = false;
	}

	this.resizeCanvas=function(canvas,w,h) {

		canvas.canvas.width=w;
		canvas.canvas.height=h;

		canvas.ctx.webkitImageSmoothingEnabled =
			canvas.ctx.imageSmoothingEnabled =
			canvas.ctx.mozImageSmoothingEnabled =
			canvas.ctx.oImageSmoothingEnabled =
			canvas.ctx.msImageSmoothingEnabled=
			false;
	}

	this.createCanvas=function(width,height,onscreen) {
		var
			canvas=document.createElement("canvas"),
			ret={
				canvas:canvas,
				ctx:canvas.getContext("2d")
			};

		this.resizeCanvas(ret,width,height);
		canvas.requestPointerLock = canvas.requestPointerLock || canvas.mozRequestPointerLock;
		return ret;
	}

	this.addEventListener=function(node,evt,cb,rt) {
		if (node.addEventListener)
			node.addEventListener(evt,cb,(passiveSupported && (node == window.document || node == window.document.body || node == window)) ? { passive: false, capture: rt } : rt);
		else node.attachEvent("on"+evt,cb)
	}

	this.removeEventListener=function(node,evt,cb,rt) {
		if (node.removeEventListener) node.removeEventListener(evt,cb,rt);
		else node.detachEvent("on"+evt,cb)
	}

	this.clone=function(obj) { return JSON.parse(JSON.stringify(obj)); }

	this.copyToClipboard=function(text) {
	    var t = document.createElement("textarea");
	    document.body.appendChild(t);
	    t.value = text;
	    t.select();
	    document.execCommand("copy");
	    document.body.removeChild(t);
	}
	
	this.getParameterByName=function(name, url) {
		if (!url) url = window.location.href;
		name = name.replace(/[\[\]]/g, '\\$&');
		var
			regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
			results = regex.exec(url);
		if (!results) return null;
		if (!results[2]) return '';
		return decodeURIComponent(results[2].replace(/\+/g, ' '));
	}

	if (window.navigator.vibrate) this.vibrate=function(duration) {
		window.navigator.vibrate(duration);
	}
	else this.vibrate=function(){}

	this.setFullScreen=function(node) {
		if (!!document[fullScreen.is]) document[fullScreen.exit]();
		else node[fullScreen.request]();
	}

	this.generateRandomString=function(chars,length) {
		var value="";
		while (value.length<length)
			value+=chars[QMATH.floor(QMATH.random()*chars.length)];
		return value;
	}
}
