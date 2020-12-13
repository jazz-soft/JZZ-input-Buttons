(function(global, factory) {
  if (typeof exports === 'object' && typeof module !== 'undefined') {
    module.exports = factory;
  }
  else if (typeof define === 'function' && define.amd) {
    define('JZZ.input.Buttons', ['JZZ'], factory);
  }
  else {
    factory(JZZ);
  }
})(this, function(JZZ) {

  if (!JZZ) return;
  if (!JZZ.input) JZZ.input = {};

  var _version = '0.0.0';
  function _name(name, deflt) { return name ? name : deflt; }

  var _firefoxBug;
  function _fixBtnUp(e) {
    if (typeof e.buttons == 'undefined' || e.buttons != _firefoxBug) return e;
    e.stopPropagation();
    if (e.button == 0) return {buttons:_firefoxBug^1};
    if (e.button == 1) return {buttons:_firefoxBug^4};
    if (e.button == 2) return {buttons:_firefoxBug^2};
  }

  function _lftBtnDn(e) { return typeof e.buttons == 'undefined' ? !e.button : e.buttons & 1; }
  function _lftBtnUp(e) { return typeof e.buttons == 'undefined' ? !e.button : !(e.buttons & 1); }

  function _handleMouseDown(bbb, b) {
    return function(e) {
      if (_lftBtnDn(e)) {
        bbb.mouseDown = true;
        bbb.press(b);
      }
      _firefoxBug = e.buttons;
    };
  }

  function _handleMouseOver(bbb, b) {
    return function(e) {
      if (bbb.mouseDown) {
        bbb.press(b);
      }
      _firefoxBug = e.buttons;
    };
  }

  function _handleMouseOut(bbb, b) {
    return function(e) {
      if (bbb.mouseDown) {
        bbb.release(b);
      }
      _firefoxBug = e.buttons;
    };
  }

  function _handleMouseUp(bbb, b) {
    return function(e) {
      e = _fixBtnUp(e);
      if (_lftBtnUp(e)) {
        bbb.release(b);
        bbb.mouseDown = false;
      }
    };
  }

  function _handleMouseOff(bbb) {
    return function(e) {
      e = _fixBtnUp(e);
      if (_lftBtnUp(e)) bbb.mouseDown = false;
    };
  }

  function _watchMouseButtons() {
    return function(e) {
      _firefoxBug = e.buttons;
    };
  }

  function _add(a, x) {
    for (var i = 0; i < a.length; i++) if (a[i] == x) return;
    a.push(x);
  }

  function _in(a, x) {
    for (var i = 0; i < a.length; i++) if (a[i] == x) return true;
    return false;
  }

  function _handleTouch(bbb) {
    return function(e) {
      e.preventDefault();
      var t = [];
      for (var i = 0; i < e.touches.length; i++) bbb.findButton(e.touches[i].clientX, e.touches[i].clientY, t);
      var tt = [];
      var i;
      for (i = 0; i < t.length; i++) {
        _add(tt, t[i]);
        if (!_in(bbb.touches, t[i])) bbb.press(t[i]);
      }
      for (i = 0; i < bbb.touches.length; i++) {
        if (!_in(t, bbb.touches[i])) bbb.release(bbb.touches[i]);
      }
      bbb.touches = tt;
    };
  }

  function Buttons(arg) {
    var a, b, d, i;
    this.moudeDown = false;
    // this.playing = {};
    this.buttons = [];
    this.touches = [];

    this.watchButtons = _watchMouseButtons();
    this.touchHandle = _handleTouch(this);
    window.addEventListener('mousedown', this.watchButtons);
    window.addEventListener('mousemove', this.watchButtons);
    window.addEventListener('mouseup', _handleMouseOff(this));

    for (i = 0; i < arg.buttons.length; i++) {
      a = arg.buttons[i];
      d = a.dom;
      if (typeof d == 'string') d = document.getElementById(d);
      b = { dom: d, midi: a.midi };
      this.buttons.push(b);

      d.addEventListener('mousedown', _handleMouseDown(this, b));
      d.addEventListener('mouseover', _handleMouseOver(this, b));
      d.addEventListener('mouseout', _handleMouseOut(this, b));
      d.addEventListener('mouseup', _handleMouseUp(this, b));

      d.addEventListener('touchstart', this.touchHandle);
      d.addEventListener('touchmove', this.touchHandle);
      d.addEventListener('touchend', this.touchHandle);

      d.style.userSelect = 'none';
      d.style.MozUserSelect = 'none';
      d.style.WebkitUserSelect = 'none';
      d.style.MsUserSelect = 'none';
      d.style.KhtmlUserSelect = 'none';
      d.style.cursor = 'default';
    }
  }

  Buttons.prototype.press = function(b) {
    var i;
    if (!b.on) {
      b.on = 1;
      for (i = 0; i < b.midi.length; i++) {
        this.emit(JZZ.MIDI.noteOn(b.midi[i][0], b.midi[i][1]));
      }
    }
    else b.on++;
  };

  Buttons.prototype.release = function(b) {
    var self = this;
    setTimeout(function() { self.off(b); }, 0);
  }

  Buttons.prototype.off = function(b) {
    var i;
    if (b.on) {
      b.on--;
      if (!b.on) {
        for (i = 0; i < b.midi.length; i++) {
          this.emit(JZZ.MIDI.noteOff(b.midi[i][0], b.midi[i][1]));
        }
      }
    }
  }

  Buttons.prototype.findButton = function(x, y, ret) {
    for (var i = 0; i < this.buttons.length; i++) {
      for (var elm = document.elementFromPoint(x, y); elm; elm = elm.parentNode) {
        if (this.buttons[i].dom == elm) {
          _add(ret, this.buttons[i]);
          return;
        }
      }
    }
  };

  function ButtEngine() {}

  ButtEngine.prototype._info = function(name) {
    return {
      type: 'html/javascript',
      name: _name(name, 'Buttons'),
      manufacturer: 'virtual',
      version: _version
    };
  };

  ButtEngine.prototype._openIn = function(port, name) {
    port._info = this._info(name);
    try {
      var buttons = new Buttons(this._arg);
      buttons.emit = function(msg) { port._emit(msg); };
      port._resume();
    }
    catch (err) {
      port._crash(err);
    }
  };

  JZZ.input.Buttons = function() {
    var name, arg;
    if (arguments.length == 1) {
      if (typeof arguments[0] === 'string') name = arguments[0];
      else arg = arguments[0];
    }
    else { name = arguments[0]; arg = arguments[1];}
    var engine = new ButtEngine();
    engine._arg = arg;
    return JZZ.lib.openMidiIn(name, engine);
  };

  JZZ.input.Buttons.version = function() { return _version; };

  JZZ.input.Buttons.register = function() {
    var name, arg;
    if (arguments.length == 1) {
      if (typeof arguments[0] === 'string') name = arguments[0];
      else arg = arguments[0];
    }
    else { name = arguments[0]; arg = arguments[1];}
    var engine = new ButtEngine();
    engine._arg = arg;
    return JZZ.lib.registerMidiIn(name, engine);
  };

});
