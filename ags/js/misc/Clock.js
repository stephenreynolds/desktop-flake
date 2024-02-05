import GLib from 'gi://GLib';
import Variable from 'resource:///com/github/Aylur/ags/variable.js';
import Widget from 'resource:///com/github/Aylur/ags/widget.js';

const clock = Variable(GLib.DateTime.new_now_local(), {
    poll: [1000, () => GLib.DateTime.new_now_local()],
});

/**
 * @param {import('types/widgets/label').Props & {
 *   format?: string,
 *   interval?: number,
 * }} o
 */
export default ({
    format = '%-I:%M %p %a %b %e',
    ...rest
} = {}) => Widget.Label({
    className: 'clock',
    label: clock.bind('value').transform(time => {
        return time.format(format) || 'invalid format';
    }),
    ...rest,
});
