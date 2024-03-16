import Gdk from 'gi://Gdk';
import Gio from 'gi://Gio';
import Gtk from "gi://Gtk?version=3.0";
import * as Utils from 'resource:///com/github/Aylur/ags/utils.js';
import { type Config } from "types/app"
import { type Application } from "types/service/applications"

export function range(length: number, start = 1) {
    return Array.from({ length }, (_, i) => i + start);
}

export function forMonitors(widget: (monitor: number) => Gtk.Window) {
    const n = Gdk.Display.get_default()?.get_n_monitors() || 1;
    return range(n, 0).map(widget).flat(1);
}

export function dependencies(bins: Array<string>) {
    const deps = bins.map(bin => {
        const has = Utils.exec(`which ${bin}`);
        if (!has)
            print(`Missing dependency: ${bin}`);

        return !!has;
    });

    return deps.every(has => has);
}

export function truncateString(str: string, len: number) {
    return str.length > len ? str.slice(0, len) + '...' : str;
}

export async function launchApp(app: Application) {
    await Utils.execAsync([`${app.executable}`]);
    app.frequency += 1;
}

export function config<T extends Gtk.Window>(config: Config<T>) {
    return config
}

export function fileExists(path: string) {
    return Gio.File.new_for_path(path).query_exists(null);
}
