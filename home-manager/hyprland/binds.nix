self:
{ config, lib, pkgs, ... }:

let
  inherit (lib) mkIf;
  cfg = config.desktop-flake.hyprland;

  modifier = "SUPER";
  ags = "ags -b hyprland";
in mkIf cfg.enable {
  wayland.windowManager.hyprland.settings = {
    bind = let
      cliphist = "${pkgs.cliphist}/bin/cliphist";
      wofi = "${pkgs.wofi}/bin/wofi";
      wl-copy = "${pkgs.wl-clipboard}/bin/wl-copy";
    in [
      "${modifier}, Space, exec, ${ags} -t launcher"
      "${modifier}, N, exec, ${ags} -t action-center"

      "${modifier} CTRL, V, exec, ${cliphist} list | ${wofi} --dmenu | ${cliphist} decode | ${wl-copy}"
    ];
  };
}
