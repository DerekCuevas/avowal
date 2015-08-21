/**
 * Advanced Aysnc form validation example.
 * A sign up form, the validation includes a GET HTTP request to the server,
 * to check if the username entered is available.
 *
 * @author Derek Cuevas
 */
'use strict';

var $ = require('jquery');
var Validation = require('../../Validation.js');

var $signup = $('form[name=signup]');
var $status = $('.status');
var $user = $signup.find('[name=username]');

function isEmpty(value) {
    return value.trim().length === 0;
}

function validPass(password) {
    return /^\w{4,20}$/i.test(password);
}

function titleCase(name) {
    return name.replace(/\w\S*/g, function (str) {
        return str.charAt(0).toUpperCase() + str.substr(1).toLowerCase();
    });
}

function debounce(freq, fn, except) {
    var watch;
    return function () {
        var args = Array.prototype.slice.call(arguments);
        clearTimeout(watch);

        if (except && except.apply(null, args)) {
            return;
        }
        watch = setTimeout(function () {
            fn.apply(null, args);
        }, freq);
    };
}

var signup = new Validation({
    name: 'signup',
    on: 'input',
    templates: {
        success: 'template.success',
        error: 'template.error'
    }
});

signup.delegate({
    first: {
        init: function (input) {
            input.focus();
        },
        validate: function (first, callback) {
            var valid = !isEmpty(first);
            var message = valid ? 'First name ok' : 'First name required.';
            callback(valid, message);
        },
        transform: function (first) {

            //probably not the best idea, but just to show you can
            return titleCase(first);
        }
    },
    last: {
        validate: function (last, callback) {
            var valid = !isEmpty(last);
            var message = valid ? 'Last name ok.' : 'Last name required.';
            callback(valid, message);
        },
        transform: function (last) {
            return titleCase(last);
        }
    },
    username: {

        // using a closure to cache the DOM
        validate: (function () {
            var $spinner = $('.username-spinner');

            return debounce(200, function (username, callback) {
                $spinner.show();

                $.get('/available', {username: username}, function (available) {
                    $spinner.hide();
                    callback(available, available ? 
                        'Username available.' : 
                        'Sorry, username taken.');
                });
            }, function (username, callback) {
                if (isEmpty(username) || username === '@') {
                    callback(false, 'Username required.');
                    return true;
                }
            });
        }()),
        transform: function (username) {
            if (username.indexOf('@') !== 0) {
                return '@' + username;
            }
            return username;
        }
    },
    password_one: {
        validate: function (password, callback) {
            var valid = validPass(password);
            callback(valid, valid ? 'Password ok.' : 'Password invalid.');
        }
    },
    password_two: {
        validate: (function () {
            var $password_one = $signup.find('[name=password_one]');

            return function (password, callback) {
                var password_one = $password_one.val();

                if (!validPass(password)) {
                    callback(false, 'Password invalid.');
                } else if (password_one !== password) {
                    callback(false, 'Password mismatch.');
                } else {
                    callback(true, 'Password match.');
                }
            };
        }())
    }
});

function send() {
    $.post('/signup', signup.values(), function () {
        var user = $user.val();
        var icon = '<i class="fa fa-smile-o"></i> ';

        $status
            .hide()
            .html(icon + 'Thank you for signing up, ' + user + '.')
            .fadeIn()
            .fadeOut(4000);

        signup.reset(true);
    });
}

signup.on('submit', function (e) {
    e.preventDefault();

    signup.validateAll(function (valid) {
        if (valid) {
            send();
        }
    });
});

signup.on('reset', function () {
    signup.reset();
});
