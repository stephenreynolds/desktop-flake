import Widget from 'resource:///com/github/Aylur/ags/widget.js';
import Notifications from 'resource:///com/github/Aylur/ags/service/notifications.js';

export default () => Widget.Label({
    className: 'text text-xl icon-material',
    vpack: 'center',
    setup: (self) => self
        .hook(Notifications, (self) => {
            if (Notifications.dnd) {
                self.label = 'notifications_paused';
            }
            else if (Notifications.notifications.length === 0) {
                self.label = 'notifications';
            }
            else {
                self.label = 'notifications_unread';
                self.toggleClassName('text-primary', true);
                return;
            }

            self.toggleClassName('text-primary', false);
        })
});
