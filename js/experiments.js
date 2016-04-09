$('#results-download-button').css('display', "none");
var freqTrails = [200, 250, 300];
var waveTypeTrials = ["SinW", "ConstH", "DecH"];
var envelopeTrails = ["ConstE", "IncDecE"];

var trails = [];
var selectedOptions = [];
var currSet = 1;
var currSection = 1;
var currTrail = 0;

var noOfCorrectAnsSectionOne = [];
var noOfCorrectAns = 0;
var likelinessRatingSectionTwo = [];
var likelinessRatingSectionTwoOneSet = [];

var timeTakenSectionOne = [];
var timeTakenSectionTwo = [];
var date = new Date();
var startTime = 0;

beginSectionOne();

function beginSectionOne() {
	date = new Date();
	startTime = date.getTime();
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
		$('#option-'+i+' img').attr('width', "945px");
		$('#option-'+i+' img').attr('src', "img/" + trailNoToName(selectedOptions[i]) + ".png");
	}

	$('.option').click(function(evt) {
		evt.stopPropagation();
		$('.option').off('click');

		if (selectedOptions[($(this)[0].id).substr(7)] == trails[currTrail]) {
			noOfCorrectAns++;
			// console.log("correct");
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
				noOfCorrectAnsSectionOne[currSet-1] = noOfCorrectAns;
				noOfCorrectAns = 0;
				date = new Date();
				timeTakenSectionOne[currSet-1] = date.getTime() - startTime;
				currTrail = 0;
				currSection = 2;
				beginSectionTwo();
			}

			window.scrollTo(0, 0);
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
	date = new Date();
	startTime = date.getTime();
	$('.section-one').hide();
	$('.section-two').show();

	resetTrailOrder();
	setupSectionTwoTest();
	likelinessRatingSectionTwoOneSet = [];
}

function setupSectionTwoTest() {
	$('#next-experiment').addClass("disabled");

	gReconSound = null;
	$('#reconstructed-sound-wave')[0].getContext("2d").fillStyle = '#000000';
	$('#reconstructed-sound-wave')[0].getContext("2d").fillRect(0, 0, 945, 140);
	while($('#spectrogram-canvas')[0].firstChild) {
		$("#spectrogram-canvas")[0].removeChild($("#spectrogram-canvas")[0].firstChild);
	}
	
	//--- load the sound file
	loadSoundFile(trailNoToName(trails[currTrail]) + ".wav");
	updateExptTrails();
	$('#next-experiment').addClass("disabled");


	var rank = 0;
	
	$('.radio-recon-rank').click(function(evt) {
		evt.stopPropagation();
		$('.radio-recon-rank').off('click');
		rank = $(this)[0].children[0].value;


		$('#next-experiment').removeClass("disabled");
		$('#next-experiment').click(function(evt) {
			evt.stopPropagation();
			$(this).off('click');

			likelinessRatingSectionTwoOneSet[currTrail] = rank;
			
			currTrail++;

			if (currTrail < 14) {
				setupSectionTwoTest();
			} else {
				date = new Date();
				timeTakenSectionTwo[currSet-1] = date.getTime() - startTime;
				currTrail = 0;
				currSection = 1;
				currSet++;
				likelinessRatingSectionTwo.push(likelinessRatingSectionTwoOneSet);


				if (currSet == 4) {
					$('#next-experiment').addClass("disabled");
					createCsvContent();
				} else {
					beginSectionOne();
				}
			}

		});
	});
}

function createCsvContent() {
	var csvContent = "data:text/csv;charset=utf-8,";
	var dataString = noOfCorrectAnsSectionOne.join(",");
   	csvContent += dataString+ "\n";

   	for (var i = 0; i < likelinessRatingSectionTwo.length; i++) {
   		dataString = likelinessRatingSectionTwo[i].join(",");
   		csvContent += dataString+ "\n";
   	}
   	dataString = timeTakenSectionOne.join(",");
   	csvContent += dataString+ "\n";
	dataString = timeTakenSectionTwo.join(",");
   	csvContent += dataString+ "\n";


	var encodedUri = encodeURI(csvContent);
	var link = document.getElementById("results-download-button");
	link.setAttribute("href", encodedUri);
	link.setAttribute("download", "my_results.csv");
	$('#results-download-button').show();
	
	$('#results-download-button').click(function() {
		$('#next-experiment').removeClass("disabled");
		$('#next-experiment').click(function() {
			$(this).attr('href', "post-questionnaire.html");
		});
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
