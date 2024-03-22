import { Option, resetOptions, getValues, apply, getOptions } from './settings/option.js';

export default {
    reset: resetOptions,
    values: getValues,
    apply: apply,
    list: getOptions,

    bar: {
        position: Option('bottom', {
            'enum': ['top', 'bottom'],
            'type': 'enum',
        }),
        showOnAllMonitors: Option(true),
    },

    primaryMonitor: Option(2),

    hyprland: {
        borders: {
            size: Option(1),
        },
        gaps: {
            gapsIn: Option(0),
            gapsOut: Option(0),
            noGapsWhenOnly: Option(0),
            noGapsWindowClasses: Option(['firefox']),
        },
        rounding: Option(0),
    },

    locale: {
        dateFormat: Option('%a %b %-e'),
        timeFormat: Option('%-I:%M %p'),
    }
};
