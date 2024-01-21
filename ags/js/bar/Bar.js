import Variable from 'resource:///com/github/Aylur/ags/variable.js';
import Widget from 'resource:///com/github/Aylur/ags/widget.js';
import options from '../options.js';

const time = Variable('', {
    poll: [1000, function() {
        return Date().toString();
    }],
});

const Bar = () => Widget.CenterBox({
        start_widget: Widget.Label({
            hpack: 'start',
            label: 'Welcome to AGS!',
        }),
        end_widget: Widget.Label({
            hpack: 'end',
            label: time.bind()
        }),
});

/** @param {number} monitor */
export default (monitor) => Widget.Window({
    name: `bar-${monitor}`,
    exclusivity: 'exclusive',
    monitor,
    anchor: options.bar.position.bind('value').transform(pos => ([
        pos, 'left', 'right'
    ])),
    visible: options.bar.showOnAllMonitors.bind('value').transform(v => {
        return v || monitor === options.primaryMonitor.value;
    }),
    child: Bar(),
});
