self: { config, lib, pkgs, ... }:

let
  cfg = config.desktop-flake;

  modifier = "SUPER";
  ags = "ags -b hyprland";
in
lib.mkIf cfg.enable {
  wayland.windowManager.hyprland.extraConfig = ''
    bind = ${modifier}, Space, exec, ${ags} -t launcher
    bind = ${modifier}, N, exec, ${ags} -t action-center
  '';
}
