import GLib from 'gi://GLib';
import Variable from 'resource:///com/github/Aylur/ags/variable.js';
import Widget from 'resource:///com/github/Aylur/ags/widget.js';

export const localTime = Variable(GLib.DateTime.new_now_local(), {
    poll: [1000, () => GLib.DateTime.new_now_local()],
});

export const utcTime = Variable(GLib.DateTime.new_now_utc(), {
    poll: [1000, () => GLib.DateTime.new_now_utc()],
});

export default ({
    format = '%-I:%M %p %a %b %e',
    ...rest
} = {}) => Widget.Label({
    label: localTime.bind('value').transform(time => time.format(format) || 'invalid format'),
    ...rest,
});
