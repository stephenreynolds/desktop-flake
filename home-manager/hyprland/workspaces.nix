{ config, lib, ... }:

let
  inherit (lib) mkIf;
  cfg = config.desktop-flake.hyprland;

  primaryMonitor = config.desktop-flake.primaryMonitor;
  terminal = config.home.sessionVariables.TERMINAL;
in mkIf cfg.enable {
  wayland.windowManager.hyprland.settings.workspace = [
    "s[true], monitor:${primaryMonitor}, on-created-empty:[group new] ${terminal}"
  ];
}
