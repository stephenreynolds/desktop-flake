import Widget from 'resource:///com/github/Aylur/ags/widget.js';
import { truncateString } from '../../utils.js';

const AudioIndicator = async () => {
    const audio = await Service.import('audio');

    return Widget.EventBox({
        onScrollUp: () => audio.speaker.volume += 0.02,
        onScrollDown: () => audio.speaker.volume -= 0.02,
        onMiddleClick: () => audio.speaker.stream.isMuted = !audio.speaker.stream.isMuted,
        child: Widget.Label({
            className: 'text-xl icon-material',
            setup: (self) => self.hook(audio, () => {
                if (!audio.speaker) {
                    return;
                }

                /** @type {Array<[number, string]>} */
                const volumeIcons = [[67, 'volume_up'], [34, 'volume_down'], [1, 'volume_mute']];
                const volume = audio.speaker.volume * 100;
                const name = truncateString(audio.speaker.description, 30);
                const isMuted = audio.speaker.stream.isMuted;
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

const NetworkIndicator = async () => {
    const network = await Service.import('network');

    return Widget.Stack({
        children: {
            'disabled': Widget.Label({ className: 'text-base icon-material', label: 'wifi_off' }),
            'disconnected': Widget.Label({ className: 'text-base icon-material', label: 'signal_wifi_off' }),
            'connecting': Widget.Label({ className: 'text-base icon-material', label: 'settings_ethernet' }),
            '0': Widget.Label({ className: 'text-base icon-material', label: 'signal_wifi_0_bar' }),
            '1': Widget.Label({ className: 'text-base icon-material', label: 'network_wifi_1_bar' }),
            '2': Widget.Label({ className: 'text-base icon-material', label: 'network_wifi_2_bar' }),
            '3': Widget.Label({ className: 'text-base icon-material', label: 'network_wifi_3_bar' }),
            '4': Widget.Label({ className: 'text-base icon-material', label: 'signal_wifi_4_bar' }),
        },
        setup: (self) => self.hook(network, (stack) => {
            if (!network.wifi) {
                return;
            }
            if (network.wifi.internet == 'connected') {
                stack.shown = String(Math.ceil(network.wifi.strength / 25));
            }
            else if (["disconnected", "connecting"].includes(network.wifi.internet)) {
                stack.shown = network.wifi.internet;
            }
        }),
    });
};

export default async () => {
    const audioIndicator = await AudioIndicator();
    const networkIndicator = await NetworkIndicator();

    return Widget.Box({
        child: Widget.Box({
            className: 'spacing-h-5',
            children: [
                networkIndicator,
                audioIndicator,
            ],
        }),
    });
};
