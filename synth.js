(function(AudioContext){

  /* NoiseGen */

  function NoiseGenFactory(context, stereo, bufSize){
    bufSize = bufSize || 4096;
    var node = context.createJavaScriptNode(bufSize, 1, 2);
    node.onaudioprocess = function(e){
      var outBufferL = e.outputBuffer.getChannelData(0);
      var outBufferR = e.outputBuffer.getChannelData(1);
      for (var i = 0; i < bufSize; i++){
        outBufferL[i] = Math.random() * 2 - 1;
        outBufferR[i] = stereo ? Math.random() * 2 - 1 : outBufferL[i];
      }
    }
    return node;
  }

  /* EnvelopeNode */

  function EnvelopeNode(a, d, s, r){
    this.gain.value = 0;
    this.att = a;
    this.dec = d;
    this.sus = s;
    this.rel = r;

    this.trigger = function(length){
      var now = this.context.currentTime;
      var gain = this.gain;
      gain.cancelScheduledValues(now);
      gain.setValueAtTime(0, now);
      gain.linearRampToValueAtTime(1.0, now + this.att);
      now += this.att;
      gain.linearRampToValueAtTime(this.sus, now + this.dec);
      if (length){
        var self = this;
        setTimeout(function(){ self.release(); }, length * 1000);
      }
    };
    this.release = function(){
      var now = this.context.currentTime;
      var gain = this.gain;
      gain.cancelScheduledValues(now);
      gain.setValueAtTime(gain.value, now);
      gain.linearRampToValueAtTime(0, now + this.rel);
    }
  }

  function EnvelopeFactory(context, a, d, s, r){
    var gain = context.createGainNode();
    EnvelopeNode.call(gain, a, d, s, r);
    return gain;
  }

  /* FeedbackDelayNode */

  function FeedbackDelayNode(context, delay, feedback){
    this.delayTime.value = delay;
    this.gainNode = context.createGainNode();
    this.gainNode.gain.value = feedback;
    this.connect(this.gainNode);
    this.gainNode.connect(this);
  }

  function FeedbackDelayFactory(context, delayTime, feedback){
    var delay = context.createDelayNode(delayTime + 1);
    FeedbackDelayNode.call(delay, context, delayTime, feedback);
    return delay;
  }

  AudioContext.prototype.createNoiseGen = function(stereo, bufSize){ return NoiseGenFactory(this, stereo, bufSize); };
  AudioContext.prototype.createEnvelope = function(a, s, d, r){ return EnvelopeFactory(this, a, s, d, r); };
  AudioContext.prototype.createFeedbackDelay = function(delay, feedback){ return FeedbackDelayFactory(this, delay, feedback); };

  /** INSTRUMENTS **/

  function Drum(context){
    var osc = this.osc = context.createOscillator();
    osc.frequency.value = 45;
    osc.type = osc.SINE;
    var env = this.env = context.createEnvelope(0.001, 0.1, 0, 0.5);
    osc.connect(env);
  }

  Drum.prototype.trigger = function(){
    this.env.trigger(0.05);
  }
  Drum.prototype.connect = function(dest){
    this.env.connect(dest);
  }

  function HiHat(context){
    this.noiseGen = context.createNoiseGen();
    this.filter = context.createBiquadFilter();
    this.filter.type = this.filter.HIGHPASS;
    this.filter.frequency.value = 5000;
    this.noiseGen.connect(this.filter);
    this.env = context.createEnvelope(0.001, 0.05, 0, 0.2);
    this.filter.connect(this.env);
  }

  HiHat.prototype.trigger = function(){
    this.env.trigger(0.025);
  }
  HiHat.prototype.connect = function(dest){
    this.env.connect(dest);
  }

  AudioContext.prototype.createDrum = function(){ return new Drum(this); };
  AudioContext.prototype.createHiHat = function(){ return new HiHat(this); };

  /** LOOP **/

  function Loop(){
    this.tracks = {};
    this.stopped = true;
    this.interval = 500;
    this.beatUnit = 1/4;
  }

  Loop.prototype.setInstruments = function(instruments){
    each(instruments, function(inst, label){
      this.tracks[label] = { instrument: inst };
    }, this);
  }

  Loop.prototype.setLoop = function(loops){
    each(loops, function(loop, label){
      this.tracks[label].loop = typeof loop === "string" ? loop.split('') : loop;
      this.tracks[label].loopPos = 0;
    }, this);
  }

  Loop.prototype.setBPM = function(BPM){
    this.interval = (60 / BPM) * 1000;
  }

  Loop.prototype.setBeatUnit = function(unit){
    this.beatUnit = unit;
  }

  Loop.prototype.playLoop = function(){
    this.stopped = false;
    this.playNext();
  }

  Loop.prototype.playNext = function(){
    if (this.stopped) return;
    each(this.tracks, function(track){
      var currNote = track.loop[track.loopPos];
      if (currNote === '*'){
        track.instrument.trigger();
      }
      if (++track.loopPos >= track.loop.length){
        track.loopPos = 0;
      }
    }, this);
    var self = this;
    setTimeout(function(){ self.playNext(); }, this.interval * this.beatUnit * 4);
  }

  Loop.prototype.stopLoop = function(){
    this.stopped = true;
  }

  function each(obj, callback, context){
    context = context || this;
    for (var prop in obj){
      if (obj.hasOwnProperty(prop)){
        callback.call(context, obj[prop], prop);
      }
    }
  }

  window.Loop = Loop;

})(window.AudioContext || window.webkitAudioContext);