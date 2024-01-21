import Bar from './bar/Bar.js';
import GLib from 'gi://GLib';
import { init } from './settings/setup.js';
import { forMonitors } from './utils.js';

const windows = () => [
    forMonitors(Bar),
];

export default {
    onConfigParsed: init,
    windows: windows().flat(1),
    maxStreamVolume: 1.05,
    stackTraceOnError: GLib.getenv('AGS_DEBUG'),
};
