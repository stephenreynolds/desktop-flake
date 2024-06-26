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
colorlist=($colornames) # Array of color names
colorvalues=($colorstrings)

get_light_dark() {
	lightdark=""
	if [ ! -f "$CACHE_DIR"/colormode.txt ]; then
		echo "" >"$CACHE_DIR"/colormode.txt
	else
		lightdark=$(cat "$CACHE_DIR"/colormode.txt) # either "" or "-l"
	fi
	echo "$lightdark"
}

apply_hyprland() {
	primary=${colorvalues[1]#\#}
	secondaryContainer=${colorvalues[7]#\#}
	hyprctl --batch "keyword general:col.active_border rgba(${primary}FF) ; \
    keyword general:col.inactive_border rgba(${secondaryContainer}CC)"
}

apply_ags() {
	ags --bus-name hyprland --run-js "reloadScss()"
}

apply_gtk() {
	lightdark=$(get_light_dark)

	cp "scripts/color_generation/templates/gradience_template.json" "$CACHE_DIR/gradience.json"

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

apply_term() {
	lightdark=$(get_light_dark)

	wal -c

	if [ "$lightdark" = "-l" ]; then
		wal -i "$CACHE_DIR"/wallpaper -qnel
	else
		wal -i "$CACHE_DIR"/wallpaper -qne
	fi

	apply_kitty &
}

apply_kitty() {
	if ! command -v kitty >/dev/null 2>&1; then
		return
	fi

	mkdir -p "$XDG_CONFIG_HOME/kitty/themes"
	cp "$XDG_CACHE_HOME"/wal/colors-kitty.conf "$XDG_CONFIG_HOME"/kitty/themes/generated-wal.conf
	kitty +kitten themes --reload-in=all --config-file-name "generated-theme.conf" Generated-Wal
}

apply_electronmail() {
	config_file="$XDG_CONFIG_HOME/electron-mail/config.json"
	if [ ! -f "$config_file" ]; then
		return
	fi
	primary=${colorvalues[1]#\#}
	sed -i "s/\"customUnreadBgColor\": \"#.*\"/\"customUnreadBgColor\": \"#$primary\"/" "$config_file"
}

apply_vesktop() {
	theme_file="$XDG_CONFIG_HOME/vesktop/themes/material_generated.css"
	cp "scripts/color_generation/templates/vesktop.css.template" "$theme_file"

	# Apply colors
	for i in "${!colorlist[@]}"; do
		if ((i == 0)); then
			continue
		fi
		hex=${colorvalues[$i]:1:6}
		rgb=$(printf "%d, %d, %d" 0x"${hex:0:2}" 0x"${hex:2:2}" 0x"${hex:4:2}")
		sed -i "s/{{ ${colorlist[$i]} }}/$rgb/g" "$theme_file"
	done
}

apply_avizo() {
	mkdir -p "$XDG_CONFIG_HOME/avizo"
	config_file="$XDG_CONFIG_HOME/avizo/config.ini"
	cp "scripts/color_generation/templates/avizo.ini" "$config_file"

	hex=${colorvalues[7]:1:6}
	rgb=$(printf "%d, %d, %d" 0x"${hex:0:2}" 0x"${hex:2:2}" 0x"${hex:4:2}")
	sed -i "s/{{ background }}/rgba($rgb, 0.7)/g" "$config_file"
}

apply_ags &
apply_hyprland &
apply_term &
apply_gtk &
apply_electronmail &
apply_vesktop &
apply_avizo &
