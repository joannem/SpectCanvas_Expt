/**
 * Context menu that inspects a harmonic and its individual paths.
 */

function ContextMenu() {
	"use strict";
	var that = (this === window) ? {} : this;
	
	var fillMeterWidth = $(".context-menu").width()-14;
	var harmonicLevelWidth = fillMeterWidth * 0.8;

	var harmonicObj = null;
	var svgPaths = [];

	var noOfHarmonics = 0;

	//--- slider positions of preview gradient of path context menu
	var redStartCurrX = 0;
	var yellowCurrX = 0;
	var whiteCurrX = 0;
	var redEndCurrX = 0;

	initialiseListeners();

	function initialiseListeners() {
		
		//--- Path menu
		listenToGradientInput();

		//--- Harmonic menu
		listenToNoOfHarmonics();

	}

	
	//--- Path menu

	function listenToGradientInput() {
		$("#slider-redStart, #slider-white, #slider-yellow, #slider-redEnd").mousedown(function() {
			event.stopPropagation();
			var color = ($(this)[0].id).substr(7);

			$(this).mousemove(function(evt) {
				moveContextMenuSlider(color, evt.offsetX);
				updatePathGradient(color, evt.offsetX);
			}).mouseup(function() {
				$(this).off('mousemove');
				$(this).off('mouseup');
			}).mouseout(function() {
				$(this).off('mousemove');
				$(this).off('mouseout');
			});
		});
	}

	function moveContextMenuSlider(color, currX) {
		var colorCurrX = 0;
		var dx = 0;

		switch(color) {
			case "redStart":
				colorCurrX = redStartCurrX;
				break;
			case "white":
				colorCurrX = whiteCurrX;
				break;
			case "yellow":
				colorCurrX = yellowCurrX;
				break;
			case "redEnd":
				colorCurrX = redStartCurrX;
				break;
			default:
				console.log("Error: unknown value of 'color':" + color + " .");
				return;
		}

		//--- move slider
		dx = currX - colorCurrX;
		colorCurrX += dx;
		$("#slider-" + color).attr('transform', "translate(" + (colorCurrX - 5) + ")");
	}

	function updatePathGradient(color, currX) {
		$("#Gradient-fill-" + color).attr('offset', currX/fillMeterWidth * 100 + "%");
		harmonicObj.updateStrokeFillGradient(color, currX/fillMeterWidth * 100);
	}


	//--- Harmonic menu
	
	function listenToNoOfHarmonics() {
		$("#add-harmonics").click(function(evt) {
			evt.stopPropagation();
			if (noOfHarmonics < 5) {
				noOfHarmonics++;
				$("#no-of-harmonics").val(noOfHarmonics);

				harmonicObj.addHarmonic();
				updateHarmonicLevelsDisplayed();
			}
		});

		$("#minus-harmonics").click(function(evt) {
			evt.stopPropagation();

			if (noOfHarmonics > 1) {
				noOfHarmonics--;
				$("#no-of-harmonics").val(noOfHarmonics);

				harmonicObj.deleteHarmonic();
				updateHarmonicLevelsDisplayed();
			}
		});
	}

	function updateHarmonicLevelsDisplayed() {

		//--- remove old harmonic levels
		while ($("#harmonic-levels")[0].firstChild) {
		    $("#harmonic-levels")[0].removeChild($("#harmonic-levels")[0].firstChild);
		}

		//--- remove old harmonic dividers
		while ($("#harmonic-dividers")[0].firstChild) {
		    $("#harmonic-dividers")[0].removeChild($("#harmonic-dividers")[0].firstChild);
		}
		
		//--- add new harmonic levels 
		var height = 100.0 / noOfHarmonics;
		var opacityVal = 0;
		
		for (var i = 0; i < noOfHarmonics; i++) {
			opacityVal = svgPaths[i].getStrokeOpacity() * 100;
			
			$("#harmonic-levels")[0].appendChild(
				makeLevelSvgRect("background", "#FFFFFF", i, 100, height));
			$("#harmonic-levels")[0].appendChild(
				makeLevelSvgRect("value", "#4D4D4D", i, opacityVal, height));
			
			$("#harmonic-dividers")[0].appendChild(makeSvgLine(i, height));
		}

		listenToHarmonicLevelChange();	// reset since new ones were created
	}

	function makeLevelSvgRect(type, fill, harmonicNo, width, height) {
		var newRect = gSvgCreator.createSolidSvgRect(0, (noOfHarmonics - 1 - harmonicNo) * height + "%", width + "%", height + "%", fill);
		newRect.setAttribute('class', "level-meter");
		newRect.setAttribute('id', "level-" + type + "-" + harmonicNo);
		
		return newRect;
	}

	function makeLevelButtonSvgRect(harmonicNo, height) {
		var newRect = gSvgCreator.createSolidSvgRect(0, (noOfHarmonics - 1 - harmonicNo) * height + "%", "100%", height + "%", "orange");
		newRect.setAttribute('class', "level-button");
		newRect.setAttribute('id', "level-button" + "-" + harmonicNo);

		return newRect;
	}

	function makeSvgLine(harmonicNo, height) {
		return gSvgCreator.createHoriSvgLine(0, "100%", (noOfHarmonics - 1 - harmonicNo) * height + "%", "#737373", 1);
	}

	function listenToHarmonicLevelChange() {
		$(".level-meter").mousedown(function(evt) {
			evt.stopPropagation();

			var harmonicNo = $(this)[0].id.split("-")[2];
			
			var newOpacity = evt.offsetX/harmonicLevelWidth;
			$("#level-value-" + harmonicNo).attr('width', newOpacity * 100.0 + "%");
			svgPaths[harmonicNo].updateStrokeOpacity(newOpacity * 1.0);
			
			$("#level-value-" + harmonicNo + ", #level-background-" + harmonicNo).mousemove(function(evt) {
				newOpacity = evt.offsetX/harmonicLevelWidth;
				$("#level-value-" + harmonicNo).attr('width', newOpacity * 100.0 + "%");
				svgPaths[harmonicNo].updateStrokeOpacity(newOpacity * 1.0);
			}).mouseup(function() {
				$("#level-value-" + harmonicNo + ", #level-background-" + harmonicNo).off('mousemove');
				$("#level-value-" + harmonicNo + ", #level-background-" + harmonicNo).off('mouseup');
			});
		});
	}
	
	//--- Set path menu properties
	
	function setEnvelope(gradientPropeties) {
		
		//--- set SVG path's gradient value
		$("#Gradient-fill").attr('fx', (gradientPropeties.redOffset) + "%");
		$("#Gradient-fill-redStart").attr('offset', (gradientPropeties.redStartOffset) + "%");
		$("#Gradient-fill-yellow").attr('offset', (gradientPropeties.yellowOffset) + "%");
		$("#Gradient-fill-white").attr('offset', (gradientPropeties.whiteOffset) + "%");
		$("#Gradient-fill-redEnd").attr('offset', (gradientPropeties.redEndOffset) + "%");

		redStartCurrX = gradientPropeties.redStartOffset/100 * fillMeterWidth;
		whiteCurrX = gradientPropeties.whiteOffset/100 * fillMeterWidth;
		yellowCurrX = gradientPropeties.yellowOffset/100 * fillMeterWidth;
		redEndCurrX = gradientPropeties.redEndOffset/100 * fillMeterWidth;

		$("#slider-redStart").attr('transform', "translate(" + (redStartCurrX - 5) + ")");
		$("#slider-white").attr('transform', "translate(" + (whiteCurrX - 5) + ")");
		$("#slider-yellow").attr('transform', "translate(" + (yellowCurrX - 5) + ")");
		$("#slider-redEnd").attr('transform', "translate(" + (redEndCurrX - 5) + ")");
	}


	//--- Set harmonic menu properties
	
	function setHarmonicValues() {
		noOfHarmonics = svgPaths.length;
		$("#no-of-harmonics").val(noOfHarmonics);
		updateHarmonicLevelsDisplayed();
		$("#context-menu-f0").text(harmonicObj.getFundamentalFreq());
	}


	this.showContextMenu = function(top, left, svgObj) {
		
		//--- reposition context menu
		$(".context-menu").offset({
			top: top,
			left: left
		});

		harmonicObj = svgObj;
		svgPaths = svgObj.getSvgPathObjs();

		setEnvelope(harmonicObj.getStrokeGradient());
		setHarmonicValues();

		$(".context-menu").show();

	};

	this.hideContextMenu = function() {
		$(".context-menu").offset({
			top: 0,
			left: 0
		});	// reset position to prevent it from flying off the screen
		$(".context-menu").hide();
	};
};
