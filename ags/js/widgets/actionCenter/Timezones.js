import Widget from 'resource:///com/github/Aylur/ags/widget.js';
import GLib from 'gi://GLib';
import { localTime, utcTime } from '../misc/Clock.js';
import options from '../../options.js';

function getDayString(time) {
    const localTime = GLib.DateTime.new_now_local();
    let differenceInDays = time.get_day_of_year() - localTime.get_day_of_year();
    let dayString = 'Today';
    if (differenceInDays > 0) {
        dayString = 'Tomorrow';
    }
    else if (differenceInDays < 0) {
        dayString = 'Yesterday';
    }
    return dayString;
}

export default () => Widget.Box({
    className: 'sidebar-group-invisible',
    spacing: 20,
    homogeneous: true,
    children: [
        Widget.Label({
            className: 'tz-local',
            hpack: 'start',
            label: localTime.bind('value').transform(time => time.format(options.locale.timeFormat.value)),
        }),
        Widget.Box({
            spacing: 20,
            children: [
                Widget.Box({
                    vertical: true,
                    hexpand: true,
                    children: [
                        Widget.Label({
                            className: 'tz-label',
                            label: 'UTC',
                            xalign: 0,
                        }),
                        Widget.Label({
                            className: 'tz-label',
                            label: 'Japan',
                            xalign: 0,
                        }),
                    ],
                }),
                Widget.Box({
                    vertical: true,
                    children: [
                        Widget.Label({
                            className: 'tz-utc',
                            xalign: 1,
                            label: utcTime.bind('value').transform(time => `${time.format(options.locale.timeFormat.value)} ${getDayString(time)}`),
                        }),
                        Widget.Label({
                            className: 'tz-jst',
                            xalign: 1,
                            setup: (self) => self
                                .poll(1000, (self => {
                                    const time = GLib.DateTime.new_now(GLib.TimeZone.new('Asia/Tokyo'));
                                    const timeString = `${time.format(options.locale.timeFormat.value)} ${getDayString(time)}`;
                                    self.label = timeString;
                                }))
                        }),
                    ],
                }),
            ],
        }),
    ],
});
