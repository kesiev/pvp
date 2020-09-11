
function StaticGenerator() {
	const
		BUFFERWIDTH=SCREEN_WIDTH*2,
		BUFFERHEIGHT=SCREEN_HEIGHT*2;

	var
		canvas;

	this.initialize=function() {
		canvas=DOM.createCanvas(BUFFERWIDTH,BUFFERWIDTH);
		imagedata=canvas.ctx.createImageData(BUFFERWIDTH, BUFFERWIDTH);
		imagedatadata=imagedata.data;
		var len=BUFFERWIDTH*BUFFERHEIGHT*4;
		for (x=0;x<len;x+=4) {
			if (QMATH.random()>0.5) {
				imagedatadata[x]=PALETTE.WHITE[0];
				imagedatadata[x+1]=PALETTE.WHITE[1];
				imagedatadata[x+2]=PALETTE.WHITE[2];
			} else {
				imagedatadata[x]=PALETTE.BLACK[0];
				imagedatadata[x+1]=PALETTE.BLACK[1];
				imagedatadata[x+2]=PALETTE.BLACK[2];
			}
			imagedatadata[x+3]=255;
		}
		canvas.ctx.putImageData(imagedata,0,0);
	}	
	this.blit=function(ctx,x,y,w,h,opacity) {
		CANVAS.blit(
			ctx,canvas.canvas,
			QMATH.random()>0.5,
			QMATH.random()>0.5,
			0,opacity,1,0,
			QMATH.floor(QMATH.random()*(BUFFERWIDTH-w)),QMATH.floor(QMATH.random()*(BUFFERHEIGHT-h)),w,h,
			x,y,w,h
		)
	}
}