{ hyprctl, pkgs, rounding, gapsOut, gapsIn }:
let
  inherit (builtins) toString;
  jaq = "${pkgs.jaq}/bin/jaq";
in
pkgs.writeShellScript "toggle_hyprland_gaps" ''
  gaps_out=$(${hyprctl} -j getoption general:gaps_out | ${jaq} -r '.custom' | awk '{print $1}')
  gaps_in=$(${hyprctl} -j getoption general:gaps_in | ${jaq} -r '.custom' | awk '{print $1}')

  if [[ $gaps_out -eq 0 ]]; then
    gaps_out=${toString gapsOut}
    rounding=${toString rounding}
    state="enabled"
  else
    gaps_out=0
    rounding=0
    state="disabled"
  fi

  if [[ $gaps_in -eq 0 ]]; then
    gaps_in=${toString gapsIn}
  else
    gaps_in=0
  fi

  ${hyprctl} --batch "keyword general:gaps_out $gaps_out ; keyword general:gaps_in $gaps_in ; keyword decoration:rounding $rounding" 
''
