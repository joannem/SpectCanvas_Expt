var gSvgCreator = new SvgCreator();
var gSvgCanvas = new SvgCanvas($('#svg-canvas'), $('#spectrogram-canvas'));

var gContextMenu = new ContextMenu();

var gWaveSpect = new WaveSpect(10, 0.5);
var gAudioCtx = new (window.AudioContext || window.webkitAudioContext)(); 
var gSound = null;
var gReconSound = null;

var gWaveSpect = new WaveSpect(10, 0.5);

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
