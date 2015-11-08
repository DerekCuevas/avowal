'use strict';

var async = new Avowal({
    name: 'async',
    on: 'submit',
    templates: {
        success: document.querySelector('template.success').innerHTML,
        error: document.querySelector('template.error').innerHTML,
    },
});

async.delegate({
    step1: {
        init: function (input) {
            input.focus();
        },
        validate: function (val, cb) {
            var spinner = document.getElementById('step1-spinner');
            spinner.style.display = 'inline';

            setTimeout(function () {
                spinner.style.display = 'none';
                cb(true, 'valid after one second!');
            }, 1000);
        },
    },
    step2: {
        validate: function (val, cb) {
            var spinner = document.getElementById('step2-spinner');
            spinner.style.display = 'inline';

            setTimeout(function () {
                spinner.style.display = 'none';
                cb(true, 'valid after four seconds!');
            }, 4000);
        },
    },
    step3: {
        validate: function (val, cb) {
            var spinner = document.getElementById('step3-spinner');
            spinner.style.display = 'inline';

            setTimeout(function () {
                spinner.style.display = 'none';
                cb(true, 'valid after two seconds!');
            }, 2000);
        },
    },
});

async.on('reset', function () {
    var status = document.getElementById('status');
    status.innerHTML = '';
    async.reset(true);
});

async.on('submit', function (e) {
    var status = document.getElementById('status');
    var check = '<i class="fa fa-check"></i>';
    e.preventDefault();

    async.validateAll(function (valid) {
        if (valid) {
            status.innerHTML = check + ' Only now does the form send.';
        }
    });
});
