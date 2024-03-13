import { setupHyprland } from './hyprland';
import { reloadScss, scssWatcher } from './scss';
import { fileExists } from 'utils';

async function restoreTheme() {
    return Utils.execAsync([
        `${App.configDir}/scripts/color_generation/switchwall.sh`,
        `${Utils.CACHE_DIR}/user/wallpaper`
    ]);
}

export async function init() {
    scssWatcher();
    setupHyprland();
    reloadScss();

    if (fileExists("/tmp/ags/scss/style.css")) {
        restoreTheme();
    }
    else {
        await restoreTheme();
    }
}
