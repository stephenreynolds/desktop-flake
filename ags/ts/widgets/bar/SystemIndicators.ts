import Widget from 'resource:///com/github/Aylur/ags/widget.js';
import Audio from 'resource:///com/github/Aylur/ags/service/audio.js';
import Network from 'resource:///com/github/Aylur/ags/service/network.js';
import { truncateString } from 'utils';

const AudioIndicator = () => {
    const delta = 0.05;
    const incrementVolume = () => Audio.speaker.volume = Math.min(1, Audio.speaker.volume + delta);
    const decrementVolume = () => Audio.speaker.volume = Audio.speaker.volume - delta;
    const muteVolume = () => Audio.speaker.stream.isMuted = !Audio.speaker.stream.isMuted;

    return Widget.EventBox({
        onScrollUp: incrementVolume,
        onScrollDown: decrementVolume,
        onMiddleClick: muteVolume,
        child: Widget.Label({
            className: 'text-xl icon-material',
            setup: (self) => self.hook(Audio, () => {
                if (!Audio.speaker) {
                    return;
                }

                /** @type {Array<[number, string]>} */
                const volumeIcons = [[67, 'volume_up'], [34, 'volume_down'], [0, 'volume_mute']];
                const volume = Math.ceil(Audio.speaker.volume * 100);
                const name = truncateString(Audio.speaker.description || '', 30);
                const isMuted = Audio.speaker.stream?.isMuted;
                if (isMuted) {
                    self.label = 'volume_off';
                }
                else {
                    self.label = volumeIcons.find(([n]) => n <= volume)?.[1] || '';
                }
                const volumeText = isMuted ? 'muted' : `${Math.floor(volume)}%`;
                self.tooltip_text = `${name}: ${volumeText}`;
            }, 'speaker-changed'),
        }),
    });
};

const SimpleNetworkIndicator = () => Widget.Icon({
    setup: (self) => self.hook(Network, self => {
        const icon = Network[Network.primary || 'wifi']?.iconName;
        self.icon = icon || '';
        self.visible = icon;
    }),
});

const NetworkWiredIndicator = () => Widget.Stack({
    children: {
        'fallback': SimpleNetworkIndicator(),
        'unknown': Widget.Label({ className: 'text-xl icon-material', label: 'wifi_off' }),
        'disconnected': Widget.Label({ className: 'text-xl icon-material', label: 'signal_wifi_off' }),
        'connected': Widget.Label({ className: 'text-xl icon-material', label: 'lan' }),
        'connecting': Widget.Label({ className: 'text-xl icon-material', label: 'settings_ethernet' }),
    },
    setup: (self) => self.hook(Network, stack => {
        if (!Network.wired)
            return;

        const { internet } = Network.wired;
        if (['connecting', 'connected'].includes(internet))
            stack.shown = internet;
        else if (Network.connectivity !== 'full')
            stack.shown = 'disconnected';
        else
            stack.shown = 'fallback';
    }),
});

const NetworkWifiIndicator = () => Widget.Stack({
    children: {
        'disabled': Widget.Label({ className: 'text-xl icon-material', label: 'wifi_off' }),
        'disconnected': Widget.Label({ className: 'text-xl icon-material', label: 'signal_wifi_off' }),
        'connecting': Widget.Label({ className: 'text-xl icon-material', label: 'settings_ethernet' }),
        '0': Widget.Label({ className: 'text-xl icon-material', label: 'signal_wifi_0_bar' }),
        '1': Widget.Label({ className: 'text-xl icon-material', label: 'network_wifi_1_bar' }),
        '2': Widget.Label({ className: 'text-xl icon-material', label: 'network_wifi_2_bar' }),
        '3': Widget.Label({ className: 'text-xl icon-material', label: 'network_wifi_3_bar' }),
        '4': Widget.Label({ className: 'text-xl icon-material', label: 'signal_wifi_4_bar' }),
    },
    setup: (self) => self.hook(Network, (stack) => {
        if (!Network.wifi) {
            return;
        }

        switch (Network.wifi.internet) {
            case 'connected':
                stack.shown = String(Math.ceil(Network.wifi.strength / 25));
                stack.tooltip_text = `Connected to ${Network.wifi.ssid}`;
                break;
            case 'connecting':
                stack.shown = 'connecting';
                stack.tooltip_text = "Connecting...";
                break;
            case 'disconnected':
                stack.shown = 'disconnected';
                stack.tooltip_text = 'Disconnected';
                break;
        }
    }),
});

export const NetworkIndicator = () => Widget.Stack({
    children: {
        'fallback': SimpleNetworkIndicator(),
        'wifi': NetworkWifiIndicator(),
        'wired': NetworkWiredIndicator(),
    },
    setup: (self) => self.hook(Network, stack => {
        if (!Network.primary) {
            stack.shown = 'wifi';
            return;
        }
        const primary = Network.primary || 'fallback';
        if (['wifi', 'wired'].includes(primary))
            stack.shown = primary;
        else
            stack.shown = 'fallback';
    }),
});

export default () => {
    const audioIndicator = AudioIndicator();
    const networkIndicator = NetworkIndicator();

    return Widget.Box({
        child: Widget.Box({
            className: 'system-indicators spacing-h-5',
            children: [
                networkIndicator,
                audioIndicator,
            ],
        }),
    });
};
