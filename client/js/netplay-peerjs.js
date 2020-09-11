function NetplayPeerJs(master) {

	const
		NODE_PREFIX="PVPX2-",
		PEERID_LENGTH=8,
		NETMODE_SERVER=0,
		NETMODE_CLIENT=1;

	var
		self=this,
		listener,isSatellite,
		peer,serverPeer,conn,localPeerId,localPeerIdIsSatellite,
		netplayServer,
		outPacket,
		inPlayersData,
		inPlayersEvents;

	this.state=NETPLAYSTATE_OFF;
	this.isAvailable=false;
	this.updateTime=PEERJS_UPDATETIME;
	this.predictorStrength=PEERJS_PREDICTORSTRENGTH;

	function generatePeerId() {
		SETTINGS.setOptionValue("netPeerId",DOM.generateRandomString(MENU_KEYBOARDS.numpad.validChars,PEERID_LENGTH));
	}

	function generateConfigurationUrl() {
		return document.location.href.replace(/\?.*/,"")+"?server="+CONFIG.netPeerId
	}

	this.initialize=function(){
		if (window.Peer) {
			listener=0;
			this.isAvailable=true;
			window.onbeforeunload = function() { closeConnections(true); }
			return true;
		} else return false;
	}

	this.addOptions=function(netModes,options) {
		netModes.push({id:"netModeNetServer",label:PEERJS_NETLABEL+" Server",netplay:this,mode:NETMODE_SERVER,enable:["netPeerId","netNewPeerId","netCopyPeerUrl"]});
		netModes.push({id:"netModeNetClient",label:PEERJS_NETLABEL+" Client",netplay:this,mode:NETMODE_CLIENT,enable:["netServerId"]});
		options.push({
			id:"netServerId",label:PEERJS_NETLABEL+" Server ID",keyboard:MENU_KEYBOARDS.numpad,keyboardLabel:["Input the Server ID to connect.","Players connected to the same server will play together."],keyboardMaxLength:PEERID_LENGTH,keyboardMinLength:PEERID_LENGTH,
			default:DOM.generateRandomString(MENU_KEYBOARDS.numpad.validChars,PEERID_LENGTH)
		});
		options.push({
			id:"netPeerId",label:"Your ID",valueOnly:true,locked:true,
			default:DOM.generateRandomString(MENU_KEYBOARDS.numpad.validChars,PEERID_LENGTH)
		});
		options.push({
			id:"netCopyPeerUrl",label:"Copy configuration URL to clipboard...",
			onSelect:function() {
				TRANSITION.notify("URL Copied!","Share this link to play together")
				DOM.copyToClipboard(generateConfigurationUrl())
			}
		});
		options.push({
			id:"netNewPeerId",label:"Generate new ID...",
			onSelect:function() { generatePeerId(); }
		});
	}

	this.initializeConfig=function() {
		// Get room name from URL
		var serverPeerId=DOM.getParameterByName("server");
		if (serverPeerId) {
			SETTINGS.setOptionValue("netServerId",serverPeerId);
			SETTINGS.setOptionValue("netMode",SETTINGS.getOptionValueById("netMode","netModeNetClient"));
		}
		// Generate Peer ID
		if (!CONFIG.netPeerId) generatePeerId();			
	}

	this.getHeader=function() {
		return CONFIG.netNickname+" "+DOT_SYMBOL+
			(localPeerId?" You ":" ??? ")+(
				isSatellite?
					(conn&&conn.open?RIGHTARROW_SYMBOL:TIME_SYMBOL)+" "+CONFIG.netServerId
				:
					CONFIG.netPeerId+" (Server)"
			);
	}

	this.getSettingsNotes=function(netmode) {
		if (netmode.mode==NETMODE_SERVER) {
			return [
				"Share this link to other Players to automatically configure their clients:",
				generateConfigurationUrl()
			]
		} else {
			return [
				"Insert a "+PEERJS_NETLABEL+" Server ID to connect and play together. If you don't want to",
				"type it in ask the server player the link displayed on its Netplay settings."
			]
		}
	}

	// Packet management

	function managePlayersPacket(type,data) {
		switch (type) {
			// Client
			case NETCODE_ROOMCONFIG:{
				if (self.state==NETPLAYSTATE_PLAYING) {
					sendToConnection(conn,NETCODE_LEAVEROOM);
					self.setState(NETPLAYSTATE_CONNECTED);
				} else if (self.state>=NETPLAYSTATE_JOIN) {
					self.setState(NETPLAYSTATE_JOINED);
					listener.onRoomPlayersUpdated(data.players);
					if (data.setup) listener.onSetupUpdated(data.setup);
				}
				break;
			}
			case NETCODE_CONFIRM:{
				listener.onPlayerConfirm(data);
				break;
			}
			case NETCODE_ROOMFROZEN:{
				if (self.state>=NETPLAYSTATE_JOIN) listener.onStartGame(data);
				break;
			}
			case NETCODE_SETUP:{
				if (self.state>=NETPLAYSTATE_JOIN) listener.onSetupUpdated(data);
				break;
			}
			case NETCODE_DATA:{
				if (self.state==NETPLAYSTATE_PLAYING) {
					data[0].forEach(packet=>{
						inPlayersData[packet.id]=packet.data;
					})
					data[1].forEach(event=>{
						inPlayersEvents.push(event);
					});
				}
				break;
			}
			case NETCODE_EVENT:{
				if (self.state==NETPLAYSTATE_PLAYING) inPlayersEvents.push(data);
				break;
			}
			case NETCODE_BULK:{
				data.forEach(packet=>{
					managePlayersPacket(packet[0],packet[1])
				})
				break;
			}
			case NETCODE_UNAVAILABLE:{
				console.info("Server not available!");
				closeConnections(true);
				break;
			}
		}
	}

	function manageServerPacket(connection,type,data) {
		if (netplayServer) {
			var peerid=connection?connection.peer:0;
			switch (type) {
				case NETCODE_JOINROOM:{
					netplayServer.log(2,"joinRoom","-",netplayServer.joinRoom(data[0],data[1],data[2],peerid,connection));
					break;
				}
				case NETCODE_LEAVEROOM:{
					netplayServer.log(2,"leaveRoom","-",netplayServer.leaveRoom(peerid));
					break;
				}

				case NETCODE_SETCONFIRM:{
					netplayServer.log(3,"setConfirm","-",netplayServer.setConfirm(peerid,data));
					break;
				}

				case NETCODE_FREEZEROOM:{
					netplayServer.log(3,"freezeRoom","-",netplayServer.freezeRoom(peerid,data));
					break;
				}

				case NETCODE_UPDATESETUP:{
					netplayServer.log(3,"updateSetup","-",netplayServer.updateSetup(peerid,data));
					break;
				}

				case NETCODE_BROADCAST:{
					netplayServer.broadcast(peerid,NETCODE_DATA,data);
					break;
				}
				case NETCODE_SENDEVENT:{
					netplayServer.send(data[0],NETCODE_EVENT,data[1]);
					break;
				}
			}
		}
	}

	// Low-level communication

	function sendToConnection(connection,type,data) {
		if (isSatellite) {	
			if (connection&&connection.open) connection.send([type,data]);			
		} else {
			if (connection&&connection.open) connection.send([type,data]);
			else {
				manageServerPacket(connection,type,data);
				managePlayersPacket(type,data);
			}
		}
	}

	// Peer & connection destruction

	var connectionCooldown;

	function closeConnections(cooldown) {
		console.info("Closing connections...");
		// Close connections
		if (conn) {
			console.info("Closing connection to server...");
			conn.close();
		}
		if (netplayServer) {
			console.info("Disconnecting all peers from server...");
			var connections=netplayServer.getRoomConnections();
			connections.forEach(connection=>{
				if (connection) connection.close();
			});
		}
		// Reset variables
		conn=0;		
		connectionCooldown=cooldown?PEERJS_CONNECTIONCOOLDOWN:0;
		joinTimer=0;
		if (self.state>=NETPLAYSTATE_ON) self.setState(NETPLAYSTATE_ON,true);
		else self.setState(NETPLAYSTATE_OFF,true);
		// Reset UI
		if (listener) listener.onDisable();
	}

	function closePeer(hard) {
		console.info("Closing peer... Hard:",!!hard);
		closeConnections();
		try {
			peer.off("open");
			peer.off("connection");
			peer.on("connection", (conn)=>{ conn.close(); });
			if (hard&&peer) {
				console.info("Peer destroyed :( Destruction enabled:",PEERJS_ENABLEDESTROY);
				if (PEERJS_ENABLEDESTROY) peer.destroy();
			}
		} catch (e) {}
		peer=0;
		localPeerId=0;
		peerTimer=10;
		self.setState(NETPLAYSTATE_OFF,true);
	}

	function destroyNetplayServer() {
		if (netplayServer) netplayServer.destroy();
		netplayServer=0;
	}

	// Peer management

	var peerTimer, connectionTries,connectionTimer,joinTimer;

	// API - Initialization

	this.show=function(first,listen,netmode) {		
		listener=listen;
		isSatellite=netmode.mode==NETMODE_CLIENT;
		if (first) {
			if (localPeerIdIsSatellite!=isSatellite) {
				console.info("Changed peer type. Closing peer...");
				closePeer();
			}
		}
		if (this.state>=NETPLAYSTATE_ON) {
			sendToConnection(conn,NETCODE_LEAVEROOM);
			this.setState(NETPLAYSTATE_ON);
		} else this.setState(NETPLAYSTATE_OFF);
	}

	this.quit=function() {
		closeConnections();
		destroyNetplayServer();
	}

	// Connection management

	this.setState=function(state,wait,setup) {
		this.state=state;
		if (!wait) this.manageConnection(setup);
	}

	this.manageConnection=function(setup) {
		if (connectionCooldown) {
			console.info("Waiting to connect...")
			connectionCooldown--;
		} else if (isSatellite) {
			// Client
			switch (this.state) {
				case NETPLAYSTATE_OFF:{
					localPeerIdIsSatellite=isSatellite;				
					closePeer();
					try {
						console.info("Creating peer. Satellite:", isSatellite);
						peer=new Peer(PEERJS_CONFIG);
						peer.on("open", (id)=> {
							localPeerId=id;
							console.info("Peer id",id);
							this.setState(NETPLAYSTATE_ON);
						});
					} catch (e) {
						console.info("Can't create peer",e);
					}
					this.setState(NETPLAYSTATE_PREPARING);
					break;
				}
				case NETPLAYSTATE_PREPARING:{
					// Wait the peer ID to appear, else destroy it and recreate.
					console.info("Waiting peer ID...",peerTimer);
					if (peerTimer) peerTimer--;
					else {
						console.info("Can't get the ID. Closing peer...");
						if (isSatellite) closePeer(true);
						else closePeer();
					}
					break;
				}
				case NETPLAYSTATE_ON:{
					closeConnections();
					this.setState(NETPLAYSTATE_CONNECT);
					break;
				}
				case NETPLAYSTATE_CONNECT:{
					connectionTries=PEERJS_CONNECTIONTRIES;
					connectionTimer=PEERJS_CONNECTIONTIME;
					console.info("Connecting to the server...",NODE_PREFIX+CONFIG.netServerId);
					try {
						conn=peer.connect(NODE_PREFIX+CONFIG.netServerId);
						conn.on("open", (data)=>{
							this.setState(NETPLAYSTATE_CONNECTED);
							console.info("Connection opened.");						  	
						});
						conn.on("data", (data)=>{
						  	managePlayersPacket(data[0],data[1]);
						});
						conn.on("close", (data)=>{
							console.info("Connection closed...");
							closeConnections(true);
						});
						conn.on("error", (data)=>{
							console.info("Connection error...");
							closeConnections(true);
						});
					} catch (e) {
						console.info("Can't create connection",e);
					}
					this.setState(NETPLAYSTATE_CONNECTING);
					break;
				}
				case NETPLAYSTATE_CONNECTING:{
					console.info("Connecting...",connectionTimer);
					if (connectionTimer) connectionTimer--;
					else if (connectionTries) {
						console.info("Connection destroyed. Trying again...",connectionTries);
						connectionTries--;
						closeConnections();
					} else {
						console.info("Connection tries over. Closing peer...");
						closePeer();
					}
					break;
				}
				case NETPLAYSTATE_CONNECTED:{
					this.setState(NETPLAYSTATE_JOIN);
					break;
				}
				case NETPLAYSTATE_JOIN:{
					sendToConnection(conn,NETCODE_JOINROOM, ["room",CONFIG.netNickname,setup]);
					joinTimer=PEERJS_JOINTIME;
					this.setState(NETPLAYSTATE_JOINING,true);
					break;
				}
				case NETPLAYSTATE_JOINING:{
					if (joinTimer) {
						console.info("Waiting to join the room...",joinTimer)
						joinTimer--;
					} else this.setState(NETPLAYSTATE_JOIN,true);	
					break;
				}
			}
		} else {
			// Server
			switch (this.state) {
				case NETPLAYSTATE_OFF:{
					var nextState=NETPLAYSTATE_PREPARING;
					destroyNetplayServer();
					localPeerIdIsSatellite=isSatellite;				
					var peerId=NODE_PREFIX+CONFIG.netPeerId;
					closePeer();
					if (serverPeer&&(serverPeer.id==peerId)) {
						console.info("Reusing peer. Satellite:", isSatellite);
						peer=serverPeer;
						localPeerId=serverPeer.id;
						nextState=NETPLAYSTATE_ON;
					} else {
						try {
							console.info("Creating peer. Satellite:", isSatellite);
							serverPeer=peer=new Peer(peerId,PEERJS_CONFIG);
						} catch (e) {
							console.info("Can't create peer",e);
						}
					}

					if (peer) {						
						peer.on("open", (id)=> {
							localPeerId=id;
							console.info("Peer id",id);
							this.setState(NETPLAYSTATE_ON);
						});
						peer.off("connection");			
						peer.on("connection", (conn)=>{		

							console.info("Connected",conn.peer);

							conn.on("open",()=>{
								if (netplayServer) console.info("Connection opened with",conn.peer);
								else sendToConnection(conn,NETCODE_UNAVAILABLE, []);
							})

							conn.on("data", function(data){
								if (netplayServer) {
							  	manageServerPacket(conn,data[0],data[1]);
								managePlayersPacket(data[0],data[1]);
							} else sendToConnection(conn,NETCODE_UNAVAILABLE, []);
							});

							conn.on("close",function(){
								console.info("Disconnected",conn.peer);
								if (netplayServer) {
									netplayServer.leaveRoom(conn.peer);
								}
							});

							conn.on("error",function(e){
								console.info("Disconnected (error)",conn.peer,e);
								if (netplayServer) {
									netplayServer.leaveRoom(conn.peer);
								}
							});
						});
					}
					this.setState(nextState);				
					break;
				}
				case NETPLAYSTATE_PREPARING:{
					// Wait the peer ID to appear, else destroy it and recreate.
					console.info("Waiting peer ID...",peerTimer);
					if (peerTimer) peerTimer--;
					else {
						console.info("Can't get the ID. Closing peer...");
						if (isSatellite) closePeer(true);
						else closePeer();
					}
					break;
				}
				case NETPLAYSTATE_ON:{
					closeConnections();
					this.setState(NETPLAYSTATE_CONNECT);			
					break;
				}
				case NETPLAYSTATE_CONNECT:{
					netplayServer=new NetplayServer({
						netcodes:window,
						logLevel:0,
						singleRoom:"room",
					    sendToPlayer:function(conn,type,data) {
					        sendToConnection(conn,type,data);
					    }
					});
					this.setState(NETPLAYSTATE_CONNECTING);
					break;
				}
				case NETPLAYSTATE_CONNECTING:{
					this.setState(NETPLAYSTATE_CONNECTED);
					break;
				}
				case NETPLAYSTATE_CONNECTED:{
					this.setState(NETPLAYSTATE_JOIN);
					break;
				}
				case NETPLAYSTATE_JOIN:{
					console.info("Requesting to join room...");
					sendToConnection(conn,NETCODE_JOINROOM, ["room",CONFIG.netNickname,setup]);
					if (this.state==NETPLAYSTATE_JOIN)
						this.setState(NETPLAYSTATE_JOINING,true);
					break;
				}
				case NETPLAYSTATE_JOINING:{
					if (joinTimer) {
						console.info("Waiting to join the room...",joinTimer)
						joinTimer--;
					} else this.setState(NETPLAYSTATE_JOIN,true);
					break;
				}
			}
		}
	}

	// API - Game setup

	this.updateSetup=function(setup) {
		sendToConnection(conn,NETCODE_UPDATESETUP,setup)
	}

	this.setConfirm=function(confirm) {
		sendToConnection(conn,NETCODE_SETCONFIRM, confirm);
	}

	this.sendStartGame=function(gamesettings) {
		this.setState(NETPLAYSTATE_PLAYING);
		sendToConnection(conn,NETCODE_FREEZEROOM,gamesettings);
	}

	this.startGame=function() {
		this.setState(NETPLAYSTATE_PLAYING);
		if (netplayServer) netplayServer.setBulkMode(PEERJS_BULKMODE);
		outPacket=[0,[]];
		inPlayersData=[];
		inPlayersEvents=[];
	}

	// API - ingame

	this.sendEventTo=function (player,data) {
		if (this.state==NETPLAYSTATE_PLAYING)
			sendToConnection(conn,NETCODE_SENDEVENT,[player.netId,data]);
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
			sendToConnection(conn,NETCODE_BROADCAST,outPacket);
		outPacket[1].length=0;
	}

	this.endFrame=function(players) {
		return inPlayersEvents;
	}

	this.flushFrame=function() {
		inPlayersEvents.length=0;
		if (netplayServer) netplayServer.flushMessages();
	}

}