{ hyprctl, pkgs }:
let jaq = "${pkgs.jaq}/bin/jaq";
in pkgs.writeShellScript "killandswitch" ''
  case $(${hyprctl} activewindow -j | ${jaq} -r ".class") in
    "discord")
      ${pkgs.xdotool}/bin/xdotool getactivewindow windowunmap
      ${hyprctl} dispatch killactive ""
      ;;
    *)
      ${hyprctl} dispatch killactive
  esac
''
