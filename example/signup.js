/**
 * aysnc form validation example
 * a basic signup form, the validation includes a GET to the server,
 * to check if the username entered is available
 */
'use strict';

var $ = require('jquery');
var Validation = require('../Validation.js');

/**
 * cache some DOM nodes
 */
var $signup = $('form[name=signup]');
var $status = $('.status');
var $user = $signup.find('[name=username]');

/**
 * define some functions
 */
function is_empty(value) {
    return value.trim().length === 0;
}

function valid_pass(password) {
    return /^\w{4,20}$/i.test(password);
}

function title_case(name) {
    return name.replace(/\w\S*/g, function (str) {
        return str.charAt(0).toUpperCase() + str.substr(1).toLowerCase();
    });
}

function set_maximum_frequency(freq, fn, except) {
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

/**
 * create a new form validator instance for the signup form
 */
var signup = new Validation({
    name: 'signup',
    on: 'change',
    templates: {
        success: 'template.success',
        error: 'template.error'
    }
});

signup.addListener(function (state) {
    console.log(state);
});

signup.delegate({
    name: {
        init: function (input) {
            input.focus();
        },
        validator: function (name, callback) {
            var valid = !is_empty(name);
            var message = valid ? 'Full name ok.' : 'Full name required.';
            callback(valid, message);
        },
        transform: function (name) {

            //probably not the best idea, but just to show you can
            return title_case(name);
        }
    },
    username: {
        init: function (input) {
            console.log('Init username:', input);
        },
        validator: set_maximum_frequency(200, function (username, callback) {
            $.get('/available', {username: username}, function (available) {
                callback(available, available ? 
                    'Username available.' : 
                    'Sorry, username taken.');
            });
        }, function (username, callback) {
            if (is_empty(username) || username === '@') {
                callback(false, 'Username required.');
                return true;
            }
        }),
        whenValid: function (username) {
            console.log('Username valid:', username);
        },
        whenInvalid: function (username) {
            console.log('Username invalid:', username);
        },
        transform: function (username) {
            if (username.indexOf('@') !== 0) {
                return '@' + username;
            }
            return username;
        }
    },
    password_one: {
        validator: function (password, callback) {
            var valid = valid_pass(password);
            callback(valid, valid ? 'Password ok.' : 'Password invalid.');
        }
    },
    password_two: {
        validator: (function () {
            var $password_one = $signup.find('[name=password_one]');

            return function (password, callback) {
                var password_one = $password_one.val();

                if (!valid_pass(password)) {
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

function send_form() {
    $.post('/signup', $signup.serialize(), function () {
        var user = $user.val();
        var icon = '<i class="fa fa-smile-o"></i> ';

        $status
            .hide()
            .html(icon + 'Thank you for signing up, ' + user + '.')
            .fadeIn()
            .fadeOut(5000);

        signup.reset();
        $signup[0].reset();
    });
}

/**
 * add a submit handler
 */
$signup.on('submit', function (e) {
    e.preventDefault();

    signup.validateAll(function (valid) {
        if (valid) {
            send_form();
        }
    });
});

$signup.on('reset', function () {
    signup.reset();
});
