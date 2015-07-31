/**
 * Asynchronous form validation.
 * @author Derek Cuevas
 */

/**
 * TODOs:
 * - add getState / setState methods
 * - add getValues method
 *
 * - call lifeCycles (init) after reset
 * - find_or_add_status();
 */

(function () {
    'use strict';

    var root = typeof self === 'object' && self.self === self && self ||
        typeof global === 'object' && global.global === global && global ||
        this;

    var forEvery = function (obj, fn) {
        Object.keys(obj).forEach(function (key) {
            fn(key, obj[key]);
        });
    };

    var asyncForEvery = function (obj, fn, done) {
        var keys = Object.keys(obj);
        var count = 0;

        keys.forEach(function (key) {
            fn(key, obj[key], function () {
                count += 1;
                if (count === keys.length) {
                    done();
                }
            });
        });
    };

    var render = function (template, obj) {
        return template.replace(/\{\{(.+?)\}\}/g, function (placeholder, property) {
            var value = obj[property];
            if (value !== undefined && typeof value !== 'number') {
                return value.replace(/(<([^>]+)>)/ig, '');
            }
            return value;
        });
    };

    var fail = function (thing) {
        throw new Error(thing);
    };

    function Validation(options, spec) {
        options = options || {};
        options.templates = options.templates || {};

        if (!options.name) {
            fail('Error, form name needed.');
        }

        this.form = document.querySelector('form[name=' + options.name + ']');

        if (!this.form) {
            fail('Error, form not found, ' + options.name);
        }

        var on = options.on || 'input';
        var templateSuccess = options.templates.success || 'template.success';
        var templateError = options.templates.error || 'template.error';

        this.state = {};
        this.cache = {};
        this.lifeCycle = {};

        this.listeners = [];
        this.valid = false;

        this.on = on;

        this.templates = {
            success: document.querySelector(templateSuccess).innerHTML,
            error: document.querySelector(templateError).innerHTML,
            status: '<div class="status-message"></div>'
        };

        if (spec) {
            this.delegate(on, spec);
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
            this.notifyChange();

            lifeCycle.validator(input.value, function (valid, message) {
                this.state[name] = valid;
                this._showStatus(name, valid, message);

                if (valid && lifeCycle.whenValid) {
                    lifeCycle.whenValid(input.value);
                } else if (!valid && lifeCycle.whenInvalid) {
                    lifeCycle.whenInvalid(input.value);
                }
            }.bind(this));
        }.bind(this));
    };

    Validation.prototype.delegate = function (spec) {
        forEvery(spec, function (name, lifeCycle) {
            var input = this.form.querySelector('[name=' + name + ']');

            this.cache[name] = input;
            this.state[name] = false;
            this.lifeCycle[name] = lifeCycle;

            input.setAttribute('autocomplete', 'off');
            
            this._initLifeCycle(name, this.on);
        }.bind(this));
    };

    Validation.prototype.reset = function () {
        forEvery(this.state, function (name) {
            this.resetInput(name);
        }.bind(this));
    };

    Validation.prototype.resetInput = function (name) {
        var input = this.cache[name];
        var status = input.parentNode.querySelector('.status-message');

        this.state[name] = false;
        input.classList.remove('success', 'error');
        status.innerHTML = '';
    };

    Validation.prototype.isValid = function () {
        var allValid = true;

        forEvery(this.state, function (name, valid) {
            if (!valid) {
                allValid = false;
            }
        });
        return allValid;
    };

    Validation.prototype.validateAll = function (callback) {
        var allValid = true;
        var cb = callback || function () {};

        asyncForEvery(this.state, function (name, state, done) {
            var input = this.cache[name];
            var validator = this.lifeCycle[name].validator;

            validator(input.value, function (valid, message) {
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

    Validation.prototype.addListener = function (listener) {
        this.listeners.push(listener);
    };

    Validation.prototype.notifyChange = function () {
        this.listeners.forEach(function (listener) {
            listener(this.state);
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

}());
