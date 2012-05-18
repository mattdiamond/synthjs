(function(AudioContext){

  /* WrappedNode */

  function WrappedNode(){};

  WrappedNode.prototype.connect = function(node){
    this.node.connect(node.node ? node.node : node);
  };

  /* SynthNode */

  function SynthProto(){
    Object.defineProperty(this, "freq", {
      get: function(){ return this.node.playbackRate.value * 20; },
      set: function(val){ this.node.playbackRate.value = val / 20; }
    });
    Object.defineProperty(this, "gain", {
      get: function(){ return this.node.gain.value; },
      set: function(val){ this.node.gain.value = val; }
    });
  };

  SynthProto.prototype = WrappedNode.prototype;

  var bufferCache = {};

  function SynthNode(bufferFunc, context, freq){
    var node = this.node = context.createBufferSource();
    node.loop = true;
    node.gain.value = 0.5;

    node.playbackRate.value = (freq || 440) / 20;

    if (!bufferCache[bufferFunc]){
      var buffer = bufferCache[bufferFunc] = context.createBuffer(1, 44100 / 20, 44100);
      var bufferData = buffer.getChannelData(0);
      var buflen = bufferData.length;
      for (var i = 0; i < buflen; i++){
        bufferData[i] = bufferFunc(i / buflen);
      }
    }
    node.buffer = bufferCache[bufferFunc];

    node.noteOn(0);
  }

  SynthNode.prototype = new SynthProto();

  /* EnvelopeNode */

  function EnvelopeProto(){
    this.trigger = function(length){
      var now = this.node.context.currentTime;
      var gain = this.node.gain;
      gain.setValueAtTime(0, now);
      gain.linearRampToValueAtTime(1.0, now + this.att);
      now += this.att;
      gain.linearRampToValueAtTime(this.sus, now + this.dec);
      if (length){
        var env = this;
        setTimeout(function(){ env.release(); }, length * 1000);
      }
    };
    this.release = function(){
      var now = this.node.context.currentTime;
      var gain = this.node.gain;
      gain.cancelScheduledValues(now);
      gain.setValueAtTime(gain.value, now);
      gain.linearRampToValueAtTime(0, now + this.rel);
    }
  };

  EnvelopeProto.prototype = WrappedNode.prototype;

  function EnvelopeNode(context, a, d, s, r){
    this.node = context.createGainNode();
    this.node.gain.value = 0;
    this.att = a;
    this.dec = d;
    this.sus = s;
    this.rel = r;
  }

  EnvelopeNode.prototype = new EnvelopeProto();

  /* SawtoothNode */

  var sawFunc = function(i){ return 2 * i - 1 };

  var SawNode = SynthNode.bind(this, sawFunc);

  /* SquareNode */

  var squareFunc = function(i) {
    return (i < 0.5 ? -1 : 1);
  };

  var SquareNode = SynthNode.bind(this, squareFunc);

  /* SineNode */

  var sineFunc = function(i){
    return Math.sin(2 * i * Math.PI);
  }

  var SineNode = SynthNode.bind(this, sineFunc);

  /* FeedbackDelayNode */

  function FeedbackDelayNode(context, delay, feedback){
    this.node = context.createDelayNode(delay + 1);
    this.node.delayTime.value = delay;
    this.gainNode = context.createGainNode();
    this.gainNode.gain.value = feedback;
    this.node.connect(this.gainNode);
    this.gainNode.connect(this.node);
  }

  FeedbackDelayNode.prototype = WrappedNode.prototype;

  AudioContext.prototype.createSawSynth = function(freq){ return new SawNode(this, freq); };
  AudioContext.prototype.createSquareSynth = function(freq){ return new SquareNode(this, freq); };
  AudioContext.prototype.createSineSynth = function(freq){ return new SineNode(this, freq); };

  AudioContext.prototype.createSynth = function(bufferFunc, freq){ return new SynthNode(bufferFunc, this, freq); };

  AudioContext.prototype.createEnvelope = function(a, s, d, r){ return new EnvelopeNode(this, a, s, d, r); };
  AudioContext.prototype.createFeedbackDelay = function(delay, feedback){ return new FeedbackDelayNode(this, delay, feedback); };

})(window.AudioContext || window.webkitAudioContext);