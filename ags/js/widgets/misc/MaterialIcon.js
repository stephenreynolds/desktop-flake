import Widget from 'resource:///com/github/Aylur/ags/widget.js';

export default (icon, size, props = {}) =>
    Widget.Label({
        className: `icon-material text-${size}`,
        label: icon,
        ...props,
    });
