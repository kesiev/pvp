function QMath(master) {

	var
		resolution=360,
		PI2 = Math.PI * 2;

	function prepareCache(size, factor, fn) {
		var
			array=new Float32Array(size),
			length = array.length;
		for (var i = 0; i < length; i++)
			array[i] = fn(i / factor);
		return array;
	};

	this.PI=Math.PI;
	this.floor=Math.floor;
	this.abs=Math.abs;
	this.ceil=Math.ceil;
	this.atan2=Math.atan2;
	this.sqrt=Math.sqrt;
	this.random=Math.random;
	this.min=Math.min;
	this.round=n=>(n + 0.5) << 0;

	switch (master.math) {
		case "approx":{
			this.sin=function(x){
				if (x < -3.14159265) x += 6.28318531;
				else if (x >  3.14159265) x -= 6.28318531;
				if (x < 0) return 1.27323954 * x + .405284735 * x * x;
				else return 1.27323954 * x - 0.405284735 * x * x;
			}
			this.cos=function(x){
				x += 1.57079632;
				if (x >  3.14159265) x -= 6.28318531;
				if (x < 0) return 1.27323954 * x + 0.405284735 * x * x
				else return 1.27323954 * x - 0.405284735 * x * x;
			}
			break;
		}
		case "table":{
			var
				factor=resolution / PI2,
				sinTable=prepareCache( resolution, factor, Math.sin),
				cosTable=prepareCache( resolution, factor, Math.cos);

			this.sin=function(angle) {
				angle %= PI2;
				if (angle < 0) angle += PI2;
				return sinTable[(angle * factor) | 0];
			};

			this.cos=function(angle) {
				angle %= PI2;
				if (angle < 0) angle += PI2;
				return cosTable[(angle * factor) | 0];
			};

			break;
		}
		default:{
			this.sin=Math.sin;
			this.cos=Math.cos;
			break;
		}
	}

	// Basic/Quality version for better accuracy
	this.sin_=Math.sin;
	this.cos_=Math.cos;

	return this;

}