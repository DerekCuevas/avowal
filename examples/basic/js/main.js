(function () {
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
                cb(true, 'Email: ' + email + ' is valid.');
            }
        },
        password: {
            validate: function (password, cb) {
                cb(true, 'Password: ' + password + ' is valid.');
            }
        }
    });

    basic.onSubmit(function (e) {
        e.preventDefault();

        if (basic.isValid()) {
            console.log('Valid Submission.');
            basic.reset(true);
        }
    });

    basic.onReset(function () {
        basic.reset();
    });
}());
