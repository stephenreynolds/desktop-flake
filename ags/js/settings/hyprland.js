import App from "resource:///com/github/Aylur/ags/app.js";
import Hyprland from "resource:///com/github/Aylur/ags/service/hyprland.js";
import * as Utils from "resource:///com/github/Aylur/ags/utils.js";
import options from "../options.js";

function sendBatch(batch) {
    const command = batch
        .filter(x => !!x)
        .map(x => `keyword ${x}`)
        .join('; ');

    Hyprland.sendMessage(`[[BATCH]]/${command}`);
}

function listenForNoGapsWhenSingle(gapsout) {
    const events = ['openwindow', 'closewindow', 'movewindow', 'changefloatingmode'];

    const setGaps = () => Utils.timeout(10, () =>
        Hyprland.workspaces.map((workspace) => {
            const tiledClients = Hyprland.clients.filter((c) => c.workspace.id === workspace.id && !c.floating && c.mapped);

            const noGapsWindowClasses = options.hyprland.gaps.noGapsWindowClasses.value;
            if (tiledClients.length === 1 && noGapsWindowClasses.includes(tiledClients[0].class)) {
                Hyprland.sendMessage(`keyword workspace ${workspace.id},gapsout:0,rounding:false,border:false`)
                    .catch(() => { });
                
                return;
            }

            Hyprland.sendMessage(`keyword workspace ${workspace.id},gapsout:${gapsout},rounding:true,border:true`)
                .catch(() => { });
        }),
    );

    App.connect('config-parsed', setGaps);

    Hyprland.connect('event', (_, event) => {
        if (events.includes(event)) {
            setGaps();
        }
    });
}

export async function setupHyprland() {
    const batch = [];

    batch.push(
        `general:border_size ${options.hyprland.borders.size.value}`,
        `general:gaps_in ${options.hyprland.gaps.gapsIn.value}`,
        `general:gaps_out ${options.hyprland.gaps.gapsOut.value}`,
        `decoration:rounding ${options.hyprland.rounding.value}`,
    );

    sendBatch(batch);

    if (options.hyprland.gaps.noGapsWhenOnly.value === 0) {
        listenForNoGapsWhenSingle(options.hyprland.gaps.gapsOut.value);
    }
}
