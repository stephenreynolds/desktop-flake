import GLib from 'gi://GLib';
import Bar from './widgets/bar/bar.js';
import Notifications from './widgets/Notifications.js';
import ActionCenter from './widgets/actionCenter/ActionCenter.js';
import Launcher from './widgets/launcher/Launcher.js';
import { forMonitors } from './utils.js';
import { init } from './settings/setup.js';
import options from './options.js';

const windows = () => [
    Notifications(options.primaryMonitor.value),
    ActionCenter(),
    Launcher(),
];

const CLOSE_ANIM_TIME = 130;

export default {
    onConfigParsed: init,
    closeWindowDelay: {
        'action-center': CLOSE_ANIM_TIME,
        'launcher': CLOSE_ANIM_TIME,
    },
    windows: windows().flat(1),
    stackTraceOnError: GLib.getenv('AGS_DEBUG'),
};

forMonitors(Bar);
