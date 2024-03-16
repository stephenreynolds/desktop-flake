self:
{ config, lib, pkgs, ... }:

let
  inherit (lib) mkIf getExe;
  cfg = config.desktop-flake.hyprland;
in mkIf cfg.enable {
  wayland.windowManager.hyprland.settings = {
    exec = let
      ags = "${
          self.inputs.ags.packages.${pkgs.system}.default
        }/bin/ags -b hyprland";
    in [
      "${
        getExe pkgs.xorg.xrandr
      } --output ${config.desktop-flake.primaryMonitor} --primary"
      "${ags} -q; ${ags}"
    ];
  };
}
