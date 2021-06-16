'use strict'

const capital = e => {
    return e = e.charAt(0).toUpperCase() + e.slice(1)
}
const uniqueMessage = error => {
    let output;
    try {
        output = Object.keys(error.keyValue)

        output += ' already exists';

    } catch (ex) {
        output = 'Unique field already exists';
    }
    return output
};
exports.errorHandler = error => {
    let message = '';
    if (error.code) {
        switch (error.code) {
            case 11000:
            case 11001:
                message = capital(uniqueMessage(error))
                break;
            default:
                message: 'something went wrong'
        }
    } else {
        for (let errorName in error.errorors) {
            if (error.errorors[errorName].message) message = error.errorors[errorName].message;

        }
    }
    return message
}