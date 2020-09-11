
function Benchmark() {
	const
		CAMERAROTATION=QMATH.PI/FPS/5,
		CHANGEEVERY=FPS*10;
		
	var
		camera,
		timer=0,
		map=0,
		framets=0,
		framegap=0,
		framemin=999999,
		framemax=0,
		framesum=[0,0,0,0,0,0,0,0,0,0],
		graph=[],
		framecount=0,
		frameavg=0,
		ts,
		i;
	
	function selectMap(id) {
		var loadedData=MAPLOADER.load(id,RC,[],{});
		camera=RC.Camera({w:SCREEN_WIDTH,h:SCREEN_HEIGHT,planeY:0.66,id:0});
		camera.setPosX(loadedData.flagX);
		camera.setPosY(loadedData.flagY);
		camera.rotateBy(QMATH.random()*QMATH.PI*2);
	}

	function getTimestamp() { return (new Date()).getTime(); };


	this.initialize=function() {
		_MSPF=MSPF;
		_FPS=FPS;
	}
	
	this.show=function(matchEnd) {		
		selectMap(map);
	}
	this.frame=function() {
		camera.rotateBy(CAMERAROTATION);
		camera.advanceBy(0.1);
		if (timer++>CHANGEEVERY) {
			framets=0;
			timer=0;
			map=(map+1)%MAPS.length;
			selectMap(map);
		}
	}
	this.render=function(ctx) {
		ts=getTimestamp();			
		if (framets) {
			framegap=ts-framets;			
			if (framegap<framemin) framemin=framegap;
			if (framegap>framemax) framemax=framegap;
			framecount=(framecount+1)%framesum.length;
			framesum[framecount]=framegap;
			frameavg=0;
			for (i=0;i<framesum.length;i++)
				frameavg+=framesum[i];
			frameavg=QMATH.floor(frameavg/framesum.length);
			graph[framecount]=frameavg;
		}
		framets=ts;
		RC.tick();
		camera.render();
		camera.blit(ctx,0,0);
		CANVAS.print(ctx,FONT,FONTPALETTE.WHITE,0,0,"Min:"+framemin+" Max:"+framemax);
		CANVAS.print(ctx,FONT,FONTPALETTE.WHITE,0,10,"Avg:"+frameavg+"/"+_MSPF);
		for (i=0;i<graph.length;i++)
			CANVAS.fillRect(
				ctx,PALETTE.WHITE,1,
				10,30+(i*5),
				graph[i],4
			)
		CANVAS.fillRect(
			ctx,PALETTE.RED,1,
			10+_MSPF,30,
			1,graph.length*5
		)
	}
}