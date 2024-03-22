{ config, lib, pkgs, inputs, ... }:

let
  inherit (lib) mkIf;
  cfg = config.desktop-flake.hyprland;

  hyprland-plugins = inputs.hyprland-plugins.packages.${pkgs.system};
in
mkIf cfg.enable {
  wayland.windowManager.hyprland.plugins = [
    hyprland-plugins.hyprwinwrap
  ];

  wayland.windowManager.hyprland.settings = {
    plugin = {
      hyprwinwrap = {
        class = "kitty-bg";
      };
    };
  };
}
