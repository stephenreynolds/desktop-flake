{ hyprctl, pkgs }:
let jaq = "${pkgs.jaq}/bin/jaq";
in pkgs.writeShellScript "toggle_hyprland_gaps" ''
  gaps_out=$(${hyprctl} -j getoption general:gaps_out | ${jaq} -r '.custom' | awk '{print $1}')
  gaps_in=$(${hyprctl} -j getoption general:gaps_in | ${jaq} -r '.custom' | awk '{print $1}')

  if [[ $gaps_out -eq 0 ]]; then
    gaps_out=10
    rounding=4
    state="enabled"
  else
    gaps_out=0
    rounding=0
    state="disabled"
  fi

  if [[ $gaps_in -eq 0 ]]; then
    gaps_in=10
  else
    gaps_in=0
  fi

  ${hyprctl} --batch "keyword general:gaps_out $gaps_out ; keyword general:gaps_in $gaps_in ; keyword general:rounding $rounding" 

  ${pkgs.libnotify}/bin/notify-send "Hyprland" "Gaps $state" --transient
''
