import Widget from 'resource:///com/github/Aylur/ags/widget.js';
import Hyprland from 'resource:///com/github/Aylur/ags/service/hyprland.js';
import { type Workspace } from 'types/service/hyprland';

export default (monitor: number) => {
    const dispatch = (arg) => Hyprland.messageAsync(`dispatch workspace ${arg}`)

    const getMonitorWorkspaces = (monitor: number) =>
        Hyprland.workspaces
            .filter((w) =>
                w.monitor === Hyprland.getMonitor(monitor).name &&
                w.id !== -99)
            .sort((a, b) => a.id - b.id);

    const workspaceButton = (workspace: Workspace, monitor: number) => Widget.Button({
        onClicked: () => Hyprland.messageAsync(`dispatch workspace ${workspace.id}`),
        child: Widget.Label({
            label: `${workspace.name}`,
            className: 'indicator',
            vpack: 'center',
        }),
        setup: (self) => self.hook(Hyprland, () => {
            try {
                self.toggleClassName('active', Hyprland.getMonitor(monitor).activeWorkspace.id === workspace.id);
                self.toggleClassName('focused', Hyprland.active.workspace.id === workspace.id);
            }
            catch {
                return;
            }
        }),
    });

    const workspaces = Widget.EventBox({
        className: 'workspaces',
        onScrollUp: () => dispatch('m+1'),
        onScrollDown: () => dispatch('m-1'),
        child: Widget.Box({
            vpack: 'center',
            setup: (self) => self.hook(Hyprland, (self, event, name) => {
                if (self.children.length === 0) {
                    self.children = getMonitorWorkspaces(monitor)
                        .map((w) => workspaceButton(w, monitor));
                    return;
                }

                if ((event === 'createworkspace' || event === 'destroyworkspace') && name !== 'special') {
                    self.children = getMonitorWorkspaces(monitor)
                        .map((w) => workspaceButton(w, monitor));
                }
            }, 'event'),
        }),
    });

    return Widget.Box({
        className: 'bar-space',
        hpack: 'start',
        children: [
            workspaces,
        ],
    });
};
