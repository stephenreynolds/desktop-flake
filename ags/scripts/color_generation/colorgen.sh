#!/usr/bin/env bash

# check if no arguments
if [ $# -eq 0 ]; then
	echo "Usage: colorgen.sh /path/to/image (--apply)"
	exit 1
fi

CONFIG_DIR="${AGS_CONFIG_DIR:-$XDG_CONFIG_HOME/ags}"
CACHE_DIR="${AGS_CACHE_DIR:-$XDG_CACHE_HOME/ags/user}"
DEST_DIR="$CACHE_DIR/scss"

mkdir -p "$CACHE_DIR"
mkdir -p "$DEST_DIR"

# check if the file ~/.cache/ags/user/colormode.txt exists. if not, create it. else, read it to $lightdark
lightdark=""
if [ ! -f "$CACHE_DIR/colormode.txt" ]; then
	echo "" >"$CACHE_DIR/colormode.txt"
else
	lightdark=$(cat "$CACHE_DIR/colormode.txt") # either "" or "-l"
fi

cd "$CONFIG_DIR/scripts/" || exit
file="$DEST_DIR/_material.scss"
color_generation/generate_colors_material.py --path "$1" "$lightdark" >"$file"
if [ "$2" = "--apply" ]; then
	# If there is a warning in the first line, remove it
	if [[ $(head -n 1 "$file") == *"Warning"* ]]; then
		sed -i '1d' "$file"
	fi

	color_generation/applycolor.sh
fi
