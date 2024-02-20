import App from "resource:///com/github/Aylur/ags/app.js";
import Hyprland from "resource:///com/github/Aylur/ags/service/hyprland.js";
import * as Utils from "resource:///com/github/Aylur/ags/utils.js";
import options from "options";

function sendBatch(batch) {
    const command = batch
        .filter(x => !!x)
        .map(x => `keyword ${x}`)
        .join('; ');

    Hyprland.messageAsync(`[[BATCH]]/${command}`);
}

function listenForNoGapsWhenSingle(gapsout, gapsin) {
    const events = ['openwindow', 'closewindow', 'movewindow', 'changefloatingmode'];

    const setGaps = () => Utils.timeout(10, () =>
        Hyprland.workspaces.map((workspace) => {
            const tiledClients = Hyprland.clients.filter((c) => c.workspace.id === workspace.id && !c.floating && c.mapped);

            const noGapsWindowClasses = options.hyprland.gaps.noGapsWindowClasses.value;
            if (tiledClients.every(c => noGapsWindowClasses.includes(c.class))) {
                Hyprland.messageAsync(`keyword workspace ${workspace.id},gapsout:0,gapsin:0,rounding:false,border:false`)
                    .catch(() => { });
                return;
            }

            Hyprland.messageAsync(`keyword workspace ${workspace.id},gapsout:${gapsout},gapsin:${gapsin}rounding:true,border:true`)
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
        listenForNoGapsWhenSingle(
            options.hyprland.gaps.gapsOut.value,
            options.hyprland.gaps.gapsIn.value
        );
    }
}
