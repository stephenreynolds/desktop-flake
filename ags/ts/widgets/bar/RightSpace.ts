import App from 'resource:///com/github/Aylur/ags/app.js';
import Widget from 'resource:///com/github/Aylur/ags/widget.js';
import SystemIndicators from './SystemIndicators';
import Tray from './Tray';
import NotificationIndicator from './NotificationIndicator';
import Clock from './Clock';
import options from 'options';

export default (monitor: number) => {
    const tray = options.primaryMonitor.value === monitor ? Tray() : null;
    const systemIndicators = options.primaryMonitor.value === monitor ? SystemIndicators() : null;
    const notificationIndicator = options.primaryMonitor.value === monitor ? NotificationIndicator() : null;
    const clock = Clock();

    return Widget.Box({
        className: 'bar-space spacing-h-15',
        hpack: 'end',
        children: [
            tray,
            systemIndicators,
            Widget.Button({
                className: 'action-center-button',
                onPrimaryClick: () => App.toggleWindow('action-center'),
                child: Widget.Box({
                    className: 'spacing-h-5',
                    children: [
                        clock,
                        notificationIndicator,
                    ],
                }),
                setup: (self) => self.hook(App, (self, currentName, visible) => {
                    if (currentName === 'action-center') {
                        self.toggleClassName('action-center-button-active', visible);
                    }
                })
            }),
        ],
    });
};
