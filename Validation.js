/**
 * Asynchronous form validation.
 * @author Derek Cuevas
 */

/**
 * TODOs:
 * - documentation work
 *
 * - better status-message support / cache ref (re-work this)
 * - add getState / setState methods
 *
 * Not Happy about:
 * - lack of private vars / methods
 * - binding this to everything
 */

(function () {
    'use strict';

    var root = this;

    var forEvery = function (obj, fun) {
        Object.keys(obj).forEach(function (key) {
            fun(key, obj[key]);
        });
    };

    var asyncForEvery = function (obj, fun, done) {
        var keys = Object.keys(obj);
        var count = 0;

        keys.forEach(function (key) {
            fun(key, obj[key], function () {
                count += 1;
                if (count === keys.length) {
                    done();
                }
            });
        });
    };

    var render = function (template, obj) {
        return template.replace(/\{\{(.+?)\}\}/g, function (_, prop) {
            return obj[prop];
        });
    };

    var fail = function (thing) {
        throw new Error("Validation Error: " + thing);
    };

    function Validation(options, spec) {
        options = options || {};
        options.templates = options.templates || {};

        if (!options.name) {
            fail('Form name needed.');
        }

        this.form = document.querySelector('form[name=' + options.name + ']');
        if (!this.form) {
            fail('Form "' + options.name + '" not found.');
        }

        this.state = {};
        this.cache = {};
        this.lifeCycle = {};
        this.listeners = [];
        this.validateOn = options.on || 'submit';

        this.templates = {
            success: options.templates.success || '',
            error: options.templates.error || ''
        };

        if (spec) {
            this.delegate(spec);
        }
    }

    Validation.prototype._showStatus = function (name, valid, message) {
        var input = this.cache[name];
        var status = input.parentNode.querySelector('.status-message');

        input.classList.remove('success', 'error');
        input.classList.add(valid ? 'success' : 'error');

        status.innerHTML = render(valid ? this.templates.success : this.templates.error, {
            status: message
        });
    };

    Validation.prototype._validate = function (name) {
        var lifeCycle = this.lifeCycle[name];
        var input = this.cache[name];

        lifeCycle.validate(input.value, function (valid, message) {
            this.state[name] = valid;
            this._showStatus(name, valid, message);
            this._notifyChange();

            if (valid && lifeCycle.whenValid) {
                lifeCycle.whenValid(input.value);
            } else if (!valid && lifeCycle.whenInvalid) {
                lifeCycle.whenInvalid(input.value);
            }
        }.bind(this));
    };

    Validation.prototype._initLifeCycle = function (name, on) {
        var lifeCycle = this.lifeCycle[name];
        var input = this.cache[name];

        if (lifeCycle.init) {
            lifeCycle.init(input);
        }

        if (lifeCycle.transform) {
            input.addEventListener('input', function () {
                input.value = lifeCycle.transform(input.value);
            });
        }

        input.addEventListener(on, function () {
            this._validate(name);
        }.bind(this));
    };

    Validation.prototype.delegate = function (spec) {
        forEvery(spec, function (name, lifeCycle) {
            var input = this.form.querySelector('[name=' + name + ']');

            if (!input) {
                fail('Input "' + name + '" not found.');
            }

            this.cache[name] = input;
            this.state[name] = false;
            this.lifeCycle[name] = lifeCycle;

            input.setAttribute('autocomplete', 'off');

            this._initLifeCycle(name, this.validateOn);
        }.bind(this));
    };

    Validation.prototype.reset = function (clear) {
        forEvery(this.state, function (name) {
            this.resetInput(name, clear);
        }.bind(this));
    };

    Validation.prototype.resetInput = function (name, clear) {
        var input = this.cache[name];
        var lifeCycle = this.lifeCycle[name];
        var status = input.parentNode.querySelector('.status-message');

        if (clear) {
            input.value = "";
        }

        if (lifeCycle.init) {
            lifeCycle.init(this.cache[name]);
        }

        this.state[name] = false;
        input.classList.remove('success', 'error');
        status.innerHTML = '';
        this._notifyChange();
    };

    Validation.prototype.isValid = function () {
        var allValid = true;

        forEvery(this.state, function (_, valid) {
            if (!valid) {
                allValid = false;
            }
        });
        return allValid;
    };

    Validation.prototype.validateAll = function (callback) {
        var allValid = true;
        var cb = callback || function () {};

        asyncForEvery(this.state, function (name, _, done) {
            var input = this.cache[name];
            var lifeCycle = this.lifeCycle[name];

            lifeCycle.validate(input.value, function (valid, message) {
                this.state[name] = valid;

                if (!valid) {
                    allValid = false;
                }

                this._showStatus(name, valid, message);
                done();
            }.bind(this));

        }.bind(this), function () {
            cb(allValid);
        });
    };

    Validation.prototype._notifyChange = function () {
        this.listeners.forEach(function (listener) {
            listener(this.state);
        }.bind(this));
    };

    Validation.prototype.on = function (target, fun) {
        if (target === 'change') {
            this.listeners.push(fun);
        } else {
            this.form.addEventListener(target, fun);
        }
    };

    Validation.prototype.values = function () {
        var vals = {};
        forEvery(this.cache, function (name, input) {
            vals[name] = input.value;
        });
        return vals;
    };

    Validation.prototype.setValues = function (values) {
        forEvery(this.cache, function (name, input) {
            if (!values[name]) {
                return;
            }
            input.value = values[name];
            this._validate(name);
        }.bind(this));
    };

    // Node.js (CommonJS)
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = Validation;
    }
    // included directly via <script> tag
    else {
        root.Validation = Validation;
    }

}).call(this);
