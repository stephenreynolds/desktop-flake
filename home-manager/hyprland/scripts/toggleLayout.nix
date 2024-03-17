{ hyprctl, pkgs }:
let jaq = "${pkgs.jaq}/bin/jaq";
in pkgs.writeShellScript "toggle_hyprland_layout" ''
  layout=$(${hyprctl} -j getoption general:layout | ${jaq} -r ".str")
  if [[ $layout == "master" ]]; then
    hyprctl keyword general:layout "dwindle"
  else
    hyprctl keyword general:layout "master"
  fi
''
