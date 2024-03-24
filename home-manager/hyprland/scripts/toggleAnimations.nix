{ hyprctl, pkgs, ... }:
let jaq = "${pkgs.jaq}/bin/jaq";
in pkgs.writeShellScript "toggle_hyprland_gaps" ''
  animations=$(${hyprctl} getoption animations:enabled -j | ${jaq} -r '.int')

  ${hyprctl} keyword animations:enabled $(($animations ^ 1))

  if [[ $animations -eq 0 ]]; then
    state="enabled"
  else
    state="disabled"
  fi
''
