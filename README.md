# Avowal
Super lightweight zero dependency optionally asynchronous JavaScript form validation framework (phew!).

A lot of JavaScript form validation frameworks aim to validate any and every possible set of input data. For example, all types of numeric input (ranges, phone numbers), string input (email addresses), ect.

This framework does not take that approach, rather it aims at separating common form based events (input, blur, change, submit, ...) from functions that validate input data along with functions to process side effects on that data.

An arbitrary number of form inputs can be validated that require asynchronous validation (ex. AJAX) while avoiding race conditions and callback hell.

The API is 100% js based, DOM attributes are not used to validate data. There is support for rendering validation messages against form inputs with templates (see examples).

More documentation can be found in the doc/ directory. Work in Progress (see Todo).

## Setup
Clone or 'npm install' this repository.

```sh
git clone https://github.com/DerekCuevas/avowal.git
```

```sh
npm install --save git+https://github.com/DerekCuevas/avowal.git
```

Require with commonJS (browserify) or include directly via a script tag.

```javascript
var Avowal = require('Avowal');
```

```html
<script src="Avowal.js"></script>
```

## Using it

Create a Avowal instance. It makes sense to name the instance the same as the form.

```javascript
var particle = new Avowal({

    // The name attribute of the form as specified by  <form name='particle' ... ></form>.
    name: 'particle',

    // The validation event (common: 'input', 'blur', 'change', ...).
    on: 'input',

    // 'handlebars like' HTML templates to be rendered against each input.
    // These will render in a div with class name of 'status-message' closest to the input.
    // (this might change sometime in the future...)
    templates: {
        success: '<p class="success">{{status}}</p>',
        error: '<p class="error">{{status}}</p>',
    },
});
```

## Add a delegate

The delegate function accepts a specification object that describes the form and how to validate it. The specification object's top level keys map to input name attributes in the form.

```javascript
particle.delegate({
    color: {/* life cycle object for the 'color' input */},
    radius: {/* life cycle object for the 'radius' input */},
    ...
});
```

## The life cycle object

Each input can specify a life cycle object, the bare minimum life cycle object will include the validate method only. Below is a bare minimum life cycle object.

```javascript
color: {

    // The only required life cycle method, 'validate' accepts two parameters,
    // the current value of the input and a callback function.
    // The callback accepts two required values, a boolean (valid / invalid) and
    // a message to be rendered in one of your templates under the input.
    // If valid == true, the success template will be rendered. If valid == false
    // the error template will be rendered.
    // Must return the state of the value with the callback as show below.
    validate: function (val, cb) {
        cb(true, 'The hex color looks valid.');
    },
}
```

A complete life cycle object with all possible life cycle events specified.

```javascript
color: {

    // A form input event to validate on. (input, blur, change, ...)
    // For consistency use the constructors options.on value instead.
    on: '',

    // Called just before any events are bound to the input,
    // the input DOM ref is passed in as an argument.
    init: function (input) {...},

    // The main validation function (documented above).
    validate: function (val, cb) {...},

    // called whenever validate returns true
    whenValid: function (val) {...},

    // called whenever validate returns false
    whenInvalid: function (val) {...},

    // transforms the value to the returned value as the user types
    // fires on 'input' event
    transform: function (val) {...}
}
```
## Top level API (Documentation in progress)

delegate
```javascript
// Delegates control of a form to the validator. The spec object's keys
// correspond to the name attributes of the form's inputs. The
// values are the life cycle objects for the matched inputs.
Avowal.prototype.delegate = function (spec) {...}
```

reset
```javascript
// resets the state of the form
Avowal.prototype.reset = function (clear) {...}
```

resetInput
```javascript
Avowal.prototype.resetInput = function (name) {...}
```

isValid
```javascript
Avowal.prototype.isValid = function () {...}
```

validateAll
```javascript
Avowal.prototype.validateAll = function (callback) {...}
```

on
```javascript
Avowal.prototype.on = function (target, fun) {...}
```

values
```javascript
Avowal.prototype.values = function () {...}
```

setValues
```javascript
Avowal.prototype.setValues = function (values)
```

## Examples
Examples can be found in /examples. There are two examples, a particle editor (/particle) and a sign up form (/signup).

## To do
- [x] documentation work
- [ ] make rendering templates optional?
- [ ] better status-message support / cache status-message ref (re-work this)
- [ ] add getState / setState methods
