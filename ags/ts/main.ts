import GLib from 'gi://GLib';
import Bar from 'widgets/bar/Bar';
import Notifications from 'widgets/Notifications';
import ActionCenter from 'widgets/actionCenter/ActionCenter';
import Launcher from 'widgets/Launcher';
import { forMonitors, config } from 'utils';
import { init } from 'settings/setup';
import options from 'options';

const windows = () => [
    forMonitors(Bar),
    Notifications(options.primaryMonitor.value),
    ActionCenter(),
    Launcher(),
];

const CLOSE_ANIM_TIME = 130;

export default config({
    onConfigParsed: init,
    closeWindowDelay: {
        'action-center': CLOSE_ANIM_TIME,
        'launcher': CLOSE_ANIM_TIME,
    },
    windows: windows().flat(1),
    stackTraceOnError: GLib.getenv('AGS_DEBUG'),
});
