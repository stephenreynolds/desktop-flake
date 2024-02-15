self: { config, lib, pkgs, ... }:

let
  inherit (lib) mkOption mkIf mkMerge;
  cfg = config.desktop-flake;
in
{
  imports = [
    (import ./autostart.nix self)
    (import ./options.nix self)
    (import ./layer-rules.nix self)
    (import ./window-rules.nix self)
  ];

  options.desktop-flake = {
    xdg-autostart = mkOption {
      type = lib.types.bool;
      default = true;
      description = "Whether to autostart programs that ask for it";
    };
  };

  config = mkIf cfg.enable (mkMerge [
    {
      wayland.windowManager.hyprland = {
        enable = true;
        package = self.inputs.hyprland.packages.${pkgs.system}.hyprland;
      };

      # Stolen from https://github.com/alebastr/sway-systemd/commit/0fdb2c4b10beb6079acd6073c5b3014bd58d3b74
      systemd.user.targets.hyprland-session-shutdown = {
        Unit = {
          Description = "Shutdown running Hyprland session";
          DefaultDependencies = "no";
          StopWhenUnneeded = "true";

          Conflicts = [
            "graphical-session.target"
            "graphical-session-pre.target"
            "hyprland-session.target"
          ];
          After = [
            "graphical-session.target"
            "graphical-session-pre.target"
            "hyprland-session.target"
          ];
        };
      };
    }

    (lib.mkIf cfg.xdg-autostart {
      systemd.user.targets.hyprland-session = {
        Unit = {
          Description = "Hyprland compositor session";
          BindsTo = [ "graphical-session.target" ];
          Wants = [ "graphical-session-pre.target" "xdg-desktop-autostart.target" ];
          After = [ "graphical-session-pre.target" ];
          Before = [ "xdg-desktop-autostart.target" ];
        };
      };
    })
  ]);
}
