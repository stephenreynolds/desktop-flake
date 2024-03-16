self:
{ config, lib, pkgs, ... }:

let
  inherit (lib) mkIf;
  cfg = config.desktop-flake.hyprland;

  modifier = "SUPER";
  ags = "ags -b hyprland";
in mkIf cfg.enable {
  wayland.windowManager.hyprland.extraConfig = ''
    bind = ${modifier}, Space, exec, ${ags} -t launcher
    bind = ${modifier}, N, exec, ${ags} -t action-center
  '';
}
