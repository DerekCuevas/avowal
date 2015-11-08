/**
 * Avowal - small async form validation framework
 * @author Derek Cuevas
 */

(function () {
    'use strict';

    var root = this;

    function forEvery(obj, fun) {
        Object.keys(obj).forEach(function (key) {
            fun(key, obj[key]);
        });
    }

    function asyncForEvery(obj, fun, done) {
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
    }

    function render(template, obj) {
        return template.replace(/\{\{(.+?)\}\}/g, function (_, prop) {
            return obj[prop];
        });
    }

    function fail(thing) {
        throw new Error('Avowal Error => ' + thing);
    }

    function Avowal(options) {
        var opts = options || {};
        opts.templates = opts.templates || {};

        if (!opts.name) {
            fail('Form name attribute needed.');
        }

        this.form = document.querySelector('form[name=' + opts.name + ']');
        if (!this.form) {
            fail('Form "' + opts.name + '" not found.');
        }

        this.state = {};
        this.cache = {};
        this.lifeCycle = {};

        this.listeners = [];
        this.validateOn = opts.on || 'submit';

        this.templates = {
            success: options.templates.success || '',
            error: options.templates.error || '',
        };
    }

    Avowal.prototype._showStatus = function (name, valid, message) {
        var input = this.cache[name];
        var status = input.parentNode.querySelector('.status-message');
        var template = valid ? this.templates.success : this.templates.error;

        if (!message) {
            return;
        }

        input.classList.remove('success', 'error');
        input.classList.add(valid ? 'success' : 'error');

        status.innerHTML = render(template, {
            status: message,
        });
    };

    Avowal.prototype._validate = function (name) {
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

    Avowal.prototype._initLifeCycle = function (name, on) {
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

    Avowal.prototype.delegate = function (spec) {
        forEvery(spec, function (name, lifeCycle) {
            var input = this.form.querySelector('[name=' + name + ']');
            var on = lifeCycle.on ? lifeCycle.on : this.validateOn;

            if (!input) {
                fail('Input "' + name + '" not found in form "' + this.form.name + '".');
            }

            if (!lifeCycle.validate) {
                fail('Missing "validate" method on input "' + name + '".');
            }

            this.cache[name] = input;
            this.state[name] = false;
            this.lifeCycle[name] = lifeCycle;

            input.setAttribute('autocomplete', 'off');
            this._initLifeCycle(name, on);
        }.bind(this));
    };

    Avowal.prototype.reset = function (clear) {
        forEvery(this.state, function (name) {
            this.resetInput(name, clear);
        }.bind(this));
    };

    Avowal.prototype.resetInput = function (name, clear) {
        var input = this.cache[name];
        var lifeCycle = this.lifeCycle[name];
        var status = input.parentNode.querySelector('.status-message');

        if (clear) {
            input.value = '';
        }

        if (lifeCycle.init) {
            lifeCycle.init(this.cache[name]);
        }

        this.state[name] = false;
        input.classList.remove('success', 'error');
        status.innerHTML = '';
        this._notifyChange();
    };

    Avowal.prototype.isValid = function () {
        var allValid = true;

        forEvery(this.state, function (_, valid) {
            if (!valid) {
                allValid = false;
            }
        });
        return allValid;
    };

    Avowal.prototype.validateAll = function (callback) {
        var allValid = true;
        var cb = callback || function () {};

        asyncForEvery(this.state, function (name, _, done) {
            var input = this.cache[name];
            var lifeCycle = this.lifeCycle[name];

            lifeCycle.validate(input.value, function (valid, message) {
                this.state[name] = valid;
                this._showStatus(name, valid, message);

                if (!valid) {
                    allValid = false;
                }
                done();
            }.bind(this));

        }.bind(this), function () {
            cb(allValid);
        });
    };

    Avowal.prototype._notifyChange = function () {
        this.listeners.forEach(function (listener) {
            listener(this.state);
        }.bind(this));
    };

    Avowal.prototype.on = function (target, fun) {
        if (target === 'change') {
            this.listeners.push(fun);
        } else {
            this.form.addEventListener(target, fun);
        }
    };

    Avowal.prototype.values = function () {
        var vals = {};
        forEvery(this.cache, function (name, input) {
            vals[name] = input.value;
        });
        return vals;
    };

    Avowal.prototype.setValues = function (values) {
        forEvery(this.cache, function (name, input) {
            if (!values[name]) {
                return;
            }
            input.value = values[name];
            this._validate(name);
        }.bind(this));
    };

    Avowal.prototype.getState = function () {
        return this.state;
    };

    // (CommonJS)
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = Avowal;
    // included directly via <script> tag
    } else {
        root.Avowal = Avowal;
    }

}).call(this);
