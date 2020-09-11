function Particles(maxParticles,x,y,width,height) {
	const
		PI2=QMATH.PI*2,
		CLUSTER_SPEED=QMATH.floor(height*0.05),
		CLUSTER_SPEEDDELTA=QMATH.floor(height*0.03),
		GRAVITY_RATIO=1;

	var
		particles=[],
		lastParticle=0,
		x1=x+width-1,
		y1=y+height-1,
		liveParticles=0;

	for (var i=0;i<maxParticles;i++) {
		particles.push({isRunning:false})
	}

	this.maxParticles=maxParticles;

	this.addParticlesCluster=function(size,x,y,gravityx,gravityy,color,alpha) {
		for (var i=0;i<size;i++)
			this.addParticle(x,y,QMATH.random()*PI2,CLUSTER_SPEED+QMATH.random()*CLUSTER_SPEEDDELTA,gravityx*GRAVITY_RATIO,gravityy*GRAVITY_RATIO,color,alpha);
	}

	this.addParticlesHorizontalLine=function(size,x,w,y,gravityx,gravityy,color,alpha) {
		for (var i=0;i<size;i++)
			this.addParticle(x+QMATH.random()*w,y,QMATH.random()*PI2,CLUSTER_SPEED+QMATH.random()*CLUSTER_SPEEDDELTA,gravityx*GRAVITY_RATIO,gravityy*GRAVITY_RATIO,color,alpha);
	}

	this.addParticle=function(x,y,angle,speed,gravityx,gravityy,color,alpha) {
		for (var i=0;i<maxParticles+1;i++) {
			lastParticle=(lastParticle+1)%maxParticles;
			if (!particles[lastParticle].isRunning) break;
		}
		var particle=particles[lastParticle];
		if (!particle.isRunning) liveParticles++;
		particle.isRunning=true;
		particle.x1=particle.x=x;
		particle.y1=particle.y=y;
		particle.dx=speed * QMATH.cos_(angle);
		particle.dy=speed * QMATH.sin_(angle);
		particle.gravityx=gravityx;
		particle.gravityy=gravityy;
		particle.color=color;
		particle.alpha=particle.alpha==undefined?1:particle.alpha;
	}
	
	this.frame=function() {
		if (liveParticles)
			particles.forEach(particle=>{
				if (particle.isRunning) {
					particle.dx+=particle.gravityx;
					particle.dy+=particle.gravityy;
					particle.x1=particle.x+particle.dx;
					particle.y1=particle.y+particle.dy;
					if (
						(particle.x<x)||(particle.x>x1)||
						(particle.y<y)||(particle.y>y1)
					) {
						particle.isRunning=false;
						liveParticles--;
					}
				}
			});
	}

	this.render=function(ctx) {
		if (liveParticles)
			particles.forEach(particle=>{
				if (particle.isRunning) {
					CANVAS.blitLine(
						ctx,
						particle.x,particle.y,
						particle.x1,particle.y1,
						particle.color,
						particle.alpha
					);
					particle.x=particle.x1;
					particle.y=particle.y1;
				}
			});
	}

}