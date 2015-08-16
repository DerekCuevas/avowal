(function () {
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
            init: function (email) {
                email.focus();
            },
            validate: function (email, cb) {
                var valid = email.trim().length !== 0;
                var msg = valid ? 'Email looks good.' : 'Your email is required.';
                cb(valid, msg);
            }
        },
        password: {
            validate: function (password, cb) {
                var valid = password.trim().length !== 0;
                var msg = valid ? 'Password looks good.' : 'Your password is required.';
                cb(valid, msg);
            }
        }
    });

    basic.onSubmit(function (e) {
        e.preventDefault();

        basic.validateAll(function (valid) {
            if (valid) {
                console.log('Valid Submission.');
                basic.reset(true);
            }
        });
    });

    basic.onReset(function () {
        basic.reset(true);
    });
}());
