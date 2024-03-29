import Widget from 'resource:///com/github/Aylur/ags/widget.js';
import Clock from 'widgets/misc/Clock';
import options from 'options';

export default () => Widget.Box({
    className: 'text text-semibold',
    css: 'font-size: 0.8rem;',
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

