#!/usr/bin/env bash

CONFIG_DIR="${AGS_CONFIG_DIR:-$XDG_CONFIG_HOME/ags}"

cd "$HOME/Pictures" || "$HOME" || exit 1
imgpath=$(yad --width 1200 --height 800 --file --title='Choose wallpaper')
screensizey=$(wlr-randr | grep 'current' | uniq | awk '{print $1}' | cut -d 'x' -f2 | head -1)
cursorposx=$(hyprctl cursorpos -j | gojq '.x' 2>/dev/null) || cursorposx=960
cursorposy=$(hyprctl cursorpos -j | gojq '.y' 2>/dev/null) || cursorposy=540
cursorposy_inverted=$(( screensizey - cursorposy ))

if [ "$imgpath" == '' ]; then
    echo 'Aborted'
    exit 0
fi

swww img "$imgpath" --transition-step 100 --transition-fps 60 \
    --transition-type grow --transition-angle 30 --transition-duration 1 \
    --transition-pos "$cursorposx, $cursorposy_inverted"

"$CONFIG_DIR"/scripts/color_generation/colorgen.sh "${imgpath}" --apply
