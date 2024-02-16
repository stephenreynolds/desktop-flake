import { setupHyprland } from './hyprland.js';
import { reloadScss, scssWatcher } from './scss.js';
import * as Utils from 'resource:///com/github/Aylur/ags/utils.js';

async function restoreTheme() {
    await Utils.execAsync([
        `${App.configDir}/scripts/color_generation/switchwall.sh`,
        `${Utils.CACHE_DIR}/user/wallpaper`
    ]);
}

export function init() {
    scssWatcher();
    reloadScss();
    setupHyprland();
    restoreTheme();
}
