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

$('#recon-sound-button').click(function(evt) {
	evt.stopPropagation();
	
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

		gReconSound = new Sound (gAudioCtx, reconSoundBuffer, onReconSoundStop);
		
		//--- draw waveform of new sound
		var monoSoundData = gReconSound.getMonoSoundData();
		gSoundVisualiser.drawReconWaveform(monoSoundData.monoPcmData, monoSoundData.pcmDataLen, monoSoundData.maxAmp);

		//--- create wave file to be downloaded
		// createWaveFile();
	});
});

$('#reconstructed-sound-play-button').click(function() {
	event.stopPropagation();

	if (gReconSound == null) {
		console.log ("No sound data found.");
	} else if (!gReconSound.isPlaying()) {
		gReconSound.play(0);
		gReconSound.setIsPlaying(true);
		$(this).html('<span class="glyphicon glyphicon-stop" aria-hidden="true"></span> Stop');
	} else {
		gReconSound.stopPlaying();
		gReconSound.setIsPlaying(false);	
		$(this).html('<span class="glyphicon glyphicon-play" aria-hidden="true"></span> Play');
	}
});

function onReconSoundStop() {
	console.log("sound stoped");
	gReconSound.setIsPlaying(false);
	$('#reconstructed-sound-play-button').html('<span class="glyphicon glyphicon-play" aria-hidden="true"></span> Play');
}
