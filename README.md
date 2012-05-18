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

A square wave "ping" with delay.

    var context = new webkitAudioContext();

    //square wave at 660 Hz
    var square = context.createSquareSynth(660);
    //envelope with 0.001 sec attack and 0.5 sec decay
    var envelope = context.createEnvelope(0.001, 0.5, 0, 0);
    //feedback delay of 0.4 seconds with 0.5x feedback
    var feedbackDelay = context.createFeedbackDelay(0.4, 0.5);

    square.connect(envelope);
    envelope.connect(feedbackDelay);
    feedbackDelay.connect(context.destination);

    //trigger the note and release after 0.6 seconds
    envelope.trigger(0.6);
	
API
----

###Synths###

context.**createSineSynth**([freq])

context.**createSawSynth**([freq])

context.**createSquareSynth**([freq])

###Envelope###

context.**createEnvelope**(a, d, s, r)

*Properties*

* this.**node** (internal gain node)
* this.**att**
* this.**dec**
* this.**sus**
* this.**rel**

*Methods*

* **trigger**([length]) - Triggers a note. If *length* is supplied, the note will automatically be released after *length* seconds.
* **release**() - Releases the currently triggered note.

###Effects###

context.**createFeedbackDelay**(delay, feedback)