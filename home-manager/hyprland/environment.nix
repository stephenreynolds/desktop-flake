{ config, lib, ... }:

let
  inherit (lib) mkIf optionalAttrs mapAttrsToList;
  cfg = config.desktop-flake.hyprland;

  sessionVariables = config.desktop-flake.hyprland.additionalSessionVariables
    // optionalAttrs config.desktop-flake.nvidia {
    # Nvidia: https://wiki.hyprland.org/Nvidia
    LIBVA_DRIVER_NAME = "nvidia";
    GBM_BACKEND = "nvidia-drm";
    __GLX_VENDOR_LIBRARY_NAME = "nvidia";
    NVD_BACKEND = "direct";
    MOZ_DISABLE_RDD_SANDBOX = 1;
  };
in
mkIf cfg.enable {
  wayland.windowManager.hyprland.settings.env =
    mapAttrsToList (key: value: "${key}, ${toString value}") sessionVariables;
}
