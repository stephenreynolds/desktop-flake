self: { config, lib, pkgs, ... }:

let
  cfg = config.desktop-flake;

  ags = "${self.inputs.ags.packages.${pkgs.system}.default}/bin/ags -b hyprland";
in
lib.mkIf cfg.enable {
  wayland.windowManager.hyprland.settings = {
    exec = [
      "${lib.getExe pkgs.xorg.xrandr} --output ${config.desktop-flake.primaryMonitor} --primary"
      "${ags} -q; ${ags}"
    ];
  };
}
