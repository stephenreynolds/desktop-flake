import Widget from 'resource:///com/github/Aylur/ags/widget.js';
import Clock from '../misc/Clock.js';
import options from '../../options.js';

export default () => Widget.Box({
    className: 'text text-sm',
    vertical: true,
    vpack: 'center',
    children: [
        Clock({
            format: options.locale.timeFormat.value,
            hpack: 'end',
        }),
        Clock({
            format: options.locale.dateFormat.value,
            hpack: 'end',
        }),
    ],
});

