{ hyprctl, pkgs }:
let jaq = "${pkgs.jaq}/bin/jaq";
in pkgs.writeShellScript "killandswitch" ''
  killactive() {
    case $(${hyprctl} activewindow -j | ${jaq} -r ".class") in
      "discord")
        ${pkgs.xdotool}/bin/xdotool getactivewindow windowunmap
        ${hyprctl} dispatch killactive ""
        ;;
      *)
        ${hyprctl} dispatch killactive
    esac
  }

  workspace=$(${hyprctl} activewindow -j | ${jaq} -r ".workspace.id")
  if [[ $workspace == "-99" ]]; then
    killactive
  else
    active=$(${hyprctl} activeworkspace -j)
    lastwindow=$(echo "$active" | ${jaq} -r ".windows == 1")
    killactive
    if [[ $lastwindow == "true" ]]; then
      monitor=$(echo "$active" | ${jaq} -r ".monitorID")
      lastworkspace=$(${hyprctl} workspaces -j | ${jaq} -r "map(select(.monitorID == $monitor and .id != -99)) | length == 1")
      if [[ $lastworkspace == "false" ]]; then
        ${hyprctl} dispatch workspace m-1
      fi
    fi
  fi
''
