/**
 * Gradient of a stroke of an SVG path.
 * Only has 3 colours, red, yellow and white to represent
 * the amplitude of a harmonic.
 *
 * Created by joanne on 12/1/16.
 */

// TODO: change white to black
function StrokeGradient(harmonicId) {
	"use strict";

	var that = (this === window) ? {} : this;
	var id = "gradient-fill-" + harmonicId;
	var opacity = 1.0; 	// default

	var gradientDefObj;
	var linearGradientObj;
	
	var redStartObj;
	var whiteStopObj;
	var yellowStopObj;
	var redEndObj;

	var svgns = "http://www.w3.org/2000/svg";

	var redStartOffset = 0;
	var whiteOffset = 25;
	var yellowOffset = 50;
	var redEndOffset = 100;

	var redStartTranslateX = 0;
	var whiteTranslateX = 0;
	var yellowTranslateX = 0;
	var redEndTranslateX = 0;

	createGradientDefObj();

	//----- private methods -----//
	function createGradientDefObj() {
		gradientDefObj = document.createElementNS(svgns, 'defs');

		linearGradientObj = document.createElementNS(svgns, 'linearGradient');
		linearGradientObj.setAttribute('id', id);

		redStartObj = createStopObj("red", redStartOffset);
		whiteStopObj = createStopObj("white", whiteOffset);
		yellowStopObj = createStopObj("yellow", yellowOffset);
		redEndObj = createStopObj("red", redEndOffset);

		linearGradientObj.appendChild(redStartObj);
		linearGradientObj.appendChild(whiteStopObj);
		linearGradientObj.appendChild(yellowStopObj);
		linearGradientObj.appendChild(redEndObj);
		gradientDefObj.appendChild(linearGradientObj);
	}

	function createStopObj(stopColor, offsetVal) {
		var stopObj = document.createElementNS(svgns, 'stop');
		stopObj.setAttribute('stop-color', stopColor);
		stopObj.setAttribute('stop-opacity', opacity);
		stopObj.setAttribute('offset', offsetVal + "%");

		return stopObj;
	}

	function setRedStartOffset(newOffsetVal) {
		redStartOffset = newOffsetVal;
		redStartObj.setAttribute('offset', newOffsetVal + "%");
	};

	function setYellowOffset(newOffsetVal) {
		yellowOffset = newOffsetVal;
		yellowStopObj.setAttribute('offset', newOffsetVal + "%");
	};

	function setWhiteOffset(newOffsetVal) {
		whiteOffset = newOffsetVal;
		whiteStopObj.setAttribute('offset', newOffsetVal + "%");
	};

	function setRedEndOffset(newOffsetVal) {
		redEndOffset = newOffsetVal;
		redEndObj.setAttribute('offset', newOffsetVal + "%");
	};

	//----- privileged methods -----//
	
	this.setOffset = function (color, newOffsetVal) {
		switch(color) {
			case "redStart":
				setRedStartOffset(newOffsetVal);
				break;
			case "white":
				setWhiteOffset(newOffsetVal);
				break;
			case "yellow":
				setYellowOffset(newOffsetVal);
				break;
			case "redEnd":
				setRedEndOffset(newOffsetVal);
				break;
			default:
				console.log("Error: unknown value of 'color'.");
		}
	}

	this.setOpacity = function(newOpacityVal) {
		redStartObj.setAttribute('stop-opacity', newOpacityVal);
		whiteStopObj.setAttribute('stop-opacity', newOpacityVal);
		yellowStopObj.setAttribute('stop-opacity', newOpacityVal);
		redEndObj.setAttribute('stop-opacity', newOpacityVal);
	};

	this.updateId = function(newId) {
		id = "gradient-fill-" + newId;
	};

	this.getGradientDefObj = function() {
		return gradientDefObj;
	};

	this.getGradientId = function() {
		return id;
	};

	//TODO: find a better way to clone this
	this.getGradientProperties = function() {
		return {
			redStartOffset: redStartOffset,
			whiteOffset: whiteOffset,
			yellowOffset: yellowOffset,
			redEndOffset: redEndOffset
		};
	};

	return that;
}
