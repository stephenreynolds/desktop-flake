#!/usr/bin/env bash

CONFIG_DIR="${AGS_CONFIG_DIR:-$XDG_CONFIG_HOME/ags}"
CACHE_DIR="${AGS_CACHE_DIR:-$XDG_CACHE_HOME/ags/user}"

if [ $# -eq 0 ]; then
    cd "$HOME/Pictures" || "$HOME" || exit 1
    imgpath=$(yad --width 1200 --height 800 --file --title='Choose wallpaper')
else 
    imgpath=$1
fi

if [ "$imgpath" == '' ]; then
    echo 'Aborted'
    exit 0
fi

screensizey=$(wlr-randr | grep 'current' | uniq | awk '{print $1}' | cut -d 'x' -f2 | head -1)
cursorposx=$(hyprctl cursorpos -j | gojq '.x' 2>/dev/null) || cursorposx=960
cursorposy=$(hyprctl cursorpos -j | gojq '.y' 2>/dev/null) || cursorposy=540
cursorposy_inverted=$(( screensizey - cursorposy ))

swww img "$imgpath" --transition-step 100 --transition-fps 60 \
    --transition-type grow --transition-angle 30 --transition-duration 1 \
    --transition-pos "$cursorposx, $cursorposy_inverted"

cp "$imgpath" "$CACHE_DIR"/wallpaper

"$CONFIG_DIR"/scripts/color_generation/colorgen.sh "${imgpath}" --apply
