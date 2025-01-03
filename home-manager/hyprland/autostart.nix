{ config, lib, pkgs, inputs, ... }:

let
  inherit (lib) mkIf getExe optionals;
  cfg = config.desktop-flake.hyprland;
  primaryMonitor = config.desktop-flake.primaryMonitor;
in
mkIf cfg.enable {
  wayland.windowManager.hyprland.settings = {
    exec = [ "${getExe pkgs.xorg.xrandr} --output ${primaryMonitor} --primary" ]
      ++ (optionals config.desktop-flake.ags.enable (
      let
        ags =
          "${inputs.ags.packages.${pkgs.system}.default}/bin/ags -b hyprland";
      in
      [ "uwsm app -- ${ags} -q; ${ags}" ]
    ));

    exec-once =
      let
        cliphist = "${pkgs.cliphist}/bin/cliphist";
        wl-paste = "${pkgs.wl-clipboard}/bin/wl-paste";
      in
      [
        "sleep 0.5 ; ${pkgs.libcanberra-gtk3}/bin/canberra-gtk-play -f ${pkgs.yaru-theme}/share/sounds/Yaru/stereo/desktop-login.oga"

        "uwsm app -- ${wl-paste} --type text --watch ${cliphist} store"
        "uwsm app -- ${wl-paste} --type image --watch ${cliphist} store"
      ];
  };
}
