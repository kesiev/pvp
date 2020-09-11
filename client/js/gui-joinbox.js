const
	JOINBOX_WAITING=1,
	JOINBOX_WAITINGFIRE=2,
	JOINBOX_FILLING=3,
	JOINBOX_READY=4;

function JoinBox(manageControllers,waitingMessage,waitingFireMessage,fillingMessage,readyMessage,joinMessage) {

	const
		NOTJOINEDCOLOR=PALETTE.DARKPURPLE,
		BOXHEADERTEXTCOLOR=FONTPALETTE.WHITE,
		NOTICEX=HSCREEN_WIDTH,
		NOTICEY=QMATH.floor(SCREEN_HEIGHT-FONT.tileHeight*1.5),
		NOTICETEXTY=NOTICEY+QMATH.floor(FONT.tileHeight/2)
		STARTTIMER_TIME=FPS*3,
		JOINBOXHEIGHT=FONTSMALL.tileHeight+7,
		JOINBOXTOP=SCREEN_HEIGHT-JOINBOXHEIGHT-FONT.tileHeight-8,
		JOINBOXSPACING=QMATH.floor(SCREEN_WIDTH/4),
		JOINBOXPADDING=FONT.tileWidth,
		JOINBOXWIDTH=JOINBOXSPACING-(FONT.tileWidth*2),
		JOINBOXCONTROLTRIM=QMATH.ceil((JOINBOXWIDTH/FONTSMALL.tileWidth)-2),
		JOINBOXCENTER=QMATH.floor(JOINBOXSPACING/2),
		JOINBOXHEADINGY=JOINBOXTOP,
		JOINBOXBLINKY=JOINBOXTOP+8,
		JOINBOXJOINEDY=JOINBOXTOP+9,
		PRESSBUTTONSPEED=FPS,
		MAXPLAYERS=PLAYERSDATA.length;

	var joinedControls,gameReady,pressButtonTimer,startTimer,enabledOptions,camera,state;

	function controllerIsJoined(controller) {
		return joinedControls[controller]!==undefined
	}

	function renamePlayers(joinedPlayers) {
		joinedPlayers.forEach((player,id)=>{
			player.label=PLAYERSDATA[id].label;
		});
	}


	this.setState=function(state) {
		this.state=state;
		if (state<JOINBOX_FILLING) startTimer=0;
	}

	this.fillBar=function() {
		if (this.state<=JOINBOX_FILLING) {
			this.setState(JOINBOX_FILLING);
			if (startTimer<STARTTIMER_TIME) startTimer++;
			else return true;
		}
	}

	this.setJoinedPlayers=function(players) {
		this.joinedPlayers=players;
	}

	this.leaveGame=function(controller) {
		if (controllerIsJoined(controller)) {
			startTimer=0;
			this.joinedPlayers.forEach((player,id)=>{
				AUDIOPLAYER.play("menu_joinout");
				if (player.controller==controller)
					this.joinedPlayers.splice(id,1);
			})
			delete joinedControls[controller];
			renamePlayers(this.joinedPlayers);
		}
	}

	this.joinGame=function(controller) {
		if (
			CONTROLSAVAIL[controller]&&
			!controllerIsJoined(controller)&&
			(this.joinedPlayers.length<MAXPLAYERS)
		) {
			AUDIOPLAYER.play("menu_joinin");
			startTimer=0;
			joinedControls[controller]=true;
			this.joinedPlayers.push({
				isLocal:true,
				controller:controller,				
				joinLabel:CONTROLSAVAIL[controller].label
			});
			renamePlayers(this.joinedPlayers);			
		}
	}

	this.kickAll=function() {
		joinedControls={};
		this.joinedPlayers=[];
	}

	this.reset=function() {
		pressButtonTimer=0;
		this.setState(JOINBOX_WAITING);
	}
	this.initialize=function() {
		this.kickAll();		
		this.reset();
	};
	this.show=function() {
		if (manageControllers) this.reset();
		else this.initialize();
	}
	this.quit=function() {
		this.kickAll();
	}
	this.end=function() {

	}
	this.frame=function(isFree){
		var ret;
		pressButtonTimer=(pressButtonTimer+1)%(PRESSBUTTONSPEED*2);
		
		if (isFree&&manageControllers&&(this.state!=JOINBOX_READY)) {

			// Players join
			var starting=this.joinedPlayers.length>0;

			for (var c in GAMECONTROLS) {
				var control=GAMECONTROLS[c];
				if (control.action>0) {
					this.leaveGame(c);
					starting=false;
				} else if (control.fire>0) this.joinGame(c);
			}
			this.joinedPlayers.forEach((player,id)=>{
				if (GAMECONTROLS[player.controller]) {
					if (GAMECONTROLS[player.controller].fire)
						player.confirming=true;
					else {
						player.confirming=false;
						starting=false;
					}
				} else {
					this.leaveGame(player.controller);
					starting=false;
				}
			});

			if (starting) {
				if (this.fillBar()) this.setState(JOINBOX_READY);
			} else this.setState(this.joinedPlayers.length==0?JOINBOX_WAITING:JOINBOX_WAITINGFIRE);
		}

		return isFree?this.state:undefined;
	}
	this.render=function(ctx) {

		// Join-in box		
		PLAYERSDATA.forEach((player,id)=>{
			var isJoined=this.joinedPlayers[id];			
			if (isJoined&&isJoined.isYou)
				CANVAS.fillRect(
					ctx,
					PALETTE.WHITE,1,
					(JOINBOXSPACING)*id+JOINBOXPADDING-1,
					JOINBOXTOP-1,
					JOINBOXWIDTH+2,
					JOINBOXHEIGHT+2
				);
			CANVAS.fillRect(
				ctx,
				isJoined?player.color:NOTJOINEDCOLOR,1,
				(JOINBOXSPACING)*id+JOINBOXPADDING,
				JOINBOXTOP,
				JOINBOXWIDTH,
				JOINBOXHEIGHT
			);
			if (isJoined) {
				CANVAS.printCenter(
					ctx,FONT,this.joinedPlayers[id].confirming?FONTPALETTE.WHITE:player.fontColor,
					(JOINBOXSPACING*id)+JOINBOXCENTER,
					JOINBOXHEADINGY,
					player.label
				);
				CANVAS.printCenter(
					ctx,FONTSMALL,BOXHEADERTEXTCOLOR,
					(JOINBOXSPACING*id)+JOINBOXCENTER,
					JOINBOXJOINEDY,
					isJoined.joinLabel.substr(0,JOINBOXCONTROLTRIM)
				);
			} else {
				if (pressButtonTimer<PRESSBUTTONSPEED)
					CANVAS.printCenter(
						ctx,FONTSMALL,player.fontColor,
						(JOINBOXSPACING*id)+JOINBOXCENTER,
						JOINBOXBLINKY,
						"JOIN IN!"
					);					
				else
					CANVAS.printCenter(
						ctx,FONTSMALL,player.fontColor,
						(JOINBOXSPACING*id)+JOINBOXCENTER,
						JOINBOXBLINKY,
						joinMessage
					);
			}
		});

		switch (this.state) {
			case JOINBOX_WAITING:{
				CANVAS.printCenter(ctx,FONT,FONTPALETTE.WHITE,NOTICEX,NOTICETEXTY,waitingMessage);
				break;
			}
			case JOINBOX_WAITINGFIRE:{
				CANVAS.printCenter(ctx,FONT,FONTPALETTE.WHITE,NOTICEX,NOTICETEXTY,waitingFireMessage);
				break;
			}
			case JOINBOX_FILLING:{
				CANVAS.fillRect(ctx,PALETTE.GREEN,1,0,NOTICEY,QMATH.floor(SCREEN_WIDTH*(startTimer/STARTTIMER_TIME)),FONT.tileHeight);
				CANVAS.printCenter(ctx,FONT,FONTPALETTE.WHITE,NOTICEX,NOTICETEXTY,fillingMessage+QMATH.ceil((STARTTIMER_TIME-startTimer)/FPS)+"sec...");
				break;
			}
			case JOINBOX_READY:{
				CANVAS.fillRect(ctx,PALETTE.BLUE,1,0,NOTICEY,SCREEN_WIDTH,FONT.tileHeight);
				CANVAS.printCenter(ctx,FONT,FONTPALETTE.WHITE,NOTICEX,NOTICETEXTY,readyMessage);
				break;
			}
		}

	}
}