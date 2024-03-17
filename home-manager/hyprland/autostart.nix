{ config, lib, pkgs, inputs, ... }:

let
  inherit (lib) mkIf getExe optionalString;
  cfg = config.desktop-flake.hyprland;
  primaryMonitor = config.desktop-flake.primaryMonitor;
in mkIf cfg.enable {
  wayland.windowManager.hyprland.settings = {
    exec = let
      ags = "${inputs.ags.packages.${pkgs.system}.default}/bin/ags -b hyprland";
    in [
      "${getExe pkgs.xorg.xrandr} --output ${primaryMonitor} --primary"
      "${ags} -q; ${ags}"
    ];

    exec-once = let
      hyprctl = "${config.wayland.windowManager.hyprland.package}/bin/hyprctl";
      cliphist = "${pkgs.cliphist}/bin/cliphist";
      wl-paste = "${pkgs.wl-clipboard}/bin/wl-paste";
    in [
      (optionalString (primaryMonitor != "")
        "${hyprctl} dispatch focusmonitor ${primaryMonitor}")

      "${wl-paste} --type text --watch ${cliphist} store"
      "${wl-paste} --type image --watch ${cliphist} store"
    ];
  };
}
