import GLib from 'gi://GLib';
import Bar from './widgets/bar/bar.js';
import Notifications from './widgets/Notifications.js';
import { forMonitors } from './utils.js';
import { init } from './settings/setup.js';
import options from './options.js';

const windows = () => [
    Notifications(options.primaryMonitor.value),
];

export default {
    onConfigParsed: init,
    windows: windows().flat(1),
    stackTraceOnError: GLib.getenv('AGS_DEBUG'),
};

forMonitors(Bar);
