SynthJS
=======
v0.01-alpha
----------

This is a utility script that defines a number of common synth patterns for use by the Web Audio API. So far this consists of:

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

