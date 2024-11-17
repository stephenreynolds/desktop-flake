{ config, lib, pkgs, inputs, ... }:

let
  cfg = config.desktop-flake;

  hyprland = inputs.hyprland.packages.${pkgs.system};
in
{
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

    programs.uwsm = {
      enable = true;
      waylandCompositors.hyprland = {
        binPath = "/run/current-system/sw/bin/Hyprland";
        comment = "Hyprland session managed by uwsm";
        prettyName = "Hyprland";
      };
    };
  };
}
