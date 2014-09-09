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
	self.socket = io('ws://192.168.0.226:6969');
	
	/**
	 * Holds the canvas
	 */
	self.canvas;
	
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
		window.clearInterval(self.drawInterval);
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
			self.points.shift();
		}, self.config.interval);		
	};
	
	/**
	 * Sets the grid & clears the canvas
	 */
	self.setGrid = function() {
		
		self.ctx.strokeStyle = '#eee';
		self.ctx.lineWidth = 1;

		// Vertical lines along the x-axis
		for(var x = 10; x <= self.canvas.width; x = x+10) {
			self.ctx.beginPath();
			self.ctx.moveTo(x, 0);
			self.ctx.lineTo(x, self.canvas.height);
			self.ctx.stroke();			
		}

		// Horizontal lines along the y-axis
		for(var y = 10; y <= self.canvas.height; y = y+10) {
			self.ctx.beginPath();
			self.ctx.moveTo(0, y);
			self.ctx.lineTo(self.canvas.width, y);
			self.ctx.stroke();			
		}

	};
	
	/**
	 * Get the coordinates of the click, within the canvas
	 * 
	 * @param {object} event Mouse event
	 */
	self.updateCoordinates = function(event) {
		var mouseX = event.pageX;
		var mouseY = event.pageY;
		self.coordinates = {
			x: (mouseX - 8) - 1,
			y: (mouseY - 8) - 1
		};
	};	
	
	/**
	 * Pushes the mouse position to the server
	 */
	self.push = function() {
		self.socket.emit('mouse', self.coordinates);
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
			var dotSizeNew = (self.config.dotSize - (i * (self.config.dotSize/self.config.points)));
			if(dotSizeNew <= 0) {
				dotSizeNew = 1;
			}
			
			// Calculate color
			hue += (i/50 * (hue/self.config.points));
			var color = 'hsl(' + hue + ', ' + 255 + '%, 40%)';
			
			// Draw the point
			self.drawPoint(point.x, point.y, dotSizeNew, color);

			// Show coordinates
			if(i === (self.points.length -1)) {
				self.drawCoordinates(point.x,point.y);
			}
			
		}
		
	};
	
	/**
	 * Prepare Canvas
	 */
	self.prepareCanvas = function() {
		
		// Fetch the canvas and its context
		self.canvas = document.getElementById('native');
		self.ctx = self.canvas.getContext('2d');
		
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
		
		// Prepare the canvas
		self.prepareCanvas();
		
		// Listen to changes in the socket and draw the new position
		self.socket.on('mouse', function(msg){
			self.addPoint(msg);
		});	

		// Start pushing coordinates to the server while the mouse is being clicked
		document.addEventListener('mousedown', function(event) {
			self.start();
		});
		
		// Stop pushing when the mouse is no longer being clicked
		document.addEventListener('mouseup', function(event) {
			self.stop();
		});
		
		// Redraw canvas every 10 seconds
		setInterval(function() {
			self.redrawCanvas();
		}, self.config.interval);		
		
		// Update coordiantes while the mouse is moving
		document.addEventListener('mousemove', function(event) {
			if(event.which === 1) {
				self.updateCoordinates(event);
			}
			else {
				self.coordinates = {};
			}
		});
		
	};
	self.init();
	
};