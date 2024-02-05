import Variable from 'resource:///com/github/Aylur/ags/variable.js';
import Widget from 'resource:///com/github/Aylur/ags/widget.js';
import options from '../options.js';
import Clock from './Clock.js';

const Bar = () => Widget.CenterBox({
    className: 'bar-bg',
    startWidget: Widget.Label({
        hpack: 'start',
        label: 'Welcome to AGS!',
    }),
    endWidget: Widget.Box({
        hpack: 'end',
        children: [
            Clock(),
        ]
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
