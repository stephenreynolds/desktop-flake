import App from 'resource:///com/github/Aylur/ags/app.js';
import { monitorFile, ensureDirectory, execAsync } from 'resource:///com/github/Aylur/ags/utils.js';
import { dependencies } from 'utils';

const sourcePath = `${App.configDir}/scss`;
const outputPath = `${Utils.CACHE_DIR}/user/scss`;

export function scssWatcher() {
    monitorFile(sourcePath, reloadScss);
}

export async function reloadScss() {
    if (!dependencies(['sass'])) {
        return;
    }

    try {
        ensureDirectory(outputPath);
        ensureDirectory('/tmp/ags/scss');
        await execAsync([
            'cp', '-f', `${outputPath}/_material.scss`, '/tmp/ags/scss/_material.scss'
        ]);
        await execAsync([
            'sass', `${sourcePath}/main.scss`, `${outputPath}/style.css`
        ]);
        App.resetCss();
        App.applyCss(`${outputPath}/style.css`);
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
