import GLib from 'gi://GLib';
import Bar from './widgets/bar/bar.js';
import { forMonitors } from './utils.js';
import { init } from './settings/setup.js';

const windows = () => [
];

export default {
    onConfigParsed: init,
    windows: windows().flat(1),
    stackTraceOnError: GLib.getenv('AGS_DEBUG'),
};

forMonitors(Bar);
