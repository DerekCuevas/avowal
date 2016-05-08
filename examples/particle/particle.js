/**
 * Basic form validation example.
 * Particle Editor.
 *
 * @author Derek Cuevas
 */

(function () {
  'use strict';

  var particles = document.getElementById('particles');
  var preview;

  var particle = new Avowal({
    name: 'particle',
    on: 'input',
    templates: {
      success: document.querySelector('template.success').innerHTML,
      error: document.querySelector('template.error').innerHTML
    }
  });

  function validateSize(size, min, max, name) {
    var ret = {};

    if (!size) {
      ret.valid = false;
      ret.message = 'The ' + name + ' is required.';
    } else if (size <= min) {
      ret.valid = false;
      ret.message = 'The ' + name + ' must be greater than ' + min + 'px.';
    } else if (size >= max) {
      ret.valid = false;
      ret.message = 'The ' + name + ' must be less than ' + max + 'px.';
    } else {
      ret.valid = true;
      ret.message = 'The ' + name + ' looks good.';
    }
    return ret;
  }

  particle.delegate({
    color: {
      init: function (input) {
        input.focus();

        // using the lifecycle object to cache DOM nodes
        this.input = input;
        this.colorPreview = document.getElementById('color-preview');

        this.input.style.width = '100%';
        this.colorPreview.style.display = 'none';
      },
      validate: function (color, callback) {
        var valid = /^#[0-9a-f]{3}(?:[0-9a-f]{3})?$/i.test(color);

        if (color.length === 0) {
          callback(false, 'The color is required.');
        } else if (!valid) {
          callback(false, 'The color entered is an invalid hex color.');
        } else {
          callback(true, 'The color looks good.');
        }
      },
      whenValid: function (color) {
        this.input.style.width = '85%';
        this.colorPreview.style.display = 'inline';
        this.colorPreview.style.backgroundColor = color;
      },
      whenInvalid: function () {
        this.input.style.width = '100%';
        this.colorPreview.style.display = 'none';
      },
      transform: function (color) {
        if (color.length === 0) {
          return color;
        }
        if (color.indexOf('#') !== 0) {
          return '#' + color;
        }
        return color;
      }
    },
    radius: {
      validate: function (radius, callback) {
        var valid = validateSize(radius, 0, window.innerWidth / 2, 'radius');
        callback(valid.valid, valid.message);
      }
    },
    x: {
      validate: function (x, callback) {
        var valid = validateSize(x, 0, window.innerWidth, 'x position');
        callback(valid.valid, valid.message);
      }
    },
    y: {
      validate: function (y, callback) {
        var valid = validateSize(y, 0, window.innerHeight, 'y position');
        callback(valid.valid, valid.message);
      }
    }
  });

  function pixelize(size) {
    return size + 'px';
  }

  function draw(p) {
    var newParticle = document.createElement('div');

    newParticle.style.position = 'absolute';
    newParticle.style.borderRadius = pixelize(p.radius);

    newParticle.style.width = pixelize(p.radius * 2);
    newParticle.style.height = pixelize(p.radius * 2);

    newParticle.style.left = pixelize(p.x);
    newParticle.style.top = pixelize(p.y);
    newParticle.style.background = p.color;

    particles.appendChild(newParticle);
    return newParticle;
  }

  particle.on('input', function () {
    if (particle.isValid()) {
      if (preview) {
        particles.removeChild(preview);
      }
      preview = draw(particle.getValues());
    }
  });

  particle.on('submit', function (e) {
    e.preventDefault();

    particle.validateAll(function (valid) {
      if (valid) {
        draw(particle.getValues());
        particle.reset(true);
      }
    });
  });

  particle.on('reset', function () {
    if (preview) {
      particles.removeChild(preview);
      preview = undefined;
    }
    particle.reset();
  });
}());
