import App from 'resource:///com/github/Aylur/ags/app.js';
import Widget from 'resource:///com/github/Aylur/ags/widget.js';
import SystemIndicators from './systemIndicators.js';
import Tray from './tray.js';
import NotificationIndicator from './notificationIndicator.js';
import Clock from './clock.js';
import options from '../../options.js';

/** @type {number} monitor */
export default (monitor) => {
    const tray = options.primaryMonitor.value === monitor ? Tray() : null;
    const systemIndicators = options.primaryMonitor.value === monitor ? SystemIndicators() : null;
    const notificationIndicator = options.primaryMonitor.value === monitor ? NotificationIndicator() : null;
    const clock = Clock();

    return Widget.Box({
        className: 'spacing-h-15',
        children: [
            Widget.Box({ hexpand: true }),
            tray,
            systemIndicators,
            Widget.Button({
                onPrimaryClick: () => App.toggleWindow('action-center'),
                child: Widget.Box({
                    className: 'spacing-h-5',
                    children: [
                        clock,
                        notificationIndicator,
                    ],
                }),
            }),
        ],
    });
};
