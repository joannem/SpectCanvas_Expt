var freqTrails = [200, 250, 300];
var waveTypeTrials = ["SinW", "ConstH", "DecH"];
var envelopeTrails = ["ConstE", "IncDecE"];

var trails = [];
var selectedOptions = [];
var currSet = 1;
var currSection = 1;
var currTrail = 0;

beginSectionOne();

function beginSectionOne() {
	$('.section-two').hide();
	$('.section-one').show();

	resetTrailOrder();
	setupSectionOneTest();
}

function setupSectionOneTest() {
	//--- load the sound file
	loadSoundFile(trailNoToName(trails[currTrail]) + ".wav");
	updateExptTrails();

	//--- pick 3 other random options
	var optionPicked = [];
	selectedOptions = [];
	for (var i = 0; i < 14; i++) {
		optionPicked.push(0);
	}
	optionPicked[trails[currTrail]] = 1;
	selectedOptions.push(trails[currTrail]);
	var currCandidate = 0;
	while (selectedOptions.length < 4) {
		currCandidate = Math.floor(Math.random()*14)%14;
		if (optionPicked[currCandidate] == 0) {
			optionPicked[currCandidate] = 1;
			selectedOptions.push(currCandidate);
		}
	}
	shuffle(selectedOptions);
	loadOptions();
	
	$('#next-experiment').addClass("disabled");
}

function loadOptions() {
	for (var i = 0; i < 4; i++) {
		$('#option-'+i+' img').css('border', "none");
		$('#option-'+i+' img').attr('height', "400px");
		$('#option-'+i+' img').attr('src', "img/" + trailNoToName(selectedOptions[i]) + ".png");
	}

	$('.option').click(function(evt) {
		evt.stopPropagation();
		$('.option').off('click');

		if (selectedOptions[($(this)[0].id).substr(7)] == trails[currTrail]) {
			// TODO: increment
			console.log("correct");
		}

		showAnswer();

		$('#next-experiment').removeClass("disabled");		
		$('#next-experiment').click(function(evt) {
			evt.stopPropagation();
			$(this).off('click');

			currTrail++;
			$('#next-experiment').addClass("disabled");

			if (currTrail < 14) {
				setupSectionOneTest();
			} else {
				currTrail = 0;
				currSection++;
				beginSectionTwo();
			}

			// window.scrollTo(0, 0);
		});

	});
}

function showAnswer() {
	for (var i = 0; i < 4; i++) {
		if (selectedOptions[i] == trails[currTrail]) {
			$('#option-'+i+' img').css('border', "5px solid #0FF000");
		} else {
			$('#option-'+i+' img').css('border', "5px solid red");
		}
	}
}

function beginSectionTwo() {
	$('.section-one').hide();
	$('.section-two').show();

	resetTrailOrder();
	setupSectionTwoTest();
}

function setupSectionTwoTest() {
	//--- TODO: reset canvas
	//--- load the sound file
	loadSoundFile(trailNoToName(trails[currTrail]) + ".wav");
	updateExptTrails();
	$('#next-experiment').removeClass("disabled");

	if (currSet == 3 && currTrail == 13) {
		$('#next-experiment').text("Done");
		$('#next-experiment').attr('href', "post-questionnaire.html");
	}

	$('#next-experiment').click(function(evt) {
		evt.stopPropagation();
		$(this).off('click');
		
		currTrail++;

		if (currTrail < 14) {
			setupSectionTwoTest();
		} else {
			currTrail = 0;
			currSection = 1;
			currSet++;

			beginSectionOne();
		}

		// window.scrollTo(0, 0);
	});
}

function updateExptTrails() {
	$('#set-indicator').text(currSet);
	$('#section-indicator').text(currSection);
	$('#trail-indicator').text(currTrail+1);
}

function resetTrailOrder() {
	//--- randomnise order of 14 cases
	trails = [];
	trails = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
	shuffle(trails);
	currTrail = 0;
}

function trailNoToName(trailNo) {
	var freq = Math.floor(trailNo/6);
	var envelope = (trailNo - freq*6) % 2;
	var waveType = Math.floor(trailNo/2) % 3;

	return freqTrails[freq] + "_" + waveTypeTrials[waveType] + "_" + envelopeTrails[envelope];
}

function loadSoundFile(soundFileName) {
	// console.log(soundFileName);
	var request = new XMLHttpRequest(); 
	
	request.open("GET", "TestTones/" + soundFileName, true); 
	request.responseType = "arraybuffer"; 

	request.onload = function() { 
		gAudioCtx.decodeAudioData(request.response, function(buffer) {
			gSound = new Sound (gAudioCtx, buffer, soundStoppedFunction);
			gMonoSoundData = gSound.getMonoSoundData();
			gSoundVisualiser.drawWaveform(gMonoSoundData.monoPcmData, gMonoSoundData.pcmDataLen, gMonoSoundData.maxAmp);
		});
	};

	request.send();
}

function soundStoppedFunction() {
	console.log("sound stoped");
	gSound.setIsPlaying(false);
	$('#sample-sound-button').html('<span class="glyphicon glyphicon-play" aria-hidden="true"></span> Play');
}

$('#sample-sound-button').click(function() {
	event.stopPropagation();

	if (gSound == null) {
		console.log ("No sound data found.");
	} else if (!gSound.isPlaying()) {
		gSound.play(0);
		gSound.setIsPlaying(true);
		$(this).html('<span class="glyphicon glyphicon-stop" aria-hidden="true"></span> Stop');
	} else {
		gSound.stopPlaying();
		gSound.setIsPlaying(false);	
		$(this).html('<span class="glyphicon glyphicon-play" aria-hidden="true"></span> Play');
	}
});


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
