/**
 * An editable SVG path object that is drawn by the mouse.
 * Requires: jQuery, StrokeGradient.js
 * 
 * Created by joanne on 17/12/15.
 */

function SvgPathObject(harmonicId, pathStr, strokeGradient) {
	"use strict";
	var that = (this === window) ? {} : this;

	var pathSvgObj;

	//--- properties of stroke
	var strokeOpacity = 1.0;
	var strokeWidth = 14;

	//--- initialising objects
	createSvgPathObject(strokeWidth);

	//----- private methods -----//

	function createSvgPathObject(strokeWidth) {
		pathSvgObj = gSvgCreator.createSvgPath(pathStr, "url(#" + strokeGradient.getGradientId() + ")", strokeWidth);
	}

	//----- privileged methods -----//

	/**
	 * Get the DOM of the gropued SVG object consisting of its path and guide box.
	 *
	 * @returns grouped SVG object containing the SVG path and SVG guide box
	 */
	this.getPathSvgObj = function() {
		return pathSvgObj;
	};

	this.drawPath = function(x, y) {
		pathStr += " " + x + "," + y;
		pathSvgObj.setAttribute('d', pathStr);
	};

	this.updatePath = function(newPath) {
		pathSvgObj.setAttribute('d', newPath);
		pathStr = newPath;
	};

	this.updateStrokeOpacity = function (newStrokeOpacity) {
		strokeOpacity = newStrokeOpacity;
		pathSvgObj.setAttribute('stroke-opacity', strokeOpacity);
	}

	this.isSelected = function() {
		return selected;
	};

	this.getPathStr = function() {
		return pathStr;
	};

	this.getStrokeOpacity = function() {
		return strokeOpacity;
	};

	return that;
}
