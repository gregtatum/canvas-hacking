var Scene = function() {

	//This is the constructor which will load up the scene, an instance is created at the bottom of the page.
	
	this.createRequestAnimationFramePolyfill();
	this.ratio = window.devicePixelRatio >= 1 ? window.devicePixelRatio : 1; //Is this a retina display?
	
	this.$canvas = $('canvas');								//Get a reference to the jQuery object
	this.canvas = this.$canvas.get(0);						//Get a reference to the DOM element
	this.context = this.canvas.getContext( '2d' );			//Get a reference to the 2d context, so you can make all of the drawing calls
	this.currTime = this.prevTime = new Date().getTime();	//Timing variables

	this.addEventListeners();	//Add any event listeners here
	this.resizeCanvas();		//Size the canvas to be full width
	this.addStats();			//Show framerates
	this.mouse = new Mouse( this );

	this.dots = [];

	for(var i=0; i < 1000; i++) {
		this.dots.push(
			new Dot(
				this,
				this.mouse,
				this.width * Math.random(), // x
				this.height * Math.random() // y
			)
		);
	}
	
	
	//--------------------------------------------------------------
	// Start the loop!

	this.loop();

	
	
};
		
Scene.prototype = {

	createRequestAnimationFramePolyfill : function() {

		//Request animation frame syncs your javascript calls with the browser's rendering loop.
		//This is a polyfill for older browsers that still have the function prefixed.

		window.requestAnimFrame = (
			window.requestAnimationFrame		||
			window.webkitRequestAnimationFrame	||
			window.mozRequestAnimationFrame		||
			function( callback ){
				window.setTimeout(callback, 1000 / 60);
			}
		);

	},
	
	addStats : function() {

		//Third party framerate display

		this.stats = new Stats();
		this.stats.domElement.style.position = 'absolute';
		this.stats.domElement.style.top = '0px';
		$("#container").append( this.stats.domElement );
	},
	
	addEventListeners : function() {
		$(window).on('resize', this.resizeCanvas.bind(this));
	},
	
	resizeCanvas : function(e) {
		this.canvas.width = $(window).width() * this.ratio;
		this.canvas.height = $(window).height() * this.ratio;
		this.width = this.canvas.width;
		this.height = this.canvas.height;
		this.left = this.$canvas.offset().left;
		this.top = this.$canvas.offset().top;
	},
			
	loop : function() {
		
		//this is the change in time in milliseconds
		var dt;

		this.currTime = new Date().getTime();

		dt = this.currTime - this.prevTime;

		//Update then request a new animation frame
		this.update( dt );
		requestAnimFrame( this.loop.bind(this) );
		
		this.prevTime = this.currTime;

	},
	
	rgbToFillStyle : function(r, g, b, a) {
		if(a === undefined) {
			return ["rgb(",r,",",g,",",b,")"].join('');
		} else {
			return ["rgba(",r,",",g,",",b,",",a,")"].join('');
		}
	},
	
	hslToFillStyle : function(h, s, l, a) {
		if(a === undefined) {
			return ["hsl(",h,",",s,"%,",l,"%)"].join('');
		} else {
			return ["hsla(",h,",",s,"%,",l,"%,",a,")"].join('');
		}
	},
	
	update : function( dt ) {
		this.stats.update();
		
		//Clear the canvas
		this.context.clearRect(0,0,this.width, this.height);
		
		for(var i=0; i < this.dots.length; i++) {
			this.dots[i].update( dt );
		}
	}
	
};

var Dot = function(scene, mouse, x, y) {
	
	var speed = .05;
	
	//Dependencies
	this.scene = scene;
	this.mouse = mouse;

	this.position = new THREE.Vector2(x,y);
	this.direction = new THREE.Vector2(
		speed * Math.random() - speed / 2,
		speed * Math.random() - speed / 2
	);
	
	this.size = 10 * Math.random() + 1;
	
	this.fleeSpeed = 1000 * Math.random() + 500;
	this.fleeDistance = (150 * Math.random()) + 180 * this.scene.ratio;
	
	this.mouseVector = new THREE.Vector2();
	this.mouseLength;

};
	
Dot.prototype = {

	update : function( dt ) {
		this.updatePosition( dt );
		this.fleeMouse( dt );
		this.keepOnScreen( dt );
		this.draw( dt );
	},
	
	draw : function(dt) {	
		this.scene.context.beginPath();
		this.scene.context.arc(this.position.x, this.position.y, this.size, 0, 2*Math.PI);
		this.scene.context.fill();
	},
	
	updatePosition : function() {

		//This is a little trick to create a variable outside of the render loop
		//It's expensive to allocate memory inside of the loop.

		var moveDistance = new THREE.Vector2();

		return function( dt ) {

			moveDistance.copy( this.direction );
			moveDistance.multiplyScalar( dt );

			this.position.add( moveDistance );
		}

	}(), //Note that this function is immediately executed and returns a different function
	
	fleeMouse : function(dt) {

		this.mouseVector.copy( this.position );
		this.mouseVector.sub( this.mouse.position );
		this.mouseDistance = this.mouseVector.length();

		this.moveLength = (Math.max(0, this.fleeDistance - this.mouseDistance) / this.fleeSpeed) * dt;
		
		if( this.moveLength > 0 ) {
			
			//Normalize
			this.mouseVector.divideScalar(this.mouseDistance);

			//Lengthen
			this.mouseVector.multiplyScalar(this.moveLength);
			
			this.position.add(
				this.mouseVector
			);

		}
	},
	
	keepOnScreen : function(dt) {
		if(this.position.x < this.size * -1) {this.position.x = this.scene.width  + this.size;}
		if(this.position.y < this.size * -1) {this.position.y = this.scene.height + this.size;}
		if(this.position.x > this.scene.width + this.size) {this.position.x = 0 - this.size;}
		if(this.position.y > this.scene.height + this.size) {this.position.y = 0 - this.size;}
	}

};

var Mouse = function( scene ) {

	this.scene = scene;
	this.position = new THREE.Vector2(-10000, -10000);

	$(window).mousemove( this.onMouseMove.bind(this) );

};

	
Mouse.prototype = {
	
	onMouseMove : function(e) {
		
		if(typeof(e.pageX) == "number") {
			this.position.x = e.pageX * this.scene.ratio;
			this.position.y = e.pageY * this.scene.ratio;
		} else {
			this.position.x = -100000;
			this.position.y = -100000;
		}

	},

	copyPosition : function( vector ) {
		vector.copy( this.position );
	},

	getPosition : function() {
		return this.position.clone();
	}

};

var scene;

$(function() {
	scene = new Scene();
});