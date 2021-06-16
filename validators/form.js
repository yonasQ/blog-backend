const { check } = require('express-validator')

exports.contactFormValidator = [
    check('name')
        .not()
        .isEmpty()
        .withMessage('Name is required'),
    check('email')
        .isEmail()
        .withMessage('Must be a valid email adress'),
    check('message')
        .isLength({ min: 15 })
        .withMessage('Message must be atleast 15 characters long'),
];