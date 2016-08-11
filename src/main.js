
import Sync from './shared/syncClient';
import {getTimeFunction} from './shared/utils';
import FastClick from 'fastclick';

require('scss/main.scss');

window.sync = new Sync(getTimeFunction);
FastClick.attach(document.body);

if (window.location.pathname.indexOf('input') !== -1) {
    require('./input').init();
} else {
    require('./mobile').init();
}
