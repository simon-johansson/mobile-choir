
require("scss/main.scss")

const FastClick = require('fastclick');
FastClick.attach(document.body);

if (window.location.pathname.indexOf('input') !== -1) {
    require('./input');
} else {
    require('./output');
}
