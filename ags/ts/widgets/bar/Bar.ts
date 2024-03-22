import Widget from 'resource:///com/github/Aylur/ags/widget.js';
import options from 'options';
import LeftSpace from './LeftSpace';
import RightSpace from './RightSpace';
import Hyprland from 'resource:///com/github/Aylur/ags/service/hyprland.js';
import * as Utils from 'resource:///com/github/Aylur/ags/utils.js';

export default (monitor = 0) => {
    const events = ['workspace', 'openwindow', 'closewindow', 'movewindow', 'changefloatingmode', 'submap'];

    const setFloating = (box) => Utils.timeout(15, async () => {
        try {
            const monitorObject = Hyprland.getMonitor(monitor);
            const activeWorkspace = monitorObject?.activeWorkspace.id;
            if (!activeWorkspace) return;
            const workspace = Hyprland.getWorkspace(activeWorkspace);
            if (!workspace) return;
            if (workspace.windows === 0) {
                box.toggleClassName('bar-floating', true);
                return;
            }
            if (options.hyprland.gaps.gapsOut.value === 0) {
                box.toggleClassName('bar-floating', false);
                return;
            }
            if (workspace.windows === 1) {
                const layout = JSON.parse(await Utils.execAsync(['hyprctl', 'getoption', 'general:layout', '-j'])).str;
                const noGapsWhenOnly = JSON.parse(await Utils.execAsync(['hyprctl', 'getoption', `${layout}:no_gaps_when_only`, '-j'])).int;
                if (noGapsWhenOnly === 1) {
                    box.toggleClassName('bar-floating', false);
                    return;
                }
            }
            const workspacerules = JSON.parse(await Utils.execAsync(['hyprctl', 'workspacerules', '-j']));
            const barWorkspace = workspacerules.find(rule => rule.workspaceString === activeWorkspace.toString());
            if (!barWorkspace) return;
            const bottomGaps = barWorkspace.gapsOut[2];
            box.toggleClassName('bar-floating', bottomGaps > 0);
        } catch (e) {
            console.log(e);
        }
    });

    const barContent = Widget.CenterBox({
        className: 'bar-bg',
        startWidget: LeftSpace(monitor),
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
