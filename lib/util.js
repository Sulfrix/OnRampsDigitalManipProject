// Some simple helper functions

/**
 * @typedef {Object} SimpleRect
 * @property {number} w Width of the rectangle
 * @property {number} h Height of the rectangle
 */

/**
 * @typedef {Object} SimpleRectWithOffset
 * @property {number} w Width of the rectangle
 * @property {number} h Height of the rectangle
 * @property {number} offsetX X offset from the parent rectangle
 * @property {number} offsetY y offset from the parent rectangle
 */

/**
 * @typedef {{x: number, y: number} | import("types/p5").Vector} VectorLike
 */

/**
 * Sometimes JSDoc behaves better if a type is an import.
 * @typedef {import("types/p5").Vector} p5Vector
 */

/**
 * A line between two points.
 * @typedef {Object} Line
 * @property {VectorLike} a
 * @property {VectorLike} b
 */

/**
 * Fits a rectangle to another rectangle, retaining aspect ratio.
 * @param {number} w1 Width of the parent rectangle.
 * @param {number} h1 Height of the parent rectangle.
 * @param {number} w2 Width of the internal rectangle.
 * @param {number} h2 Height of the internal rectangle.
 * @returns {SimpleRect}
 */
function rectFit(w1, h1, w2, h2) {
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

/**
 * Extension of `rectFit()` which also returns the offsets needed to center the part
 * @param {number} w1 Width of the parent rectangle.
 * @param {number} h1 Height of the parent rectangle.
 * @param {number} w2 Width of the internal rectangle.
 * @param {number} h2 Height of the internal rectangle.
 * @returns {SimpleRectWithOffset}
 */
function rectFitEx(w1, h1, w2, h2) {
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

/**
 * Test for an intersection between two lines.
 * * Modified from https://stackoverflow.com/a/24392281
 * @param {Line} lineA 
 * @param {Line} lineB 
 * @returns {boolean} True if the lines intersect.
 */
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
