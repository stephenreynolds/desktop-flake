#!/usr/bin/env bash

CONFIG_DIR="${AGS_CONFIG_DIR:-$XDG_CONFIG_HOME/ags}"
CACHE_DIR="${AGS_CACHE_DIR:-$XDG_CACHE_HOME/ags/user}"
MATERIAL_DIR="/tmp/ags/scss"

sleep 0
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

    cp "scripts/color_generation/gradience_template.json" "$CACHE_DIR/gradience.json"
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

apply_ags &
apply_hyprland &
apply_gtk &