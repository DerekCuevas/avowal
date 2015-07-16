(function () {
    var validation = {};

    // Establish the root object, `window` (`self`) in the browser, `global`
    // on the server, or `this` in some virtual machines. We use `self`
    // instead of `window` for `WebWorker` support.
    var root = typeof self === 'object' && self.self === self && self ||
            typeof global === 'object' && global.global === global && global ||
            this;

    /**
     * objects (forms and validators) store state of the validator
     */
    var forms = {};
    var validators = {};

    /**
     * the HTML templates to be rendered against the status of an input
     * the parent container for the messages is the status template
     * @type {Object}
     */
    var templates = {
        success: $('template.success').html(),
        error: $('template.error').html(),
        status: '<div class="status-message"></div>'
    };

    /**
     * very very simple handlebars like variable replacement,
     * renders props in obj against the template,
     * looks for vars enclosed in {{prop_name}}, removes any HTML tags from prop vals
     * 
     * @param  {String} template HTML template
     * @param  {Object} obj      object to render
     * @return {String}          the rendered HTMl
     */
    function render(template, obj) {
        return template.replace(/\{\{(.+?)\}\}/g, function (placeholder, property) {
            var value = obj[property];
            if (value !== undefined && typeof value !== 'number') {
                return value.replace(/(<([^>]+)>)/ig, '');
            }
            return value;
        });
    }

    /**
     * helper for enumerating Objects
     * 
     * @param  {Object}   obj the object to enumerate
     * @param  {Function} fn  function to invoke on each key/value pair
     */
    function for_every(obj, fn) {
        Object.keys(obj).forEach(function (key) {
            fn(key, obj[key]);
        });
    }

    /**
     * enumerates an Object asynchronously, applies fn to every key/value pair
     * calls the callback (donefn) when each pair has been enumerated
     * 
     * @param  {Object}   obj    the object to enumerate
     * @param  {Function} fn     function to invoke on each key/value pair
     * @param  {Function} donefn callback
     */
    function async_for_every(obj, fn, donefn) {
        var key_count = Object.keys(obj).length,
            finished_count = 0;

        for_every(obj, function (key, value) {
            fn(key, value, function () {
                finished_count += 1;
                if (finished_count === key_count) {
                    donefn();
                }
            });
        });
    }

    /**
     * returns a validator function to be associated with an input.
     * the function returned only checks if a value as been entered, 
     * no other validation is done
     * 
     * @param  {jquery Object} $input the input field targeted
     * @param  {Object} directive     the directive associated with each input
     * @return {undefined}
     */
    function make_required($input, directive) {
        var success = 'The ' + directive.name + ' field looks good.',
            error = 'The ' + directive.name + ' field is required.';

        return function (value, callback) {
            var valid = false;

            if ($input.is('input') || $input.is('textarea')) {
                valid = value.length !== 0;
            } else if ($input.is('select')) {
                valid = value !== $input.children().first().val();
            }
            callback(valid, valid ? success : error);
        };
    }

    /**
     * renders and displays the message under the input 
     * specified by form_name, input_name
     * 
     * @param  {String}  form_name  the name of the form targeted
     * @param  {String}  input_name the name of the form input targeted
     * @param  {Boolean} is_valid   status of the input
     * @param  {String}  message    the message to be rendered on the page
     * @return {underfined}
     */
    function show_status(form_name, input_name, is_valid, message) {
        var $form = $('form[name=' + form_name + ']'),
            $input = $form.find('[name=' + input_name + ']'),
            $status_message = $input.parent().find('.status-message'),
            status;

        $input.removeClass('success error');
        $input.addClass(is_valid ? 'success' : 'error');
        status = render(is_valid ? templates.success : templates.error, {
            status: message
        });
        $status_message.html(status);
    }

    /**
     * delegates control of a form to the validator
     * binds input events to the validator functions
     * 
     * @param  {String} form_name form name, as specified by <form name="...">...</form>
     * @param  {Object} spec      the specification object, expected that each key maps directly to a form input
     */
    validation.delegate = function (form_name, spec) {
        var $form = $('form[name=' + form_name + ']');

        forms[form_name] = {};
        validators[form_name] = {};

        for_every(spec, function (input_name, directive) {
            var $input = $form.find('[name=' + input_name + ']');

            $input.attr('autocomplete', 'off');

            // TODO: search for 'status-message div first' add if non-existent
            //$input.parent().append(templates.status);

            forms[form_name][input_name] = false;
            validators[form_name][input_name] = directive.validator || make_required($input, directive);

            $input.on('input', function () {
                var value = $input.val(),
                    validator = validators[form_name][input_name];

                validator(value, function (is_valid, message) {
                    forms[form_name][input_name] = is_valid;
                    show_status(form_name, input_name, is_valid, message);

                    if (is_valid && directive.when_valid) {
                        directive.when_valid(value);
                    } else if (!is_valid && directive.when_invalid) {
                        directive.when_invalid(value);
                    }
                });

                if (directive.transform) {
                    $input.val(directive.transform(value));
                }
            });
        });
    };

    /**
     * resets the state of the form validator for the specified form
     * @param  {String} form_name
     */
    validation.reset = function (form_name) {
        var $form = $('form[name=' + form_name + ']');

        for_every(forms[form_name], function (input_name) {
            var $input = $form.find('[name=' + input_name + ']'),
                $status_message = $input.parent().find('.status-message');

            forms[form_name][input_name] = false;
            $input.removeClass('success error');
            $status_message.html('');
        });
    };

    /**
     * resets an input specified by form_name, input_name
     * @param  {String} form_name
     * @param  {String} input_name
     */
    validation.reset_input = function (form_name, input_name) {
        var $input = $('form[name=' + form_name + ']').find('[name=' + input_name + ']'),
            $status_message = $input.parent().find('.status-message');

        forms[form_name][input_name] = false;
        $input.removeClass('success error');
        $status_message.html('');
    };

    /**
     * queries current state of form, does not validate inputs
     * @param  {String}  form_name
     * @return {Boolean} valid or invalid
     */
    validation.is_valid = function (form_name) {
        var valid = true;
        for_every(forms[form_name], function (input_name, input_valid) {
            if (!input_valid) {
                valid = false;
            }
        });
        return valid;
    };

    /**
     * validates all fields in the form
     * as a side effect, highlights all fields that are valid/invalid
     * this method does not invoke the when valid/invalid functions
     * 
     * @param  {String}   form_name name of the form to be validated
     * @param  {Function} callback  function called when done validating, status will be passed in 
     */
    validation.validate_all = function (form_name, callback) {
        var $form = $('form[name=' + form_name + ']'),
            valid = true,
            cb = callback || function () {
                return undefined;
            };

        async_for_every(validators[form_name], function (input_name, validator, done) {
            var $input = $form.find('[name=' + input_name + ']'),
                value = $.trim($input.val());

            validator(value, function (input_valid, message) {
                forms[form_name][input_name] = input_valid;

                if (!input_valid) {
                    valid = false;
                }

                //side effect
                show_status(form_name, input_name, input_valid, message);
                done();
            });
        }, function () {
            cb(valid);
        });
    };

    // Node.js
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = validation;
    }
    // AMD / RequireJS
    else if (typeof define !== 'undefined' && define.amd) {
        define([], function () {
            return validation;
        });
    }
    // included directly via <script> tag
    else {
        root.validation = validation;
    }
}());
