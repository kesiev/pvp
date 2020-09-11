
function Credits() {
	const
		MENUCOLOR=PALETTE.BLACK,
		CREDITSX=HSCREEN_WIDTH,
		CREDITSY=10;
		
	var
		menu;

	this.initialize=function() {
		
		menu=new KeyMenu({
			menuY:SCREEN_HEIGHT-QMATH.ceil(FONT.tileHeight*1.5)
		});
		menu.setMenu({
			options:[
				{label:"Okay, thanks!"}
			]
		})
	}
	this.show=function() {
		TRANSITION.start();
		menu.reset();
	}
	this.frame=function() {				
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
		CANVAS.fillRect(ctx,MENUCOLOR,1,0,0,SCREEN_WIDTH, SCREEN_HEIGHT);
		STATICGENERATOR.blit(ctx,0,0,SCREEN_WIDTH,SCREEN_HEIGHT,0.05);
		var py=CREDITSY;
		FULLCREDITS.forEach((line,id)=>{
			if (line.text) {
				var font=line.small?FONTSMALL:FONT;
				CANVAS.printCenter(ctx,font,FONTPALETTE[line.color],CREDITSX,py,line.text);
				py+=font.tileHeight-1;
			}
			if (line.gap) py+=line.gap;
		});
		menu.render(ctx);
		TRANSITION.render(ctx);
	}
}