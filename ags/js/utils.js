import Gdk from 'gi://Gdk';
import * as Utils from 'resource:///com/github/Aylur/ags/utils.js';

/**
  * @param {number} length
  * @param {number=} start
  * @returns {Array<number>}
  */
export function range(length, start = 1) {
    return Array.from({ length }, (_, i) => i + start);
}

/**
  * @param {(monitor: number) => any} widget
  * @returns {Array<import('types/widgets/window').default>}
  */
export function forMonitors(widget) {
    const n = Gdk.Display.get_default()?.get_n_monitors() || 1;
    return range(n, 0).map(widget).flat(1);
}

/** @param {Array<string>} bins */
export function dependencies(bins) {
    const deps = bins.map(bin => {
        const has = Utils.exec(`which ${bin}`);
        if (!has)
            print(`Missing dependency: ${bin}`);

        return !!has;
    });

    return deps.every(has => has);
}

export function truncateString(str, len) {
    return str.length > len ? str.slice(0, len) + '...' : str;
}

export async function launchApp(app) {
    await Utils.execAsync([`${app.executable}`]);
    app.frequency += 1;
}
