import Notifications from 'resource:///com/github/Aylur/ags/service/notifications.js';
import Widget from 'resource:///com/github/Aylur/ags/widget.js';
import Notification from 'widgets/misc/Notification';

const Popups = () =>
    Widget.Box({
        className: 'notification-popups spacing-v-5-revealer',
        vertical: true,
        margin: 1,
        attribute: {
            map: new Map(),
            dismiss: (box, id, force = false) => {
                if (!id || !box.attribute.map.has(id)) {
                    return;
                }

                const notification = box.attribute.map.get(id);

                if (notification === null || notification.attribute.hovered && !force) {
                    return;
                }

                notification.revealChild = false;
                notification.attribute.destroyWithAnims();
                box.attribute.map.delete(id);
            },
            notify: (box, id) => {
                if (!id || Notifications.dnd) {
                    return;
                }

                const notification = Notifications.getNotification(id);

                if (!notification) {
                    return;
                }

                box.attribute.map.delete(id);

                const newNotification = Notification({
                    notification,
                    isPopup: true,
                });

                box.attribute.map.set(id, newNotification);
                box.pack_end(box.attribute.map.get(id), false, false, 0);
                box.show_all();
            },
        },
        setup: (self) => self
            .hook(Notifications, (self, id) => self.attribute.notify(self, id), 'notified')
            .hook(Notifications, (self, id) => self.attribute.dismiss(self, id), 'dismissed')
            .hook(Notifications, (self, id) => self.attribute.dismiss(self, id, true), 'closed'),
    });

export default (monitor: number) =>
    Widget.Window({
        monitor,
        name: `notifications-${monitor}`,
        anchor: ['bottom', 'right'],
        layer: 'overlay',
        child: Popups(),
    });
