SynthJS v0.1.0-alpha
===================

This is a utility script that extends the Web Audio API context with a number of common synth and DSP nodes. So far this consists of:

* Sine, Square, and Sawtooth wave synths
* Envelope generator
* Feedback delay

This is a work in progress.

Examples
--------

Hello World: A basic sine tone at the default frequency of 440 Hz.

	var context = new webkitAudioContext();
	
	var sine = context.createSineSynth();
	sine.connect(context.destination);
	
API
----

context.**createSineSynth([freq])**

context.**createSawSynth([freq])**

context.**createSquareSynth([freq])**