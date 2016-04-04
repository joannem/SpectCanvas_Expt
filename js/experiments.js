var gAudioCtx = new (window.AudioContext || window.webkitAudioContext)(); 
var gSoundVisualiser = new SoundVisualiser($('#original-sound-wave'), null, null, 513, 140, 945);

var gSound = null;

$('#original-sound-wave').css({
	"height": 140,
	"width": $('#sound-space-container').width()
});
var originalSoundWaveCanvasCtx = $('#original-sound-wave')[0].getContext("2d");
originalSoundWaveCanvasCtx.fillRect(0, 0, $('#sound-space-container').width(), 140);

var freqTrails = [200, 250, 300];
var waveTypeTrials = ["SinW", "ConstH", "DecH"];
var envelopeTrails = ["ConstE", "IncDecE"];

var currSet = 1;
var currSection = 1;
var currTrail = 0;

beginSectionOne();

function beginSectionOne() {
	// randomnise 14 cases
	var trails = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
	shuffle(trails);

	var trailName = "";
	for (var i = 0; i < trails.length; i++) {
		trailName = trailNoToName(trails[i]);
	}
	loadSoundFile(trailName + ".wav");

}

function trailNoToName(trailNo) {
	var freq = Math.floor(trailNo/6);
	var envelope = (trailNo - freq*6) % 2;
	var waveType = Math.floor(trailNo/2) % 3;

	return freqTrails[freq] + "_" + waveTypeTrials[waveType] + "_" + envelopeTrails[envelope];
}

function loadSoundFile(soundFileName) {
	console.log(soundFileName);
	var request = new XMLHttpRequest(); 
    
    request.open("GET","TestTones/" + soundFileName,true); 
    request.responseType = "arraybuffer"; 

    request.onload = function() { 
    	console.log("loaded");
    };

    request.send();
}

function soundStoppedFunction() {
	console.log("sound stoped");
}

// http://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
// Fisher-Yates (aka Knuth) Shuffle
function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

	// Pick a remaining element...
	randomIndex = Math.floor(Math.random() * currentIndex);
	currentIndex -= 1;

	// And swap it with the current element.
	temporaryValue = array[currentIndex];
	array[currentIndex] = array[randomIndex];
	array[randomIndex] = temporaryValue;
  }

  return array;
}
