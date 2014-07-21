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
	
	update : function() {
		this.stats.update();
		
		//Clear the canvas
		this.context.clearRect(0,0,this.width, this.height);
		
	}
	
};

var scene;

$(function() {
	scene = new Scene();
});