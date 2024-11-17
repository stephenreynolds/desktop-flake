{ config, lib, pkgs, inputs, ... }:

let
  inherit (lib) mkEnableOption mkOption mkIf mkMerge types;
  cfg = config.desktop-flake.hyprland;
in
{
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
    animations = {
      enable = mkOption {
        type = types.bool;
        default = true;
        description = "Whether to enable animations";
      };
    };
    gaps = {
      outer = mkOption {
        type = types.oneOf [ types.int types.str ];
        default = 5;
        description = "The size of outer gaps";
      };
      inner = mkOption {
        type = types.oneOf [ types.int types.str ];
        default = 4;
        description = "The size of inner gaps";
      };
      workspaces = mkOption {
        type = types.oneOf [ types.int types.str ];
        default = 50;
        description = "The size of gaps between workspaces";
      };
    };
    borderSize = mkOption {
      type = types.int;
      default = 1;
      description = "The size of the borders";
    };
    rounding = mkOption {
      type = types.int;
      default = 10;
      description = "The amount of rounding around windows";
    };
    defaultLayout = mkOption {
      type = types.enum [ "dwindle" "master" ];
      default = "master";
      description = "The default layout";
    };
    modifier = mkOption {
      type = types.str;
      default = "SUPER";
      description = "The modifier key for some keybinds";
    };
    tearing.enable = mkEnableOption "Whether to allow screen tearing";
  };

  config = mkIf cfg.enable (mkMerge [
    {
      wayland.windowManager.hyprland = {
        enable = true;
        package = inputs.hyprland.packages.${pkgs.system}.hyprland;
        systemd.enable = false;
      };

      services.avizo.enable = true;
    }
  ]);
}
