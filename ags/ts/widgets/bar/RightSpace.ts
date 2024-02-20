import App from 'resource:///com/github/Aylur/ags/app.js';
import Widget from 'resource:///com/github/Aylur/ags/widget.js';
import SystemIndicators from './SystemIndicators';
import Tray from './Tray';
import NotificationIndicator from './NotificationIndicator';
import Clock from './Clock';
import options from 'options';
import { type Widget } from 'types/widgets/widget';

const ifPrimaryMonitor = (monitor: number, widget: () => Widget) =>
    options.primaryMonitor.value === monitor ? widget() : null;

export default (monitor: number) => {
    const tray = ifPrimaryMonitor(monitor, Tray);
    const systemIndicators = ifPrimaryMonitor(monitor, SystemIndicators);
    const notificationIndicator = ifPrimaryMonitor(monitor, NotificationIndicator);
    const clock = Clock();

    return Widget.Box({
        className: 'bar-space spacing-h-15',
        hpack: 'end',
        children: [
            tray,
            systemIndicators,
            Widget.Button({
                className: 'bar-button',
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
                }, 'window-toggled'),
            }),
        ],
    });
};
