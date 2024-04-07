{ config, lib, ... }:

let
  inherit (lib) mkIf;
  cfg = config.desktop-flake.hyprland;

  primaryMonitor = config.desktop-flake.primaryMonitor;
  terminal = "xterm";
in
mkIf cfg.enable {
  wayland.windowManager.hyprland.settings.workspace = [
    "special, monitor:${primaryMonitor}, on-created-empty:[group new] ${terminal}"
  ];
}
