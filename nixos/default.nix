self:
{ config, lib, pkgs, ... }:

let
  inherit (lib) mkEnableOption;
  inherit (self) inputs;
in {
  imports = map (path: import path { inherit config lib pkgs inputs; }) [
    ./hyprland.nix
    ./hyprlock.nix
  ];

  options.desktop-flake = {
    enable = mkEnableOption "Whether to enable the desktop environment";
  };
}
