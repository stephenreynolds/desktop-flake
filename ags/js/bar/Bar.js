import Variable from 'resource:///com/github/Aylur/ags/variable.js';
import Widget from 'resource:///com/github/Aylur/ags/widget.js';

const time = Variable('', {
    poll: [1000, function() {
        return Date().toString();
    }],
});

const Bar = () => Widget.CenterBox({
        start_widget: Widget.Label({
            hpack: 'center',
            label: 'Welcome to AGS!',
        }),
        end_widget: Widget.Label({
            hpack: 'center',
            label: time.bind()
        }),
});

export default (monitor = 0) => Widget.Window({
    monitor,
    name: `bar-${monitor}`,
    anchor: ['top', 'left', 'right'],
    exclusivity: 'exclusive',
    child: Bar(),
});
