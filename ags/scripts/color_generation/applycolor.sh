#!/usr/bin/env bash

CONFIG_DIR="${AGS_CONFIG_DIR:-$XDG_CONFIG_HOME/ags}"
MATERIAL_DIR="/tmp/ags/scss"

sleep 0
cd "$CONFIG_DIR" || exit

colorstrings=''
colorvalues=()
IFS=$'\n'
colorstrings=$(cat $MATERIAL_DIR/_material.scss | cut -d: -f2 | cut -d ' ' -f2 | cut -d ";" -f1)
colorvalues=( $colorstrings )

apply_hyprland() {
    onPrimary=${colorvalues[2]#\#}
    secondaryContainer=${colorvalues[7]#\#}
    onError=${colorvalues[14]#\#}
    hyprctl --batch "keyword general:col.active_border rgba(${onPrimary}FF) ; \
        keyword general:col.inactive_border rgba(${secondaryContainer}CC) ; \
        keyword group:col.border_locked_active rgba(${onError}FF) ; \
        keyword group:groupbar:col.locked_active rgba(${onError}FF)"
}

apply_ags() {
    ags --bus-name hyprland --run-js "reloadScss()"
}

apply_ags &
apply_hyprland &
