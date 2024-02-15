import Widget from 'resource:///com/github/Aylur/ags/widget.js';
import PopupWindow from '../../lib/popupWindow.js';

const ActionCenter = () => Widget.Box({
    children: [
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
