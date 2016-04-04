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
	gReconSound.setIsPlaying(false);
	$('#reconstructed-sound-play-button').html('<span class="glyphicon glyphicon-play" aria-hidden="true"></span> Play');
}

function writeUTFBytes(view, offset, string){ 
	var lng = string.length;
	for (var i = 0; i < lng; i++){
		view.setUint8(offset + i, string.charCodeAt(i));
	}
}
