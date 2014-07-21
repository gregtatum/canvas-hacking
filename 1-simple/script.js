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

	
	/*
	 * Save the colors for the various objects once, the canvas context takes a string. An optimization
	 * here is to create that string outside of the loop. The hslToFillStyle() method is a utility
	 * function that generates the string efficiently from numeric values.
	 */

	this.squareFillStyle	= this.hslToFillStyle(150, 100, 50, 0.5); //(hue, saturation, lightness, alpha) alpha is optional
	this.circleFillStyle	= this.hslToFillStyle(250, 100, 50, 0.5);
	this.linesFillStyle		= this.hslToFillStyle(350, 100, 50, 0.5);
	this.movingFillStyle	= this.hslToFillStyle(050, 100, 50, 0.5);

	this.squareStrokeStyle	= this.hslToFillStyle(150, 100, 50, 1);
	this.circleStrokeStyle	= this.hslToFillStyle(250, 100, 50, 1);
	this.linesStrokeStyle	= this.hslToFillStyle(350, 100, 50, 1);
	this.movingFillStyle	= this.hslToFillStyle(050, 100, 50, 1);
	
	//RGB is also available:
	this.exampleRgbFill = this.rgbToFillStyle(150, 150, 180, 0.7);
	

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
	
	drawSquare : function() {

		var x, y;
		
		this.context.fillStyle = this.squareFillStyle;
		this.context.strokeStyle = this.squareStrokeStyle;
		this.context.lineWidth = 3 * this.ratio;

		x = this.width / 2 - 50;
		y = this.height / 2 - 50;

		this.context.fillRect(
			x,		//x coordinate
			y,		//y coordinate
			100,	//width
			100		//height
		);

		this.context.strokeRect(
			x,		//x coordinate
			y,		//y coordinate
			100,	//width
			100		//height
		);
	},

	drawCircle : function() {

		this.context.beginPath();
		this.context.fillStyle = this.circleFillStyle;
		this.context.strokeStyle = this.circleStrokeStyle;
		this.context.lineWidth = 3 * this.ratio;

		this.context.arc(
			this.width / 4,			// x coordinate
			this.height / 2,		// y coordinate
			50,						// radius
			0,						// arc start angle (radians)
			2 * Math.PI				// arc end angle (radians)
		);

		this.context.fill();
		this.context.stroke();

	},

	drawTriangle : function() {

		//This vector object was borrowed from three.js
		var originX, originY;

		originX = this.width * 3/4;
		originY = this.height / 2;
		
		this.context.beginPath();
		this.context.fillStyle = this.linesFillStyle;
		this.context.strokeStyle = this.linesStrokeStyle;
		this.context.lineWidth = 3 * this.ratio;

		this.context.beginPath();
		this.context.moveTo( originX - 50, originY - 50);
		this.context.lineTo( originX - 50, originY + 50);
		this.context.lineTo( originX + 50, originY + 50);

		//Close the path to complete the triangle
		//this.context.closePath();

		this.context.fill();
		this.context.stroke();

	},

	drawMovingLine : function() {

		var xOffset = 200 * Math.sin( new Date().getTime() / 400 );

		this.context.fillStyle = this.movingFillStyle;
		this.context.strokeStyle = this.movingStrokeStyle;
		this.context.lineWidth = 3 * this.ratio;

		this.context.beginPath();
		
		this.context.arc(
			this.width / 2 + xOffset,	// x coordinate
			this.height *  3/ 4,		// y coordinate
			75,							// radius
			Math.PI,					// arc start angle (radians)
			0							// arc end angle (radians)
		);

		this.context.fill();
		this.context.stroke();

	},

	drawText : function() {

		//The color is inherited from previous context calls. Try changing the order of drawText() in update()
		
		//this.context.font = "100 1em 'Roboto'";
		this.context.font = "100 "+ (this.width / 20) +"px 'Roboto'"; //Make the font size tied to the width of the screen

		this.context.fillText(
			"The wonderful world of <canvas>",	// text
			this.width / 7,					// x
			this.height / 4						// y
		);
		this.context.fill();

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
		
		//Do the drawing here
		this.drawSquare();
		this.drawCircle();
		this.drawTriangle();
		this.drawMovingLine();
		this.drawText();
	}
	
};

var scene;

$(function() {
	scene = new Scene();
});