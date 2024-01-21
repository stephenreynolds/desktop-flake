self: { config, lib, pkgs, ... }:

let
  cfg = config.desktop-flake;

  ags = "${self.inputs.ags.packages.${pkgs.system}.default}/bin/ags -b hyprland";
in
lib.mkIf cfg.enable {
  wayland.windowManager.hyprland.settings = {
    exec = [
      "${ags} -q; ${ags}"
    ];
  };
}
