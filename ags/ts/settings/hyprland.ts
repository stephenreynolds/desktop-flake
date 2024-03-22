import App from "resource:///com/github/Aylur/ags/app.js";
import Hyprland from "resource:///com/github/Aylur/ags/service/hyprland.js";
import options from "options";

function sendBatch(batch: Array<string>) {
    const command = batch
        .filter(x => !!x)
        .map(x => `keyword ${x}`)
        .join('; ');

    Hyprland.messageAsync(`[[BATCH]]/${command}`);
}

function setGaps(gapsout: number, gapsin: number) {
    return Hyprland.workspaces.map((workspace) => {
        const tiledClients = Hyprland.clients.filter((c) => c.workspace.id === workspace.id && !c.floating && c.mapped);

        const noGapsWindowClasses = options.hyprland.gaps.noGapsWindowClasses.value;

        if (tiledClients.length > 0 && tiledClients.every(c => noGapsWindowClasses.includes(c.class))) {
            Hyprland.messageAsync(`keyword workspace ${workspace.id},gapsout:0,gapsin:0,rounding:false,border:false`)
                .catch(() => { });
            return;
        }

        Hyprland.messageAsync(`keyword workspace ${workspace.id},gapsout:${gapsout},gapsin:${gapsin}rounding:true,border:true`)
            .catch(() => { });
    });
}

function onCloseWindow() {
    const workspace = Hyprland.getWorkspace(Hyprland.active.workspace.id);
    if (!workspace || workspace.id === -99) {
        return;
    }
    if (workspace.windows === 0) {
        const lastWorkspace = Hyprland.workspaces
            .filter(w => w.monitorID === Hyprland.active.monitor.id && w.id !== -99)
            .length === 1;
        if (!lastWorkspace) {
            Hyprland.messageAsync("dispatch workspace m-1");
        }
    }
}

function listen(gapsout: number, gapsin: number) {
    if (gapsout === 0 && gapsin === 0) {
        Hyprland.connect('client-removed', onCloseWindow);
        return;
    }

    const events = ['openwindow', 'closewindow', 'movewindow', 'changefloatingmode'];

    App.connect('config-parsed', () => setGaps(gapsout, gapsin));

    Hyprland.connect('event', (_, event) => {
        if (event === "closewindow") {
            onCloseWindow();
        }

        if (events.includes(event)) {
            setGaps(gapsout, gapsin);
        }
    });
}

export async function setupHyprland() {
    const batch: Array<string> = [];

    batch.push(
        `general:border_size ${options.hyprland.borders.size.value}`,
        `general:gaps_in ${options.hyprland.gaps.gapsIn.value}`,
        `general:gaps_out ${options.hyprland.gaps.gapsOut.value}`,
        `decoration:rounding ${options.hyprland.rounding.value}`,
    );

    sendBatch(batch);

    listen(options.hyprland.gaps.gapsOut.value, options.hyprland.gaps.gapsIn.value);
}
