function Transition() {
	const
		TRANSITION_TIME=QMATH.ceil(FPS/5),
		NOTIFICATION_WIDTH=270,
		NOTIFICATION_HEIGHT=26,
		NOTIFICATION_MARGINY=8,
		NOTIFICATION_X=QMATH.floor((SCREEN_WIDTH-NOTIFICATION_WIDTH)/2),
		NOTIFICATION_Y=SCREEN_HEIGHT-NOTIFICATION_HEIGHT-FONT.tileHeight,
		NOTIFICATION_TIME=FPS*6,
		NOTIFICATION_SPEED=SCREEN_HEIGHT/FPS,
		NOTIFICATION_COLOR=PALETTE.DARKPURPLE,
		NOTIFICATION_BORDERCOLOR=PALETTE.WHITE,
		NOTIFICATION_TITLECOLOR=FONTPALETTE.RED,
		NOTIFICATION_TEXTCOLOR=FONTPALETTE.WHITE;

	var
		timer=0,
		transition,
		ret,
		particles,
		notificationTimer,
		notificationTitle,
		notificationText,
		notificationY;
		
	this.isStopped=true;	
	this.particles=0;
	this.initialize=function() {
		this.particles=new Particles(80,0,0,SCREEN_WIDTH,SCREEN_HEIGHT);
	}
	this.notify=function(title,text) {
		AUDIOPLAYER.play("menu_notify");
		notificationY=SCREEN_HEIGHT;
		notificationTitle=title;
		notificationText=text;
		notificationTimer=NOTIFICATION_TIME;
	}
	this.start=function() {
		ret=0;
		timer=0;
		transition=0;
		this.isStopped=false;
		this.isFree=false;
	}
	this.end=function(r) {
		notificationTimer=0;
		ret=r;
		timer=0;
		transition=1;
		this.isStopped=false;
		this.isFree=false;
	}
	this.running=function() {
		return timer==TRANSITION_TIME;
	}
	this.render=function(ctx) {
		if (!this.isStopped||ret) {
			var size=QMATH.floor((HSCREEN_HEIGHT/TRANSITION_TIME)*timer);
			switch (transition) {
				case 0:{
					size=HSCREEN_HEIGHT-size;
					CANVAS.fillRect(ctx,PALETTE.DARKPURPLE,1,0,0,SCREEN_WIDTH,size);
					CANVAS.fillRect(ctx,PALETTE.DARKPURPLE,1,0,SCREEN_HEIGHT-size,SCREEN_WIDTH,size);
					break;
				}
				case 1:{
					CANVAS.fillRect(ctx,PALETTE.DARKPURPLE,1,0,0,SCREEN_WIDTH,size);
					CANVAS.fillRect(ctx,PALETTE.DARKPURPLE,1,0,SCREEN_HEIGHT-size,SCREEN_WIDTH,size);
					break;
				}
			}
			if (timer==TRANSITION_TIME) {
				if ((transition==1)&&(CONFIG.guiParticles))
					this.particles.addParticlesHorizontalLine(30,0,SCREEN_WIDTH,HSCREEN_HEIGHT,0,2,PALETTE.WHITE);
				this.isStopped=true;
				if (!ret) this.isFree=true;
			} else timer++;
		}
		if (notificationText) {
			CANVAS.fillRect(ctx,NOTIFICATION_BORDERCOLOR,QMATH.sin_(notificationTimer/5),NOTIFICATION_X-1,notificationY-1,NOTIFICATION_WIDTH+2,NOTIFICATION_HEIGHT+2);
			CANVAS.fillRect(ctx,NOTIFICATION_COLOR,1,NOTIFICATION_X,notificationY,NOTIFICATION_WIDTH,NOTIFICATION_HEIGHT);
			CANVAS.printCenter(ctx,FONT,NOTIFICATION_TITLECOLOR,HSCREEN_WIDTH,notificationY+NOTIFICATION_MARGINY,notificationTitle);
			CANVAS.printCenter(ctx,FONT,NOTIFICATION_TEXTCOLOR,HSCREEN_WIDTH,notificationY+NOTIFICATION_MARGINY+FONT.tileHeight,notificationText);
		}
		this.particles.render(ctx);
	} 
	this.getState=function() {
		this.particles.frame();
		if (notificationText)
			if (notificationTimer>0) {
				notificationTimer--;
				if (notificationY>NOTIFICATION_Y) notificationY-=NOTIFICATION_SPEED;
				if (notificationY<NOTIFICATION_Y) notificationY=NOTIFICATION_Y;
			} else {
				if (notificationY<SCREEN_HEIGHT	) notificationY+=NOTIFICATION_SPEED;
				else notificationText=0;
			}
		if (this.isStopped) return ret;
	}
}