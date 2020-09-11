const
	// Netplay update frequency
	SOCKETIO_UPDATETIME=0,
	SOCKETIO_PREDICTORSTRENGTH=0.5,
	PEERJS_UPDATETIME=2,
	PEERJS_PREDICTORSTRENGTH=0.5,

	// Netplay Predictor
	PREDICTOR_DISTANCETOLLERANCE=[0.1,0.9],
	PREDICTOR_ANGLETOLLERANCE=[-0.78,0.78],

	// PEERJS Connection timers/flags
	PEERJS_CONNECTIONTIME=10,
	PEERJS_CONNECTIONCOOLDOWN=3,
	PEERJS_CONNECTIONTRIES=3,
	PEERJS_JOINTIME=5,
	PEERJS_ENABLEDESTROY=false,
	PEERJS_BULKMODE=true,

	// PEERJS Configuration
	PEERJS_NETLABEL="NET", // Used by GUI.
	PEERJS_CONFIG={
		config: {'iceServers': [
			{ url: 'stun:stun.l.google.com:19302' },

			// Adding a TURN server here will enable internet play for everyone.
			// Feel free to donate a TURN server, thanks!	
			/*
			{
				url: '___',
				credential: '___',
				username: '___'
			}
			*/
			
		]}
	};