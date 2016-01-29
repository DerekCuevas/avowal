'use strict';

var asyncForm = new Avowal({
    name: 'async',
    on: 'submit',
    templates: {
        success: document.querySelector('template.success').innerHTML,
        error: document.querySelector('template.error').innerHTML,
    },
});

function validate(step) {
    var spinner = document.getElementById(step + '-spinner');

    return function (_, callback) {
        var timeout = Math.ceil(Math.random() * 5000);

        spinner.style.display = 'inline';

        setTimeout(function () {
            spinner.style.display = 'none';
            callback(true, 'valid after ' + (timeout / 1000) + ' seconds!');
        }, timeout);
    };
}

asyncForm.delegate({
    step1: {
        init: function (input) {
            input.focus();
        },
        validate: validate('step1'),
    },
    step2: {
        validate: validate('step2'),
    },
    step3: {
        validate: validate('step3'),
    },
});

asyncForm.on('reset', function () {
    var status = document.getElementById('status');
    status.innerHTML = '';
    asyncForm.reset(true);
});

asyncForm.on('submit', function (e) {
    var status = document.getElementById('status');
    var check = '<i class="fa fa-check"></i>';
    e.preventDefault();

    // NOTE: it might be a good idea to disable the submit/reset buttons while validating
    asyncForm.validateAll(function (valid) {
        if (valid) {
            status.innerHTML = check + ' Only now would the form send.';
        }
    });
});
