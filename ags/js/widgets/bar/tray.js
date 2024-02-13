import SystemTray from "resource:///com/github/Aylur/ags/service/systemtray.js";
import Widget from "resource:///com/github/Aylur/ags/widget.js";
import * as Utils from "resource:///com/github/Aylur/ags/utils.js";
import Gtk from "gi://Gtk";
import Gdk from "gi://Gdk";

export default () => {
    const TrayItem = (item) => Widget.Button({
        className: 'bar-systray-item',
        child: Widget.Icon({
            hpack: 'center',
            setup: (self) => {
                self.hook(item, (self) => self.icon = item.icon);
                Utils.timeout(1, () => {
                    const styleContext = self.get_parent().get_style_context();
                    const width = styleContext.get_property('min-width', Gtk.StateFlags.NORMAL);
                    const height = styleContext.get_property('min-height', Gtk.StateFlags.NORMAL);
                    self.size = Math.max(width, height, 1);
                });
            }
        }),
        setup: (self) => self.hook(item, (self) => self.tooltipMarkup = item['tooltip-markup']),
        onClicked: (btn) => item.menu.popup_at_widget(btn, Gdk.Gravity.SOUTH, Gdk.Gravity.NORTH, null),
        onSecondaryClick: (btn) => item.menu.popup_at_widget(btn, Gdk.Gravity.SOUTH, Gdk.Gravity.NORTH, null),
    });
    
    const trayContent = Widget.Box({
        className: 'tray-content',
        attribute: {
            items: new Map(),
            onAdded: (box, id) => {
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
            onRemoved: (box, id) => {
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
