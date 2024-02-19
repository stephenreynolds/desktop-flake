import Gtk from 'gi://Gtk';
import Widget from 'resource:///com/github/Aylur/ags/widget.js';
import Notifications from 'resource:///com/github/Aylur/ags/service/notifications.js';
import MaterialIcon from 'widgets/misc/MaterialIcon';
import Notification from 'widgets/misc/Notification';
import { setupCursorHover } from 'lib/cursorHover';
import Gdk from 'gi://Gdk?version=3.0';

const notificationsEmptyContent = Widget.Box({
    hexpand: true,
    vertical: true,
    vpack: 'center',
    className: 'text',
    children: [
        MaterialIcon('check', '5xl'),
        Widget.Label({ label: 'No new notifications' }),
    ],
});

const NotificationList = Widget.Box({
    className: 'spacing-v-5-revealer',
    vertical: true,
    vpack: 'start',
    setup: (self) => self
        .hook(Notifications, (box, id) => {
            if (box.children.length === 0) {
                Notifications.notifications
                    .forEach(notification => {
                        box.pack_end(Notification({
                            notification,
                            isPopup: false,
                        }), false, false, 0);
                    });
                box.show_all();
            }
            else if (id) {
                const notification = Notifications.getNotification(id);
                const newNotification = Notification({
                    notification,
                    isPopup: false,
                });
                if (newNotification) {
                    box.pack_end(newNotification, false, false, 0);
                    box.show_all();
                }
            }
        }, 'notified')
        .hook(Notifications, (box, id) => {
            if (!id) {
                return;
            }

            for (const ch of box.children) {
                if (ch._id === id) {
                    ch.attribute.destroyWithAnims();
                }
            }
        }, 'closed'),
});

export default (props) => {
    const ListActionButton = (icon, name, action, { ...rest } = {}) => Widget.Button({
        className: 'notification-listaction-button',
        onClicked: action,
        child: Widget.Box({
            className: 'spacing-h-5',
            children: [
                MaterialIcon(icon, 'base'),
                Widget.Label({
                    label: name,
                    className: 'text-lg',
                }),
            ],
        }),
        setup: setupCursorHover,
        ...rest
    });

    const listTitle = Widget.Box({
        vpack: 'start',
        className: 'action-center-group-invisible text spacing-h-10',
        children: [
            Widget.Label({
                className: 'text-xl',
                hexpand: true,
                xalign: 0,
                label: 'Notifications',
            }),
            ListActionButton('notifications_paused', 'Silent', (self) => {
                Notifications.dnd = !Notifications.dnd
            }, {
                setup: (self) => {
                    setupCursorHover(self);
                    self.hook(Notifications, (self) => {
                        self.toggleClassName('notification-listaction-button-enabled', Notifications.dnd);
                    })
                }
            }),
            ListActionButton('clear_all', 'Clear', () => Notifications.clear(), {
                setup: (self) => {
                    setupCursorHover(self);
                    self.bind('visible', Notifications, 'notifications', (notifications) => notifications.length > 0)
                }
            })
        ],
    });

    const notificationList = Widget.Scrollable({
        hexpand: true,
        hscroll: 'never',
        vscroll: 'automatic',
        className: 'notifications-scrollable',
        child: Widget.Box({
            vexpand: true,
            children: [NotificationList],
        }),
        setup: (self) => {
            const vScrollbar = self.get_vscrollbar();
            vScrollbar.get_style_context().add_class('sidebar-scrollbar');
        }
    });

    const listContents = Widget.Stack({
        transition: 'crossfade',
        transitionDuration: 150,
        children: {
            empty: notificationsEmptyContent,
            list: notificationList,
        },
        setup: (self) => self
            .bind('shown', Notifications, 'notifications', (notifications) => notifications.length > 0 ? 'list' : 'empty')
    });

    return Widget.Box({
        ...props,
        className: 'action-center-group-invisible spacing-v-5',
        vertical: true,
        vexpand: true,
        children: [
            listTitle,
            listContents,
        ],
        setup: (self) => self.on('key-press-event', (_, event) => {
            const keyval = event.get_keyval()[1];
            const mod = event.get_state()[1] - 16;
            if (mod !== Gdk.ModifierType.MOD1_MASK) {
                return;
            }
            switch (keyval) {
                case Gdk.KEY_c:
                    Notifications.clear();
                    break;
                case Gdk.KEY_s:
                    Notifications.dnd = !Notifications.dnd;
                    break;
            }
        })
    });
};
