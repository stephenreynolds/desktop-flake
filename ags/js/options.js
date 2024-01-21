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
    },
};
