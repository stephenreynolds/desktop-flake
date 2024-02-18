import Gdk from 'gi://Gdk';
import Gtk from 'gi://Gtk';
import GLib from 'gi://GLib';
import Widget from 'resource:///com/github/Aylur/ags/widget.js'
import * as Utils from 'resource:///com/github/Aylur/ags/utils.js'
import MaterialIcon from "./MaterialIcon";
import AnimatedCircProg from "./AnimatedCircularProgress";
import { setupCursorHover } from "lib/cursorHover";
import dayjs from 'lib/dayjs/dayjs';
import relativeTime from 'lib/dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

function guessMessageType(summary) {
    if (summary.includes('recording')) return 'screen_record';
    if (summary.includes('battery') || summary.includes('power')) return 'power';
    if (summary.includes('screenshot')) return 'screenshot_monitor';
    if (summary.includes('welcome')) return 'waving_hand';
    if (summary.includes('time')) return 'scheduleb';
    if (summary.includes('installed')) return 'download';
    if (summary.includes('update')) return 'update';
    if (summary.startsWith('file')) return 'folder_copy';
    return 'chat';
}

function exists(widget) {
    return widget !== null;
}

const NotificationIcon = (notification) => {
    // { appEntry, appIcon, image }, urgency = 'normal'
    if (notification.image) {
        return Widget.Box({
            valign: Gtk.Align.CENTER,
            hexpand: false,
            className: 'notification-icon',
            css: `
                background-image: url("${notification.image}");
                background-size: auto 100%;
                background-repeat: no-repeat;
                background-position: center;
            `,
        });
    }

    let icon = 'NO_ICON';
    if (Utils.lookUpIcon(notification.appIcon))
        icon = notification.appIcon;
    if (Utils.lookUpIcon(notification.appEntry))
        icon = notification.appEntry;

    return Widget.Box({
        vpack: 'center',
        hexpand: false,
        className: `notification-icon notification-icon-material-${notification.urgency}`,
        homogeneous: true,
        children: [
            (icon !== 'NO_ICON' ?
                Widget.Icon({
                    vpack: 'center',
                    icon: icon,
                    setup: (self) => Utils.timeout(1, () => {
                        const styleContext = self.get_parent().get_style_context();
                        const width = styleContext.get_property('min-width', Gtk.StateFlags.NORMAL);
                        const height = styleContext.get_property('min-height', Gtk.StateFlags.NORMAL);
                        self.size = Math.max(width * 0.7, height * 0.7, 1);
                    }, self),
                })
                :
                MaterialIcon(`${notification.urgency == 'critical' ? 'release_alert' : guessMessageType(notification.summary.toLowerCase())}`, '3xl', {
                    hexpand: true,
                })
            )
        ],
    });
};

export default ({ notification, isPopup = false, props = {} } = {}) => {
    const popupTimeout = notification.timeout || (notification.urgency == 'critical' ? 8000 : 3000);
    const command = (isPopup ?
        () => notification.dismiss() :
        () => notification.close()
    )
    const destroyWithAnims = () => {
        widget.sensitive = false;
        notificationBox.setCss(middleClickClose);
        Utils.timeout(200, () => {
            if (wholeThing) wholeThing.revealChild = false;
        }, wholeThing);
        Utils.timeout(400, () => {
            command();
            if (wholeThing) {
                wholeThing.destroy();
                wholeThing = null;
            }
        }, wholeThing);
    }
    const widget = Widget.EventBox({
        onHover: (self) => {
            self.window.set_cursor(Gdk.Cursor.new_from_name(display, 'grab'));
            if (!wholeThing.attribute.hovered)
                wholeThing.attribute.hovered = true;
        },
        onHoverLost: (self) => {
            self.window.set_cursor(null);
            if (wholeThing.attribute.hovered)
                wholeThing.attribute.hovered = false;
            if (isPopup) {
                command();
            }
        },
        onMiddleClick: (self) => {
            destroyWithAnims();
        },
        setup: (self) => {
            self.on("button-press-event", () => {
                wholeThing.attribute.held = true;
                notificationContent.toggleClassName(`${isPopup ? 'popup-' : ''}notification-clicked-${notification.urgency}`, true);
                Utils.timeout(800, () => {
                    if (wholeThing?.attribute.held) {
                        Utils.execAsync(['wl-copy', `${notification.body}`])
                        notifTextSummary.label = notification.summary + " (copied)";
                        Utils.timeout(3000, () => notifTextSummary.label = notification.summary)
                    }
                })
            }).on("button-release-event", () => {
                wholeThing.attribute.held = false;
                notificationContent.toggleClassName(`${isPopup ? 'popup-' : ''}notification-clicked-${notification.urgency}`, false);
            })
        }
    });
    let wholeThing = Widget.Revealer({
        attribute: {
            'close': undefined,
            'destroyWithAnims': destroyWithAnims,
            'dragging': false,
            'held': false,
            'hovered': false,
            'id': notification.id,
        },
        revealChild: false,
        transition: 'slide_left',
        transitionDuration: 200,
        child: Widget.Box({
            homogeneous: true,
        }),
    });

    const display = Gdk.Display.get_default();
    const notifTextPreview = Widget.Revealer({
        transition: 'slide_down',
        transitionDuration: 120,
        revealChild: true,
        child: Widget.Label({
            xalign: 0,
            className: `text-base notification-body-${notification.urgency}`,
            useMarkup: true,
            xalign: 0,
            justify: Gtk.Justification.LEFT,
            maxWidthChars: 24,
            truncate: 'end',
            label: notification.body.split("\n")[0],
        }),
    });
    const notifTextExpanded = Widget.Revealer({
        transition: 'slide_up',
        transitionDuration: 120,
        revealChild: false,
        child: Widget.Box({
            vertical: true,
            className: 'spacing-v-10',
            children: [
                Widget.Label({
                    xalign: 0,
                    className: `text-base notification-body-${notification.urgency}`,
                    useMarkup: true,
                    xalign: 0,
                    justify: Gtk.Justification.LEFT,
                    maxWidthChars: 24,
                    wrap: true,
                    label: notification.body,
                }),
                Widget.Box({
                    className: 'notification-actions spacing-h-5',
                    children: [
                        Widget.Button({
                            hexpand: true,
                            className: `notification-action notification-action-${notification.urgency}`,
                            onClicked: () => destroyWithAnims(),
                            child: Widget.Label({
                                label: 'Close',
                            })
                        }),
                        ...notification.actions.map(action => Widget.Button({
                            hexpand: true,
                            className: `notification-action notification-action-${notification.urgency}`,
                            onClicked: () => notification.invoke(action.id),
                            child: Widget.Label({
                                label: action.label,
                            })
                        }))
                    ],
                })
            ]
        }),
    });
    const notifIcon = Widget.Box({
        vpack: 'start',
        homogeneous: true,
        children: [
            Widget.Overlay({
                child: NotificationIcon(notification),
                overlays: isPopup ? [AnimatedCircProg({
                    className: `notification-circprog-${notification.urgency}`,
                    vpack: 'center', hpack: 'center',
                    initFrom: (isPopup ? 100 : 0),
                    initTo: 0,
                    initAnimTime: popupTimeout,
                })] : [],
            }),
        ]
    });
    const notifTextSummary = Widget.Label({
        xalign: 0,
        className: 'text-lg text-semibold titlefont',
        justify: Gtk.Justification.LEFT,
        hexpand: true,
        maxWidthChars: 24,
        wrap: true,
        truncate: 'end',
        ellipsize: 3,
        useMarkup: notification.summary.startsWith('<'),
        label: notification.summary,
    });
    const notifTextBody = Widget.Label({
        vpack: 'center',
        justification: 'right',
        className: 'text-sm text-semibold',
        setup: (self) => {
            if (isPopup) {
                return;
            }
            self.poll(1000, (self) => self.label = dayjs.unix(notification.time).fromNow());
        }
    });
    const notifText = Widget.Box({
        valign: Gtk.Align.CENTER,
        vertical: true,
        hexpand: true,
        children: [
            Widget.Box({
                children: [
                    notifTextSummary,
                    notifTextBody,
                ]
            }),
            notifTextPreview,
            notifTextExpanded,
        ]
    });
    const notifExpandButton = Widget.Button({
        vpack: 'start',
        className: 'notification-expand-btn',
        onClicked: (self) => {
            if (notifTextPreview.revealChild) { // Expanding...
                notifTextPreview.revealChild = false;
                notifTextExpanded.revealChild = true;
                self.child.label = 'expand_less';
                expanded = true;
            }
            else {
                notifTextPreview.revealChild = true;
                notifTextExpanded.revealChild = false;
                self.child.label = 'expand_more';
                expanded = false;
            }
        },
        child: MaterialIcon('expand_more', 'norm', {
            vpack: 'center',
        }),
        setup: setupCursorHover,
    });
    const notificationContent = Widget.Box({
        ...props,
        className: `${isPopup ? 'popup-' : ''}notification-${notification.urgency} spacing-h-10`,
        children: [
            notifIcon,
            Widget.Box({
                className: 'spacing-h-5',
                children: [
                    notifText,
                    notifExpandButton,
                ]
            })
        ]
    })

    // Gesture stuff
    const gesture = Gtk.GestureDrag.new(widget);
    var initDirX = 0;
    var initDirVertical = -1; // -1: unset, 0: horizontal, 1: vertical
    var expanded = false;
    // in px
    const startMargin = 0;
    const MOVE_THRESHOLD = 10;
    const DRAG_CONFIRM_THRESHOLD = 100;
    // in rem
    const maxOffset = 10.227;
    const endMargin = 20.455;
    const disappearHeight = 6.818;
    const leftAnim1 = `transition: 200ms cubic-bezier(0.05, 0.7, 0.1, 1);
                       margin-left: -${Number(maxOffset + endMargin)}rem;
                       margin-right: ${Number(maxOffset + endMargin)}rem;
                       opacity: 0;`;

    const rightAnim1 = `transition: 200ms cubic-bezier(0.05, 0.7, 0.1, 1);
                        margin-left:   ${Number(maxOffset + endMargin)}rem;
                        margin-right: -${Number(maxOffset + endMargin)}rem;
                        opacity: 0;`;

    const middleClickClose = `transition: 200ms cubic-bezier(0.85, 0, 0.15, 1);
                              margin-left:   ${Number(maxOffset + endMargin)}rem;
                              margin-right: -${Number(maxOffset + endMargin)}rem;
                              opacity: 0;`;

    const notificationBox = Widget.Box({
        attribute: {
            'leftAnim1': leftAnim1,
            'rightAnim1': rightAnim1,
            'middleClickClose': middleClickClose,
            'ready': false,
        },
        homogeneous: true,
        children: [notificationContent],
        setup: (self) => self
            .hook(gesture, self => {
                var offset_x = gesture.get_offset()[1];
                var offset_y = gesture.get_offset()[2];
                // Which dir?
                if (initDirVertical == -1) {
                    if (Math.abs(offset_y) > MOVE_THRESHOLD)
                        initDirVertical = 1;
                    if (initDirX == 0 && Math.abs(offset_x) > MOVE_THRESHOLD) {
                        initDirVertical = 0;
                        initDirX = (offset_x > 0 ? 1 : -1);
                    }
                }
                // Horizontal drag
                if (initDirVertical == 0 && offset_x > MOVE_THRESHOLD) {
                    if (initDirX < 0)
                        self.setCss(`margin-left: 0px; margin-right: 0px;`);
                    else
                        self.setCss(`
                            margin-left:   ${Number(offset_x + startMargin - MOVE_THRESHOLD)}px;
                            margin-right: -${Number(offset_x + startMargin - MOVE_THRESHOLD)}px;
                        `);
                }
                else if (initDirVertical == 0 && offset_x < -MOVE_THRESHOLD) {
                    if (initDirX > 0)
                        self.setCss(`margin-left: 0px; margin-right: 0px;`);
                    else {
                        offset_x = Math.abs(offset_x);
                        self.setCss(`
                            margin-right: ${Number(offset_x + startMargin - MOVE_THRESHOLD)}px;
                            margin-left: -${Number(offset_x + startMargin - MOVE_THRESHOLD)}px;
                        `);
                    }
                }
                // Update dragging
                wholeThing.attribute.dragging = Math.abs(offset_x) > MOVE_THRESHOLD;
                if (Math.abs(offset_x) > MOVE_THRESHOLD ||
                    Math.abs(offset_y) > MOVE_THRESHOLD) wholeThing.attribute.held = false;
                widget.window?.set_cursor(Gdk.Cursor.new_from_name(display, 'grabbing'));
                // Vertical drag
                if (initDirVertical == 1 && offset_y > MOVE_THRESHOLD && !expanded) {
                    notifTextPreview.revealChild = false;
                    notifTextExpanded.revealChild = true;
                    expanded = true;
                    notifExpandButton.child.label = 'expand_less';
                }
                else if (initDirVertical == 1 && offset_y < -MOVE_THRESHOLD && expanded) {
                    notifTextPreview.revealChild = true;
                    notifTextExpanded.revealChild = false;
                    expanded = false;
                    notifExpandButton.child.label = 'expand_more';
                }

            }, 'drag-update')
            .hook(gesture, self => {
                if (!self.attribute.ready) {
                    wholeThing.revealChild = true;
                    self.attribute.ready = true;
                    return;
                }
                const offset_h = gesture.get_offset()[1];

                if (Math.abs(offset_h) > DRAG_CONFIRM_THRESHOLD && offset_h * initDirX > 0) {
                    if (offset_h > 0) {
                        self.setCss(rightAnim1);
                        widget.sensitive = false;
                    }
                    else {
                        self.setCss(leftAnim1);
                        widget.sensitive = false;
                    }
                    Utils.timeout(200, () => {
                        if (wholeThing) wholeThing.revealChild = false;
                    }, wholeThing);
                    Utils.timeout(400, () => {
                        command();
                        if (wholeThing) {
                            wholeThing.destroy();
                            wholeThing = null;
                        }
                    }, wholeThing);
                }
                else {
                    self.setCss(`transition: margin 200ms cubic-bezier(0.05, 0.7, 0.1, 1), opacity 200ms cubic-bezier(0.05, 0.7, 0.1, 1);
                                   margin-left:  ${startMargin}px;
                                   margin-right: ${startMargin}px;
                                   margin-bottom: unset; margin-top: unset;
                                   opacity: 1;`);
                    if (widget.window)
                        widget.window.set_cursor(Gdk.Cursor.new_from_name(display, 'grab'));

                    wholeThing.attribute.dragging = false;
                }
                initDirX = 0;
                initDirVertical = -1;
            }, 'drag-end')
        ,
    })
    widget.add(notificationBox);
    wholeThing.child.children = [widget];
    if (isPopup) Utils.timeout(popupTimeout, () => {
        if (notification.hints.transient) {
            notification.close();
        }
        if (wholeThing) {
            wholeThing.revealChild = false;
            Utils.timeout(200, () => {
                if (wholeThing) {
                    wholeThing.destroy();
                    wholeThing = null;
                }
                command();
            }, wholeThing);
        }
    })
    return wholeThing;
}
