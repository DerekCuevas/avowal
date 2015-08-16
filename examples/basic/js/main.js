(function () {
    'use strict';

    // TODO: address
    var basic = new Validation({
        name: 'basic',
        on: 'input',
        templates: {
            success: 'template.success',
            error: 'template.error'
        }
    });

    basic.delegate({
        email: {
            init: function (input) {
                input.focus();
            },
            validate: function (email, callback) {
                var valid = email.trim().length !== 0;
                var msg = valid ? 'Email looks good.' : 'Your email is required.';
                callback(valid, msg);
            }
        },
        password: {
            validate: function (password, callback) {
                var valid = password.trim().length !== 0;
                var msg = valid ? 'Password looks good.' : 'Your password is required.';
                callback(valid, msg);
            }
        }
    });

    basic.on('change', function (state) {
        console.log(state);
    });

    basic.on('submit', function (e) {
        e.preventDefault();

        basic.validateAll(function (valid) {
            if (valid) {
                console.log('Valid Submission.');
                basic.reset(true);
            }
        });
    });

    basic.on('reset', function () {
        basic.reset();
    });
}());
