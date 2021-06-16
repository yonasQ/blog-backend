const { check } = require('express-validator')

exports.createCatagoryValidator = [
    check('name')
        .not()
        .isEmpty()
        .withMessage('Name is required'),
];