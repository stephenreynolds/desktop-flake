self: { config, lib, pkgs, ... }:

let
  inherit (lib) mkEnableOption;
in
{
  imports = [
    (import ./hyprland.nix self)
    (import ./hyprlock.nix self)
  ];

  options.desktop-flake = {
    enable = mkEnableOption "Whether to enable the desktop environment";
  };
}
