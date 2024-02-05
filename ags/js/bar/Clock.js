import Widget from 'resource:///com/github/Aylur/ags/widget.js';
import Clock from "../misc/Clock.js";

export default () => Widget.Box({
    className: 'bar-clock',
    vertical: true,
    children: [
        Clock({ format: '%-I:%M %p', hpack: 'end' }),
        Clock({ format: '%a %b %-e', hpack: 'end' }),
    ]
});
