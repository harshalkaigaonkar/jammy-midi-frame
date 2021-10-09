import './main.scss';
import bass1 from './audio/bass/bass_1.wav';
import bass2 from './audio/bass/bass_2.wav';
import bass3 from './audio/bass/bass_3.wav';
import bass4 from './audio/bass/bass_4.wav';

import drum1 from './audio/drum/drum_1.wav';
import drum2 from './audio/drum/drum_2.wav';
import drum3 from './audio/drum/drum_3.wav';
import drum4 from './audio/drum/drum_4.wav';

import piano1 from './audio/piano/piano_1.wav';
import piano2 from './audio/piano/piano_2.wav';
import piano3 from './audio/piano/piano_3.wav';
import piano4 from './audio/piano/piano_4.wav';

import metronomeSound from './audio/metronom.mp3';
  
// Effect control view cmp
Vue.component('effect-control-view', {
  template: '#effect-control-view-template',
  props: ['effectName', 'level'],
  data: () => ({
    rotateDegree: ['-148deg', '-117deg', '-88deg', '-60deg', '-32deg', '0', '32deg', '60deg', '88deg', '117deg', '148deg'],
  }),
});

// Effect control cmp
Vue.component('effect-control', {
  template: '#effect-control-template',
  props: ['effectName', 'keyUp', 'keyDown', 'level'],
  data: () => ({
    filterChangeInterval: null,
    filterChangeIntervalTime: 500,
    isUp: false,
    isDown: false
  }),
  methods: {
    changeUp() {
      this.$emit('action', {effect: this.effectName, type: 'up'});
    },
    changeDown() {
      this.$emit('action', {effect: this.effectName, type: 'down'});
    }
  },
  created() {
    window.addEventListener('keydown', event => {
      if(event.key === this.keyDown && !this.filterChangeInterval || event.key === this.keyDown.toUpperCase() && !this.filterChangeInterval) {
        this.isDown = true;
        this.changeDown();
        this.filterChangeInterval = setInterval(this.changeDown, this.filterChangeIntervalTime);
      } else if(event.key === this.keyUp && !this.filterChangeInterval || event.key === this.keyUp.toUpperCase() && !this.filterChangeInterval) {
        this.isUp = true;
        this.changeUp();
        this.filterChangeInterval = setInterval(this.changeUp, this.filterChangeIntervalTime);
      }
    });
    window.addEventListener('keyup', event => {
      if(event.key === this.keyDown || event.key === this.keyUp || event.key === this.keyDown.toUpperCase() || event.key === this.keyUp.toUpperCase()) {
        clearInterval(this.filterChangeInterval);
        this.isUp = false;
        this.isDown = false;
        this.filterChangeInterval = null;
      }
    });
  }
});

// Pad button cmp
Vue.component('pad-btn', {
  template: '#pad-btn-template',
  props: ['keyName'],
  data: () => ({
    isPlay:false
  }),
  methods: {
    playSound() {
      this.isPlay = true;
      this.$emit('action', { key: this.keyName, play: true });
    },
    stopSound() {
      this.isPlay = false;
      // this.$emit('action', { key: this.keyName, play: false });
    }
  },
  created() {
    window.addEventListener('keydown', event => {
      if(event.key === this.keyName && !this.isPlay || event.key === this.keyName.toUpperCase() && !this.isPlay) {
        this.playSound();
      }
    });
    window.addEventListener('keyup', event => {
      if(event.key === this.keyName && this.isPlay || event.key === this.keyName.toUpperCase() && this.isPlay) {
        this.stopSound();
      }
    });
  },
});

new Vue({
  el: '#midi-frame',
  data: () => ({
    pads: [
        [
          bass1, 
          bass2, 
          bass3, 
          bass4, 
        ],
        [
          drum1, 
          drum2, 
          drum3, 
          drum4, 
        ],
        [
          piano1,
          piano2,
          piano3,
          piano4,
        ],
    ],
    activePads: 0,

    loopTime: 3780,
    loopsInterval: null,
    group: null,
    isInited: false,

    isWantToRecord: false,
    isRecording: false,
    recordStart: null,
    record: null,
    loops: [],
    loopsGroup: new Pizzicato.Group(),

    isMetronome: false,
    metronome: null,

    reverbFilter: new Pizzicato.Effects.Reverb({
      time: 0.01,
      decay: 3,
      reverse: false,
      mix: 0.5
    }),
    delayFilter: new Pizzicato.Effects.Delay({
      feedback: 0.6,
      time: 0,
      mix: 0.5
    }),
    lowPassFilter: new Pizzicato.Effects.LowPassFilter({
      frequency: 3100,
      peak: 10
    }),

    reverbLevel: 0,
    delayLevel: 0,
    lowPassLevel: 0,

    au_1: null,
    au_2: null,
    au_3: null,
    au_4: null,
    
    isPause: true,
  }),
  methods: {
    // Create Pizzicato sound file
    initSound(src) {
      return new Pizzicato.Sound(src);
    },
    // Start Midi Frame
    initMidiFrame() {
      try {
        this.au_1 = this.initSound(this.pads[this.activePads][0]);
      this.au_2 = this.initSound(this.pads[this.activePads][1]);
      this.au_3 = this.initSound(this.pads[this.activePads][2]);
      this.au_4 = this.initSound(this.pads[this.activePads][3]);
  
      if(!this.isInited) {
        console.log('Inited')
        var AudioContext = window.AudioContext // Default
            || window.webkitAudioContext // Safari and old versions of Chrome
            || false; 

        if (AudioContext) {
            var ctx = new AudioContext;
            this.group = new Pizzicato.Group([this.au_1, this.au_2, this.au_3, this.au_4]);
            this.isInited = true;
        } else {
            // Web Audio API is not supported
            // Alert the user
            alert("Sorry, but the Web Audio API is not supported by your browser. Please, consider upgrading to the latest version or downloading Google Chrome or Mozilla Firefox");
        }
      } else {
        let effects = this.group.effects;
        this.group = new Pizzicato.Group([this.au_1, this.au_2, this.au_3, this.au_4]);
        effects.forEach(eff => this.group.addEffect(eff));
      }
      } catch (error) {
        alert(error.message) 
      }
    },
    // Handle Sound Change
    soundChange(change) {
      let au;
      switch (change.key) {
        case 'q':
          this.au_1.stop();
          this.au_1.play();
          au = this.au_1.clone();
          break;
        case 'w':
          this.au_2.stop();
          this.au_2.play();
          au = this.au_2.clone();
          break;
        case 'a':
          this.au_3.stop();
          this.au_3.play();
          au = this.au_3.clone();
          break;
        case 's':
          this.au_4.stop();
          this.au_4.play();
          au = this.au_4.clone();
          break;
        default:
          break;
      }
      if(this.isRecording) {
        this.group.effects.forEach(eff => {
          let effect;
          if(eff.reverbNode) {
            effect =  new Pizzicato.Effects.Reverb({...eff.options});
          } else if(eff.delayNode) {
            effect =  new Pizzicato.Effects.Delay({...eff.options});
          } else {
            effect =  new Pizzicato.Effects.LowPassFilter({
              frequency: eff.frequency,
              peak: eff.peak
            });
          }
          au.addEffect(effect)
        });
        this.record.sounds.push({
          au,
          time: new Date().getTime() - this.recordStart,
        })
      }
    },
    // Effect Change
    effectChange(change) {
      switch (change.effect) {
        case 'Reverb':
          if(change.type === 'up' && this.reverbLevel < 10) {
            this.setEffect('reverbFilter', 3 / 10, this.group);
            this.reverbLevel++;
          } else if(change.type === 'down' && this.reverbLevel > 0) {
            this.setEffect('reverbFilter', -3 / 10, this.group);
            this.reverbLevel--;
          }
          break;
        case 'Delay time':
          if(change.type === 'up' && this.delayLevel < 10) {
            this.setEffect('delayFilter', 1 / 10, this.group);
            this.delayLevel++;
          } else if(change.type === 'down' && this.delayLevel > 0) {
            this.setEffect('delayFilter', -1 / 10, this.group);
            this.delayLevel--;
          }
          break;
        case 'Low Pass':
          if(change.type === 'up' && this.lowPassLevel < 10) {
            this.setEffect('lowPassFilter', -300, this.group);
            this.lowPassLevel++;
          } else if(change.type === 'down' && this.lowPassLevel > 0) {
            this.setEffect('lowPassFilter', 300, this.group);
            this.lowPassLevel--;
          }
          break;
        default:
          break;
      }
    },
    // CHANGE TIME FOR REVERB AND DELAY AND FREQUENCY FOR LOWPASS
    setEffect(effect, step, au) {
      let minValues = {
        'reverbFilter': 0.01,
        'delayFilter': 0,
        'lowPassFilter': 3100
      };
      let fixedNums = {
        'reverbFilter': 4,
        'delayFilter': 1,
        'lowPassFilter': 0
      };

      let opt = effect === 'lowPassFilter' ? 'frequency' : 'time';
      if(this[effect][opt] >= minValues[effect] && effect !== 'lowPassFilter' || effect === 'lowPassFilter' && this[effect][opt] < minValues[effect]) au.removeEffect(this[effect]);
      let val = (this[effect][opt] + step);
      this[effect][opt] = Number(val.toFixed(fixedNums[effect]));
      this[effect][opt] = {...this[effect][opt]};

      if(this[effect][opt] > minValues[effect] && effect !== 'lowPassFilter' || effect === 'lowPassFilter' && this[effect][opt] < minValues[effect]) {
        au.addEffect(this[effect]);
        console.log('Effect ', effect)
      }
    },
    // Init Record 
    initRecord() {
      if(this.isPause) {
        this.playLoops();
        this.startRecording();
      } else {
        this.isWantToRecord = true;
      }
    },
    // Start record new Loop
    startRecording() {
      this.isRecording = true;
      this.recordStart = new Date().getTime();
      this.record = { sounds: [] };
      
      if(this.isMetronome) {
        this.switchMetronome();
        this.switchMetronome();
      }

      setTimeout(() => {
        this.loops.push(this.record)
        this.record = null;
        this.recordStart = null;
        this.isRecording = false;
        this.pauseLoops();
        this.loops[this.loops.length - 1].sounds.forEach(s => {
          this.loopsGroup.addSound(s.au);
        });
        this.playLoops();
      }, this.loopTime);
    },
    // Play Loops
    playLoops() {
      let action = () => {
        if(this.isWantToRecord) {
          this.isWantToRecord = false;
          this.startRecording();
        }
        this.loops.forEach(loop => this.playLoop(loop));
      }
      this.loopsInterval = setInterval(() => action(), this.loopTime);
      action();
      this.isPause = false;
    },
    // Pause Loops
    pauseLoops() {
      clearInterval(this.loopsInterval);
      this.loopsInterval = null;
      this.loops.forEach(loop => this.pauseLoop(loop));
      this.isPause = true;
    },
    // Play Loop
    playLoop(loop) {
      loop.sounds.forEach((s, i) => {
        s.au.play(s.time / 1000);
      });
    },
    // Pause Loop
    pauseLoop(loop) {
      loop.sounds.forEach(s => {s.au.stop()});
    },
    // Clear Loop
    clearLoop() {
      this.loops.pop();
    },
    // Switch metronom on/off
    switchMetronome() {
      if(this.isMetronome) {
        this.metronome.stop();
        this.isMetronome = false;
      } else {
        this.metronome.play();
        this.isMetronome = true;
      }
    },
    // Change pads 
    switchPads() {
      if(this.activePads === this.pads.length - 1) {
        this.activePads = 0;
      } else {
        this.activePads++;
      }
      this.initMidiFrame();
    }
  },
  created() {
    this.metronome = new Pizzicato.Sound(metronomeSound);
    this.metronome.volume = 0.1;
    this.metronome.loop = true;

    // this.loopsGroup.volume = 0.75;
    // Listen to key press
    window.addEventListener('keydown', event => {
      switch(event.key) {
        case 'c':
          this.initRecord();
          break;
        case 'C':
          this.initRecord();
          break;
        case 'r':
          this.isPause ? this.playLoops() : this.pauseLoops();
          break;
        case 'R':
          this.isPause ? this.playLoops() : this.pauseLoops();
          break;
        case 'd':
          this.clearLoop();
          break;
        case 'D':
          this.clearLoop();
          break;
        case 'e':
          this.switchPads();
          break;
        case 'E':
          this.switchPads();
          break;
        case 'm':
          this.switchMetronome();
          break;
        case 'M':
          this.switchMetronome();
          break;
      }
    }); 
  }
});

