# Documentation
A guide to using the form validation.

## Using it

Create a Validation instance. It makes sense to name the instance the same as the form.

```javascript
var particle = new Validation({

    // The name of the form as specified by <form name='' ... ></form>.
    name: 'particle',

    // The validation event (common: 'input', 'blur', 'change', ...).
    on: 'input',

    // Location (css selector) of handlebars like HTML templates to be rendered
    // against each input. These will render in a div with class
    // name of 'status-message' closest to the input.
    templates: {
        success: 'template.success',
        error: 'template.error'
    }
});
```

## Add a delegate

The delegate function accepts a specification object that describes the form and how to validate it. The specification object's top level keys map to input names in the form.

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

    // Called just before any events are bound to the input,
    // the input DOM ref is passed in as an argument.
    init: function (input) {...},

    // The main validation function (documented above).
    validate: function (val, cb) {...},

    // called when the input's state changes to valid
    whenValid: function (val) {...},

    // called when the input's state changes to invalid
    whenInvalid: function (val) {...},

    // transforms the value to the returned value as the user types
    // fires on 'input' event
    transform: function (val) {...}
}
```
## Validation methods (Documentation in progress)

delegate
```javascript
// Delegates control of a form to the validator. The spec object's keys 
// correspond to the name attributes of the form's inputs. The 
// values are the life cycle objects for the matched inputs.

// ex.
// var spec = {name: {/*lifeCycle*/}, age: {/*lifecycle*/}}
Validation.prototype.delegate = function (spec) {...}
```

reset
```javascript
// resets the state of the form
Validation.prototype.reset = function (clear) {...}
```

resetInput
```javascript
Validation.prototype.resetInput = function (name) {...}
```

isValid
```javascript
Validation.prototype.isValid = function () {...}
```

validateAll
```javascript
Validation.prototype.validateAll = function (callback) {...}
```

on
```javascript
Validation.prototype.on = function (target, fun) {...}
```

values
```javascript
Validation.prototype.values = function () {...}
```

setValues
```javascript
Validation.prototype.setValues = function (values)
```
