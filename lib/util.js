// Some simple helper functions

function rectFit(w1, h1, w2, h2) {
	// Fits a rectangle to another rectangle, retaining aspect ratio.
	let ratio1 = w1 / h1;
	let ratio2 = w2 / h2;
	if (ratio1 < ratio2) {
		let ratio = w1 / w2;
		let height = h2 * ratio;
		return { w: w1, h: height };
	} else {
		let ratio = h1 / h2;
		let width = w2 * ratio;
		return { w: width, h: h1 };
	}
}

function rectFitEx(w1, h1, w2, h2) {
	// Extended function which also returns the offsets needed to center the part
	let out = rectFit(w1, h1, w2, h2);
	let baseCenterX = w1 / 2;
	let baseCenterY = h1 / 2;
	let sizeCenterX = out.w / 2;
	let sizeCenterY = out.h / 2;
	let diffX = baseCenterX - sizeCenterX;
	let diffY = baseCenterY - sizeCenterY;
	out.offsetX = diffX;
	out.offsetY = diffY;
	return out;
}

// modified from https://stackoverflow.com/a/24392281
// returns true if the line from (a,b)->(c,d) intersects with (p,q)->(r,s)
function linesIntersect(lineA, lineB) {
	var a = lineA.a.x;
	var b = lineA.a.y;
	var c = lineA.b.x;
	var d = lineA.b.y;
	var p = lineB.a.x;
	var q = lineB.a.y;
	var r = lineB.b.x;
	var s = lineB.b.y;
	var det, gamma, lambda;
	det = (c - a) * (s - q) - (r - p) * (d - b);
	if (det === 0) {
		return false;
	} else {
		lambda = ((s - q) * (r - a) + (p - r) * (s - b)) / det;
		gamma = ((b - d) * (r - a) + (c - a) * (s - b)) / det;
		return 0 < lambda && lambda < 1 && 0 < gamma && gamma < 1;
	}
}
