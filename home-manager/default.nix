self:
{ config, lib, pkgs, ... }:

let
  inherit (lib) mkEnableOption mkOption types;
  inherit (self) inputs;
in {
  imports = map (path: import path { inherit config lib pkgs inputs self; }) [
    ./ags.nix
    ./hypridle.nix
    ./hyprlock.nix
    ./hyprland
  ];

  options.desktop-flake = {
    enable = mkEnableOption "Whether to enable the desktop environment";
    nvidia = mkEnableOption "Whether to enable options for Nvidia GPUs";
    primaryMonitor = mkOption {
      type = types.str;
      default = "";
      description = "The primary monitor.";
    };
  };
}
