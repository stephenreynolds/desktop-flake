#!/usr/bin/env bash

CONFIG_DIR="${AGS_CONFIG_DIR:-$XDG_CONFIG_HOME/ags}"
CACHE_DIR="${AGS_CACHE_DIR:-$XDG_CACHE_HOME/ags/user}"
MATERIAL_DIR="/tmp/ags/scss"

if [ ! -d "$CACHE_DIR" ]; then
    mkdir -p "$CACHE_DIR"
fi

cd "$CONFIG_DIR" || exit

colornames=$(cat $MATERIAL_DIR/_material.scss | cut -d: -f1)
colorstrings=$(cat $MATERIAL_DIR/_material.scss | cut -d: -f2 | cut -d ' ' -f2 | cut -d ";" -f1)
IFS=$'\n'
colorlist=( $colornames ) # Array of color names
colorvalues=( $colorstrings )

get_light_dark() {
    lightdark=""
    if [ ! -f "$CACHE_DIR"/colormode.txt ]; then
        echo "" > "$CACHE_DIR"/colormode.txt
    else
        lightdark=$(cat "$CACHE_DIR"/colormode.txt) # either "" or "-l"
    fi
    echo "$lightdark"
}

apply_hyprland() {
    primary=${colorvalues[1]#\#}
    secondaryContainer=${colorvalues[7]#\#}
    hyprctl --batch "keyword general:col.active_border rgba(${primary}FF) ; \
        keyword general:col.inactive_border rgba(${secondaryContainer}CC)";
}

apply_ags() {
    ags --bus-name hyprland --run-js "reloadScss()"
}

apply_gtk() {
    lightdark=$(get_light_dark)

    cp "scripts/color_generation/templates/gradience_template.json" "$CACHE_DIR/gradience.json"
    #
    # Apply colors
    for i in "${!colorlist[@]}"; do
        sed -i "s/{{ ${colorlist[$i]} }}/${colorvalues[$i]}/g" "$CACHE_DIR/gradience.json"
    done

    mkdir -p "$XDG_CONFIG_HOME/presets" # create gradience presets folder
    gradience-cli apply -p "$CACHE_DIR"/gradience.json --gtk both

    # Set light/dark preference
    # And set GTK theme manually as Gradience defaults to light adw-gtk3
    # (which is unreadable when broken when you use dark mode)
    if [ "$lightdark" = "-l" ]; then
        gsettings set org.gnome.desktop.interface gtk-theme 'adw-gtk3'
        gsettings set org.gnome.desktop.interface color-scheme 'prefer-light'
    else
        gsettings set org.gnome.desktop.interface gtk-theme adw-gtk3-dark
        gsettings set org.gnome.desktop.interface color-scheme 'prefer-dark'
    fi
}

apply_kitty() {
    if ! command -v kitty > /dev/null 2>&1; then
        return
    fi

    lightdark=$(get_light_dark)

    wal -c

    if [ "$lightdark" = "-l" ]; then
        wal -i "$CACHE_DIR"/wallpaper -qnel
    else
        wal -i "$CACHE_DIR"/wallpaper -qne
    fi

    mkdir -p "$XDG_CONFIG_HOME/kitty/generated"
    cp "$XDG_CACHE_HOME"/wal/colors-kitty.conf "$XDG_CONFIG_HOME"/kitty/themes/generated-wal.conf
    kitty +kitten themes --reload-in=all --config-file-name "generated-theme.conf" Generated-Wal
}

apply_ags &
apply_hyprland &
apply_kitty &
apply_gtk &
