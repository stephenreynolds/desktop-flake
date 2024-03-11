import Notifications from 'resource:///com/github/Aylur/ags/service/notifications.js';
import Widget from 'resource:///com/github/Aylur/ags/widget.js';
import * as Utils from 'resource:///com/github/Aylur/ags/utils.js';
import PopupWindow from 'widgets/misc/PopupWindow';
import NotificationList, { clearNotifications } from './NotificationList';
import Timezones from './Timezones';
import Calendar from './Calendar';
import TodoList from './TodoList';
import { setupCursorHover } from 'lib/cursorHover';

const defaultShown = 'calendar';
const contentStack = Widget.Stack({
    hexpand: true,
    children: {
        calendar: Calendar(),
        todo: TodoList(),
    },
    transition: 'slide_up_down',
    transition_duration: 180,
    setup: (stack) => Utils.timeout(1, () => {
        stack.shown = defaultShown;
    }),
});

const StackButton = (stackItemName: string, icon: string, name: string) => Widget.Button({
    className: 'button-minsize sidebar-navrail-btn sidebar-button-alone text-sm spacing-h-5',
    onClicked: (button) => {
        contentStack.shown = stackItemName;
        const children = button.get_parent().get_children();
        for (let i = 0; i < children.length; i++) {
            if (children[i] !== button) {
                children[i].toggleClassName('sidebar-navrail-btn-active', false);
            }
            else {
                button.toggleClassName('sidebar-navrail-btn-active', true);
            }
        }
    },
    child: Widget.Box({
        className: 'spacing-v-5',
        vertical: true,
        children: [
            Widget.Label({
                className: 'text icon-material text-3xl',
                label: icon,
            }),
            Widget.Label({
                className: 'text text-base',
                label: name,
            }),
        ],
    }),
    setup: (button) => Utils.timeout(1, () => {
        button.toggleClassName('sidebar-navrail-btn-active', defaultShown === stackItemName);
        setupCursorHover(button);
    }),
});

const calendarButton = StackButton('calendar', 'calendar_month', 'Calendar');
const todoButton = StackButton('todo', 'lists', 'To Do');

const BottomGroup = () => Widget.Box({
    className: 'sidebar-group spacing-h-5',
    vertical: true,
    child: Widget.Box({
        setup: (box) => {
            box.pack_start(Widget.Box({
                vpack: 'center',
                homogeneous: true,
                vertical: true,
                className: 'sidebar-navrail spacing-v-10',
                children: [
                    calendarButton,
                    todoButton,
                ],
            }), false, false, 0);
            box.pack_end(contentStack, false, false, 0);
        },
    }),
});

const ActionCenter = () => Widget.Box({
    vexpand: true,
    hexpand: true,
    hpack: 'end',
    children: [
        Widget.EventBox({
            onPrimaryClick: () => App.closeWindow('action-center'),
            onSecondaryClick: () => App.closeWindow('action-center'),
            onMiddleClick: () => App.closeWindow('action-center'),
        }),
        Widget.Box({
            vertical: true,
            vexpand: true,
            className: 'action-center spacing-v-15',
            children: [
                NotificationList(),
                Timezones(),
                BottomGroup(),
            ]
        })
    ],
    setup: (self) => self
        .keybind(['MOD1', 'MOD2'], 'c', clearNotifications)
        .keybind(['MOD1', 'MOD2'], 's', () => Notifications.dnd = !Notifications.dnd)
        .keybind(['MOD1', 'MOD2'], 'Tab', () => {
            if (contentStack.shown === 'calendar') {
                contentStack.shown = 'todo';
                calendarButton.toggleClassName('sidebar-navrail-btn-active', false);
                todoButton.toggleClassName('sidebar-navrail-btn-active', true);
            }
            else {
                contentStack.shown = 'calendar';
                todoButton.toggleClassName('sidebar-navrail-btn-active', false);
                calendarButton.toggleClassName('sidebar-navrail-btn-active', true);
            }
        })
});

export default () => PopupWindow({
    name: 'action-center',
    keymode: 'exclusive',
    anchor: ['right', 'top', 'bottom'],
    showClassName: 'action-center-show',
    hideClassName: 'action-center-hide',
    child: ActionCenter(),
});
