(function () {
    'use strict';

    var validateSize = function (size, min, max, name) {
        var ret = {};

        if (!size) {
            ret.valid = false;
            ret.message = 'The ' + name + ' is required.';
        } else if (size <= min) {
            ret.valid = false;
            ret.message = 'The ' + name + ' must be greater than zero.';
        } else if (size >= max) {
            ret.valid = false;
            ret.message = 'The ' + name + ' must be less than the current window size.';
        } else {
            ret.valid = true;
            ret.message = 'The ' + name + ' looks good.';
        }
        return ret;
    };

    var particle = new Validation({
        name: 'basic',
        on: 'input',
        templates: {
            success: 'template.success',
            error: 'template.error'
        }
    });

    particle.delegate({
        color: {
            init: function (input) {
                input.focus();
            },
            validate: function (color, callback) {
                var valid = /^#[0-9a-f]{3}(?:[0-9a-f]{3})?$/i.test(color);

                if (color.length === 0) {
                    callback(false, 'The color is required.');
                } else if (!valid) {
                    callback(false, 'The color entered is an invalid hex color.');
                } else {
                    callback(true, 'The color looks good, valid hex color.');
                }
            }
        },
        radius: {
            validate: function (radius, callback) {
                var valid = validateSize(radius, 0, document.width / 2, 'radius');
                callback(valid.valid, valid.message);
            }
        },
        x: {
            validate: function (x, callback) {
                var valid = validateSize(x, -1, document.width, 'x position');
                callback(valid.valid, valid.message);
            }
        },
        y: {
            validate: function (y, callback) {
                var valid = validateSize(y, -1, document.height, 'y position');
                callback(valid.valid, valid.message);
            }
        }
    });

    var pixelize = function (size) {
        return size + 'px';
    };

    var draw = function (p) {
        var newParticle = document.createElement('div');
        var particles = document.getElementById('particles');

        newParticle.style.position = 'absolute';
        newParticle.style.borderRadius = pixelize(p.radius);

        newParticle.style.width = pixelize(p.radius * 2);
        newParticle.style.height = pixelize(p.radius * 2);

        newParticle.style.top = pixelize(p.y);
        newParticle.style.left = pixelize(p.x);
        newParticle.style.background = p.color;

        particles.appendChild(newParticle);
    };

    particle.on('submit', function (e) {
        e.preventDefault();

        particle.validateAll(function (valid) {
            var p = particle.values();
            if (valid) {
                draw(p);
            }
        });
    });

    particle.on('reset', function () {
        particle.reset();
    });
}());
