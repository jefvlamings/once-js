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

(function() {
 
	$('document').ready(function() {

		var canvas = document.getElementById('native');
		var ctx = canvas.getContext('2d');
		ctx.translate(0.5,0.5);	
			
		var coordinates = {x: 0, y:0};
		var timer;	
			
		var setGrid = function() {
			ctx.clear();
			ctx.strokeStyle = '#eee';
			ctx.lineWidth = 1;
			
			// X
			for(var x = 10; x <= canvas.width; x = x+10) {
				ctx.beginPath();
				ctx.moveTo(x, 0);
				ctx.lineTo(x, 200);
				ctx.stroke();			
			}

			// Y
			for(var y = 10; y <= canvas.width; y = y+10) {
				ctx.beginPath();
				ctx.moveTo(0, y);
				ctx.lineTo(400, y);
				ctx.stroke();			
			}
			
		};

		/**
		 * Get the coordinates of the click, within the canvas
		 */
		var updateCoordinates = function(event) {

			// Get mouse coordinates
			var mouseX = event.pageX;
			var mouseY = event.pageY;

			// Get canvas coordinates
	//		var canvasOffset = $('#native').offset();
	//		var canvasX = canvasOffset['left'];
	//		var canvasY = canvasOffset['top'];		

			coordinates = {
				x: (mouseX - 8) - 1,
				y: (mouseY - 8) - 1
			};

		};

		var sync = function(event) {
			var touch = new Touch();
			touch.set('x', coordinates.x);
			touch.set('y', coordinates.y);
			socket.emit('mouse', touch.toJSON());
		};

		/**
		 * Add a point to the canvas with the given coordinates
		 */
		var addPointToCanvas = function(x,y) {
			setGrid();
			ctx.beginPath();
			ctx.arc(x, y, 3, 0, 2 * Math.PI, true);
			ctx.strokeStyle = '#333';
			ctx.stroke();
			ctx.font = "10px Arial";
			ctx.fillText('(' + x + ',' + y + ')',x-20,y-10);
		};
		
		socket.on('mouse', function(msg){
			addPointToCanvas(msg.x, msg.y);
		});	

		document.addEventListener('mousedown', function(event) {
			updateCoordinates(event);
			sync();
			timer = setInterval(function() {
				sync();
			}, 100)
		});
		
		document.addEventListener('mouseup', function(event) {
			window.clearInterval(timer);
		});
		
		document.addEventListener('mousemove', function(event) {
			if(event.which == 1) {
				updateCoordinates(event);
			}
		});
		
		setGrid();
		
	});

})();