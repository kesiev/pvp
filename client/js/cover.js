function Cover() {
	const
		MASTER_STORAGE_PREFIX=STORAGE_PREFIX+"master";

	var
		callback,imagesToLoad,loadedImages={},total=0,done=0,ready=2,
		box,log,bar,config,master,settingsbutton,settings,playbutton,cover,credits,browsernotice;

	function onReady() {
		ready--;
		if (!ready) {
			cover.parentNode.removeChild(cover);
			callback(master,loadedImages);
		}
	}
	function onDone() {
		if (done<total) done++;
		log.innerHTML="Loading "+done+"/"+total+"...";
		bar.style.width=Math.ceil(done/total*100)+"%";
	}
	function start() {		
		DOM.removeEventListener(box,"click",start);

		// Prepare master configuration
		master={};
		config.settings.forEach(setting=>{
			if (setting)
				if (setting.values)
					master[setting.id]=setting.values[setting._combo.selectedIndex].value;
				else
					master[setting.id]=setting._input.value.substr(0,setting.inputLength);
		});
		localStorage[MASTER_STORAGE_PREFIX]=JSON.stringify(master);

		// Apply master configuration
		if (!master.loadAudio) config.audio=[];

		// Remove hud nodes
		settings.parentNode.removeChild(settings);
		settingsbutton.parentNode.removeChild(settingsbutton);
		playbutton.parentNode.removeChild(playbutton);
		credits.parentNode.removeChild(credits);
		browsernotice.parentNode.removeChild(browsernotice);
		box.style.display="block";

		// Prepare loaders
		total=config.audio.length+config.images.length;
		imagesToLoad=config.images;
		AUDIOPLAYER=new AudioPlayer({
			resources:config.audio
		});

		// Run loaders
		loadNextImage();
		AUDIOPLAYER.initialize(onDone,onReady);
	}
	function loadNextImage() {
		if (imagesToLoad.length) {
			var
				image=imagesToLoad.pop();
				img=document.createElement("img");
			img.src=image.file;
			img.style.display="none";
			img.onload=function() {
				document.body.removeChild(img);
				onDone();
				loadNextImage()
			}
			loadedImages[image.id]=img;
			document.body.appendChild(img);
		} else onReady();
	}
	this.initialize=function(cfg,cb) {
		master={}
		if (localStorage[MASTER_STORAGE_PREFIX]) master=JSON.parse(localStorage[MASTER_STORAGE_PREFIX]);
		config=cfg;

		credits=document.getElementById("credits");
		browsernotice=document.getElementById("browsernotice");
		cover=document.getElementById("cover");
		log=document.getElementById("loaderlog");
		bar=document.getElementById("loaderbar");
		box=document.getElementById("loaderbox");
		settingsbutton=document.getElementById("settingsbutton");
		settings=document.getElementById("settingspanel");
		playbutton=document.getElementById("playbutton");

		credits.innerHTML=FOOTERHTMLCREDITS;

		DOM.addEventListener(settingsbutton,"click",function(){
			settings.style.display=settings.style.display=="block"?"":"block";
		});

		DOM.addEventListener(playbutton,"click",start);

		config.settings.forEach(setting=>{
			if (setting) {
				var
					row=document.createElement("div"),
					label=document.createElement("span");

				settings.appendChild(row);				
				label.innerHTML=setting.label+": ";
				row.appendChild(label);
				if (setting.values) {
					var combo=document.createElement("select");
					setting._combo=combo;
					row.appendChild(combo);
					setting.values.forEach(value=>{
						var option=document.createElement("option");
						option.innerHTML=value.label;
						if (master[setting.id]==value.value) option.selected="selected";
						combo.appendChild(option);
					});
				} else {
					var input=document.createElement("input");
					setting._input=input;
					input.type="text";
					input.value=master[setting.id]==undefined?setting.defaultValue:master[setting.id];
					input.setAttribute("maxlength",setting.inputLength);
					row.appendChild(input);
				}

			}

		})

		callback=cb;
	}
}