import App from 'resource:///com/github/Aylur/ags/app.js';
import Widget from 'resource:///com/github/Aylur/ags/widget.js';
import Applications from 'resource:///com/github/Aylur/ags/service/applications.js';
import PopupWindow from 'widgets/misc/PopupWindow';
import Fuse from 'lib/fuse';
import { launchApp } from 'utils';
import { Application } from 'types/service/applications';

const AppItem = (app: Application) =>
    Widget.Button({
        class_name: 'app',
        onClicked: () => {
            App.closeWindow('launcher');
            launchApp(app);
        },
        child: Widget.Box({
            children: [
                Widget.Icon({
                    icon: app.icon_name || undefined,
                    size: 36,
                }),
                Widget.Box({
                    vertical: true,
                    children: [
                        Widget.Label({
                            class_name: 'title',
                            label: app.name,
                            xalign: 0,
                            vpack: 'center',
                            ellipsize: 3,
                        }),
                        Widget.Label({
                            class_name: 'description',
                            label: app.description || '',
                            wrap: true,
                            xalign: 0,
                            justification: 'left',
                            vpack: 'center',
                        }),
                    ],
                }),
            ],
        }),
    });

const fuseOptions = {
    keys: [
        { name: 'name', weight: 5 },
        { name: 'description', weight: 1 },
    ],
    includeScore: true,
    sortFn: (a, b) => {
        if (a.score === b.score) {
            const aFrequency = Applications.list.find(
                (app) =>
                    app.name === a.item[0].v &&
                    (a.item[1] ? app.description === a.item[1].v : true),
            ).frequency;
            const bFrequency = Applications.list.find(
                (app) =>
                    app.name === b.item[0].v &&
                    (b.item[1] ? app.description === b.item[1].v : true),
            ).frequency;

            return bFrequency - aFrequency;
        }

        return a.score - b.score;
    },
};

const fuse = new Fuse(Applications.list, fuseOptions);

function filterApps(term: string) {
    const entries = fuse.search(term);
    return entries.map((entry) =>
        Applications.list.find((app) => app.name === entry.item.name),
    );
}

function queryFilteredApps(text: string) {
    let items: Application[] = [];
    if (text === '') {
        items = Applications.query(text);
    } else {
        items = filterApps(text);
    }
    return items;
}

const Launcher = () => {
    const list = Widget.Box({ vertical: true });

    const placeholder = Widget.Box({
        hpack: 'center',
        spacing: 3,
        children: [
            Widget.Label({
                label: 'cancel',
                className: 'placeholder icon-material text-xl',
            }),
            Widget.Label({
                label: 'Couldn\'t find a match',
                class_name: 'placeholder',
            }),
        ],
    });

    const entry = Widget.Entry({
        hexpand: true,
        text: '-',
        placeholderText: 'Search',
        onAccept: ({ text }) => {
            const items = queryFilteredApps(text || '');
            if (items[0]) {
                App.closeWindow('launcher');
                items[0].launch();
            }
        },
        onChange: ({ text }) => {
            const items = queryFilteredApps(text || '');
            list.children = items.map((app) => [AppItem(app)]).flat();
            list.show_all();

            placeholder.visible = list.children.length === 0;
        },
    });

    return Widget.Box({
        className: 'applauncher',
        attribute: { list },
        vertical: true,
        children: [
            Widget.Box({
                className: 'header',
                child: entry,
            }),
            Widget.Scrollable({
                hscroll: 'never',
                hexpand: true,
                vexpand: true,
                child: Widget.Box({
                    vertical: true,
                    children: [list, placeholder],
                }),
            }),
        ],
        setup: (self) => self
            .hook(App, (_, name, visible) => {
                if (name !== 'launcher') {
                    return;
                }

                entry.set_text('');

                if (visible) {
                    Applications.reload();
                    entry.grab_focus();
                }
            }, 'window-toggled')
            .hook(Applications, () => {
                fuse.setCollection(Applications.list);
            }, 'changed')
    });
};

export default () => PopupWindow({
    name: 'launcher',
    keymode: 'exclusive',
    showClassName: 'launcher-show',
    hideClassName: 'launcher-hide',
    child: Launcher(),
});
