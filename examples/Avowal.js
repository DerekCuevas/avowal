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

    function fail(message) {
        throw new Error('Avowal, ' + message);
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

        this._state = {};
        this._cache = {};
        this._lifecycle = {};

        this.templates = {
            success: options.templates.success || '',
            error: options.templates.error || '',
        };

        this._initEventDelegation(opts.on || 'input');
    }

    Avowal.prototype._initEventDelegation = function (on) {
        this.form.addEventListener(on, function (e) {
            var name = e.target.name;
            if (this._state.hasOwnProperty(name)) {
                this._validate(name);
            }
        }.bind(this));
    };

    Avowal.prototype._showStatus = function (name, valid, message) {
        var input = this._cache[name];
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
        var lifecycle = this._lifecycle[name];
        var value = this._cache[name].value;

        lifecycle.validate(value, function (valid, message) {
            this._state[name] = valid;
            this._showStatus(name, valid, message);

            if (valid && lifecycle.whenValid) {
                lifecycle.whenValid(value);
            } else if (!valid && lifecycle.whenInvalid) {
                lifecycle.whenInvalid(value);
            }
        }.bind(this));
    };

    Avowal.prototype._initLifecycle = function (name) {
        var lifecycle = this._lifecycle[name];
        var input = this._cache[name];

        if (lifecycle.init) {
            lifecycle.init(input);
        }

        if (lifecycle.transform) {
            input.addEventListener('input', function () {
                input.value = lifecycle.transform(input.value);
            });
        }
    };

    Avowal.prototype.delegate = function (spec) {
        forEvery(spec, function (name, lifecycle) {
            var input = this.form.querySelector('[name=' + name + ']');

            if (!input) {
                fail('Input "' + name + '" not found in form "' + this.form.name + '".');
            }

            if (!lifecycle.validate) {
                fail('Missing "validate" method on input "' + name + '", ' + 'in form "' + this.form.name + '".');
            }

            this._cache[name] = input;
            this._state[name] = false;
            this._lifecycle[name] = lifecycle;

            this._initLifecycle(name);
        }.bind(this));
    };

    Avowal.prototype.reset = function (clear) {
        forEvery(this._state, function (name) {
            this.resetInput(name, clear);
        }.bind(this));
    };

    Avowal.prototype.resetInput = function (name, clear) {
        var input = this._cache[name];
        var lifecycle = this._lifecycle[name];
        var status = input.parentNode.querySelector('.status-message');

        if (clear) {
            input.value = '';
        }

        if (lifecycle.init) {
            lifecycle.init(this._cache[name]);
        }

        this._state[name] = false;
        input.classList.remove('success', 'error');
        status.innerHTML = '';
    };

    Avowal.prototype.isValid = function () {
        var allValid = true;

        forEvery(this._state, function (_, valid) {
            if (!valid) {
                allValid = false;
            }
        });
        return allValid;
    };

    Avowal.prototype.validateAll = function (callback) {
        var allValid = true;
        var cb = callback || function () {};

        asyncForEvery(this._state, function (name, _, done) {
            var input = this._cache[name];
            var lifecycle = this._lifecycle[name];

            lifecycle.validate(input.value, function (valid, message) {
                this._state[name] = valid;
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

    Avowal.prototype.on = function (event, fun) {
        this.form.addEventListener(event, fun);
    };

    Avowal.prototype.getValues = function () {
        var values = {};
        forEvery(this._cache, function (name, input) {
            values[name] = input.value;
        });
        return values;
    };

    Avowal.prototype.setValues = function (values, validate) {
        forEvery(this._cache, function (name, input) {
            if (!values[name]) {
                return;
            }
            input.value = values[name];
            if (validate) {
                this._validate(name);
            }
        }.bind(this));
    };

    Avowal.prototype.getState = function () {
        return this._state;
    };

    // (CommonJS)
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = Avowal;
    // included directly via <script> tag
    } else {
        root.Avowal = Avowal;
    }

}).call(this);
