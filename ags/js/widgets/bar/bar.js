import Gtk from 'gi://Gtk';
import Variable from 'resource:///com/github/Aylur/ags/variable.js';
import Widget from 'resource:///com/github/Aylur/ags/widget.js';
import options from '../../options.js';
import RightSpace from './rightSpace.js';

const time = Variable('', {
    poll: [1000, function() {
        return Date().toString();
    }],
});

/** @param {number} monitor */
export default async (monitor = 0) => {
    const barContent = Widget.CenterBox({
        className: 'bar-bg',
        startWidget: Widget.Label({
            hpack: 'start',
            label: 'Welcome to AGS!',
        }),
        endWidget: RightSpace(monitor),
    });

    return Widget.Window({
        monitor,
        name: `bar-${monitor}`,
        exclusivity: 'exclusive',
        anchor: options.bar.position.bind('value').transform(pos => ([
            pos, 'left', 'right'
        ])),
        visible: options.bar.showOnAllMonitors.bind('value').transform(v => {
            return v || monitor === options.primaryMonitor.value;
        }),
        child: barContent,
    });
};
