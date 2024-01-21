import App from 'resource:///com/github/Aylur/ags/app.js';
import * as Utils from 'resource:///com/github/Aylur/ags/utils.js';
import { dependencies } from '../utils.js';

export function scssWatcher() {
    return Utils.subprocess([
        'inotifywait',
        '--recursive',
        '--event', 'create,modify',
        '-m', App.configDir + '/scss',
    ],
        reloadScss,
        () => print('Missing dependency inotify-tools for css hot reload.'));
}

export async function reloadScss() {
    if (!dependencies(['sassc'])) {
        return;
    }

    try {
        const tmp = '/tmp/ags/scss';
        Utils.ensureDirectory(tmp);
        await Utils.execAsync(`sassc ${App.configDir}/scss/main.scss ${tmp}/style.css`);
        App.resetCss();
        App.applyCss(`${tmp}/style.css`);
    }
    catch (error) {
        if (error instanceof Error) {
            console.error(error.message);
        }

        if (typeof error === 'string') {
            console.error(error);
        }
    }
}
