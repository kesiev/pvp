function AudioPlayer(cfg) {
	if (!cfg) cfg={};

	var
		sam,
		ready=false,
		audioContext=audioOut=0,
		lastId=0,
		audioPlaying={},
		musicPlaying=0,
		samples={};
	
	if (cfg.volume==undefined) cfg.volume=1;
	if (cfg.musicVolume==undefined) cfg.musicVolume=0.3;
	

	this.resources=JSON.parse(JSON.stringify(cfg.resources));
	this.enabled=true;
	this.musicEnabled=true;
	this.effectsEnabled=true;
	this.configuration=cfg;

	this.setMusic=function(enabled) {
		this.musicEnabled=enabled;
		if (ready)
			if (enabled) this.playMusic(musicPlaying,true);
			else this.stopMusic(true);
	}

	this.setEffects=function(enabled) {
		this.effectsEnabled=enabled;
	}

	this.audioIsEnded=function(sampleid) {
		return !audioPlaying[sampleid]||audioPlaying[sampleid].ended;
	}

	this.setVolume=function(vol) {
		cfg.volume=vol;
	}

	this.setMusicVolume=function(vol) {
		cfg.musicVolume=vol;
		if (XMPlayer&&XMPlayer.gainNode) {
			XMPlayer.gainNode.gain.value=0.1*vol;
		}
		if (musicPlaying&&audioPlaying[musicPlaying]&&audioPlaying[musicPlaying].gain)
			audioPlaying[musicPlaying].gain.gain.value=vol;
	}

	this.play=function(sampleid,loop,volume,force) {
		var sample=samples[sampleid]||false;
		if (this.initialize()&&sample&&this.enabled&&(this.effectsEnabled||force)&&audioContext) {
			if (sample.mod) {
				XMPlayer.stop();
				XMPlayer.load(sample.mod);
				XMPlayer.play();
				audioPlaying[sampleid]="mod";
			} else {
				loop=!!loop;
				this.stop(sampleid);
				var sound={
					gain:audioContext.createGain(),
					source: audioContext.createBufferSource(),
					ended:false
				}
				sound.gain.connect(audioOut);
				sound.gain.gain.value=volume||cfg.volume;
				sound.source.buffer = sample.buffer;
				sound.source.loop=loop;
				if (sample.properties.pitchStart!==undefined)
					sound.source.playbackRate.value=sample.properties.pitchStart+(sample.properties.pitchRange*QMATH.random());
				sound.source.onended=()=>{ sound.ended=true; }
				if (loop&&(sample.properties.loopStart!=undefined)) {
					sound.source.loopStart=sample.properties.loopStart;
					sound.source.loopEnd=sample.properties.loopEnd;
				}
				sound.source.connect(sound.gain);
				sound.source.start(0);
				audioPlaying[sampleid]=sound;
			}
		}
	}

	this.playMusic=function(sampleid,force) {
		if (force||(sampleid!=musicPlaying)) {
			if (this.initialize()) {
				this.stopMusic();
				if (this.musicEnabled) this.play(sampleid,true,cfg.musicVolume,true);
				musicPlaying=sampleid;
			}
		}
	}

	this.stopMusic=function(dontforget) {
		if (this.initialize()) {
			this.stop(musicPlaying)
			if (!dontforget) musicPlaying=0;
		}
	}

	this.stopAll=function() {
		if (this.initialize()) {
			for (var a in audioPlaying)
				this.stop(a);
		}
	}

	this.stop=function(sampleid) {
		if (this.initialize()) {
			if (audioPlaying[sampleid]=="mod") {
				XMPlayer.stop();
			} else if (audioPlaying[sampleid]) {
				audioPlaying[sampleid].source.stop(0);
				audioPlaying[sampleid].gain.disconnect();
				audioPlaying[sampleid].source.disconnect();
				audioPlaying[sampleid]=0;
			}
		}
	}

	this.setEnabled=function(state) {
		this.enabled=state;
		this.stopAll();
	}

	this.initialize=function(onprogress,ondone) {
		if (!this.enabled||ready) return true;
		else {
			XMPlayer.init();
			if (window.AudioContext)
				audioContext=new window.AudioContext();
			else if (window.webkitAudioContext)
				audioContext=new window.webkitAudioContext();
			if (audioContext) {
				ready=true;
				audioOut=audioContext.createGain();
				audioOut.connect(audioContext.destination);
				audioOut.gain.value=0.9;
				loadResources(cfg.resources,onprogress,ondone);
			}
			return false;
		}
	}

	// --- LOADER

	function loadResources(sampleslist,onprogress,ondone) {
		var self=this;
		if (!sampleslist.length) {
			if (ondone) ondone(true);
		} else {
			var sample=sampleslist.shift();		
			if (sample.sam) {
				if (!sam) sam=new SamJs();
				var
					audiobuffer=sam.buf32(sample.sam.text),
					source = audioContext.createBufferSource(),
					soundBuffer = audioContext.createBuffer(1, audiobuffer.length, 22050),
					buffer = soundBuffer.getChannelData(0);
				for(var i=0; i<audiobuffer.length; i++) {
					buffer[i] = audiobuffer[i];
				}
				samples[sample.id]={
					buffer:soundBuffer,
					properties:sample
				};
				onprogress();
				loadResources(sampleslist,onprogress,ondone);
			} else if (sample.mod) {
				var request = new XMLHttpRequest();
				request.open("GET", sample.mod);
				request.responseType = "arraybuffer";
				request.onload = function () {
					if (this.status === 200) {
						samples[sample.id]={
							buffer:0,
							properties:sample,
							mod:request.response
						}
					}
					loadResources(sampleslist,onprogress,ondone);
				};
				request.send();
			} else if (sample.like) {
				 samples[sample.id]={
					buffer:samples[sample.like].buffer,
					mod:samples[sample.like].mod,
					properties:sample
				};
				loadResources(sampleslist,onprogress,ondone);
			} else {
				var request = new XMLHttpRequest();
				request.open('GET', sample.file+(DOM.canPlayOgg?".ogg":".mp4"), true);
				request.responseType = 'arraybuffer';
				request.onload = function() {					
					audioContext.decodeAudioData(request.response, function(buffer) {
						onprogress();
						samples[sample.id]={
							buffer:buffer,
							properties:sample
						};
						loadResources(sampleslist,onprogress,ondone);
					}, function(e){
						console.log("Error loading resource",sample);
						if (ondone) ondone(false);
					});
				}	
				request.send();
			}
		}
	}

}