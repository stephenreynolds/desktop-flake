import { setupHyprland } from './hyprland.js';
import { reloadScss, scssWatcher } from './scss.js';

export function init() {
    scssWatcher();
    reloadScss();
    setupHyprland();
}
