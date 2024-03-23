{ config, lib, ... }:

let
  inherit (lib) mkIf;
  cfg = config.desktop-flake.hyprland;
in
mkIf cfg.enable {
  wayland.windowManager.hyprland.extraConfig = ''
    # Passthrough submap
    bind = SUPERCTRLALTSHIFT, Q, submap, passthrough_supmap
    bind = SUPERCTRLALTSHIFT, Q, submap, passthrough_supmap

    submap = passthrough_supmap
    # Scroll through existing workspaces with {modifier} + scroll
    bind = $mod, mouse_down, workspace, m+1
    bind = $mod, mouse_up, workspace, m-1

    bind = SUPERCTRLALTSHIFT, Q, submap, reset
    bind = SUPERCTRLALTSHIFT, Q, submap, reset
    submap = reset
  '';
}
