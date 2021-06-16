const { check } = require('express-validator')

exports.usersignupValidator = [
    check('name')
        .not()
        .isEmpty()
        .withMessage('Name is required'),
    check('email')
        .isEmail()
        .withMessage('Must be a valid email adress'),
    check('password')
        .isLength({ min: 6 })
        .withMessage('Password must be atleast 6 characters'),
];
exports.usersigninValidator = [
    check('email')
        .isEmail()
        .withMessage('Must be a valid email adress'),
    check('password')
        .isLength({ min: 6 })
        .withMessage('Password must be atleast 6 characters')
];
exports.forgotPasswordValidator = [
    check('email')
        .isEmail()
        .withMessage('Must be a valid email adress')
];
exports.resetPasswordValidator = [
    check('newPassword')
        .isLength({ min: 6 })
        .withMessage('Password must be atleast 6 characters')
];