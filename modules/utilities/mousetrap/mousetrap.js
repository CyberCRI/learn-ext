/* eslint semi:0 */
/**
 * Copyright 2012-2017 Craig Campbell
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * Mousetrap is a simple keyboard shortcut library for Javascript with
 * no external dependencies
 *
 * @version 1.6.3
 * @url craig.is/killing/mice
 */

import KeyMap from './keymap'

/**
 * takes the event and returns the key character
 *
 * @param {Event} e
 * @return {string}
 */
function _characterFromEvent(e) {
  // for keypress events we should return the character as is
  if (e.type === 'keypress') {
    var character = String.fromCharCode(e.which);

    // if the shift key is not pressed then it is safe to assume
    // that we want the character to be lowercase.  this means if
    // you accidentally have caps lock on then your key bindings
    // will continue to work
    //
    // the only side effect that might not be desired is if you
    // bind something like 'A' cause you want to trigger an
    // event when capital A is pressed caps lock will no longer
    // trigger the event.  shift+a will though.
    if (!e.shiftKey) {
      character = character.toLowerCase();
    }

    return character;
  }

  // for non keypress events the special maps are needed
  if (KeyMap.KEYS[e.which]) {
    return KeyMap.KEYS[e.which];
  }

  if (KeyMap.SYMBOLS[e.which]) {
    return KeyMap.SYMBOLS[e.which];
  }

  // if it is not in the special map
  // with keydown and keyup events the character seems to always
  // come in as an uppercase character whether you are pressing shift
  // or not.  we should make sure it is always lowercase for comparisons
  return String.fromCharCode(e.which).toLowerCase();
}

/**
 * checks if two arrays are equal
 *
 * @param {Array} modifiers1
 * @param {Array} modifiers2
 * @returns {boolean}
 */
function _modifiersMatch(modifiers1, modifiers2) {
  return modifiers1.sort().join(',') === modifiers2.sort().join(',');
}

function _isModifier(key) {
  return key === 'shift' || key === 'ctrl' || key === 'alt' || key === 'meta';
}

/**
 * Gets info for a specific key combination
 *
 * @param  {string} combination key combination ("command+s" or "a" or "*")
 * @param  {string=} action
 * @returns {Object}
 */
function _getKeyInfo(combination, action) {
  let keys, key
  let modifiers = [];

  // take the keys from this pattern and figure out what the actual
  // pattern is all about
  keys = combination === '+'
    ? ['+']
    : combination.replace(/\+{2}/g, '+plus').split('+');

  for (let i = 0; i < keys.length; ++i) {
    key = keys[i];

    // normalize key names
    if (KeyMap.ALIASES[key]) {
      key = KeyMap.ALIASES[key];
    }

    // if this is not a keypress event then we should
    // be smart about using shift keys
    // this will only work for US keyboards however
    if (action && action !== 'keypress' && KeyMap.SHIFTED[key]) {
      key = KeyMap.SHIFTED[key];
      modifiers.push('shift');
    }

    // if this key is a modifier then add it to the list of modifiers
    if (_isModifier(key)) {
      modifiers.push(key);
    }
  }

  // depending on what the key combination is
  // we will try to pick the best event for it
  if (!action) {
    action = KeyMap.KEYS_R[key] ? 'keydown' : 'keypress';
  } else if (action === 'keypress' && modifiers.length) {
    // modifier keys don't work as expected with keypress,
    // switch to keydown
    action = 'keydown'
  }

  return {
    key: key,
    modifiers: modifiers,
    action: action,
  };
}

function _belongsTo(element, ancestor) {
  if (element === null || element === document) {
    return false
  }

  if (element === ancestor) {
    return true
  }

  return _belongsTo(element.parentNode, ancestor)
}

function Mousetrap(targetElement) {
  const self = this

  targetElement = targetElement || document;

  if (!(self instanceof Mousetrap)) {
    return new Mousetrap(targetElement);
  }

  self.target = targetElement;
  self._callbacks = {};

  /**
   * direct map of string combinations to callbacks used for trigger()
   */
  self._directMap = {};

  /**
   * keeps track of what level each sequence is at since multiple
   * sequences can start out with the same sequence
   */
  let _sequenceLevels = {};

  /**
   * variable to store the setTimeout call
   */
  let _resetTimer;
  // temporary state where we will ignore the next keyup
  let _ignoreNextKeyup = false;
  // temporary state where we will ignore the next keypress
  let _ignoreNextKeypress = false;
  // are we currently inside of a sequence? if so return an action
  let _nextExpectedAction = false;

  /**
   * resets all sequence counters except for the ones passed in
   */
  function _resetSequences(doNotReset) {
    doNotReset = doNotReset || {};

    let activeSequences = false

    for (let key in _sequenceLevels) {
      if (doNotReset[key]) {
        activeSequences = true;
        continue;
      }
      _sequenceLevels[key] = 0;
    }

    if (!activeSequences) {
      _nextExpectedAction = false;
    }
  }

  /**
   * finds all callbacks that match based on the keycode, modifiers,
   * and action
   *
   * @param {string} character
   * @param {Array} modifiers
   * @param {Event|Object} e
   * @param {string=} sequenceName - name of the sequence we are looking for
   * @param {string=} combination
   * @param {number=} level
   * @returns {Array}
   */
  function _getMatches(character, modifiers, e, sequenceName, combination, level) {
    let callback;
    let matches = [];
    let action = e.type;

    // if there are no events related to this keycode
    if (!self._callbacks[character]) {
      return [];
    }

    // if a modifier key is coming up on its own we should allow it
    if (action === 'keyup' && _isModifier(character)) {
      modifiers = [character];
    }

    // loop through all callbacks for the key that was pressed
    // and see if any of them match
    for (let i = 0; i < self._callbacks[character].length; ++i) {
      callback = self._callbacks[character][i];

      // if a sequence name is not specified, but this is a sequence at
      // the wrong level then move onto the next match
      if (!sequenceName && callback.seq && _sequenceLevels[callback.seq] != callback.level) {
        continue;
      }

      // if the action we are looking for doesn't match the action we got
      // then we should keep going
      if (action != callback.action) {
        continue;
      }

      // if this is a keypress event and the meta key and control key
      // are not pressed that means that we need to only look at the
      // character, otherwise check the modifiers as well
      //
      // chrome will not fire a keypress if meta or control is down
      // safari will fire a keypress if meta or meta+shift is down
      // firefox will fire a keypress if meta or control is down
      if ((action === 'keypress' && !e.metaKey && !e.ctrlKey) || _modifiersMatch(modifiers, callback.modifiers)) {

        // when you bind a combination or sequence a second time it
        // should overwrite the first one.  if a sequenceName or
        // combination is specified in this call it does just that
        //
        // @todo make deleting its own method?
        const deleteCombo = !sequenceName && callback.combo == combination;
        const deleteSequence = sequenceName && callback.seq == sequenceName && callback.level == level;
        if (deleteCombo || deleteSequence) {
          self._callbacks[character].splice(i, 1);
        }

        matches.push(callback);
      }
    }

    return matches;
  }

  /**
   * actually calls the callback function
   *
   * if your callback function returns false this will use the jquery
   * convention - prevent default and stop propogation on the event
   */
  function _fireCallback(callback, e, combo, sequence) {

    // if this event should not happen stop here
    if (self.stopCallback(e, e.target || e.srcElement, combo, sequence)) {
      return;
    }

    if (callback(e, combo) === false) {
      e.preventDefault();
      if (self.paused) {
        return true;
      }
      e.stopPropagation();
    }
  }

  /**
   * handles a character key event
   */
  self._handleKey = function(character, modifiers, e) {
    const callbacks = _getMatches(character, modifiers, e);
    let doNotReset = {};
    let maxLevel = 0;
    let processedSequenceCallback = false;

    // Calculate the maxLevel for sequences so we can only execute the longest callback sequence
    for (let i = 0; i < callbacks.length; ++i) {
      if (callbacks[i].seq) {
        maxLevel = Math.max(maxLevel, callbacks[i].level);
      }
    }

    // loop through matching callbacks for this key event
    for (let i = 0; i < callbacks.length; ++i) {

      // fire for all sequence callbacks
      // this is because if for example you have multiple sequences
      // bound such as "g i" and "g t" they both need to fire the
      // callback for matching g cause otherwise you can only ever
      // match the first one
      if (callbacks[i].seq) {

        // only fire callbacks for the maxLevel to prevent
        // subsequences from also firing
        //
        // for example 'a option b' should not cause 'option b' to fire
        // even though 'option b' is part of the other sequence
        //
        // any sequences that do not match here will be discarded
        // below by the _resetSequences call
        if (callbacks[i].level != maxLevel) {
          continue;
        }

        processedSequenceCallback = true;

        // keep a list of which sequences were matches for later
        doNotReset[callbacks[i].seq] = 1;
        _fireCallback(callbacks[i].callback, e, callbacks[i].combo, callbacks[i].seq);
        continue;
      }

      // if there were no sequence matches but we are still here
      // that means this is a regular match so we should fire that
      if (!processedSequenceCallback) {
        _fireCallback(callbacks[i].callback, e, callbacks[i].combo);
      }
    }

    // if the key you pressed matches the type of sequence without
    // being a modifier (ie "keyup" or "keypress") then we should
    // reset all sequences that were not matched by this event
    //
    // this is so, for example, if you have the sequence "h a t" and you
    // type "h e a r t" it does not match.  in this case the "e" will
    // cause the sequence to reset
    //
    // modifier keys are ignored because you can have a sequence
    // that contains modifiers such as "enter ctrl+space" and in most
    // cases the modifier key will be pressed before the next key
    //
    // also if you have a sequence such as "ctrl+b a" then pressing the
    // "b" key will trigger a "keypress" and a "keydown"
    //
    // the "keydown" is expected when there is a modifier, but the
    // "keypress" ends up matching the _nextExpectedAction since it occurs
    // after and that causes the sequence to reset
    //
    // we ignore keypresses in a sequence that directly follow a keydown
    // for the same character
    const ignoreThisKeypress = e.type === 'keypress' && _ignoreNextKeypress;
    if (e.type == _nextExpectedAction && !_isModifier(character) && !ignoreThisKeypress) {
      _resetSequences(doNotReset);
    }

    _ignoreNextKeypress = processedSequenceCallback && e.type === 'keydown';
  };

  /**
   * handles a keydown event
   *
   * @param {Event} e
   * @returns void
   */
  function _handleKeyEvent(e) {

    // normalize e.which for key events
    // @see http://stackoverflow.com/questions/4285627/javascript-keycode-vs-charcode-utter-confusion
    if (typeof e.which !== 'number') {
      e.which = e.keyCode;
    }

    let character = _characterFromEvent(e);

    // no character found then stop
    if (!character) {
      return;
    }

    // need to use === for the character check because the character can be 0
    if (e.type === 'keyup' && _ignoreNextKeyup === character) {
      _ignoreNextKeyup = false;
      return;
    }

    const modifiers = [
      e.shiftKey && 'shift',
      e.altKey && 'alt',
      e.ctrlKey && 'ctrl',
      e.metaKey && 'meta',
    ].filter((v) => !!v)

    self.handleKey(character, modifiers, e);
  }

  /**
   * called to set a 1 second timeout on the specified sequence
   *
   * this is so after each key press in the sequence you have 1 second
   * to press the next key before you have to start over
   *
   * @returns void
   */
  function _resetSequenceTimer() {
    clearTimeout(_resetTimer);
    _resetTimer = setTimeout(_resetSequences, 1000);
  }

  /**
   * binds a key sequence to an event
   *
   * @param {string} combo - combo specified in bind call
   * @param {Array} keys
   * @param {Function} callback
   * @param {string=} action
   * @returns void
   */
  function _bindSequence(combo, keys, callback, action) {

    // start off by adding a sequence level record for this combination
    // and setting the level to 0
    _sequenceLevels[combo] = 0;

    /**
     * callback to increase the sequence level for this sequence and reset
     * all other sequences that were active
     *
     * @param {string} nextAction
     * @returns {Function}
     */
    function _increaseSequence(nextAction) {
      return function() {
        _nextExpectedAction = nextAction;
        ++_sequenceLevels[combo];
        _resetSequenceTimer();
      };
    }

    /**
     * wraps the specified callback inside of another function in order
     * to reset all sequence counters as soon as this sequence is done
     *
     * @param {Event} e
     * @returns void
     */
    function _callbackAndReset(e) {
      _fireCallback(callback, e, combo);

      // we should ignore the next key up if the action is key down
      // or keypress.  this is so if you finish a sequence and
      // release the key the final key will not trigger a keyup
      if (action !== 'keyup') {
        _ignoreNextKeyup = _characterFromEvent(e);
      }

      // weird race condition if a sequence ends with the key
      // another sequence begins with
      setTimeout(_resetSequences, 10);
    }

    // loop through keys one at a time and bind the appropriate callback
    // function.  for any key leading up to the final one it should
    // increase the sequence. after the final, it should reset all sequences
    //
    // if an action is specified in the original bind call then that will
    // be used throughout.  otherwise we will pass the action that the
    // next key in the sequence should match.  this allows a sequence
    // to mix and match keypress and keydown events depending on which
    // ones are better suited to the key provided
    for (let i = 0; i < keys.length; ++i) {
      const isFinal = i + 1 === keys.length;
      const wrappedCallback = isFinal ? _callbackAndReset : _increaseSequence(action || _getKeyInfo(keys[i + 1]).action);
      _bindSingle(keys[i], wrappedCallback, action, combo, i);
    }
  }

  /**
   * binds a single keyboard combination
   *
   * @param {string} combination
   * @param {Function} callback
   * @param {string=} action
   * @param {string=} sequenceName - name of sequence if part of sequence
   * @param {number=} level - what part of the sequence the command is
   * @returns void
   */
  function _bindSingle(combination, callback, action, sequenceName, level) {

    // store a direct mapped reference for use with Mousetrap.trigger
    self._directMap[combination + ':' + action] = callback;

    // make sure multiple spaces in a row become a single space
    combination = combination.replace(/\s+/g, ' ');

    const sequence = combination.split(' ');
    let info;

    // if this pattern is a sequence of keys then run through this method
    // to reprocess each pattern one key at a time
    if (sequence.length > 1) {
      _bindSequence(combination, sequence, callback, action);
      return;
    }

    info = _getKeyInfo(combination, action);

    // make sure to initialize array if this is the first time
    // a callback is added for this key
    self._callbacks[info.key] = self._callbacks[info.key] || [];

    // remove an existing match if there is one
    _getMatches(info.key, info.modifiers, {type: info.action}, sequenceName, combination, level);

    // add this call back to the array
    // if it is a sequence put it at the beginning
    // if not put it at the end
    //
    // this is important because the way these are processed expects
    // the sequence ones to come first
    self._callbacks[info.key][sequenceName ? 'unshift' : 'push']({
      callback: callback,
      modifiers: info.modifiers,
      action: info.action,
      seq: sequenceName,
      level: level,
      combo: combination,
    });
  }

  /**
   * binds multiple combinations to the same callback
   *
   * @param {Array} combinations
   * @param {Function} callback
   * @param {string|undefined} action
   * @returns void
   */
  self._bindMultiple = function(combinations, callback, action) {
    for (let i = 0; i < combinations.length; ++i) {
      _bindSingle(combinations[i], callback, action);
    }
  };

  // start!
  targetElement.addEventListener('keypress', _handleKeyEvent);
  targetElement.addEventListener('keydown', _handleKeyEvent);
  targetElement.addEventListener('keyup', _handleKeyEvent);
}

/**
 * binds an event to mousetrap
 *
 * can be a single key, a combination of keys separated with +,
 * an array of keys, or a sequence of keys separated by spaces
 *
 * be sure to list the modifier keys first to make sure that the
 * correct key ends up getting bound (the last key in the pattern)
 *
 * @param {string|Array} keys
 * @param {Function} callback
 * @param {string=} action - 'keypress', 'keydown', or 'keyup'
 * @returns void
 */
Mousetrap.prototype.bind = function(keys, callback, action) {
  const self = this;
  keys = keys instanceof Array ? keys : [keys];
  self._bindMultiple.call(self, keys, callback, action);
  return self;
};

/**
 * unbinds an event to mousetrap
 *
 * the unbinding sets the callback function of the specified key combo
 * to an empty function and deletes the corresponding key in the
 * _directMap dict.
 *
 * TODO: actually remove this from the _callbacks dictionary instead
 * of binding an empty function
 *
 * the keycombo+action has to be exactly the same as
 * it was defined in the bind method
 *
 * @param {string|Array} keys
 * @param {string} action
 * @returns void
 */
Mousetrap.prototype.unbind = function(keys, action) {
  const self = this;
  return self.bind.call(self, keys, function() {}, action);
};

/**
 * triggers an event that has already been bound
 *
 * @param {string} keys
 * @param {string=} action
 * @returns void
 */
Mousetrap.prototype.trigger = function(keys, action) {
  const self = this;
  if (self._directMap[keys + ':' + action]) {
    self._directMap[keys + ':' + action]({}, keys);
  }
  return self;
};

Mousetrap.prototype.pause = function() {
  const self = this
  self.paused = true
}

Mousetrap.prototype.unpause = function() {
  const self = this
  self.paused = false
}

/**
 * resets the library back to its initial state.  this is useful
 * if you want to clear out the current keyboard shortcuts and bind
 * new ones - for example if you switch to another page
 *
 * @returns void
 */
Mousetrap.prototype.reset = function() {
  const self = this;
  self._callbacks = {};
  self._directMap = {};
  return self;
};

/**
 * should we stop this event before firing off callbacks
 *
 * @param {Event} e
 * @param {Element} element
 * @return {boolean}
 */
Mousetrap.prototype.stopCallback = function(e, element) {
  const self = this;

  // if the element has the class "mousetrap" then no need to stop
  if ((' ' + element.className + ' ').indexOf(' mousetrap ') > -1) {
    return false;
  }

  if (_belongsTo(element, self.target)) {
    return false;
  }

  // Events originating from a shadow DOM are re-targetted and `e.target` is the shadow host,
  // not the initial event target in the shadow tree. Note that not all events cross the
  // shadow boundary.
  // For shadow trees with `mode: 'open'`, the initial event target is the first element in
  // the event’s composed path. For shadow trees with `mode: 'closed'`, the initial event
  // target cannot be obtained.
  if ('composedPath' in e && typeof e.composedPath === 'function') {
    // For open shadow trees, update `element` so that the following check works.
    var initialEventTarget = e.composedPath()[0];
    if (initialEventTarget !== e.target) {
      element = initialEventTarget;
    }
  }

  // stop for input, select, and textarea
  return element.tagName == 'INPUT' || element.tagName == 'SELECT' || element.tagName == 'TEXTAREA' || element.isContentEditable;
};

/**
 * exposes _handleKey publicly so it can be overwritten by extensions
 */
Mousetrap.prototype.handleKey = function() {
  const self = this;
  return self._handleKey.apply(self, arguments);
};

/**
 * Init the global mousetrap functions
 *
 * This method is needed to allow the global mousetrap functions to work
 * now that mousetrap is a constructor function.
 */
Mousetrap.init = function() {
  let documentMousetrap = Mousetrap(document);
  for (let method in documentMousetrap) {
    if (method.charAt(0) !== '_') {
      Mousetrap[method] = (function(method) {
        return function() {
          return documentMousetrap[method].apply(documentMousetrap, arguments);
        };
      } (method));
    }
  }
};

export default Mousetrap
