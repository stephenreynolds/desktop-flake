import Widget from 'resource:///com/github/Aylur/ags/widget.js';
import { type Workspace } from 'types/service/hyprland';

const hyprland = await Service.import('hyprland');

const dispatchWorkspace = (arg: string) => hyprland.messageAsync(`dispatch workspace ${arg}`)

const getMonitorWorkspaces = (monitor: number) =>
    hyprland.workspaces
        .filter((w) =>
            w.monitor === hyprland.getMonitor(monitor)?.name &&
            w.id !== -99)
        .sort((a, b) => a.id - b.id);

const workspaceButton = (workspace: Workspace, monitor: number) => Widget.Button({
    onClicked: () => hyprland.messageAsync(`dispatch workspace ${workspace.id}`),
    child: Widget.Label({
        label: `${workspace.name}`,
        className: 'indicator',
        vpack: 'center',
    }),
    setup: (self) => self.hook(hyprland, () => {
        try {
            self.toggleClassName('active', hyprland.getMonitor(monitor)?.activeWorkspace.id === workspace.id);
            self.toggleClassName('focused', hyprland.active.workspace.id === workspace.id);
        }
        catch {
            return;
        }
    }),
});

const workspaces = (monitor: number) => Widget.EventBox({
    className: 'workspaces',
    onScrollUp: () => dispatchWorkspace('m+1'),
    onScrollDown: () => dispatchWorkspace('m-1'),
    child: Widget.Box({
        vpack: 'center',
        setup: (self) => self.hook(hyprland, (self, event, name) => {
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

export default (monitor: number) => Widget.Box({
    className: 'bar-space',
    hpack: 'start',
    children: [
        workspaces(monitor),
    ],
});
