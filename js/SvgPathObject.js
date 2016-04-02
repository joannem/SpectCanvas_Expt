/**
 * An editable SVG path object that is drawn by the mouse.
 * Requires: jQuery, StrokeGradient.js
 * 
 * Created by joanne on 17/12/15.
 */

function SvgPathObject(harmonicId, pathStr) {
	"use strict";
	var that = (this === window) ? {} : this;

	var pathSvgObj;

	//--- properties of stroke
	var strokeOpacity = 1.0;
	var strokeWidth = 1;
	var isGradient = true;
	var strokeGradient = new StrokeGradient(harmonicId, strokeOpacity);

	//--- initialising objects
	createSvgPathObject(strokeWidth);

	//----- private methods -----//

	function createSvgPathObject(strokeWidth) {
		pathSvgObj = gSvgCreator.createSvgPath(pathStr, "url(#" + strokeGradient.getGradientId() + ")", strokeWidth);
	}

	function updateStrokeOpacity (newStrokeOpacity) {
		strokeOpacity = newStrokeOpacity;
		pathSvgObj.setAttribute('stroke-opacity', strokeOpacity);
		strokeGradient.setOpacity(strokeOpacity);
	}

	function updateStrokeFillType(newIsGradient) {
		isGradient = newIsGradient;
		if (isGradient) {
			pathSvgObj.setAttribute('stroke', "url(#" + strokeGradient.getGradientId() + ")");
		} else {
			pathSvgObj.setAttribute('stroke', "url(#svg-pattern)");
		}
	}

	function updateStrokeFillGradient(color, newOffset) {
		strokeGradient.setOffset(color, newOffset);
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

	// this.offsetPosition = function(newTransformMatrix) {
	// 	transformMatrix = newTransformMatrix;
	// 	groupedSvgObj.setAttributeNS(null, "transform", "matrix(" + transformMatrix.join(' ') + ")");
	// };

	this.updateStrokeProperties = function(property, value) {
		switch(property) {
			case "opacity":
				updateStrokeOpacity(value);
				break;
			case "strokeFillType":
				updateStrokeFillType(value);
				break;
			case "strokeFillGradient":
				updateStrokeFillGradient(value.color, value.newOffset);
				break;
			default:
				console.log("Error: unable to determine stroke property");
		}
	};

	this.isSelected = function() {
		return selected;
	};

	this.getPathStr = function() {
		return pathStr;
	};

	this.getStrokeProperties = function() {
	  return {
		  strokeWidth: strokeWidth,
		  strokeOpacity: strokeOpacity,
		  isGradient: isGradient,
		  strokeGradient: strokeGradient.getGradientProperties(),
	  };
	};

	this.getStrokeGradient = function() {
		return strokeGradient;
	};

	return that;
}
