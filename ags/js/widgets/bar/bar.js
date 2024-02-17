import Gtk from 'gi://Gtk';
import Variable from 'resource:///com/github/Aylur/ags/variable.js';
import Widget from 'resource:///com/github/Aylur/ags/widget.js';
import options from '../../options.js';
import LeftSpace from './leftSpace.js';
import RightSpace from './rightSpace.js';
import Hyprland from 'resource:///com/github/Aylur/ags/service/hyprland.js';
import * as Utils from 'resource:///com/github/Aylur/ags/utils.js';

/** @param {number} monitor */
export default async (monitor = 0) => {
    const events = ['workspace', 'openwindow', 'closewindow', 'movewindow', 'changefloatingmode'];

    const setFloating = (box) => Utils.timeout(10, async () => {
        try {
            const monitorObject = Hyprland.getMonitor(monitor);
            const activeWorkspace = monitorObject?.activeWorkspace.id;
            if (!activeWorkspace) return;
            const workspace = Hyprland.getWorkspace(activeWorkspace);
            if (workspace.windows === 0) {
                box.toggleClassName('bar-floating', true);
                return;
            }
            const workspacerules = JSON.parse(await Utils.execAsync(['hyprctl', 'workspacerules', '-j']));
            const barWorkspace = workspacerules.find(rule => rule.workspaceString === activeWorkspace.toString());
            if (!barWorkspace) return;
            box.toggleClassName('bar-floating', barWorkspace.gapsOut > 0);
        } catch (e) {
            console.log(e);
        }
    });

    const barContent = Widget.CenterBox({
        className: 'bar-bg',
        startWidget: await LeftSpace(monitor),
        endWidget: RightSpace(monitor),
        setup: (self) => self
            .hook(App, setFloating, 'config-parsed')
            .hook(Hyprland, (self, event) => {
                if (!events.includes(event)) {
                    return;
                }

                setFloating(self);
            }, 'event')
    });

    return Widget.Window({
        monitor,
        name: `bar-${monitor}`,
        exclusivity: 'exclusive',
        anchor: options.bar.position.bind('value').transform(pos => ([
            pos, 'left', 'right'
        ])),
        visible: options.bar.showOnAllMonitors.bind('value').transform(v => {
            return v || monitor === options.primaryMonitor.value;
        }),
        child: barContent,
    });
};
