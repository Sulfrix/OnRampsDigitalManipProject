// A rectangle. Can be rotated and can detect intersections between other boxes and points.s
// Can be used in workspace coordinates or screenspace coordinates

/**
 * @typedef {Object} SerializedBoundingBox
 * @property {number} x
 * @property {number} y
 * @property {number} width
 * @property {number} height
 * @property {number} rot
 */

class BoundingBox {
	/**
	 *
	 * @param {p5.Vector} pos
	 * @param {Number} width
	 * @param {Number} height
	 * @param {Number} rot
	 */
	constructor(pos, width, height, rot = 0) {
		this.pos = pos;
		this.width = width;
		this.height = height;
		this.rot = rot;
	}

	/**
	 * Creates an easily serializable object.
	 * @returns {SerializedBoundingBox}
	 */
	serialize() {
		let out = {x: this.pos.x, y: this.pos.y, width: this.width, height: this.height}
		if (this.rot != 0) {
			out.rot = this.rot
		}
		return out
	}

	/**
	 * Creates a BoundingBox from serialized data.
	 * @param {SerializedBoundingBox} data 
	 */
	static createFromData(data) {
		return new BoundingBox(createVector(data.x, data.y), data.width, data.height, data.rot)
	}

	/**
	 *
	 * @param {BoundingBox} box
	 * @param {Number} x
	 * @param {Number} y
	 */
	static pointIntersects(box, x = 0, y = 0) {
		// Is this point touching the box?
		let testX = x - box.pos.x;
		let testY = y - box.pos.y;
		if (box.rot != 0) {
			// Only calculate rotations if the bb is rotated
			// this turns out to be 99.9999% of the bounding boxes in the project, oh well :P
			let ang = atan2(testY, testX); // calculate angle
			let rad = dist(0, 0, testX, testY);
			ang -= box.rot; // counter rotate by box rotation
			testX = cos(ang) * rad;
			testY = sin(ang) * rad;
		}
		let halfWidth = box.width / 2;
		let halfHeight = box.height / 2;
		if (abs(testX) < halfWidth && abs(testY) < halfHeight) {
			// test bounds
			return true;
		} else {
			return false;
		}
	}

	static vectorIntersects(box, vector) {
		return BoundingBox.pointIntersects(box, vector.x, vector.y);
	}

	/**
	 * Determines if two bounding boxes intersect.
	 * @param {BoundingBox} a
	 * @param {BoundingBox} b
	 */
	static boxesIntersect(a, b) {
		// Thanks to: https://math.stackexchange.com/a/1278682

		// If both boxes have no rotation, do a much faster AABB calculation.
		if (a.rot == 0 && b.rot == 0) {
			return BoundingBox.AABBIntersect(a, b);
		}

		var acorners = a.corners();
		var bcorners = b.corners();

		// Check A's corners to see if any of them intersect B
		for (let corner of acorners) {
			if (BoundingBox.vectorIntersects(b, corner)) {
				return true;
			}
		}

		// ... and vice versa
		for (let corner of bcorners) {
			if (BoundingBox.vectorIntersects(a, corner)) {
				return true;
			}
		}

		var aedges = a.edges(acorners);
		var bedges = b.edges(bcorners);
		if (aedges.length != bedges.length) {
			// This scenario shouldn't be possible
			return false;
		}
		// If corner checks fail, check if any edge intersection occurs.
		for (let i = 0; i < aedges.length; i++) {
			for (let j = 0; j < bedges.length; j++) {
				if (linesIntersect(aedges[i], bedges[j])) {
					return true;
				}
			}
		}

		// All checks have failed, these boxes are not colliding.
		return false;
	}

	/**
	 * Determines if two bounding boxes intersect, treating them as if their rotations are zero.
	 * @param {BoundingBox} a
	 * @param {BoundingBox} b
	 */
	static AABBIntersect(a, b) {
		var amins = a.mins();
		var amaxs = a.maxs();
		var bmins = b.mins();
		var bmaxs = b.maxs();

		return (
			amaxs.x >= bmins.x &&
			bmaxs.x >= amins.x &&
			amaxs.y >= bmins.y &&
			bmaxs.y >= amins.y
		);
	}

	mins() {
		return createVector(this.width / -2, this.height / -2).add(this.pos);
	}

	maxs() {
		return createVector(this.width / 2, this.height / 2).add(this.pos);
	}

	/**
	 * Returns the corners of a bounding box, clockwise.
	 * @returns {Array<p5.Vector>}
	 */
	corners() {
		var out = [];
		// Basic positions for each corner
		out.push(createVector(this.width / -2, this.height / -2));
		out.push(createVector(this.width / 2, this.height / -2));
		out.push(createVector(this.width / 2, this.height / 2));
		out.push(createVector(this.width / -2, this.height / 2));

		// Rotate all the corners
		if (this.rot != 0) {
			for (let corner of out) {
				corner.rotate(this.rot);
			}
		}

		// Translate all the corners
		for (let corner of out) {
			corner.add(this.pos);
		}
		return out;
	}

	/**
	 *
	 * @param {Array<p5.Vector>} corners An already-populated list of corners, so they don't need to be recalculated
	 */
	edges(corners) {
		if (!corners) {
			corners = this.corners();
		}
		let out = [];
		let count = corners.length;
		for (let i = 0; i < count; i++) {
			let j = (i + 1) % count;
			out.push({ a: corners[i], b: corners[j] });
		}
		return out;
	}

	static fromCorner(pos, w, h, rot) {
		return new BoundingBox(
			createVector(pos.x + w / 2, pos.y + h / 2),
			w,
			h,
			rot
		); // The position of a bounding box is its center. This method quickly creates one using the corner as the position
	}

	setCornerPos(x, y) {
		// Sets position based on corner position
		if (x != null) {
			this.pos.x = x + this.width / 2;
		}
		if (y != null) {
			this.pos.y = y + this.height / 2;
		}
	}

	get cornerPos() {
		// returns corner position
		return createVector(pos.x - w / 2, pos.y - h / 2);
	}

	boxTranslate() {
		// Translates the view into coordinates relative to the bounding box
		translate(this.pos.x, this.pos.y);
		if (this.rot != 0) {
			rotate(this.rot);
		}
	}

	drawRect() {
		// Mostly unused (except for part selection in the part editor) draws a rectangle representing the bounding box. Good debugging tool.
		push();
		this.boxTranslate();
		rect(this.width / -2, this.height / -2, this.width, this.height);
		pop();
	}

	scale(x) {
		this.width *= x;
		this.height *= y;
	}

	/**
	 * Converts the local position to a global position
	 * @param {p5.Vector} vec
	 */
	localPos(vec) {
		vec = vec.copy();
		if (this.rot != 0) {
			vec.rotate(this.rot);
		}
		vec.add(this.pos);
		return vec;
	}

	/**
	 * Converts the local position to a global position
	 * @param {p5.Vector} vec
	 */
	localPosCorner(vec) {
		vec = vec.copy();
		vec.x -= this.width / 2;
		vec.y -= this.height / 2;
		if (this.rot != 0) {
			vec.rotate(this.rot);
		}
		vec.add(this.pos);
		return vec;
	}

	/**
	 *
	 * @param {Number} x
	 * @param {Number} y
	 */
	pointIntersects(x, y) {
		// Point intersection with bounding boxes is static, so for convenience it can be called here.
		return BoundingBox.pointIntersects(this, x, y);
	}
}
