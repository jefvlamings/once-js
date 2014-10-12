/**
 * ThumbKiss
 */
var ThumbKiss = function(config) {
	
	/**
	 * Reference to self
	 */
	var self = this;
	
	/**
	 * Configuration values
	 */
	self.config = config;
	
	/**
	 * Default configuration values
	 */
	self.defaultConfig = {
		interval : 0,	
		points : 40,
		hue: 300,
		dotSize: 4
	};	
	
	/**
	 * Holds the socket connection
	 */
	self.socket = io.connect('192.168.0.226:6969');
	
	/**
	 * Holds the canvas
	 */
	self.$canvas = $('canvas');
	
	/**
	 * Holds the canvas context (2D)
	 */
	self.ctx;
	
	/**
	 * Holds all the point that need to be drawn
	 */
	self.points = [];
	
	/**
	 * Coordinates
	 */
	self.coordinates = {};
	
	/**
	 * Push Interval
	 */
	self.pushInterval;	
	
	/**
	 * Draw Interval
	 */
	self.drawInterval;	
	
	/*-- FUNCTIONS --*/
	
	/**
	 * Start
	 */
	self.start = function() {
		self.push();
		self.pushInterval = setInterval(function() {
			self.push();
		}, self.config.interval);		
	};
	
	/**
	 * Stop
	 */
	self.stop = function() {
		window.clearInterval(self.pushInterval);
		self.drawInterval = setInterval(function() {
			if(self.points.length === 0) {
				window.clearInterval(self.drawInterval);
			}
			else {
				self.points.shift();
			}
		}, self.config.interval);	
	};
	
	/**
	 * Sets the grid & clears the canvas
	 */
	self.setGrid = function() {
		
		self.ctx.strokeStyle = '#eee';
		self.ctx.lineWidth = 1;

		// Vertical lines along the x-axis
		for(var x = 10; x <= self.$canvas[0].width; x = x+10) {
			self.ctx.beginPath();
			self.ctx.moveTo(x, 0);
			self.ctx.lineTo(x, self.$canvas[0].height);
			self.ctx.stroke();			
		}

		// Horizontal lines along the y-axis
		for(var y = 10; y <= self.$canvas[0].height; y = y+10) {
			self.ctx.beginPath();
			self.ctx.moveTo(0, y);
			self.ctx.lineTo(self.$canvas[0].width, y);
			self.ctx.stroke();			
		}

	};
	
	/**
	 * Get the coordinates of the click, within the canvas
	 * 
	 * @param {object} event Mouse event
	 */
	self.updateCoordinates = function(event) {
		self.coordinates = {
			x: parseFloat((event.pageX / $(window).width()).toFixed(6)),
			y: parseFloat((event.pageY / $(window).height()).toFixed(6))
		};
	};	
	
	/**
	 * Get the coordinates of the click, within the canvas
	 * 
	 * @param {object} event Mouse event
	 */
	self.updateCoordinatesWithTouch = function(event) {
		self.coordinates = {
			x: parseFloat((event.originalEvent.touches[0].pageX / $(window).width()).toFixed(6)),
			y: parseFloat((event.originalEvent.touches[0].pageY / $(window).height()).toFixed(6))
		};
	};	
	
	/**
	 * Pushes the mouse position to the server
	 */
	self.push = function() {
		self.socket.emit('mouse1', self.coordinates);
	};	
	
	/**
	 * Adds a point the the points array. We make sure no more than the maximum
	 * number of points are kept in the array
	 * 
	 * @param {object} point Object containing coordinates of point
	 */
	self.addPoint = function(point) {
		self.points.push(point);
		if(self.points.length >= self.config.points) {
			self.points.shift();
		}		
	};
	
	/**
	 * Add a point to the canvas with the given coordinates
	 */
	self.redrawCanvas = function() {
		
		// Clear the canvas
		self.ctx.clear();
		
		// Add the grid
		self.setGrid();
		
		// Draw points
		self.drawPoints();
		
	};	
	
	/**
	 * Draw Coordinates
	 * 
	 * @param {integer} x Coordinate on the x-axis
	 * @param {integer} y Coordinate on the y-axis
	 */
	self.drawCoordinates = function(x,y) {
		self.ctx.font = "10px Arial";
		self.ctx.fillText('(' + x + ',' + y + ')',x-20,y-10);
	};
	
	/**
	 * Draw Points
	 * 
	 * @param {integer} x Coordinate on the x-axis
	 * @param {integer} y Coordinate on the y-axis
	 * @param {float} size Size of the dot (diameter)
	 * @param {string} color Color of the dot
	 */
	self.drawPoint = function(x, y, size, color) {
		self.ctx.beginPath();
		self.ctx.arc(x, y, size, 0, 2 * Math.PI, true);
		self.ctx.fillStyle = color;
		self.ctx.fill();		
	};
	
	/**
	 * Add the points to the canvas
	 */	
	self.drawPoints = function() {
		var hue = self.config.hue;
		for(var i = 0; i< self.points.length; i++) {
			
			// Get the current point
			var point = self.points[i];

			// Calculate dot size
//			var dotSizeNew = (self.config.dotSize - (i * (self.config.dotSize/self.config.points)));
//			if(dotSizeNew <= 0) {
//				dotSizeNew = 1;
//			}
			
			// Calculate color
			hue += (i/50 * (hue/self.config.points));
			var color = 'hsl(' + hue + ', ' + 255 + '%, 40%)';
			
			// Draw the point
			self.drawPoint(point.x * $(window).width(), point.y  * $(window).height(), self.config.dotSize, color);

			// Show coordinates
			if(i === (self.points.length -1)) {
				self.drawCoordinates(point.x * $(window).width(),point.y * $(window).height());
			}
			
		}
		
	};
	
	/**
	 * Prepare Canvas
	 */
	self.prepareCanvas = function() {
		
		// Scale to 100% width and height
		self.$canvas[0].width = $(window).width();
		self.$canvas[0].height = $(window).height();
		
		// Fetch the canvas and its context
		self.ctx = self.$canvas[0].getContext('2d');
		
		// Render everything slightly better
		self.ctx.translate(0.5,0.5);			
		
		// Set the grid in the beginning
		self.setGrid();		
		
	};
	
	/**
	 * Acts as a constructor
	 */
	self.init = function() {
		
		// Extend the given config with the default config
		self.config = $.extend({},self.defaultConfig, config);
		
		// Resize canvas if window resizes
		$('window').on('resize', function() {
			self.prepareCanvas();
		});
		self.prepareCanvas();
		
		// Listen to changes in the socket and draw the new position
		self.socket.on('mouse2', function(msg){
			self.addPoint(msg);
		});	
		
		// Listen to changes in the socket and draw the new position
		self.socket.on('mouse1', function(msg){
			self.addPoint(msg);
		});	

		// Start pushing coordinates to the server while the mouse is being clicked
		self.$canvas.on('mousedown touchstart', function(event) {
			event.preventDefault();
			self.start();
		});
		
		// Stop pushing when the mouse is no longer being clicked
		self.$canvas.on('mouseup touchend', function(event) {
			event.preventDefault();
			self.stop();
		});
		
		// Redraw canvas every x milliseconds
		setInterval(function() {
			self.redrawCanvas();
		}, self.config.interval);		
		
		// Update coordiantes while the mouse is moving
		self.$canvas.on('mousemove touchmove', function(event) {			
			event.preventDefault();
			if(event.type === 'touchmove') {
				self.updateCoordinatesWithTouch(event);
			}
			else if(event.which === 1) {
				self.updateCoordinates(event);
			}
			else {
				self.coordinates = {};
			}
		});
		
	};
	self.init();
	
};