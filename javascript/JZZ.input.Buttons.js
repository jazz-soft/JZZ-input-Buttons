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
    port._resume();
  };

  JZZ.input.Buttons = function() {
    var name, arg;
    if (arguments.length == 1) {
      if (typeof arguments[0] === 'string') name = arguments[0];
      else arg = arguments[0];
    }
    else { name = arguments[0]; arg = arguments[1];}
    var _Engine = new ButtEngine();
    _Engine._arg = arg;
    return JZZ.lib.openMidiIn(name, _Engine);
  };

  JZZ.input.Buttons.version = function() { return _version; };

  JZZ.input.Buttons.register = function() {
    var name, arg;
    if (arguments.length == 1) {
      if (typeof arguments[0] === 'string') name = arguments[0];
      else arg = arguments[0];
    }
    else { name = arguments[0]; arg = arguments[1];}
    var _Engine = new ButtEngine();
    _Engine._arg = arg;
    return JZZ.lib.registerMidiIn(name, _Engine);
  };

});
