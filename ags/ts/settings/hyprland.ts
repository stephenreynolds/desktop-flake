import App from "resource:///com/github/Aylur/ags/app.js";
import Hyprland from "resource:///com/github/Aylur/ags/service/hyprland.js";
import options from "options";
import { type Client } from "types/service/hyprland";

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

function clientInSpecial(client: Client | undefined) {
    return client && client.workspace.id === -99;
}

function onCloseWindow(client: Client | undefined) {
    const activeWorkspace = Hyprland.getWorkspace(Hyprland.active.workspace.id);

    if (!activeWorkspace || activeWorkspace.windows > 1 || clientInSpecial(client)) {
        return;
    }

    if (activeWorkspace.windows === 1) {
        const lastClient = Hyprland.clients.find(c => c.workspace.id === activeWorkspace.id);

        if (lastClient && lastClient.title !== 'Picture-in-Picture') {
            return;
        }
    }
    else if (activeWorkspace.windows === 0 && client && ["Picture-in-Picture", "Launching..."].includes(client.title)) {
        return;
    }

    const isLastWorkspaceOnMonitor = Hyprland.workspaces
        .filter(w => w.monitorID === Hyprland.active.monitor.id && w.id !== -99)
        .length === 1;
    if (isLastWorkspaceOnMonitor) {
        return;
    }

    Hyprland.messageAsync("dispatch workspace m-1");
}

const clients = new Map<string, Client>();

function listen(gapsout: number, gapsin: number) {
    Hyprland.connect('client-added', (_, address) => {
        const client = Hyprland.getClient(address);
        if (client) {
            clients.set(address, client);
        }
    });

    Hyprland.connect('client-removed', (_, address) => {
        const client = clients.get(address);
        if (client) {
            clients.delete(address);
        }
        onCloseWindow(client);
    });

    App.connect('config-parsed', () => setGaps(gapsout, gapsin));
    const events = ['openwindow', 'closewindow', 'movewindow', 'changefloatingmode'];
    Hyprland.connect('event', (_, event) => {
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
