import App from 'resource:///com/github/Aylur/ags/app.js';
import Widget from 'resource:///com/github/Aylur/ags/widget.js';

export default ({
    name,
    child,
    showClassName,
    hideClassName,
    ...props
}) => Widget.Window({
    name,
    popup: true,
    visible: false,
    layer: 'overlay',
    ...props,

    child: Widget.Box({
        className: `${showClassName} ${hideClassName}`,
        setup: (self) => self.hook(App, (self, currentName, visible) => {
            if (currentName === name) {
                self.toggleClassName(hideClassName, !visible);
            }
        }),
        child: child,
    }),
});
