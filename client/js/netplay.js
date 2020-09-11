const
	NETPLAYSTATE_OFF=0,
	NETPLAYSTATE_PREPARING=1,
	NETPLAYSTATE_ON=2,
	NETPLAYSTATE_CONNECT=3,
	NETPLAYSTATE_CONNECTING=4,
	NETPLAYSTATE_CONNECTED=5,
	NETPLAYSTATE_JOIN=6,
	NETPLAYSTATE_JOINING=7,
	NETPLAYSTATE_JOINED=8,
	NETPLAYSTATE_PLAYING=9,
	NETPLAYSTATE=[
		"Disconnected",
		"Preparing...",
		"Ready.",
		"Connecting...",
		"Wait for connection...",
		"Connected.",
		"Joining game...",
		"Waiting to join the game...",
		"",
		"Playing..."
	]

var
	NETPLAY;

function Netplay(protocols,master) {

	const
		NETPACKET_FORCEQUIT=[[-1]],
		PLAYER_SYNC=[
			{
				key:"id"
			},{
				previous:"_playing"
			},
			// Send/receive only if the player is alive - Keep at the bottom of the array!
			{
				aliveOnly:true,
				key:"walking"
			},{
				aliveOnly:true,
				sprite:true,
				key:"x"
			},{
				aliveOnly:true,
				sprite:true,
				key:"y"
			},{
				aliveOnly:true,
				sprite:true,
				key:"angle"
			}
		];

	var netProtocols=[],netModes=[],netModesOptions=[];
	protocols.forEach(protocol=>{
		var obj=new protocol();
		if (obj.initialize()) {
			netProtocols.push(obj);
			obj.addOptions(netModes,netModesOptions);
		}
	})

	if (netModes.length) {

		netModes[0].default=true;

		const
			MENUCOLOR=PALETTE.BLACK,
			SETTINGSNOTESY=SCREEN_HEIGHT-FONTSMALL.tileHeight*2-4;		

		// Netplay - Helpers

		var self=this,
			netplay,
			setupGame,joinBox,joinedPlayer,
			netplayTimer=0,
			confirmingCount=0,
			joinedPlayers=[],
			roomPlayers,playerDataTimer,
			outPlayersData;

		function resetJoinboxState() {
			joinBox.setState(isJoined?JOINBOX_WAITINGFIRE:JOINBOX_WAITING);
		}

		function unconfirmJoin() {
			resetJoinboxState();
			netplay.setConfirm(false);
		}

		function confirmJoin() {
			joinBox.setState(JOINBOX_READY);
			netplay.setConfirm(true);
		}

		function startGame(ret) {

			outPlayersData=[];
			playerDataTimer=0;
			this.sendFullData=true;

			if (!ret) {

				// Prepare game data
				var ret={
					modules:[],
					settings:{}
				};
				NETPLAYGAMESETTINGS.forEach((option,id)=>{
					if (setupGame.enabledOptions[option.id]) {
						var onSet=option.values[setupGame.setup[option.id]].onSet;
						if (onSet.modules)
							onSet.modules.forEach(module=>{
								if (ret.modules.indexOf(module)==-1) ret.modules.push(module);
							});
						if (onSet.settings)
							for (var k in onSet.settings)
								ret.settings[k]=onSet.settings[k];							
					}
				});

				// Send just gameplay settings
				for (var k in DEFAULT_CONFIGS.gameplay)
					if (ret.settings[k]==undefined) ret.settings[k]=CONFIG[k];

				if (ret.settings.map==-1) ret.settings.map=QMATH.floor(QMATH.random()*MAPS.length);

				netplay.sendStartGame(ret);

				ret=DOM.clone(ret);

			}

			// Add the local player, fake all the others
			ret.players=joinedPlayers;
			ret.settings.goBackTo=GAMESTATE_NETPLAY;
			for (var k in CONFIG)
				if (ret.settings[k]==undefined) ret.settings[k]=CONFIG[k];

			netplay.startGame();

			// Run!
			self.end(ret);
		}

		function updateConfirmCount()  {
			confirmingCount=0;
			joinedPlayers.forEach(player=>{
				if (player.confirming) confirmingCount++;
			})
		}

		function setRoomPlayers(roomplayers) {
			joinedPlayers=[];
			confirmingCount=0;
			isJoined=false;
			self.isMaster=false;
			roomplayers.forEach((player,id)=>{
				var joinPlayer;
				if (player.isYou) {
					isJoined=true;
					if (id==0) self.isMaster=true;
					joinedPlayer.netId=player.id;
					joinPlayer=joinedPlayer;
				} else
					joinPlayer={
						fake:true,
						isLocal:false,
						netId:player.id,
						label:player.name,
						confirming:player.confirm
					};
				joinPlayer.isMaster=id==0;
				joinPlayer.joinLabel=joinPlayer.label;
				joinedPlayers.push(joinPlayer);
			});
			joinBox.setJoinedPlayers(joinedPlayers);
			updateConfirmCount();
		}

		// Netplay - Game interface

		this.isAvailable=true;
		this.startFrame=function(players,predictorprepare,predictorapply,checkObstacles,checkWalls) {
			if (netplay.state==NETPLAYSTATE_PLAYING) {
				inPlayersData=netplay.openStartFrame(players);
				// Sync other players data
				players.forEach(player=>{
					if (!player.isLocal) {
						var playerdata=inPlayersData[player.id];						
						if (!player.waitRespawn)
							if (playerdata) {
								predictorprepare(true,player);
								PLAYER_SYNC.forEach((attr,pos)=>{
									if ((playerdata[pos]!==undefined)&&!attr.aliveOnly||!player.isDead)
										if (attr.sprite) {
											player.sprite[attr.previous]=player.sprite[attr.key]
											player.sprite[attr.key]=playerdata[pos];
										}
										else {
											player[attr.previous]=player[attr.key];
											player[attr.key]=playerdata[pos];
										}
								});
								predictorprepare(false,player);
							} else predictorapply(player,checkObstacles,checkWalls);
					}
				});
				netplay.closeStartFrame();
			}
		}
		this.sendEventTo=function (player,data) {
			netplay.sendEventTo(player,data);
		}
		this.broadcastEvent=function (data) {
			netplay.broadcastEvent(data);
		}
		this.endFrame=function(players) {
			if (netplay.state==NETPLAYSTATE_PLAYING) {
				if (this.sendFullData) {
					var ret;
					players.forEach(player=>{
						if (player.isLocal) {
							var data=[];
							PLAYER_SYNC.forEach(attr=>{
								if (attr.sprite) data.push(player.sprite[attr.key]);
								else data.push(player[attr.key]);
							});
							outPlayersData.push({id:player.id,data:data});
						}
					});
					netplay.broadcastPlayersData(outPlayersData);				
					outPlayersData.length=0;
				} else netplay.broadcastPlayersData(outPlayersData);
				return netplay.endFrame();
			} else return NETPACKET_FORCEQUIT;
		}
		
		this.flushFrame=function() {
			if (playerDataTimer) {
				playerDataTimer--;
				this.sendFullData=false;
			} else {
				playerDataTimer=netplay.updateTime;
				this.sendFullData=true;
			}
			netplay.flushFrame();
		}

		// Netplay - listeners
		this.onRoomPlayersUpdated=function(players) {
			setRoomPlayers(players);
		}

		this.onSetupUpdated=function(setup) {
			setupGame.setSetup(setup);
		}

		this.onPlayerConfirm=function(data) {
			joinedPlayers.forEach(player=>{
				if (player.netId==data[0]) player.confirming=data[1];
			})
			updateConfirmCount();
		}

		this.onStartGame=function(data) {
			startGame(data);
		}

		this.onDisable=function() {
			this.isMaster=false;
			isJoined=false;
			joinedPlayers=[];
			netplayTimer=FPS;
			confirmingCount=0;
			joinBox.setJoinedPlayers(joinedPlayers);
			resetJoinboxState();
		}

		this.initialize=function() {

			setupGame=new SetupGame(
				"title",
				NETPLAYGAMESETTINGS,
				STORAGE_PREFIX+"netplay"
			);
			joinBox=new JoinBox(
				false,
				"Connecting...",
				"All joined players hold fire to start!",
				"Starting the game in ",
				"Waiting other players confirm...",
				"SELECT NETPLAY"
			)
			setupGame.initialize();
			joinBox.initialize();

			// Add settings
			var menu=[
				{
					id:"netNickname",label:"Nickname",alwaysEnabled:true,keyboard:MENU_KEYBOARDS.standard,keyboardLabel:["Input your Player nickname."],keyboardMaxLength:6,
					default:"p"+QMATH.floor(1000+QMATH.random()*8999)
				},
				{id:"netMode",arrows:true,alwaysEnabled:true,label:"Mode",values:netModes}
			].concat(netModesOptions)
			SETTINGS.addMenu("netplay","Netplay",menu,function(ctx){
				var notes=netModes[CONFIG.netMode].netplay.getSettingsNotes(netModes[CONFIG.netMode]);

				CANVAS.printCenter(
					ctx,FONTSMALL,FONTPALETTE.BLACK,
					HSCREEN_WIDTH,
					SETTINGSNOTESY,
					notes[0]
				);
				CANVAS.printCenter(
					ctx,FONTSMALL,FONTPALETTE.BLACK,
					HSCREEN_WIDTH,
					SETTINGSNOTESY+FONTSMALL.tileHeight,
					notes[1]
				);
			});

			// Initialize protocols configuration
			netProtocols.forEach(protocol=>{
				protocol.initializeConfig();
			})

		};

		this.show=function(ret) {
			this.isEnabled=true;
			joinedPlayer={isLocal:true,label:CONFIG.netNickname,isYou:true};

			setupGame.reset();
			joinBox.reset();

			TRANSITION.start();
			setupGame.show();
			joinBox.show();

			var netMode=netModes[CONFIG.netMode];
			netplay=netMode.netplay;
			this.predictorStrength=netplay.predictorStrength;			
			this.onDisable();
			
			netplay.show(!ret,this,netMode);
		}

		this.quit=function() {
			this.isEnabled=false;
			netplay.quit();
			this.onDisable();
			TRANSITION.end(-1);
			setupGame.quit();
			joinBox.quit();
		}

		this.end=function(ret) {
			AUDIOPLAYER.stopMusic();
			TRANSITION.end(ret);
			setupGame.end();
			joinBox.end();
		}

		this.frame=function(){

			// Update network status
			if (netplayTimer) netplayTimer--;
			else {
				netplay.manageConnection(setupGame.setup);
				netplayTimer=FPS;
			}

			// Manage room join/leave
			if (TRANSITION.isFree) {

				switch (setupGame.frame(TRANSITION.isFree&&isJoined,isJoined,!this.isMaster)) {
					case SETUPGAME_QUIT:{
						this.quit();
						break;
					}
					case SETUPGAME_CHANGED:{
						if (this.isMaster) netplay.updateSetup(setupGame.setup)
						break;
					}
				}

				if (isJoined) {
					switch (joinBox.frame(TRANSITION.isFree)) {
						case JOINBOX_FILLING:
						case JOINBOX_WAITINGFIRE:{
							if (joinedPlayer.controller) {
								if (GAMECONTROLS[joinedPlayer.controller]) {
									if (GAMECONTROLS[joinedPlayer.controller].fire) {
										if (joinBox.fillBar()) confirmJoin();
									} else {
										delete joinedPlayer.controller;
										if (isJoined) unconfirmJoin();							
										joinBox.setState(JOINBOX_WAITINGFIRE);
									}
								} else joinedPlayer.controller=0;
							} else {
								for (var c in GAMECONTROLS) {
									var control=GAMECONTROLS[c];
									if (control.fire>0) {
										joinedPlayer.controller=c;
										break;
									}
								}
							}
							break;
						}
						case JOINBOX_READY:{
							if (GAMECONTROLS[joinedPlayer.controller].action)
								unconfirmJoin();
							else if (this.isMaster&&(confirmingCount>1)&&(confirmingCount==joinedPlayers.length))
								startGame();
							break;
						}
						default:{
							resetJoinboxState();
						}
					}
				} else joinBox.frame(false);
			}

			return TRANSITION.getState();
		}
		this.render=function(ctx) {
			CANVAS.fillRect(ctx,MENUCOLOR,1,0,0,SCREEN_WIDTH, SCREEN_HEIGHT);
			if (!isJoined) STATICGENERATOR.blit(ctx,0,0,SCREEN_WIDTH,SCREEN_HEIGHT,0.2);
			joinBox.render(ctx);
			setupGame.render(ctx,!this.isMaster,!isJoined);
			CANVAS.printCenter(
				ctx,FONT,FONTPALETTE.WHITE,
				HSCREEN_WIDTH,
				8,
				netplay.getHeader()
			);
			CANVAS.printCenter(
				ctx,FONTSMALL,FONTPALETTE.BLACK,
				HSCREEN_WIDTH,
				8+FONT.tileHeight,
				NETPLAYSTATE[netplay.state]==undefined?"...":NETPLAYSTATE[netplay.state]
			);
			TRANSITION.render(ctx);
		}

	} else {

		// Empty netplay

		this.isAvailable=false;
		this.isEnabled=false;
		this.isMaster=true;
		this.initialize=function() {}
		this.show=function() {}
		this.startFrame=function() {}
		this.endFrame=function() {}
		this.render=function() {}
		this.frame=function() {}
		this.broadcastEvent=function() {}
		this.sendEventTo=function(){}
	}

}