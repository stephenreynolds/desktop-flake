import Widget from 'resource:///com/github/Aylur/ags/widget.js';

/** @type {number} monitor */
export default async (monitor) => {
    const hyprland = await Service.import('hyprland');
    const dispatch = (arg) => hyprland.sendMessage(`dispatch workspace ${arg}`)

    const getMonitorWorkspaces = (monitor) =>
        hyprland.workspaces
            .filter((w) =>
                w.monitor === hyprland.getMonitor(monitor).name &&
                w.id !== -99)
            .sort((a, b) => a.id - b.id);

    const workspaceButton = (workspace, monitor) => Widget.Button({
        onClicked: () => dispatch(workspace.id),
        child: Widget.Label({
            label: `${workspace.name}`,
            className: 'indicator',
            vpack: 'center',
        }),
        setup: (self) => self.hook(hyprland, () => {
            self.toggleClassName('active', hyprland.getMonitor(monitor).activeWorkspace.id === workspace.id);
            self.toggleClassName('focused', hyprland.active.workspace.id === workspace.id);
        }),
    });

    const workspaces = Widget.EventBox({
        className: 'workspaces',
        onScrollUp: () => dispatch('m+1'),
        onScrollDown: () => dispatch('m-1'),
        child: Widget.Box({
            vpack: 'center',
            setup: (self) => self.hook(hyprland, () => {
                self.children = getMonitorWorkspaces(monitor)
                    .map((w) => workspaceButton(w, monitor));
            }),
        }),
    });

    return await Widget.Box({
        hpack: 'start',
        children: [
            workspaces,
        ],
    });
};
