/**
 * An group of SVG path objects positioned in integer intervals
 * above each other.
 * Requires: jQuery, StrokeGradient.js, SvgPathObject.js
 *
 * Created by joanne on 04/02/16
 */

function SvgHarmonic (id, startX, startY) {
	"use strict";
	var that = (this === window) ? {} : this;

	var selected = false;

	var strokeWidth = 14;
	var noOfHarmonics = 3;		// default
	var strokeGradient = new StrokeGradient(id);

	var svgPathObjs = [];

	var minXPos = 0;
	var minYPos = 0;
	var maxXPos = 0;
	var maxYPos = 0;
	var harmonicGuideBoxSvgObj;
	var groupedSvgHarmonicObj;

	var fundamentalFreq = ($("#svg-canvas").height() - startY) / gSvgCanvas.getPxPerHz();
	fundamentalFreq = fundamentalFreq.toFixed(3);

	var fundamentalPath = [];
	fundamentalPath.push([startX, startY]);

	//--- for dragging
	var currX = 0;
	var currY = 0;

	//--- initialise
	createIndividualHarmonics();
	createGuideBox();
	appendObjectsIntoGroup();

	//--- to select and move SVG harmonic object
	groupedSvgHarmonicObj.onmousedown = function(evt) {
		evt.stopPropagation();
		if (evt.which == gLeftMouseButton) {
			gContextMenu.hideContextMenu();
			
			if (gCurrTool = "selectTool") {
				currX = evt.clientX;
				currY = evt.clientY;

				var moved = false;

				$(document).mousemove(function(evt) {
					evt.stopPropagation();
					moveGroup(evt);
					moved = true;
				}).mouseup(function() {
					event.stopPropagation();
					$(this).off('mousemove');
					$(this).off('mouseup');

					if (!moved) {
						toggleSelection();
					} else {
						that.select();
						recalculateFundamentalFreq();
					}
				});
			}

		}
	};
	
	//--- show context menu of SVG harmonic object
	groupedSvgHarmonicObj.addEventListener("contextmenu", function(evt) {
		evt.stopPropagation();
		evt.preventDefault();

		if (gCurrTool == "selectTool" && selected) {
			gContextMenu.showContextMenu(evt.pageY, evt.pageX, that);
		}

		$(this).off('contextmenu');
	});
	
	function createIndividualHarmonics() {
		var flippedHeight = 500 - startY;
		for (var i = 0; i < noOfHarmonics; i++) {
			flippedHeight = (500 - startY) * (i+1);
			svgPathObjs[i] = new SvgPathObject(id, "M " + startX + "," + (500-flippedHeight ), strokeGradient);
		}
	}

	function createGuideBox() {svgPathObjs
		harmonicGuideBoxSvgObj = gSvgCreator.createTransparentSvgRect(startX-1, startY-1, 2, 2, "#00FFFF", 1);
		harmonicGuideBoxSvgObj.setAttribute('stroke-opacity', 0);
	}

	function appendObjectsIntoGroup() {
		groupedSvgHarmonicObj = gSvgCreator.createSvgGroup();
		groupedSvgHarmonicObj.appendChild(strokeGradient.getGradientDefObj());
		groupedSvgHarmonicObj.appendChild(svgPathObjs[0].getPathSvgObj());
		groupedSvgHarmonicObj.appendChild(svgPathObjs[1].getPathSvgObj());
		groupedSvgHarmonicObj.appendChild(svgPathObjs[2].getPathSvgObj());
		groupedSvgHarmonicObj.appendChild(harmonicGuideBoxSvgObj);
	}

	//--- Called after initialisation

	function moveGroup(evt) {
		var dx = evt.clientX - currX;
		var dy = evt.clientY - currY;

		var newPaths = [];
		var yVal = 0;

		if ((fundamentalPath[0][1] + dy > 0) && (fundamentalPath[0][1] + dy < 500)) {
			for (var i = 0; i < noOfHarmonics; i++) {
				newPaths[i] = "M ";

				for (var j = 0; j < fundamentalPath.length; j++) {
					fundamentalPath[j][0] += dx;
					fundamentalPath[j][1] += dy;
					yVal = 500 - (500 - fundamentalPath[j][1]) * (i+1);
					newPaths[i] += (fundamentalPath[j][0] + "," + yVal + " ");
				}
				
				svgPathObjs[i].updatePath(newPaths[i]);
			}

			updateGuideBox();
			
			currX = evt.clientX;
			currY = evt.clientY;
		}
	}
	
	function recalculateFundamentalFreq() {
		fundamentalFreq = ($("#svg-canvas").height() - startY - fundamentalPath[0][1]) / gSvgCanvas.getPxPerHz();
		fundamentalFreq = fundamentalFreq.toFixed(3);
	}

	function toggleSelection() {
		if (selected) {
			that.deselect();
		} else {
			that.select();
		}
	}

	function updateGuideBox() {
		var thickness = strokeWidth >> 1;

		harmonicGuideBoxSvgObj.setAttribute('x', fundamentalPath[minXPos][0] - thickness);
		harmonicGuideBoxSvgObj.setAttribute('y', 500 - (500 - fundamentalPath[minYPos][1])*noOfHarmonics - thickness);
		harmonicGuideBoxSvgObj.setAttribute('width', (fundamentalPath[maxXPos][0] - fundamentalPath[minXPos][0]) + (thickness << 1));
		harmonicGuideBoxSvgObj.setAttribute('height', (fundamentalPath[maxYPos][1] - fundamentalPath[minYPos][1] + (noOfHarmonics-1)*($("#svg-canvas").height() - fundamentalPath[minYPos][1])) + (thickness << 1));
	}

	//----- privileged methods -----//
	
	this.drawHarmonics = function(x, y) {
		var baseHeight = 500 - y;
		svgPathObjs[0].drawPath(x, y);
		svgPathObjs[1].drawPath(x, 500 - (baseHeight*2));
		svgPathObjs[2].drawPath(x, 500 - (baseHeight*3));

		maxXPos = fundamentalPath[maxXPos][0] > x ? maxXPos : fundamentalPath.length;
		maxYPos = fundamentalPath[maxYPos][1] > y ? maxYPos : fundamentalPath.length;
		minXPos = fundamentalPath[minXPos][0] < x ? minXPos : fundamentalPath.length;
		minYPos = fundamentalPath[minYPos][1] < y ? minYPos : fundamentalPath.length;

		fundamentalPath.push([x, y]);
		updateGuideBox();
	};

	this.drawStraightHarmonics = function(x, y) {
		y = fundamentalPath[fundamentalPath.length - 1][1];
		var baseHeight = 500 - y;
		svgPathObjs[0].drawPath(x, y);
		svgPathObjs[1].drawPath(x, 500 - (baseHeight*2));
		svgPathObjs[2].drawPath(x, 500 - (baseHeight*3));

		maxXPos = fundamentalPath[maxXPos][0] > x ? maxXPos : fundamentalPath.length;
		maxYPos = fundamentalPath[maxYPos][1] > y ? maxYPos : fundamentalPath.length;
		minXPos = fundamentalPath[minXPos][0] < x ? minXPos : fundamentalPath.length;
		minYPos = fundamentalPath[minYPos][1] < y ? minYPos : fundamentalPath.length;

		fundamentalPath.push([x, y]);
		updateGuideBox();
	};

	this.updateId = function(newId) {
		id = newId;
	};

	this.updateStrokeFillGradient = function(color, newOffset) {
		strokeGradient.setOffset(color, newOffset);
	};

	this.select = function() {
		selected = true;
		harmonicGuideBoxSvgObj.setAttribute('stroke-opacity', 1);
	};

	this.deselect = function() {
		selected = false;
		harmonicGuideBoxSvgObj.setAttribute('stroke-opacity', 0);
	};

	this.isSelected = function() {
		return selected;
	};

	this.getGroupedSvgHarmonicObj = function() {
	  return groupedSvgHarmonicObj;
	};
	
	this.getStrokeGradient = function() {
		return strokeGradient.getGradientProperties();
	};

	this.getSvgPathObjs = function() {
		return svgPathObjs;
	};

	this.getFundamentalFreq = function() {
		return fundamentalFreq;
	};

	this.getStartPosOfFundamentalPath = function() {
		return {
			x: fundamentalPath[0][0],
			y: fundamentalPath[0][1]
		};
	};

	this.addHarmonic = function() {
		var newPath = "M ";
		var yVal = 0;
		for (var i = 0; i < fundamentalPath.length; i++) {
			yVal = 500 - (500 - fundamentalPath[i][1]) * (noOfHarmonics + 1);
			newPath += (fundamentalPath[i][0] + "," + yVal + " ");
		}

		svgPathObjs[noOfHarmonics] = new SvgPathObject(id, newPath, strokeGradient);
		groupedSvgHarmonicObj.insertBefore(svgPathObjs[noOfHarmonics].getPathSvgObj(), svgPathObjs[noOfHarmonics-1].getPathSvgObj().nextSibling);
		
		noOfHarmonics++;
		$('#no-of-harmonics').text(noOfHarmonics);
		updateGuideBox();
	};

	this.deleteHarmonic = function() {
		groupedSvgHarmonicObj.removeChild(svgPathObjs[noOfHarmonics-1].getPathSvgObj());
		svgPathObjs.splice(-1, 1);

		noOfHarmonics--;
		$('#no-of-harmonics').text(noOfHarmonics);
		updateGuideBox();
	};
	
	/** Used for cloning  **/

	this.cloneSvgHarmonic = function(clonedHarmonic) {
		clonedHarmonic.cloneFundamentalPath(fundamentalPath);
		clonedHarmonic.cloneCoordinates(maxXPos, maxYPos, minXPos, minYPos);
		clonedHarmonic.cloneGradient(strokeGradient.getGradientProperties());
		clonedHarmonic.cloneNoOfHarmonics(noOfHarmonics);
		
		for (var i = 0; i < noOfHarmonics; i++) {
			clonedHarmonic.clonePath(i, svgPathObjs[i].getPathStr());
			clonedHarmonic.cloneOpacity(i, svgPathObjs[i].getStrokeOpacity());
		}
	};

	this.cloneFundamentalPath = function(clonedFundamentalPath) {
		fundamentalPath = clonedFundamentalPath;
	};

	this.cloneCoordinates = function(clonedMaxXPos, clonedMaxYPos, clonedMinXPos, clonedMinYPos) {
		minXPos = clonedMinXPos;
		minYPos = clonedMinYPos;
		maxXPos = clonedMaxXPos;
		maxYPos = clonedMaxYPos;
		updateGuideBox();
	};

	this.cloneGradient = function(clonedGradientProperties) {
		strokeGradient.setOffset("redStart", clonedGradientProperties.redStartOffset);
		strokeGradient.setOffset("white", clonedGradientProperties.whiteOffset);
		strokeGradient.setOffset("yellow", clonedGradientProperties.yellowOffset);
		strokeGradient.setOffset("redEnd", clonedGradientProperties.redEndOffset);
	};

	this.cloneNoOfHarmonics = function(clonedNoOfHarmonics) {
		noOfHarmonics = clonedNoOfHarmonics;
	};

	this.clonePath = function(harmonicNo, clonedPath) {
		svgPathObjs[harmonicNo].updatePath(clonedPath);
	};

	this.cloneOpacity = function(harmonicNo, clonedOpacity) {
		svgPathObjs[harmonicNo].updateStrokeOpacity(clonedOpacity);
	};
}
