var Scene = function() {

	//This is the constructor which will load up the scene, an instance is created at the bottom of the page.
	
	Utils.createRequestAnimationFramePolyfill();
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
	
	this.dots = [];
	this.createDots();
	
	this.loop();
	
	
};
		
Scene.prototype = {
	
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
	
	createDots : function() {
		
		for( var i=0; i < 500; i++ ) {

			var color = Utils.hslToFillStyle(
				170 + Math.random() * 50,
				100,
				50,
				0.5
			);
			var dot = new Dot(
				Math.random() * window.innerWidth,
				Math.random() * window.innerHeight,
				Math.random() * 30 + 30,
				color,
				this.context
			);
			
			dot.spinSpeed = 0.003 * Math.random();
			
			this.dots.push( dot )
			
		}
		
		
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
	
	update : function( dt ) {
		
		this.stats.update();
		
		//Clear the canvas
		this.context.fillStyle = "rgba(255,255,255,0.08)";
		this.context.fillRect(0,0,this.width, this.height);
		
		//Start your update code here
		
		for( var i=0; i < this.dots.length; i++ ) {
			
			this.dots[i].draw(this.currTime, dt);
		}
		
	}
	
};

var Dot = function( x, y, size, color, context ) {
	this.x = x;
	this.y = y;
	this.size = size;
	this.color = color;
	this.context = context;
	this.radius = 100;
	this.spinSpeed = 0.003;
};

Dot.prototype = {
	
	draw : function( time, dt ) {
		
		var ctx = this.context;
		
		ctx.fillStyle = this.color;
		
		ctx.fillRect(
			Math.cos( time * this.spinSpeed ) * this.radius + this.x,
			Math.sin( time * this.spinSpeed ) * this.radius + this.y,
			this.size,
			this.size
		);
		
	},
}

var scene;

$(function() {
	scene = new Scene();
});