{ config, lib, ... }:

let
  inherit (lib) mkIf;
  cfg = config.desktop-flake.hyprland;

  terminal = "xterm";
in
mkIf cfg.enable {
  wayland.windowManager.hyprland.settings.workspace = [
    "s[true], on-created-empty:[group new] ${terminal}"
  ];
}
