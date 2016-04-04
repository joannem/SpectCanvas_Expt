/**
 * A visualiser to draw the spectrogram and waveform of a sound, 
 * onto a specified canvas.
 * Note: only supports mono :/
 *
 * Requires: jQuery, chroma.js, fft.js
 *
 * Created by joanne on 15/1/16.
 */

/**
 * Constructor.
 * 
 * @param {jQuery} waveformCanvasObj    	Canvas object to draw waveform in.
 * @param {jQuery} spsiWaveformCanvasObj	Canvas object to draw SPSI waveform in.
 * @param {jQuery} spectrogramCanvasObj 	Canvas object to draw spectrogram in.
 * @param {jQuery} hiddenCanvasObj 			Canvas object to store rasterised spectrogram.
 * @param {int} spectHeight 				Maximum frequency resolution in pixels.
 * @param {int} width 						Maximum time resolution in pixels.
 */
function SoundVisualiser(waveformCanvasObj, spsiWaveformCanvasObj, hiddenCanvasObj, spectHeight, waveformHeight, width) {
	"use strict";
	var that = (this === window) ? {} : this;

	//----- variables -----//
	
	if (hiddenCanvasObj != null) {
		var hiddenCanvasCtx = hiddenCanvasObj[0].getContext("2d");
		setupBlankCanvas(width, waveformHeight, spsiWaveformCanvasObj, spsiWaveformCanvaCtx);
	}

	if (spsiWaveformCanvaCtx != null) {
		var spsiWaveformCanvaCtx = spsiWaveformCanvasObj[0].getContext("2d");
	}
	var waveformCanvasCtx = waveformCanvasObj[0].getContext("2d");

	//--- for dragging and zooming canvas
	var dx = 0; var dy = 0;
	var zoomDx = 0; var zoomDy = 0;
	var zoomVal = 1.0;
	
	//--- values for calculating FFT:
	var noOfFrames = 1050;	// default value (unknown until length of PCM data is known)

	setupBlankCanvas(width, waveformHeight, waveformCanvasObj, waveformCanvasCtx);


	//----- private methods -----//

	function setupBlankCanvas(width, height, canvasObj, canvasCtx) {
		canvasObj.attr('width', width);
		canvasObj.attr('height', height);	

		canvasCtx.fillRect(0, 0, width, height);
	}


	//https://en.wikipedia.org/wiki/Grayscale
	function rgb2grey(r, g, b){
		return .299*r + .587*g + .114*b;
	}

	function updateSvgPattern() {
		var xlinkns = "http://www.w3.org/1999/xlink";
		var canvasDataUrl = spectrogramCanvasObj[0].toDataURL();
		$("#pattern-img")[0].setAttributeNS(xlinkns, "href", canvasDataUrl);
	}


	//----- privileged methods -----//
	
	/**
	 * (Re)draws the original waveform of the sound onto the waveform canvas.
	 * 
	 * @param {Array} monoPcmData	PCM of sound in mono form
	 * @param {int} pcmDataLen		Length of monoPcmData
	 * @param {int} maxAmp 			Maximum amplitude of all values in monoPcmData
	 */
	this.drawWaveform = function(monoPcmData, pcmDataLen, maxAmp) {
		waveformCanvasCtx.clearRect(0, 0, width, waveformHeight);
		waveformCanvasCtx.fillStyle = '#000000';
		waveformCanvasCtx.fillRect(0, 0, width, waveformHeight);

		//--- calculate waveform dimensions from audio data
		var jump = Math.floor(pcmDataLen / width) > 1 ? Math.floor(pcmDataLen / width) : 1;
		
		//--- draw scaled waveform
		console.log("Begin drawing waveform...");
		
		waveformCanvasCtx.fillStyle = '#0FF000';
		var x = 0; var waveHeight = 0;
		for(var i = 0; i < pcmDataLen; i += jump) {
			waveHeight = monoPcmData[i] / maxAmp * waveformHeight;
			waveformCanvasCtx.fillRect(x, (waveformHeight / 2) - waveHeight, 1, (waveHeight * 2));

			x++;
		}

		console.log("Waveform: done.");
	};

	// TODO: MERGE!! draw waveform and draw recon waveform

	/**
	 * (Re)draws the reconstructed waveform of the sound onto the waveform canvas.
	 * 
	 * @param {Array} monoPcmData	PCM of sound in mono form
	 * @param {int} pcmDataLen		Length of monoPcmData
	 * @param {int} maxAmp 			Maximum amplitude of all values in monoPcmData
	 */
	this.drawReconWaveform = function(monoPcmData, pcmDataLen, maxAmp) {
		spsiWaveformCanvaCtx.clearRect(0, 0, width, waveformHeight);
		spsiWaveformCanvaCtx.fillStyle = '#000000';
		spsiWaveformCanvaCtx.fillRect(0, 0, width, waveformHeight);

		//--- calculate waveform dimensions from audio data
		var jump = Math.floor(pcmDataLen / width) > 1 ? Math.floor(pcmDataLen / width) : 1;
		
		//--- draw scaled waveform
		console.log("Begin drawing SPSI waveform...");
		spsiWaveformCanvaCtx.fillStyle = '#000FF0';
		var x = 0; var waveHeight = 0;
		for(var i = 0; i < pcmDataLen; i += jump) {
			waveHeight = monoPcmData[i] / maxAmp * waveformHeight;
			spsiWaveformCanvaCtx.fillRect(x, (waveformHeight / 2) - waveHeight, 1, (waveHeight * 2));

			x++;
		}

		console.log("SPSI Waveform: done.");
	};

	this.spectrogramFromSvg = function(svgObj, extractedSpectrogram) {
		
		//--- scale SVG to according to FFT dimensions

		// var maxFreq = gWaveSpect.getMaxFreq();
		
		var tempSvgObj = document.createElementNS("http://www.w3.org/2000/svg", "svg");
		var clonedChildren = svgObj.children().clone();

		for (var i = 0; i < clonedChildren.length; i++) {
			tempSvgObj.appendChild(clonedChildren[i]);
		}
		
		tempSvgObj.setAttribute('width', 5000);
		tempSvgObj.setAttribute('height', 11.6);
		tempSvgObj.setAttribute('preserveAspectRatio', "none");
		tempSvgObj.setAttribute('viewBox', "0 0 5000 500");
		
		//--- scale canvas according to FFT dimensions

		setupBlankCanvas(945, 513, hiddenCanvasObj, hiddenCanvasCtx);
		hiddenCanvasCtx.fillStyle = '#000000';
		hiddenCanvasCtx.fillRect(0, 0, 945, 513);

		//--- create rasterised canvas of SVG
		
		var svgXmlData = new XMLSerializer().serializeToString(tempSvgObj);
		var svgData = new Blob([svgXmlData], {type: 'image/svg+xml;charset=utf-8'});
		
		var domUrl = window.URL || window.webkitURL || window;
		var svgUrl = domUrl.createObjectURL(svgData);

		var img = new Image();
		img.src = svgUrl;
		
		img.onload = function () {
			hiddenCanvasCtx.drawImage(img, 0, 513-11.6);
			var pixelData = hiddenCanvasCtx.getImageData(0, 0, 945, 513);
			
			domUrl.revokeObjectURL(svgUrl);

			//--- extract pixels from canvas to form spectrogram
			
			var pindex = 0;
			for (var j = (513 - 1); j >= 0; j--){
				for(var i = 0; i < 945; i++){
					
					//--- initialise matrices first
					if (j == (513 - 1)) {
						extractedSpectrogram[i] = new Array(513).fill(0);
					}

					extractedSpectrogram[i][j] = rgb2grey(pixelData.data[pindex], pixelData.data[pindex+1], pixelData.data[pindex+2]);
					pindex+=4;
				}
			}
			hiddenCanvasObj.trigger("imgLoaded");
		}
	};

	return that;
}
