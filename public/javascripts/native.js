/**
 * Extension of CanvasRenderingContext2D in order to allow clearing the canvas
 */
CanvasRenderingContext2D.prototype.clear = 
  CanvasRenderingContext2D.prototype.clear || function (preserveTransform) {
    if (preserveTransform) {
      this.save();
      this.setTransform(1, 0, 0, 1, 0, 0);
    }

    this.clearRect(0, 0, this.canvas.width, this.canvas.height);

    if (preserveTransform) {
      this.restore();
    }
};

/**
 * Native
 */
var Native = function() {
	
	/**
	 * Reference to self
	 */
	var self = this;
	
	/**
	 * Config
	 */
	self.config = {
		interval : 1,	
		points : 40
	};
	
	/**
	 * Holds the socket connection
	 */
//	self.socket = io('ws://localhost:6969');
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
	self.coordinates = {x: 0, y:0};
	
	/**
	 * Interval timer
	 */
	self.timer;	
	
	/*-- FUNCTIONS --*/
	
	/**
	 * Sets the grid & clears the canvas
	 */
	self.setGrid = function() {
		self.ctx.clear();
		self.ctx.strokeStyle = '#eee';
		self.ctx.lineWidth = 1;

		// X
		for(var x = 10; x <= self.canvas.width; x = x+10) {
			self.ctx.beginPath();
			self.ctx.moveTo(x, 0);
			self.ctx.lineTo(x, 200);
			self.ctx.stroke();			
		}

		// Y
		for(var y = 10; y <= self.canvas.width; y = y+10) {
			self.ctx.beginPath();
			self.ctx.moveTo(0, y);
			self.ctx.lineTo(400, y);
			self.ctx.stroke();			
		}

	};
	
	/**
	 * Get the coordinates of the click, within the canvas
	 */
	self.updateCoordinates = function(event) {

		// Get mouse coordinates
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
	 * Add a point the the points array
	 */
	self.addPoint = function(point) {
		if(self.points.length > self.config.points) {
			self.points.shift();
		}
		self.points.push(point);
	};
	
	/**
	 * Add a point to the canvas with the given coordinates
	 */
	self.redraw = function() {
		self.setGrid();
		self.drawPoints();
	};	
	
	/**
	 * Add the points to the canvas
	 */	
	self.drawPoints = function() {
		var dotSize = 4;
		var hue = 300;
		for(var i = 0; i< self.points.length; i++) {
			
			hue += (i/50 * (hue/self.config.points));
			
			var point = self.points[i];
			self.ctx.beginPath();
			var dotSizeNew = (dotSize - (i * (dotSize/self.config.points)));
			self.ctx.arc(point.x, point.y, dotSizeNew, 0, 2 * Math.PI, true);
			self.ctx.fillStyle = 'hsl(' + hue + ', ' + 255 + '%, 40%)';
			self.ctx.fill();
			
			// Show coordinates
//			if(i == (self.points.length -1)) {
//				self.ctx.font = "10px Arial";
//				self.ctx.fillText('(' + point.x + ',' + point.y + ')',point.x-20,point.y-10);
//			}
			
		}
	};
	
	/**
	 * Acts as a constructor
	 */
	self.init = function() {
		
		// Fetch the canvas and its context
		self.canvas = document.getElementById('native');
		self.ctx = self.canvas.getContext('2d');
		
		// Render everything slightly better
		self.ctx.translate(0.5,0.5);	

		// Listen to changes in the socket and draw the new position
		self.socket.on('mouse', function(msg){
			self.addPoint(msg);
			self.redraw();
		});	

		// Start pushing coordinates to the server while the mouse is being clicked
		document.addEventListener('mousedown', function(event) {
			timer = setInterval(function() {
				self.push();
			}, self.config.interval);
		});
		
		// Stop pushing when the mouse is no longer being clicked
		document.addEventListener('mouseup', function(event) {
			window.clearInterval(timer);
		});
		
		// Redraw canvas every 10 seconds
		setInterval(function() {
		}, self.config.interval);		
		
		// Update coordiantes while the mouse is moving
		document.addEventListener('mousemove', function(event) {
			if(event.which == 1) {
				self.updateCoordinates(event);
			}
		});
		
		// Set the grid in the beginning
		self.setGrid();

	}
	self.init();
}

$('document').ready(function() {
	var app = new Native();
});