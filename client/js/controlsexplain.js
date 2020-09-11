
function ControlsExplain(master) {
	const
		MENUCOLOR=PALETTE.BLACK,
		HELPX=HSCREEN_WIDTH,
		TIMEPERSCHEME=FPS*3,
		SPACING=QMATH.floor((FONT.tileHeight*1.3));
		
	var
		controlSchemes=[],currentScheme,timer,menu;

	this.initialize=function() {

		if (GAMECONTROLS.KEYBOARD)
			controlSchemes.push({
				label:"keyboard",
				stickers:[
					{x1:0,y1:169,width:129,height:60,x2:-65,y2:8}
				]
			});

		if (GAMECONTROLS.KEYMOUSE)
			controlSchemes.push({
				label:"keyboard + mouse",
				stickers:[
					{x1:54,y1:169,width:15,height:5,x2:-27,y2:27},
					{x1:0,y1:277,width:74,height:75,x2:-37,y2:1},
					{x1:41,y1:107,width:19,height:5,x2:45,y2:40},
				]
			});

		if (GAMECONTROLS.TOUCH) {
			controlSchemes.push({
				label:"touch screen",
				stickers:[
					{x1:0,y1:354,width:81,height:57,x2:-40,y2:10}
				]
			});
			controlSchemes.push({
				label:"touch screen",
				stickers:[
					{x1:0,y1:412,width:81,height:57,x2:-40,y2:10}
				]
			});
		}

		controlSchemes.push({
			label:"multiple gamepads",
			stickers:[
				{x1:54,y1:169,width:15,height:5,x2:-7,y2:5},
				{x1:0,y1:231,width:60,height:45,x2:-30,y2:17},
				{x1:41,y1:107,width:19,height:5,x2:-9,y2:65},
			]
		});

		menu=new KeyMenu({
			menuY:SCREEN_HEIGHT-QMATH.ceil(FONT.tileHeight*1.5),
			noGoBack:true
		});
		menu.setMenu({
			options:[
				{label:"Got it!"}
			]
		})
	}
	this.show=function() {
		currentScheme=0;
		timer=0;
		TRANSITION.start();
		if (master.screenControls=="mouse")
			TRANSITION.notify("I need your focus!","Click on the screen to play the game")
		menu.reset();
	}
	this.frame=function() {				
		timer++;
		if (timer>=TIMEPERSCHEME) {
			timer=0;
			currentScheme=(currentScheme+1)%controlSchemes.length;
		}
		switch (menu.frame(TRANSITION.isFree)) {
			case MENU_CANCEL:
			case MENU_CONFIRM:{
				TRANSITION.end(-1);
				break;
			}
		}
		return TRANSITION.getState();
	}
	this.render=function(ctx) {
		var
			y=FONT.tileHeight;

		CANVAS.fillRect(ctx,MENUCOLOR,1,0,0,SCREEN_WIDTH, SCREEN_HEIGHT);
		CANVAS.printCenter(ctx,FONT,FONTPALETTE.BLUE,HELPX,y,"You can always navigate menus with");
		y+=SPACING;
		CANVAS.blit(
			ctx,HUD.node,0,0,0,1,1,0,
			0,107,103,60,
			QMATH.floor((SCREEN_WIDTH-117)/2),y,103,60
		);
		y+=SPACING+55;
		CANVAS.printCenter(ctx,FONT,FONTPALETTE.WHITE,HELPX,y,"And use/customize "+controlSchemes[currentScheme].label);
		y+=SPACING;

		controlSchemes[currentScheme].stickers.forEach(sticker=>{
			CANVAS.blit(
				ctx,HUD.node,0,0,0,1,1,0,
				sticker.x1,sticker.y1,sticker.width,sticker.height,
				HELPX+sticker.x2,y+sticker.y2,sticker.width,sticker.height
			);
		});

		menu.render(ctx);
		TRANSITION.render(ctx);
	}
}