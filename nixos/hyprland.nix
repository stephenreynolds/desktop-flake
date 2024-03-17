{ config, lib, pkgs, inputs, ... }:

let
  cfg = config.desktop-flake;

  hyprland = inputs.hyprland.packages.${pkgs.system};
in {
  config = lib.mkIf cfg.enable {
    programs.hyprland = {
      enable = true;
      package = hyprland.hyprland;
    };

    xdg.portal = {
      enable = true;
      extraPortals = [ pkgs.xdg-desktop-portal-gtk ];
      configPackages = [ hyprland.xdg-desktop-portal-hyprland ];
    };
  };
}
