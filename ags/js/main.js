import { init } from './settings/setup.js';
import { forMonitors } from './utils.js';
import Bar from './bar/Bar.js';

const windows = () => [
    forMonitors(Bar),
];

export default {
    onConfigParsed: init,
    windows: windows().flat(1),
    maxStreamVolume: 1.05,
};
