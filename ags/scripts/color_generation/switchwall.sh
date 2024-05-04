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

hyprctl hyprpaper preload "$imgpath"
hyprctl hyprpaper wallpaper ",$imgpath"

cp "$imgpath" "$CACHE_DIR"/wallpaper

"$CONFIG_DIR"/scripts/color_generation/colorgen.sh "${imgpath}" --apply
