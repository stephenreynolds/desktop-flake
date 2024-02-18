import Widget from 'resource:///com/github/Aylur/ags/widget.js';
import PopupWindow from 'widgets/misc/PopupWindow';
import NotificationList from './NotificationList';
import Timezones from './Timezones';
import Calendar from './Calendar';

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
                Calendar(),
            ]
        })
    ],
});

export default () => PopupWindow({
    name: 'action-center',
    keymode: 'exclusive',
    anchor: ['right', 'top', 'bottom'],
    showClassName: 'action-center-show',
    hideClassName: 'action-center-hide',
    child: ActionCenter(),
});
