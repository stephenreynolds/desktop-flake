import SystemTray from "resource:///com/github/Aylur/ags/service/systemtray.js";
import Widget from "resource:///com/github/Aylur/ags/widget.js";
import Gdk from "gi://Gdk";
import { type TrayItem } from "types/service/systemtray";
import Gtk from "gi://Gtk?version=3.0";

export default () => {
    const TrayItem = (item: TrayItem) => Widget.Button({
        className: 'bar-systray-item',
        child: Widget.Icon({
            hpack: 'center',
            icon: item.icon,
            setup: (self) => {
                self.hook(item, (self) => self.icon = item.icon);
            }
        }),
        setup: (self) => self.hook(item, (self) => self.tooltip_markup = item['tooltip-markup']),
        onClicked: (btn) => item.menu.popup_at_widget(btn, Gdk.Gravity.SOUTH, Gdk.Gravity.NORTH, null),
        onSecondaryClick: (btn) => item.menu.popup_at_widget(btn, Gdk.Gravity.SOUTH, Gdk.Gravity.NORTH, null),
    });

    const trayContent = Widget.Box({
        className: 'tray-content',
        attribute: {
            items: new Map(),
            onAdded: (box: Gtk.Box, id: number) => {
                const item = SystemTray.getItem(id);
                if (!item) {
                    return;
                }
                item.menu.className = 'menu';
                if (box.attribute.items.has(id) || !item) {
                    return;
                }
                const widget = TrayItem(item);
                box.attribute.items.set(id, widget);
                box.add(widget);
                box.show_all();
                if (box.attribute.items.size === 1) {
                    trayRevealer.revealChild = true;
                }
            },
            onRemoved: (box: Gtk.Box, id: number) => {
                if (!box.attribute.items.has(id)) {
                    return;
                }
                box.attribute.items.get(id).destroy();
                box.attribute.items.delete(id);
                if (box.attribute.items.size === 0) {
                    trayRevealer.revealChild = false;
                }
            },
        },
        setup: (self) => self
            .hook(SystemTray, (box, id) => box.attribute.onAdded(box, id), 'added')
            .hook(SystemTray, (box, id) => box.attribute.onRemoved(box, id), 'removed')
    });

    const trayRevealer = Widget.Revealer({
        revealChild: false,
        transition: 'slide_left',
        transitionDuration: 200,
        child: trayContent,
    })

    return Widget.Box({
        child: trayRevealer,
    });
};
