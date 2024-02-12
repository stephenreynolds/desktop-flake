import App from 'resource:///com/github/Aylur/ags/app.js';
import * as Utils from 'resource:///com/github/Aylur/ags/utils.js';
import { dependencies } from '../utils.js';

const sourcePath = `${App.configDir}/scss`;
const outputPath = '/tmp/ags/scss';

let reloaded = false;

export function scssWatcher() {
    Utils.subprocess([
        'inotifywait',
        '--recursive',
        '--event', 'create,modify',
        '-m', sourcePath,
    ],
        reloadScss,
        () => print('Missing dependency inotify-tools for css hot reload.'));
}

export async function reloadScss() {
    if (!dependencies(['sass'])) {
        return;
    }

    try {
        Utils.ensureDirectory(outputPath);
        await Utils.execAsync([
            'sass', `${sourcePath}/main.scss`, `${outputPath}/style.css`,
        ]);
        App.resetCss();
        App.applyCss(`${outputPath}/style.css`);
        if (reloaded) {
            console.log('Reloaded scss');
        }
        reloaded = true;
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

globalThis.reloadScss = reloadScss;
