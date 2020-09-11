function NetplaySocketIo(master) {
	const
		ROOMID_MINLENGTH=3,
		ROOMID_MAXLENGTH=8;

	var
		listener,
		socket,
		outPacket,
		inPlayersData,
		inPlayersEvents;

	this.state=NETPLAYSTATE_OFF;
	this.isAvailable=false;
	this.updateTime=SOCKETIO_UPDATETIME;
	this.predictorStrength=SOCKETIO_PREDICTORSTRENGTH;

	function generateConfigurationUrl() {
		return document.location.href.replace(/\?.*/,"")+"?room="+CONFIG.netRoom;
	}

	this.initialize=function(){
		if (window.io) {
			listener=0;
			this.isAvailable=true;
			socket = io();
			return true;
		} else return false;
	}

	this.addOptions=function(netModes,options) {
		netModes.push({id:"netModeSocketIo",label:"Socket.io client",netplay:this,enable:["netRoom","netCopyRoomUrl"]});
		options.push({
			id:"netRoom",label:"Room",keyboard:MENU_KEYBOARDS.roomId,keyboardLabel:["Input the game room name to use.","Players in the same room will play together."],keyboardMaxLength:ROOMID_MAXLENGTH,keyboardMinLength:ROOMID_MINLENGTH,
			default:DOM.generateRandomString(MENU_KEYBOARDS.roomId.validChars,ROOMID_MAXLENGTH)
		});
		options.push({
			id:"netCopyRoomUrl",label:"Copy configuration URL to clipboard...",
			onSelect:function() {
				TRANSITION.notify("URL Copied!","Share this link to play together")
				DOM.copyToClipboard(generateConfigurationUrl())
			}
		});
	}

	this.initializeConfig=function() {
		// Get room name from URL
		var roomName=DOM.getParameterByName("room");
		if (roomName) {
			SETTINGS.setOptionValue("netRoom",roomName);
			SETTINGS.setOptionValue("netMode",SETTINGS.getOptionValueById("netMode","netModeSocketIo"));
		}
	}

	this.getHeader=function() {
		return CONFIG.netNickname+" "+DOT_SYMBOL+" Netplay room: "+CONFIG.netRoom
	}

	this.getSettingsNotes=function(mode) {
		return [
			"Share this link to other Players to configure them on your same room:",
			generateConfigurationUrl()
		]
	}

	// API - Initialization

	this.show=function(first,listen,netmode) {		
		listener=listen;
		if (!first) {
			socket.emit(NETCODE_LEAVEROOM);
			this.setState(NETPLAYSTATE_ON);
		}
	}

	this.quit=function() {
		socket.emit(NETCODE_LEAVEROOM);
		this.setState(NETPLAYSTATE_ON,true);
	}

	// Connection management

	this.setState=function(state,wait,setup) {
		this.state=state;
		if (!wait) this.manageConnection(setup);
	}

	this.manageConnection=function(setup) {
		switch (this.state) {
			case NETPLAYSTATE_OFF:{
				socket.off(NETCODE_ROOMCONFIG);
				socket.off(NETCODE_CONFIRM);
				socket.off(NETCODE_ROOMFROZEN);
				socket.off(NETCODE_SETUP);
				socket.off(NETCODE_DATA);
				socket.off(NETCODE_EVENT);
				this.setState(NETPLAYSTATE_PREPARING);
				break;
			}
			case NETPLAYSTATE_PREPARING:{
				socket.on(NETCODE_ROOMCONFIG,(data)=>{
					if (this.state==NETPLAYSTATE_PLAYING) {
						socket.emit(NETCODE_LEAVEROOM);
						this.setState(NETPLAYSTATE_CONNECTED);
					} else if (this.state>=NETPLAYSTATE_JOIN) {
						this.setState(NETPLAYSTATE_JOINED);
						listener.onRoomPlayersUpdated(data.players);
						if (data.setup) listener.onSetupUpdated(data.setup);
					}
				});
				socket.on(NETCODE_CONFIRM,(data)=>{
					listener.onPlayerConfirm(data);
				});
				socket.on(NETCODE_ROOMFROZEN,(data)=>{
					if (this.state>=NETPLAYSTATE_JOIN) listener.onStartGame(data);
				});
				socket.on(NETCODE_SETUP,(data)=>{
					if (this.state>=NETPLAYSTATE_JOIN) listener.onSetupUpdated(data);
				});
				socket.on(NETCODE_DATA,(data)=>{
					if (this.state==NETPLAYSTATE_PLAYING) {
						data[0].forEach(packet=>{
							inPlayersData[packet.id]=packet.data;
						})
						data[1].forEach(event=>{
							inPlayersEvents.push(event);
						});
					}
				});
				socket.on(NETCODE_EVENT,(data)=>{
					if (this.state==NETPLAYSTATE_PLAYING) inPlayersEvents.push(data);
				});
				// Bulk mode not supported.
				this.setState(NETPLAYSTATE_ON);
				break;
			}
			case NETPLAYSTATE_ON:{
				this.setState(NETPLAYSTATE_CONNECT);
				break;
			}
			case NETPLAYSTATE_CONNECT:{
				this.setState(NETPLAYSTATE_CONNECTING);
				break;
			}
			case NETPLAYSTATE_CONNECTING:{
				this.setState(NETPLAYSTATE_JOIN);
				break;
			}
			case NETPLAYSTATE_JOIN:{
				socket.emit(NETCODE_JOINROOM, [CONFIG.netRoom,CONFIG.netNickname,setup]);
				this.setState(NETPLAYSTATE_JOINING,true);
				break;
			}
			case NETPLAYSTATE_JOINING:{
				this.setState(NETPLAYSTATE_JOIN,true);
				break;
			}
		}
	}

	// API - Game setup

	this.updateSetup=function(setup) {
		socket.emit(NETCODE_UPDATESETUP,setup)
	}

	this.setConfirm=function(confirm) {
		socket.emit(NETCODE_SETCONFIRM, confirm);
	}

	this.sendStartGame=function(gamesettings) {
		this.setState(NETPLAYSTATE_PLAYING);
		socket.emit(NETCODE_FREEZEROOM,gamesettings);
	}

	this.startGame=function() {
		this.setState(NETPLAYSTATE_PLAYING);
		outPacket=[0,[]];
		inPlayersData=[];
		inPlayersEvents=[];
	}

	// API - ingame

	this.sendEventTo=function (player,data) {
		if (this.state==NETPLAYSTATE_PLAYING)
			socket.emit(NETCODE_SENDEVENT,[player.netId,data]);
	}

	this.broadcastEvent=function (data) {
		// Broadcasted events are cached and sent at once
		if (this.state==NETPLAYSTATE_PLAYING)
			outPacket[1].push(data);
	}

	this.openStartFrame=function(players) {
		return inPlayersData;
	}

	this.closeStartFrame=function() {
		inPlayersData.length=0;
	}

	this.broadcastPlayersData=function(data) {
		outPacket[0]=data;
		if (outPacket[0].length||outPacket[1].length)
			socket.emit(NETCODE_BROADCAST,outPacket);
		outPacket[1].length=0;
	}

	this.endFrame=function(players) {
		return inPlayersEvents;
	}

	this.flushFrame=function() {
		inPlayersEvents.length=0;
	}

}