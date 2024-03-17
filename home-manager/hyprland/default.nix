{ config, lib, pkgs, inputs, ... }:

let
  inherit (lib) mkEnableOption mkOption mkIf mkMerge types;
  cfg = config.desktop-flake.hyprland;
in {
  imports = map (path: import path { inherit config lib pkgs inputs; }) [
    ./autostart.nix
    ./binds.nix
    ./environment.nix
    ./layer-rules.nix
    ./options.nix
    ./submaps.nix
    ./window-rules.nix
    ./workspaces.nix
  ];

  options.desktop-flake.hyprland = {
    enable = mkOption {
      type = types.bool;
      default = config.desktop-flake.enable;
      description = "Whether to enable Hyprland";
    };
    additionalSessionVariables = mkOption {
      type = types.attrs;
      default = { };
      description = "List of environment variables to set on login";
    };
    modifier = mkOption {
      type = types.str;
      default = "SUPER";
      description = "The modifier key for some keybinds";
    };
    tearing.enable = mkEnableOption "Whether to allow screen tearing";
    xdg-autostart = mkOption {
      type = types.bool;
      default = true;
      description = "Whether to autostart programs that ask for it";
    };
  };

  config = mkIf cfg.enable (mkMerge [
    {
      wayland.windowManager.hyprland = {
        enable = true;
        package = inputs.hyprland.packages.${pkgs.system}.hyprland;
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

    (mkIf cfg.xdg-autostart {
      systemd.user.targets.hyprland-session = {
        Unit = {
          Description = "Hyprland compositor session";
          BindsTo = [ "graphical-session.target" ];
          Wants =
            [ "graphical-session-pre.target" "xdg-desktop-autostart.target" ];
          After = [ "graphical-session-pre.target" ];
          Before = [ "xdg-desktop-autostart.target" ];
        };
      };
    })
  ]);
}
