/**
 * A Canvas to draw SvgObjects on.
 * Requires: jQuery, SvgPathObject.js, StrokeGradient.js
 *
 * Created by joanne on 19/12/15.
 */

function SvgCanvas(canvasObj, spectrogramObj) {
	"use strict";
	
	var that = (this === window) ? {} : this;

	var svgPathObjs = [];
	var svgHarmonicObjs = [];
	var pxPerHz = 0;
	var pxPerMsec = 0;
	
	drawFreqTicks();
	drawTimeTicks(5000);	// default, 5 secs
	
	canvasObj.mousedown(function(evt) {
		evt.stopPropagation();
		that.deselectAllHarmonics();

		if (evt.which == gLeftMouseButton) {
			gContextMenu.hideContextMenu();

			if (gCurrTool == "harmonicPencilTool") {
				drawNewHarmonic(evt.offsetX, evt.offsetY);
			}
		}
	});

	$('#harmonic-pencil-tool-button').click(function() {
		event.stopPropagation();
		gCurrTool = "harmonicPencilTool";
		$("body").css('cursor', 'initial');
		$(".tool-button").removeClass("active");
		$(this).addClass("active");
	});

	$('#select-tool-button').click(function() {
		event.stopPropagation();
		gCurrTool = "selectTool";
		$("body").css('cursor', 'pointer');
		$('.tool-button').removeClass("active");
		$(this).addClass("active");
	});

	$('#duplicate-button').click(function() {
		event.stopPropagation();
		duplicateSvgHarmonics();
	});

	$('#delete-button').click(function() {
		event.stopPropagation();
		deleteSelectedSvgHarmonics();
	});


	//----- private methods called during initialisation -----//
	
	function drawFreqTicks() {

		//--- calculate spacing between ticks relative to size of canvas
		
		//--- min tick spacing: 1.25px; freq range: [100,500]
		pxPerHz = (canvasObj.height() / 500.0);
		var minHzPerTick = 1.25 / pxPerHz;
		
		var hzPerTick = 10;	// if each tick is min 2.5px

		if (minHzPerTick <= 10) {
			hzPerTick = 10;
		} else if (minHzPerTick <= 20) {
			hzPerTick = 20;
		} else if (minHzPerTick <= 50) {
			hzPerTick = 50;
		} else if (minHzPerTick <= 100) {
			hzPerTick = 100;
		} else if (minHzPerTick <= 200) {
			hzPerTick = 200;
		} else {
			console.log("Not enough screen resolution");
			return;
		}

		var pxPerTick = pxPerHz * hzPerTick;

		
		//--- draw the ticks
		
		var tickNo = 0;
		for (var y = 0; y <= canvasObj.height(); y += pxPerTick) {

			if (tickNo % 5 == 0) {
				$("#freq-ticks")[0].appendChild(makeNewFreqTick("#0FF000", 1, y));

				if (tickNo % 25 == 0) {
					$("#freq-ticks")[0].appendChild(
						makeNewFreqTickText("#0FF000", 14, y, (tickNo * hzPerTick) + 100));
				} else {
					$("#freq-ticks")[0].appendChild(
						makeNewFreqTickText("#0FF000", 14, y, (tickNo * hzPerTick)%1000 + 100));
				}
				
			} else {
				$("#freq-ticks")[0].appendChild(makeNewFreqTick("#0FF000", 0.5, y));

			}

			tickNo++;
		}
	}

	function makeNewFreqTick(color, width, y) {
		var newFreqTick = gSvgCreator.createHoriSvgLine(0, "100%", canvasObj.height() - y, color, width);
		newFreqTick.setAttribute('opacity', "0.7");
		return newFreqTick;
	}

	function makeNewFreqTickText(color, fontSize, y, value) {
		return gSvgCreator.createSvgText(value, 24, canvasObj.height() - y, color, fontSize);
	}
	
	function drawTimeTicks(soundLenInMsecs) {
		
		//--- remove old ticks
		while ($("#time-ticks")[0].firstChild) {
			$("#time-ticks")[0].removeChild($("#time-ticks")[0].firstChild);
		}

		//--- calculate spacing between ticks relative to size of canvas
		
		pxPerMsec = (canvasObj.width() / soundLenInMsecs);
		var minMsecPerTick = 2 / pxPerMsec;
		
		var msecPerTick = 10;	// if each tick is min 2.5px

		if (minMsecPerTick <= 1) {
			msecPerTick = 1;
		} else if (minMsecPerTick <= 10) {
			msecPerTick = 10;
		} else if (minMsecPerTick <= 50) {
			msecPerTick = 50;
		} else if (minMsecPerTick <= 250) {
			msecPerTick = 250;
		} else if (minMsecPerTick <= 500) {
			msecPerTick = 500;
		} else if (minMsecPerTick <= 1000) {
			msecPerTick = 1000;
		} else {
			console.log("Not enough screen resolution");
			return;
		}

		var pxPerTick = pxPerMsec * msecPerTick;

		//--- draw the ticks
		
		var noOfMsecs = 0;
		for (var x = 0;  x <= canvasObj.width(); x += pxPerTick) {

			if (noOfMsecs%1000 == 0) {
				$("#time-ticks")[0].appendChild(makeNewTimeTick(x, 3));
				$("#time-ticks")[0].appendChild(makeNewTimeTickSecText(12, x, noOfMsecs));
			} else {
				if (noOfMsecs%250 == 0) {
					$("#time-ticks")[0].appendChild(makeNewTimeTick(x, 1));
					$("#time-ticks")[0].appendChild(makeNewTimeTickMsecText(10, x, noOfMsecs));
				}
			}

			noOfMsecs += msecPerTick;
		}
	}

	function makeNewTimeTick(x, strokeWidth) {
		var newLine = gSvgCreator.createVertSvgLine(x, 0, 500, "white", strokeWidth);
		newLine.setAttribute('opacity', "0.3");
		
		return newLine;
	}

	function makeNewTimeTickSecText(fontSize, x, noOfMsecs) {
		var tickVal = parseInt(noOfMsecs/1000) + ":000";
		return gSvgCreator.createSvgText(tickVal, x, 490, "white", fontSize)
	}

	function makeNewTimeTickMsecText(fontSize, x, noOfMsecs) {
		var tickVal = ":" + (noOfMsecs%1000);
		return gSvgCreator.createSvgText(tickVal, x, 487, "white", fontSize);
	}


	//----- private methods called after initialisation -----//

	function drawNewHarmonic(x, y) {
		var newSvgHarmonicObj = new SvgHarmonic(gNoOfSvgHarmonicObjs, x, y);
		
		canvasObj.mousemove(function(evt) {
			event.stopPropagation();

			newSvgHarmonicObj.drawHarmonics(evt.offsetX, evt.offsetY);

			//--- insert group onto canvas
			spectrogramObj[0].appendChild(newSvgHarmonicObj.getGroupedSvgHarmonicObj());

		}).mouseup(function(){
			event.stopPropagation();
			$(this).off('mousemove');

			//--- update list of objects in SvgCanvas
			gNoOfSvgHarmonicObjs++;
			svgHarmonicObjs.push(newSvgHarmonicObj);

			$(this).off('mouseup');
		});
	}

	function duplicateSvgHarmonics() {
		var lengthBeforeDuplication = svgHarmonicObjs.length;

		// TODO: what if nothing is selected (still have to iterate through the list)
		for (var i = 0; i < lengthBeforeDuplication; ++i) {
			if (svgHarmonicObjs[i].isSelected()) {
				duplicateSvgHarmonic(i);
			}
		}
	};

	function duplicateSvgHarmonic(id) {
		var startPos = svgHarmonicObjs[id].getStartPosOfFundamentalPath();

		//--- create new SVG harmonic object based off properties from the original path
		var newSvgHarmonicObj = new SvgHarmonic(gNoOfSvgHarmonicObjs, startPos.x, startPos.y);
		svgHarmonicObjs[id].cloneSvgHarmonic(newSvgHarmonicObj);

		//--- insert group onto canvas
		spectrogramObj[0].appendChild(newSvgHarmonicObj.getGroupedSvgHarmonicObj());

		//--- update list of objects in SvgCanvas
		gNoOfSvgHarmonicObjs++;
		svgHarmonicObjs.push(newSvgHarmonicObj);
	}

	function deleteSelectedSvgHarmonics() {
		var currId = 0;

		// TODO: what if nothing is selected (still have to iterate through the list)
		while(currId < svgHarmonicObjs.length) {
			//--- delete from canvas and array
			if (svgHarmonicObjs[currId].isSelected()) {
				spectrogramObj[0].removeChild(svgHarmonicObjs[currId].getGroupedSvgHarmonicObj());
				svgHarmonicObjs.splice(currId, 1);

			} else {
				//-- update ID value
				svgHarmonicObjs[currId].updateId(currId);
				currId++;
			}
		}
	}

	//----- privileged methods -----//

	this.deselectAllHarmonics = function() {
		for (var i = 0; i < svgHarmonicObjs.length; i++) {
			svgHarmonicObjs[i].deselect();
		}
	};

	this.getPxPerHz = function() {
		return pxPerHz;
	};

	this.getPxPerMsec = function() {
		return pxPerMsec;
	};

	return that;
}
