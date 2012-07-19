(function(AudioContext){

  /* WrappedNode */

  function WrappedNode(){};

  WrappedNode.prototype.connect = function(node){
    this.node.connect(node.node || node);
  };

  /* NoiseGen */

  function NoiseGen(context, stereo){
    this.node = context.createJavaScriptNode(1024, 0, 2);
    this.node.onaudioprocess = function(e){
      var outBufferL = e.outputBuffer.getChannelData(0);
      var outBufferR = e.outputBuffer.getChannelData(1);
      for (var i = 0; i < 1024; i++){
        outBufferL[i] = Math.random() * 2 - 1;
        outBufferR[i] = stereo ? Math.random() * 2 - 1 : outBufferL[i];
      }
    }
  }

  NoiseGen.prototype = WrappedNode.prototype;

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
    this.node = context.createDelayNode(delay + 1);
    this.node.delayTime.value = delay;
    this.gainNode = context.createGainNode();
    this.gainNode.gain.value = feedback;
    this.node.connect(this.gainNode);
    this.gainNode.connect(this.node);
  }

  FeedbackDelayNode.prototype = WrappedNode.prototype;

  AudioContext.prototype.createNoiseGen = function(stereo){ return new NoiseGen(this, stereo); };

  AudioContext.prototype.createEnvelope = function(a, s, d, r){ return EnvelopeFactory(this, a, s, d, r); };
  AudioContext.prototype.createFeedbackDelay = function(delay, feedback){ return new FeedbackDelayNode(this, delay, feedback); };

})(window.AudioContext || window.webkitAudioContext);