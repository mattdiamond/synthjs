SynthJS v0.2.0-alpha
===================

This is a utility script that extends the Web Audio API context with a number of common synth and DSP nodes. So far this consists of:

* White noise generator
* Envelope generator
* Feedback delay
* Reverb
* Drum sounds
* Looping sequencer

This is a work in progress.

Note: Requires a browser that supports the webkit Web Audio API (see: [http://caniuse.com/audio-api](http://caniuse.com/audio-api)).

Examples
--------

A square wave "ping" with delay.

```js
var context = new webkitAudioContext();

//square wave at 440 Hz (default)
var osc = context.createOscillator();
osc.type = osc.SQUARE;

//envelope with 0.001 sec attack and 0.5 sec decay
var envelope = context.createEnvelope(0.001, 0.5, 0, 0);

//feedback delay of 0.4 seconds with 0.5x feedback
var feedbackDelay = context.createFeedbackDelay(0.4, 0.5);

osc.connect(envelope);
envelope.connect(feedbackDelay);
envelope.connect(context.destination);
feedbackDelay.connect(context.destination);

//trigger the note and release after 0.6 seconds
envelope.trigger(0.6);
```	

API
----

###Synths###

context.**createNoiseGen**([stereo [, bufferSize]]) - White noise generator

###Envelope###

context.**createEnvelope**(a, d, s, r)

*Properties*

* this.**att**
* this.**dec**
* this.**sus**
* this.**rel**

*Methods*

* **trigger**([length]) - Triggers a note. If *length* is supplied, the note will automatically be released after *length* seconds.
* **release**() - Releases the currently triggered note.

###Instruments###

context.**createDrum**()
context.**createHiHat**()

*Methods*

* **trigger**

###Effects###

context.**createFeedbackDelay**(delay, feedback)

* **delay** is in seconds
* **feedback** is a value between 0 and 1.0

context.**createReverbNode**(length[, options])

* **length** is in seconds

Currently available keys for reverb options object:
* **decay** - how rapidly the sound decays (1 = linear decay, higher numbers are faster exponential decays) - defaults to 2
* **reverse** - pass in `true` for reverse reverb

###Looping###

**Loop** Class

*Methods*

* **setInstruments**
* **setSequences**
* **setBPM**
* **setBeatUnit**
* **startLoop**
* **stopLoop**

More detailed docs to come, for now check out example.html for an example of using the Loop class
