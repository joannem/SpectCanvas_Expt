var gSvgCreator = new SvgCreator();
var gSvgCanvas = new SvgCanvas($('#svg-canvas'), $('#spectrogram-canvas'));

var gContextMenu = new ContextMenu();

var gWaveSpect = new WaveSpect(10, 0.5);
var gAudioCtx = new (window.AudioContext || window.webkitAudioContext)(); 
var gSound = null;
var gReconSound = null;

var gWaveSpect = new WaveSpect(10, 0.5);
var gSoundVisualiser = new SoundVisualiser($('#original-sound-wave'), $('#reconstructed-sound-wave'), $('#hidden-spectrogram-canvas'), 513, 140, 945);


var gCurrTool = "harmonicPencilTool";
var gNoOfSvgHarmonicObjs = 0;

var gLeftMouseButton = 1;

$('#original-sound-wave, #reconstructed-sound-wave').css({
	"height": 140,
	"width": $('#sound-space-container').width()
});
var originalSoundWaveCanvasCtx = $('#original-sound-wave')[0].getContext("2d");
var reconstructedSoundWaveCanvasCtx = $('#reconstructed-sound-wave')[0].getContext("2d");
originalSoundWaveCanvasCtx.fillRect(0, 0, $('#sound-space-container').width(), 140);
reconstructedSoundWaveCanvasCtx.fillRect(0, 0, $('#sound-space-container').width(), $('#reconstructed-sound-wave').height());

$('#recon-sound-button').click(function() {
	event.stopPropagation();
	
	//--- clear all the guideboxes
	gSvgCanvas.deselectAllHarmonics();

	//--- create spectrogram matrix from SVG canvas
	var extractedSpectrogram = [];
	gSoundVisualiser.spectrogramFromSvg($('#spectrogram-canvas'), extractedSpectrogram);

	//--- wait for rasterised image to finish loading
	$('#hidden-spectrogram-canvas').on("imgLoaded", function() {
		
		//--- perform SPSI to reconstruct PCM data from spectrogram
		var reconPcm = gWaveSpect.spectToWave(extractedSpectrogram);
			
		//--- replace gReconSound with new sound
		var reconSoundBuffer = gAudioCtx.createBuffer(1, reconPcm.length, 88200);
		var nowBuffering = reconSoundBuffer.getChannelData(0);
		for(var i = 0; i < reconPcm.length; i++){
			nowBuffering[i] = reconPcm[i];
		}

		gReconSound = new Sound (gAudioCtx, reconSoundBuffer, onSoundStop);
		
		//--- draw waveform of new sound
		var monoSoundData = gReconSound.getMonoSoundData();
		gSoundVisualiser.drawReconWaveform(monoSoundData.monoPcmData, monoSoundData.pcmDataLen, monoSoundData.maxAmp);

		//--- create wave file to be downloaded
		createWaveFile();
	});
});

$('#reconstructed-sound-play-button').click(function() {
	event.stopPropagation();

	if (gReconSound == null) {
		console.log ("No sound data found.");
	} else if (!gReconSound.isPlaying()) {
		gReconSound.play(0);
		gReconSound.setIsPlaying(true);
	} else {
		// do nothing
	}
});

function createWaveFile() {
	/* http://typedarray.org/from-microphone-to-wav-with-getusermedia-and-web-audio/ */
	var soundData = gReconSound.getSoundData();
	var pcmData = gReconSound.getMonoSoundData().monoPcmData;
	var sampleRate = soundData.sampleRate >> 1;

	// create the buffer and view to create the .WAV file
	var buffer = new ArrayBuffer(44 + pcmData.length * 2);
	var view = new DataView(buffer);
	 
	// write the WAV container, check spec at: https://ccrma.stanford.edu/courses/422/projects/WaveFormat/
	// RIFF chunk descriptor
	writeUTFBytes(view, 0, 'RIFF');
	view.setUint32(4, 44 + pcmData.length * 2, true);
	writeUTFBytes(view, 8, 'WAVE');
	// FMT sub-chunk
	writeUTFBytes(view, 12, 'fmt ');
	view.setUint32(16, 16, true);
	view.setUint16(20, 1, true);
	// stereo (2 channels)
	view.setUint16(22, 2, true);
	view.setUint32(24, sampleRate, true);
	view.setUint32(28, sampleRate * 4, true);
	view.setUint16(32, 4, true);
	view.setUint16(34, 16, true);
	// data sub-chunk
	writeUTFBytes(view, 36, 'data');
	view.setUint32(40, pcmData.length * 2, true);
	 
	// write the PCM samples
	var lng = pcmData.length;
	var index = 44;
	var volume = 1;
	for (var i = 0; i < lng; i++){
			view.setInt16(index, pcmData[i] * (0x7FFF * volume), true);
			index += 2;
	}
	 
	// our final binary blob that we can hand off
	var blob = new Blob ( [ view ], { type : 'audio/wav' } );
	console.log("Finished creating blob.");
	
	/** http://jsfiddle.net/koldev/cw7w5/ **/
	var blobUrl = window.URL.createObjectURL(blob);
	$('#download-wav')[0].href = blobUrl;
	console.log("Finished converting blob into file.");
}

function onSoundStop() {
	console.log("sound stopped");

}

function writeUTFBytes(view, offset, string){ 
	var lng = string.length;
	for (var i = 0; i < lng; i++){
		view.setUint8(offset + i, string.charCodeAt(i));
	}
}
