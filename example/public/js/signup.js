$(function () {
    var $signup = $('form[name=signup]');
    var $status = $('.status');

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

    function make_timedout_validator(delay, validator, except) {
        var timeout;

        return function () {
            var args = Array.prototype.slice.call(arguments);
            clearTimeout(timeout);

            if (except && except.apply(this, args)) {
                return;
            }

            timeout = setTimeout(function () {
                validator.apply(this, args);
            }, delay);
        };
    }

    validation.delegate('signup', {
        name: {
            validator: function (name, callback) {
                var valid = !is_empty(name);
                var message = valid ? 'Full name ok.' : 'Full name required.';
                callback(valid, message);
            },
            transform: function (name) {
                return title_case(name);
            }
        },
        username: {
            validator: make_timedout_validator(200, function (username, callback) {
                $.get('/available', {username: username}, function (available) {
                    callback(available, available ? 'Username available.' : 'Sorry, username taken.');
                });
            }, function (username, callback) {
                if (is_empty(username) || username === '@') {
                    callback(false, 'Username required.');
                    return true;
                }
            }),
            transform: function (username) {
                if (username.indexOf('@') !== -1) {
                    return username;
                }
                return '@' + username;
            }
        },
        password_one: {
            validator: function (password, callback) {
                var valid = valid_pass(password);
                callback(valid, valid ? 'Password ok.' : 'Password too weak.');
            }
        },
        password_two: {
            validator: (function () {
                var $password_one = $signup.find('[name=password_one]');

                return function (password, callback) {
                    var password_one = $password_one.val();

                    if (!valid_pass(password)) {
                        callback(false, 'Password too weak.');
                    } else if (password_one !== password) {
                        callback(false, 'Password mismatch.');
                    } else {
                        callback(true, 'Password match.');
                    }
                };
            }())
        }
    });

    $signup.on('submit', function (e) {
        e.preventDefault();

        validation.validate_all('signup', function (valid) {
            if (valid) {
                $.post('/signup', $signup.serialize(), function () {
                    var user = $signup.find('[name=username]').val();
                    var icon = '<i class="fa fa-smile-o"></i> ';

                    $status
                        .hide()
                        .html(icon + 'Thank you for signing up, ' + user + '.')
                        .fadeIn()
                        .fadeOut(4000);

                    validation.reset('signup');
                    $signup[0].reset();
                    $signup.find('input')[0].focus();
                });
            }
        });
    });

    $signup.find('input')[0].focus();
});
