{ pkgs, ... }:
let wpctl = "${pkgs.wireplumber}/bin/wpctl";
in pkgs.writeShellScript "volume_helper" ''
  set -x
  SINK="@DEFAULT_SINK@"
  DEFAULT_STEP=2
  LIMIT=''${LIMIT:-1}
  CHANGE=0
  VOLUME=-1

  while true; do
  	case $1 in
  	--sink)
  		SINK=''${2:-$SINK}
  		shift
  		;;
  	-l | --limit)
  		LIMIT=$((''${2:-$LIMIT}))
  		shift
  		;;
  	--set-volume)
  		VOLUME=$(($2))
  		shift
  		;;
  	-i | --increase)
  		CHANGE=$((''${2:-$DEFAULT_STEP}))
  		shift
  		;;
  	-d | --decrease)
  		CHANGE=$((-''${2:-$DEFAULT_STEP}))
  		shift
  		;;
  	*)
  		break
  		;;
  	esac
  	shift
  done

  play_sound() {
    ${pkgs.libcanberra-gtk3}/bin/canberra-gtk-play -f ${pkgs.yaru-theme}/share/sounds/Yaru/stereo/audio-volume-change.oga
  }

  if [ "$CHANGE" -gt 0 ]; then
    ${wpctl} set-volume $SINK $CHANGE%+ --limit $LIMIT
    play_sound
  elif [ "$CHANGE" -lt 0 ]; then
    ${wpctl} set-volume $SINK $((-CHANGE))%- --limit $LIMIT
    play_sound
  elif [ "$VOLUME" -ge 0 ]; then
    ${wpctl} set-volume $SINK $VOLUME --limit $LIMIT
    play_sound
  fi
''
