import { fileExists } from 'utils';
import { setupHyprland } from './hyprland';
import { reloadScss, scssWatcher } from './scss';
import * as Utils from 'resource:///com/github/Aylur/ags/utils.js';

function restoreTheme() {
    return Utils.execAsync([
        `${App.configDir}/scripts/color_generation/switchwall.sh`,
        `${Utils.CACHE_DIR}/user/wallpaper`
    ]);
}

export async function init() {
    scssWatcher();
    setupHyprland();

    if (fileExists("/tmp/ags/scss/style.css")) {
        reloadScss();
        restoreTheme();
    }
    else {
        await reloadScss();
        await restoreTheme();
    }
}
