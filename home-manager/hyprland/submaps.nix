{ config, lib, ... }:

let
  inherit (lib) mkIf;
  cfg = config.desktop-flake.hyprland;
in mkIf cfg.enable {
  wayland.windowManager.hyprland.extraConfig = ''
    # Passthrough submap
    bind = $mod, Pause, submap, passthrough_submap
    submap = passthrough_supmap
    bind = $mod, Pause, submap, reset
    submap = reset
  '';
}
