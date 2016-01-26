'use strict';

var asyncForm = new Avowal({
    name: 'async',
    on: 'submit',
    templates: {
        success: document.querySelector('template.success').innerHTML,
        error: document.querySelector('template.error').innerHTML,
    },
});

function rand() {
    return Math.ceil(Math.random() * 5000);
}

asyncForm.delegate({
    step1: {
        init: function (input) {
            input.focus();
        },
        validate: function (val, cb) {
            var timeout = rand();
            var spinner = document.getElementById('step1-spinner');
            spinner.style.display = 'inline';

            setTimeout(function () {
                spinner.style.display = 'none';
                cb(true, 'valid after ' + (timeout / 1000) + ' seconds!');
            }, timeout);
        },
    },
    step2: {
        validate: function (val, cb) {
            var timeout = rand();
            var spinner = document.getElementById('step2-spinner');
            spinner.style.display = 'inline';

            setTimeout(function () {
                spinner.style.display = 'none';
                cb(true, 'valid after ' + (timeout / 1000) + ' seconds!');
            }, timeout);
        },
    },
    step3: {
        validate: function (val, cb) {
            var timeout = rand();
            var spinner = document.getElementById('step3-spinner');
            spinner.style.display = 'inline';

            setTimeout(function () {
                spinner.style.display = 'none';
                cb(true, 'valid after ' + (timeout / 1000) + ' seconds!');
            }, timeout);
        },
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

    // might be a good idea to disable the submit/reset buttons while validating
    asyncForm.validateAll(function (valid) {
        if (valid) {
            status.innerHTML = check + ' Only now would the form send.';
        }
    });
});
