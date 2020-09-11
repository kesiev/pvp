if (typeof window !== 'undefined') exports=window;

// Client - server
exports.NETCODE_JOINROOM=0;
exports.NETCODE_LEAVEROOM=1;
exports.NETCODE_SETCONFIRM=2;
exports.NETCODE_FREEZEROOM=3;
exports.NETCODE_UPDATESETUP=4;
exports.NETCODE_BROADCAST=5;
exports.NETCODE_SENDEVENT=6;

// Server - client
exports.NETCODE_ROOMCONFIG=7;
exports.NETCODE_DATA=8;
exports.NETCODE_EVENT=9;
exports.NETCODE_ROOMFROZEN=10;
exports.NETCODE_SETUP=11;
exports.NETCODE_CONFIRM=12;
exports.NETCODE_BULK=13;
exports.NETCODE_UNAVAILABLE=100;

exports.NetplayServer=function(config) {

	if (!config) config={};
	if (config.logLevel==undefined) config.logLevel=0; // Log level
	if (config.roomTimeLimit==undefined) config.roomTimeLimit==1200000; // Autoclose rooms after 20 minutes of no join in/out

	var
		rooms={},players={},netcodes=config.netcodes,bulkmode;

	function sendToPlayer(player,type,data) {
		if (bulkmode) player.cache.push([type,JSON.parse(JSON.stringify(data))]);
		else config.sendToPlayer(player.socket,type,data);
	}

	function createRoomPacket(room,player) {
		var packet={
			setup:room.setup,
			players:[]
		};
		room.players.forEach(player2=>{
			packet.players.push({name:player2.name,id:player2.id,isYou:player.id==player2.id,confirm:player2.confirm});
		});
		return packet;
	}

	this.log=function(loglevel,id,room,text) {
		if (loglevel<=config.logLevel) console.log("["+id+"] [R:"+room+"] "+text);
	}

	this.getRoomConnections=function(roomId) {
		if (config.singleRoom) roomId=config.singleRoom;
		var
			conn=[],
			room=rooms[roomId];
						
		if (room) {
			room.players.forEach(player=>{
				conn.push(player.socket);
			});
		}
		return conn;
	}

	this.closeRoom=function(roomId) {
		if (config.singleRoom) roomId=config.singleRoom;
		var room=rooms[roomId];
		if (room) {
			room.players.forEach(player=>{
				this.log(2,"closeRoom",roomId,"Kicking player "+player.name+": "+this.leaveRoom(player.id,true));
				sendToPlayer(player,netcodes.NETCODE_ROOMCONFIG,{setup:0,players:[]});           
			});
			delete rooms[roomId];
			this.log(2,"closeRoom",roomId,"Room closed.");
			return "ok";
		} else return "errorNoRoom";
	}

	this.openRoom=function(roomId) {
		if (config.singleRoom) roomId=config.singleRoom;
		this.closeRoom(roomId);
		rooms[roomId]={
			frozen:false,
			lastUpdate:Date.now(),
			setup:0,
			players:[],
			playerById:{}
		}
	}

	this.freezeRoom=function(playerid,config) {
		var playerRoom=players[playerid];
		if (playerRoom) {
		   var room=rooms[playerRoom];
		   if (room) {
				if (!room.frozen) {
					room.frozen=true;
					this.log(3,"freezeRoom",playerRoom,"Broadcasting: "+this.broadcast(playerid,netcodes.NETCODE_ROOMFROZEN,config));
					return "ok";
				} else return "errorAlreadyFrozen";
		   } else return "errorNoRoom";
		} else return "errorNoPlayer";
	}

	this.broadcastRoomConfiguration=function(roomId,except) {
		if (config.singleRoom) roomId=config.singleRoom;
		var room=rooms[roomId];
		 if (room) {
			room.players.forEach(player=>{
				if (player.id!=except) {
					var packet=createRoomPacket(room,player);
					this.log(3,"broadcastRoomConfiguration",roomId,JSON.stringify(packet));
					sendToPlayer(player,netcodes.NETCODE_ROOMCONFIG,packet);
				}
			});
			return "ok";
		} else return "errorNoRoom";
	}

	this.joinRoom=function(roomId,name,setup,playerid,socket) {
		if (config.singleRoom) roomId=config.singleRoom;
		if (!rooms[roomId]) this.openRoom(roomId);
		var room=rooms[roomId];
		if (!room.frozen) {
			if (!room.playerById[playerid]) {
				if (room.players.length<4) {
					if (room.players.length==0) room.setup=setup;
					var player={id:playerid,name:name,socket:socket,confirm:false,cache:[]};
					room.lastUpdate=Date.now();
					room.players.push(player);
					room.playerById[playerid]=player;
					players[playerid]=roomId;
					this.broadcastRoomConfiguration(roomId);
					return "ok";
				} else return "errorRoomFull";
			} else {
				var player={id:playerid,name:name,socket:socket,confirm:false};
				room.lastUpdate=Date.now();
				room.playerById[playerid]=player;
				sendToPlayer(player,netcodes.NETCODE_ROOMCONFIG,createRoomPacket(room,player));
				return "errorAlreadyJoined";
			}
		} else return "errorRoomFrozen";
	}

	this.leaveRoom=function(playerid,dontbroadcast) {
		var playerRoom=players[playerid];
		if (playerRoom) {
		   var room=rooms[playerRoom];
		   if (room) {
				var player=room.playerById[playerid];
				if (player) {
					var pos=room.players.indexOf(player);
					if (pos!=-1) room.players.splice(pos,1);
					delete room.playerById[playerid];
					delete players[playerid];
					if (room.players.length==0) this.closeRoom(playerRoom);
					else if (!dontbroadcast) {
						this.broadcastRoomConfiguration(playerRoom);
						room.lastUpdate=Date.now();
					}
					return "ok";
				} else return "errorNoPlayerInRoom";
			} else return "errorNoPlayerRoom";
		} else return "errorNoPlayer";
	}

	this.setConfirm=function(playerid,value) {
		var playerRoom=players[playerid];            
		if (playerRoom) {
		   var room=rooms[playerRoom];
		   if (room) {
				var player=room.playerById[playerid];
				if (player) {
					player.confirm=value;
					this.broadcast(playerid,netcodes.NETCODE_CONFIRM,[playerid,value],true);
					return "ok";
				} else return "errorNoPlayer";
			} else return "errorNoPlayerRoom";
		} else return "errorNoPlayer";
	}

	this.updateSetup=function(playerid,setup) {
		var playerRoom=players[playerid];            
		if (playerRoom) {
		   var room=rooms[playerRoom];
		   if (room) {
				room.setup=setup;
				this.broadcast(playerid,netcodes.NETCODE_SETUP,setup);
				return "ok";
			} else return "errorNoPlayerRoom";
		} else return "errorNoPlayer";
	}

	this.broadcast=function(playerid,type,data,toall) {
		var playerRoom=players[playerid];
		if (playerRoom) {
			var room=rooms[playerRoom];
			if (room) {
				room.players.forEach(player=>{
					if (toall||(player.id!=playerid))
						sendToPlayer(player,type,data);
				});
				return "ok";
			} else return "errorNoPlayerRoom";
		} else return "errorNoPlayer";
	}

	this.send=function(playerid,type,data) {
		var playerRoom=players[playerid];
		if (playerRoom) {
			var room=rooms[playerRoom];
			if (room) {
				var player=room.playerById[playerid];
				if (player) {
					if (bulkmode) player.bulk.push([type,data]);
					else sendToPlayer(player,type,data);
					return "ok";
				} else return "errorPlayerNotInRoom";
			} else return "errorNoPlayerRoom";
		} else return "errorNoPlayer";
	}

	this.flushMessages=function() {
		for (var r in rooms) {
			rooms[r].players.forEach(player=>{
				if (player.cache.length) {
					config.sendToPlayer(player.socket,netcodes.NETCODE_BULK,player.cache);
					player.cache.length=0;
				}
			});
		}
	}

	this.flushRooms=function() {
		var ts=Date.now();
		for (var k in rooms) {
			if (ts-rooms[k].lastUpdate>config.roomTimeLimit) {
				serverLog(1,"<interval>",k,"Flusing for timeout: "+this.closeRoom(k));
			}
		}
	}

	this.setBulkMode=function(mode) {
		bulkmode=mode;
		if (!mode) this.flushMessages();
	}

	this.destroy=function() {
		this.setBulkMode(false);
	}

	return this;

}
