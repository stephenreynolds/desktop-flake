import Widget from 'resource:///com/github/Aylur/ags/widget.js';
import Tray from './tray.js';
import Clock from '../misc/clock.js';
import options from '../../options.js';

/** @type {number} monitor */
export default (monitor) => {
    const tray = monitor === options.primaryMonitor.value ? Tray() : null;

    const clock = Widget.Box({
        className: 'text-sm',
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

    return Widget.Box({
        children: [
            Widget.Box({ hexpand: true }),
            tray,
            clock,
        ],
    });
};
