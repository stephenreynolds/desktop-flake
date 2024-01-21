import { init } from './settings/setup.js';
import { forMonitors } from './utils.js';
import Variable from 'resource:///com/github/Aylur/ags/variable.js';
import Widget from 'resource:///com/github/Aylur/ags/widget.js';

const time = Variable('', {
    poll: [1000, function() {
        return Date().toString();
    }],
});

const Bar = (monitor = 0) => Widget.Window({
    monitor,
    name: `bar${monitor}`,
    anchor: ['top', 'left', 'right'],
    exclusivity: 'exclusive',
    child: Widget.CenterBox({
        start_widget: Widget.Label({
            hpack: 'center',
            label: 'Welcome to AGS!',
        }),
        end_widget: Widget.Label({
            hpack: 'center',
            label: time.bind()
        }),
    })
});

const windows = () => [
    forMonitors(Bar),
];

export default {
    onConfigParsed: init,
    windows: windows().flat(1),
    maxStreamVolume: 1.05,
};
