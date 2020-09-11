const
	MENU_CONFIRM=1,
	MENU_CANCEL=2,
	MENU_CHANGED=3,
	MENU_MOVED=4,
	MENU_KEYBOARDLETTERSPACING=2,
	MENU_KEYBOARDY=80,
	MENU_KEYPADDING=8,
	MENU_KEYHEIGHT=20,
	MENU_KEYTITLEX=8,
	MENU_KEYTITLEY=10,
	MENU_KEYVALUEY=55,
	MENU_KEYBARY=MENU_KEYVALUEY-10,
	MENU_KEYBARHEIGHT=20;

var
	MENU_MOUSE={x:HSCREEN_WIDTH,y:HSCREEN_HEIGHT,timer:0,back:false,moved:false,aimingOption:false},
	MENU_KEYBOARDS={
		numpad:{
			keys:[
				[
					[
						{input:"7"}, {input:"8"}, {input:"9"}
					],
					[
						{input:"4"}, {input:"5"}, {input:"6"}
					],
					[
						{input:"1"}, {input:"2"}, {input:"3"}
					],
					[
						{input:"0"},{delete:true,label:"Del"}
					]
				]
			]
		},
		roomId:{
			keys:[
				[
					[
						{input:"1"}, {input:"2"}, {input:"3"}, {input:"4"}, {input:"5"}, {input:"6"},
						{input:"7"}, {input:"8"}, {input:"9"}, {input:"0"}, {delete:true,label:"Del"}
					],
					[
						{input:"q"}, {input:"w"}, {input:"e"}, {input:"r"}, {input:"t"}, {input:"y"},
						{input:"u"}, {input:"i"}, {input:"o"}, {input:"p"},
					],
					[
						{input:"a"}, {input:"s"}, {input:"d"}, {input:"f"}, {input:"g"}, {input:"h"},
						{input:"j"}, {input:"k"}, {input:"l"}
					],
					[
						{input:"z"}, {input:"x"}, {input:"c"}, {input:"v"}, {input:"b"}, {input:"n"},
						{input:"m"}
					]
				]
			]
		},
		standard:{
			keys:[
				[
					[
						{input:"1"}, {input:"2"}, {input:"3"}, {input:"4"}, {input:"5"}, {input:"6"},
						{input:"7"}, {input:"8"}, {input:"9"}, {input:"0"}, {delete:true,label:"Del"}
					],
					[
						{input:"q"}, {input:"w"}, {input:"e"}, {input:"r"}, {input:"t"}, {input:"y"},
						{input:"u"}, {input:"i"}, {input:"o"}, {input:"p"},
					],
					[
						{input:"a"}, {input:"s"}, {input:"d"}, {input:"f"}, {input:"g"}, {input:"h"},
						{input:"j"}, {input:"k"}, {input:"l"}
					],
					[
						{input:"z"}, {input:"x"}, {input:"c"}, {input:"v"}, {input:"b"}, {input:"n"},
						{input:"m"}
					],
					[
						{label:"...",changeKeyboard:true}, {label:"Space",width:100,input:" "},
					]
				],
				[
					[
						{input:"1"}, {input:"2"}, {input:"3"}, {input:"4"}, {input:"5"}, {input:"6"},
						{input:"7"}, {input:"8"}, {input:"9"}, {input:"0"}, {delete:true,label:"Del"}
					],
					[
						{input:"Q"}, {input:"W"}, {input:"E"}, {input:"R"}, {input:"T"}, {input:"Y"},
						{input:"U"}, {input:"I"}, {input:"O"}, {input:"P"},
					],
					[
						{input:"A"}, {input:"S"}, {input:"D"}, {input:"F"}, {input:"G"}, {input:"H"},
						{input:"J"}, {input:"K"}, {input:"L"}
					],
					[
						{input:"Z"}, {input:"X"}, {input:"C"}, {input:"V"}, {input:"B"}, {input:"N"},
						{input:"M"}
					],
					[
						{label:"...",changeKeyboard:true},
						{label:"Space",width:100,input:" "},
					]
				]
			]
		}
	};

function KeyMenu(settings) {

	const
		BLINK_TIME=FPS*2,
		FLASH_TIME=QMATH.floor(BLINK_TIME/2),	
		CORNERSIZE=16,
		FULLSCREENX=SCREEN_WIDTH-16,
		FULLSCREENTIPX=SCREEN_WIDTH-21,
		FULLSCREENTIPY=CORNERSIZE-8,
		MOUSEHIDE_TIME=FPS*3;

	if (!settings) settings={};
	if (settings.noGoBack==undefined) settings.noGoBack=false;
	if (settings.labelColor==undefined) settings.labelColor=FONTPALETTE.WHITE;
	if (settings.valueColor==undefined) settings.valueColor=FONTPALETTE.YELLOW;
	if (settings.selectorColor==undefined) settings.selectorColor=PALETTE.RED;
	if (settings.lockedSelectorColor==undefined) settings.lockedSelectorColor=PALETTE.LIGHTBLUE;
	if (settings.titleColor==undefined) settings.titleColor=FONTPALETTE.RED;
	if (settings.defaultColor==undefined) settings.defaultColor=FONTPALETTE.GREEN;
	if (settings.descriptionColor==undefined) settings.descriptionColor=FONTPALETTE.BLUE;
	if (settings.lockedColor==undefined) settings.lockedColor=FONTPALETTE.CYAN;
	if (settings.labelX==undefined) settings.labelX=FONT.tileWidth;
	if (settings.valueX==undefined) settings.valueX=CANVAS.pixelLen(FONT,16);
	if (settings.menuY==undefined) settings.menuY=FONT.tileHeight;
	if (settings.menuX==undefined) settings.menuX=0;
	if (settings.menuPaddingX==undefined) settings.menuPaddingX=FONT.tileWidth;
	if (settings.menuWidth==undefined) settings.menuWidth=SCREEN_WIDTH;
	if (settings.titleSpacingY==undefined) settings.titleSpacingY=FONT.tileHeight*2;
	if (settings.optionsSpacingY==undefined) settings.optionsSpacingY=0;
	if (settings.leftArrowX==undefined) settings.leftArrowX=settings.valueX-FONT.tileWidth;
	if (settings.keyboardColor==undefined) settings.keyboardColor=PALETTE.LIGHTBLUE;
	if (settings.keyboardSelectedColor==undefined) settings.keyboardSelectedColor=PALETTE.RED;
	if (settings.keyboardTextColor==undefined) settings.keyboardTextColor=FONTPALETTE.WHITE;
	if (settings.keyboardBarColor==undefined) settings.keyboardBarColor=PALETTE.DARKPURPLE;

	var labelCut=QMATH.floor((settings.menuWidth-settings.menuPaddingX-settings.labelX)/FONT.tileWidthSpaced);
	var valueCut=QMATH.floor((settings.menuWidth-settings.menuPaddingX-settings.valueX-FONT.tileWidthSpaced)/FONT.tileWidthSpaced);
	var descriptionCut=QMATH.floor((settings.menuWidth-settings.menuPaddingX-settings.valueX)/FONTSMALL.tileWidthSpaced);

	if (settings.rightArrowX==undefined) settings.rightArrowX=settings.valueX+valueCut*FONT.tileWidthSpaced;
	if (settings.centerArrowX==undefined) settings.centerArrowX=QMATH.floor(settings.rightArrowX+settings.leftArrowX)/2;

	var blinkTimer=0,keyMode=false,keyData,keyTitle,keyValue,keyValueValid,keySelectedRow,keySelectedCol,keySelectedKey,keyboard,subkeyboard;

	var menu={options:[]};
	this.selectedRow=0;keyMode

	function openKeyboard(keydata,value) {
		keyData=keydata;
		keyTitle=menu.title+" - "+keyData.label;
		keyboard=keyData.keyboard;
		keyValue=value;
		keyValueValid=true;
		keyMode=true;
		setSubkeyboard(0);
	}

	function setSubkeyboard(id) {
		subkeyboard=id;
		keySelectedCol=0;
		keySelectedRow=0;
		keySelectedKey=keyboard.keys[subkeyboard][keySelectedCol][keySelectedRow];
	}

	function closeKeyboard(set) {
		MENU_MOUSE.aimingOption=false;
		if (keyValueValid) set[keyData.id]=keyValue;
		keyMode=false;
	}

	function checkSelector(self) {
		if (menu.options) {
			if (self.selectedRow>=menu.options.length) self.selectedRow=0;
			if (self.selectedRow<0) self.selectedRow=menu.options.length-1;
			self.selectedOption=menu.options[self.selectedRow];
		} else {
			self.selectedRow=0;
			self.selectedOption=0;
		}
	}

	function eventCallback(button1,button2) {
		if (GAMECONTROLS.TOUCH) {
			if (button1&&button2)
				GAMESTATE.setFullScreen();
		}
		if (GAMECONTROLS.KEYMOUSE) {
			if ((MENU_MOUSE.x>=FULLSCREENX)&&(MENU_MOUSE.y<=CORNERSIZE))
				GAMESTATE.setFullScreen();
		}
	}

	// Global methods
	this.initialize=function() {
		for (var k in MENU_KEYBOARDS) {
			var validChars="";
			MENU_KEYBOARDS[k].keys.forEach(subkeyboard=>{
				var y=MENU_KEYBOARDY;
				subkeyboard.forEach(row=>{
					var x=0;
					row.forEach(key=>{
						if (!key.label) key.label=key.input;
						var labellen=CANVAS.pixelStrLen(FONT,key.label);
						if (!key.width) key.width=labellen+MENU_KEYPADDING;
						if (!key.height) key.height=MENU_KEYHEIGHT;
						key.x=x;
						key.y=y;
						key.x2=key.x+key.width-1;
						key.y2=key.y+key.height-1;
						key.labelX=key.x+QMATH.floor((key.width-labellen)/2);
						key.labelY=key.y+QMATH.floor((key.height-FONT.tileHeight)/2);
						x+=key.width+MENU_KEYBOARDLETTERSPACING;
						if (key.input!==undefined) validChars+=key.input;
					});
					var gap=QMATH.floor((SCREEN_WIDTH-(x-MENU_KEYBOARDLETTERSPACING))/2);
					row.forEach(key=>{
						key.x+=gap;
						key.x2+=gap;
						key.labelX+=gap;
					});
					y+=MENU_KEYHEIGHT+MENU_KEYBOARDLETTERSPACING;
				})
				MENU_KEYBOARDS[k].validChars=validChars;
			});
		}
	}

	// Instance methods
	this.reset=function() {
		if (MENU_MOUSE.timer) {
			MENU_MOUSE.aimingOption=0;
			MENU_MOUSE.moved=true;
		}
		keyMode=0;
		this.selectedRow=0;
	}
	this.setMenu=function(newmenu) {
		menu={title:newmenu.title,renderer:newmenu.renderer,options:newmenu.options||[]};
		this.reset();
	}
	this.setOptions=function(options) {
		menu.options=options;
		checkSelector(this);
	}
	this.setTitle=function(title) {
		menu.title=title;
	}
	this.frame=function(enabled,set,locked) {
		var
			ret,
			cancel,confirm;
		// Allow to trigger fullscreen on touch without confirming options
		if (SYSTEMCONTROLS.cancel&&SYSTEMCONTROLS.confirm) {
			cancel=0;
			confirm=0;
		} else {
			cancel=SYSTEMCONTROLS.cancel==1;
			confirm=SYSTEMCONTROLS.confirm==1;
		}
		if (blinkTimer) blinkTimer--;
		else blinkTimer=BLINK_TIME;
		if (GAMECONTROLS.KEYMOUSE) {
			var sensitivity=(CONFIG.pointerSensitivity+1)*0.25
			var dx=GAMECONTROLS.KEYMOUSE.aimPointer[0]*sensitivity;
			var dy=GAMECONTROLS.KEYMOUSE.aimPointer[1]*sensitivity;
			MENU_MOUSE.click=GAMECONTROLS.KEYMOUSE.fire==1;
			MENU_MOUSE.x+=dx;
			MENU_MOUSE.y+=dy;
			MENU_MOUSE.moved=MENU_MOUSE.moved||(!!(dx||dy));
			if (MENU_MOUSE.x<0) MENU_MOUSE.x=0;
			if (MENU_MOUSE.x>SCREEN_WIDTH) MENU_MOUSE.x=SCREEN_WIDTH;
			if (MENU_MOUSE.y<0) MENU_MOUSE.y=0;
			if (MENU_MOUSE.y>SCREEN_HEIGHT) MENU_MOUSE.y=SCREEN_HEIGHT;
			MENU_MOUSE.back=(MENU_MOUSE.x<=CORNERSIZE)&&(MENU_MOUSE.y<=CORNERSIZE)&&MENU_MOUSE.click;
			if (SYSTEMCONTROLS.up||SYSTEMCONTROLS.down||SYSTEMCONTROLS.left||SYSTEMCONTROLS.right||SYSTEMCONTROLS.confirm||SYSTEMCONTROLS.cancel)
				MENU_MOUSE.timer=0;
			else if (MENU_MOUSE.moved||MENU_MOUSE.click) MENU_MOUSE.timer=MOUSEHIDE_TIME;
			else if (MENU_MOUSE.timer) MENU_MOUSE.timer--;

		}
		if (GAMECONTROLS.TOUCH||GAMECONTROLS.KEYMOUSE)
			CONTROLS.registerEventCallback(eventCallback);
		if (keyMode) {
			if (enabled) {
				if (SYSTEMCONTROLS.up==1) {
					AUDIOPLAYER.play("menu_change");
					keySelectedRow--;
				}
				if (SYSTEMCONTROLS.down==1) {
					AUDIOPLAYER.play("menu_change");
					keySelectedRow++;
				}
				if (SYSTEMCONTROLS.right==1) {
					AUDIOPLAYER.play("menu_change");
					keySelectedCol++;
				}
				if (SYSTEMCONTROLS.left==1) {
					AUDIOPLAYER.play("menu_change");
					keySelectedCol--;
				}
				if (MENU_MOUSE.timer) {
					keyboard.keys[subkeyboard].forEach((row,rowid)=>{
						row.forEach((key,colid)=>{
							if (
								(MENU_MOUSE.x>=key.x)&&
								(MENU_MOUSE.x<=key.x2)&&
								(MENU_MOUSE.y>=key.y)&&
								(MENU_MOUSE.y<=key.y2)
							) {
								keySelectedRow=rowid;
								keySelectedCol=colid;
							}
						});
					});
				}
				if (keySelectedRow>=keyboard.keys[subkeyboard].length) keySelectedRow=0;
				if (keySelectedRow<0) keySelectedRow=keyboard.keys[subkeyboard].length-1;
				if (keySelectedCol<0) keySelectedCol=keyboard.keys[subkeyboard][keySelectedRow].length-1;;
				if (keySelectedCol>=keyboard.keys[subkeyboard][keySelectedRow].length) keySelectedCol=0;
				keySelectedKey=keyboard.keys[subkeyboard][keySelectedRow][keySelectedCol];
				if (!settings.noGoBack&&(cancel||(MENU_MOUSE.timer&&MENU_MOUSE.back))) {
					AUDIOPLAYER.play("menu_back");
					closeKeyboard(set);
					ret=MENU_CHANGED;
				} else if (confirm||(MENU_MOUSE.timer&&MENU_MOUSE.click)) {
					AUDIOPLAYER.play("menu_change");
					if (!keyData.keyboardMaxLength||(keyValue.length<keyData.keyboardMaxLength))
						if (keySelectedKey.input) keyValue+=keySelectedKey.input;
					if (keyValue.length&&(keySelectedKey.delete))
						keyValue=keyValue.substr(0,keyValue.length-1);
					keyValueValid=!keyData.keyboardMinLength||(keyValue.length>=keyData.keyboardMinLength);
					if (keySelectedKey.changeKeyboard)
						setSubkeyboard((subkeyboard+1)%keyboard.keys.length);
				}
			}
		} else {
			if (enabled) {
				if (menu.options.length) {
					if (SYSTEMCONTROLS.up==1) {
						AUDIOPLAYER.play("menu_change");
						ret=MENU_MOVED;
						this.selectedRow--;
					}
					if (SYSTEMCONTROLS.down==1) {
						AUDIOPLAYER.play("menu_change");
						ret=MENU_MOVED;
						this.selectedRow++;
					}
					if (MENU_MOUSE.timer&&MENU_MOUSE.moved) {
						var pointerOption;
						var optionValue,ey,sy=settings.menuY;
						if (menu.title) sy+=settings.titleSpacingY;
						menu.options.forEach((option,id)=>{
							ey=sy+FONT.tileHeight;
							optionValue=set?set[option.id]:0;
							if (option.values&&option.values[optionValue].description)
								ey+=FONTSMALL.tileHeight*option.values[optionValue].description.length;
							if ((MENU_MOUSE.y>=sy)&&(MENU_MOUSE.y<=ey)) pointerOption=id;
							sy=ey+settings.optionsSpacingY;
						});
						MENU_MOUSE.aimingOption=pointerOption!==undefined;
						if ((pointerOption!==undefined)&&(pointerOption!=this.selectedRow)) {
							this.selectedRow=pointerOption;
							ret=MENU_MOVED;
						}
					}
					checkSelector(this);
					if (!locked)
						if (set&&this.selectedOption.values) {	
							if (MENU_MOUSE.timer&&MENU_MOUSE.click&&MENU_MOUSE.aimingOption) {
								AUDIOPLAYER.play("menu_select");
								if (MENU_MOUSE.x>settings.centerArrowX) set[this.selectedOption.id]++;
								else set[this.selectedOption.id]--;
								ret=MENU_CHANGED;
							}
							if (SYSTEMCONTROLS.right==1) {
								AUDIOPLAYER.play("menu_select");
								set[this.selectedOption.id]++;						
								ret=MENU_CHANGED;
							}
							if (SYSTEMCONTROLS.left==1) {
								AUDIOPLAYER.play("menu_select");
								set[this.selectedOption.id]--;
								ret=MENU_CHANGED;
							}
							if (set[this.selectedOption.id]>=this.selectedOption.values.length) set[this.selectedOption.id]=0;
							if (set[this.selectedOption.id]<0) set[this.selectedOption.id]=this.selectedOption.values.length-1;
						}					
				}
			}
			if (!ret) {
				if (!locked&&(confirm||(MENU_MOUSE.timer&&MENU_MOUSE.click&&MENU_MOUSE.aimingOption))) {
					AUDIOPLAYER.play("menu_select");
					if (this.selectedOption.keyboard)
						openKeyboard(
							this.selectedOption,
							(set&&set[this.selectedOption.id])||""
						);
					else
						ret=MENU_CONFIRM;
				} else if (!settings.noGoBack&&(cancel||(MENU_MOUSE.timer&&MENU_MOUSE.back))) {
					ret=MENU_CANCEL;
					AUDIOPLAYER.play("menu_back");
				}
			}
		}
		MENU_MOUSE.moved=false;
		return ret;
	}
	this.render=function(ctx,set,locked,hide) {
		var blink=blinkTimer<FLASH_TIME;

		if (!hide) {
		
			if (keyMode) {
				CANVAS.fillRect(
					ctx,
					settings.keyboardBarColor,1,
					0,MENU_KEYBARY,
					SCREEN_WIDTH,MENU_KEYBARHEIGHT
				);
				CANVAS.print(
					ctx,FONT,settings.titleColor,
					MENU_KEYTITLEX,MENU_KEYTITLEY,
					keyTitle
				);
				keyData.keyboardLabel.forEach((line,id)=>{
					CANVAS.print(
						ctx,FONTSMALL,settings.labelColor,
						MENU_KEYTITLEX,MENU_KEYTITLEY+FONT.tileHeight+(id*FONTSMALL.tileHeight),
						line
					);	
				})
				CANVAS.printCenter(
					ctx,FONT,keyValueValid?settings.valueColor:FONTPALETTE.RED,
					HSCREEN_WIDTH,MENU_KEYVALUEY,
					keyValue+(blink?"_":" ")
				);
				keyboard.keys[subkeyboard].forEach(row=>{
					row.forEach(key=>{
						CANVAS.fillRect(
							ctx,
							key==keySelectedKey?settings.keyboardSelectedColor:settings.keyboardColor,1,
							key.x,key.y,
							key.width,key.height
						)
						CANVAS.print(
							ctx,FONT,settings.keyboardTextColor,
							key.labelX,key.labelY,
							key.label
						)
					})
				})

			} else {
				var py=settings.menuY;
				var pointerAvailable=!MENU_MOUSE.timer||MENU_MOUSE.aimingOption;
				if (menu.title) {
					CANVAS.print(
						ctx,FONT,settings.titleColor,
						settings.menuX+settings.labelX,py,
						menu.title.substr(0,labelCut)
					);			
					py+=settings.titleSpacingY;
				}
				menu.options.forEach((option,id)=>{
					var optionValue=set?set[option.id]:0;
					var value,description,isDefault;
					var rowIsSelected=id==this.selectedRow;
					if (option.values) {
						value=option.values[optionValue].label;
						isDefault=option.values[optionValue].default;
						description=option.values[optionValue].description||[];
					} else if (option.keyboard||option.valueOnly) {
						value=optionValue;
						isDefault=optionValue==option.default;
						description=[];
					} else {
						value=option.value;
						isDefault=option.default;
						description=option.description||[];
					}
					if (rowIsSelected&&pointerAvailable)
						CANVAS.fillRect(
							ctx,
							locked||option.locked?settings.lockedSelectorColor:settings.selectorColor,1,
							settings.menuX,py,
							settings.menuWidth,FONT.tileHeight
						)
					CANVAS.print(
						ctx,FONT,settings.labelColor,
						settings.menuX+settings.labelX,py,
						option.label.substr(0,labelCut)
					);
					if (value) {
						if (pointerAvailable&&!locked&&!option.locked&&option.arrows&&rowIsSelected) {
							CANVAS.print(ctx,FONT,settings.labelColor,settings.leftArrowX-(blink?1:0),py,LEFTARROW_SYMBOL);
							CANVAS.print(ctx,FONT,settings.labelColor,settings.rightArrowX+(blink?1:0),py,RIGHTARROW_SYMBOL);	
						}
						CANVAS.print(
							ctx,FONT,
								option.locked?settings.lockedColor:
								isDefault?settings.defaultColor:
								settings.valueColor,
							settings.menuX+settings.valueX,py,
							value.substr(0,valueCut)
						);
					}
					py+=FONT.tileHeight;
					description.forEach(line=>{
						CANVAS.print(
							ctx,FONTSMALL,settings.descriptionColor,
							settings.menuX+settings.valueX,py,
							line.substr(0,descriptionCut)
						);
						py+=FONTSMALL.tileHeight;	
					});
					py+=settings.optionsSpacingY;
				});
				if (menu.renderer) menu.renderer(ctx,set,locked);
			}
		}

		if (MENU_MOUSE.timer) {
			if (!settings.noGoBack||keyMode)
				CANVAS.blit(ctx,HUD.node,0,0,0,1,1,0,117,blink?16:32,CORNERSIZE,CORNERSIZE,0,0,CORNERSIZE,CORNERSIZE);
			CANVAS.blit(ctx,HUD.node,0,0,0,1,1,0,117,blink?48:64,CORNERSIZE,CORNERSIZE,FULLSCREENX,0,CORNERSIZE,CORNERSIZE);
			CANVAS.blit(ctx,HUD.node,0,0,0,1,1,0,117,0,16,16,MENU_MOUSE.x,MENU_MOUSE.y,16,16);
		}
		if (GAMECONTROLS.TOUCH) {
			CANVAS.blit(ctx,HUD.node,0,0,0,1,1,0,117,blink?48:64,CORNERSIZE,CORNERSIZE,FULLSCREENX,0,CORNERSIZE,CORNERSIZE);
			CANVAS.blit(ctx,HUD.node,0,0,0,1,1,0,112,blink?107:116,21,9,FULLSCREENTIPX,FULLSCREENTIPY,21,9);
		}			
	}
}