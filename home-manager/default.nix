self: { config, lib, pkgs, ... }:

let
  inherit (lib) mkEnableOption;
in
{
  imports = [
    (import ./ags.nix self)
    (import ./hypridle.nix self)
    (import ./hyprlock.nix self)
    (import ./hyprland self)
  ];

  options.desktop-flake = {
    enable = mkEnableOption "Whether to enable the desktop environment";
  };
}
