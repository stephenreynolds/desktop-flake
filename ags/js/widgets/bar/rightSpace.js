import App from 'resource:///com/github/Aylur/ags/app.js';
import Widget from 'resource:///com/github/Aylur/ags/widget.js';
import Indicators from './indicators.js';
import Tray from './tray.js';
import Clock from '../misc/clock.js';
import options from '../../options.js';

/** @type {number} monitor */
export default (monitor) => {
    const tray = options.primaryMonitor.value === monitor ? Tray() : null;
    const indicators = options.primaryMonitor.value === monitor ? Indicators() : null;

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
        className: 'spacing-h-15',
        children: [
            Widget.Box({ hexpand: true }),
            tray,
            indicators,
            Widget.Button({
                onPrimaryClick: () => App.toggleWindow('action-center'),
                child: clock,
            }),
        ],
    });
};
