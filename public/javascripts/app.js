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
 * Fire when the document is ready to rock 'n roll
 */
$('document').ready(function() {
	var thumbKiss = new ThumbKiss({
		interval : 1,	
		points : 50,
		hue: 300,
		dotSize: 4
	});
});