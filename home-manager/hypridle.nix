self:
{ config, lib, pkgs, ... }:

let
  inherit (lib) mkIf mkMerge mkOption mkEnableOption types getExe;
  cfg = config.desktop-flake.hypridle;

  hyprctl = "${config.wayland.windowManager.hyprland.package}/bin/hyprctl";
in {
  imports = [ self.inputs.hypridle.homeManagerModules.default ];

  options.desktop-flake.hypridle = {
    enable = mkOption {
      type = types.bool;
      default = config.desktop-flake.enable;
      description = "Whether to enable hypridle";
    };
    dim = let brightnessctl = getExe pkgs.brightnessctl;
    in {
      enable = mkEnableOption "Whether to dim display";
      timeout = mkOption {
        type = types.int;
        default = cfg.dpms.timeout - 10;
        description = ''
          The time to wait before dimming.
          Default is dpms.timeout - 10 seconds.
        '';
      };
      onTimeout = mkOption {
        type = types.str;
        default = "${brightnessctl} -s set 10";
      };
      onResume = mkOption {
        type = types.str;
        default = "${brightnessctl} -r";
      };
    };
    dpms = {
      onTimeout = mkOption {
        type = types.str;
        default = "${hyprctl} dispatch dpms off";
      };
      onResume = mkOption {
        type = types.str;
        default = "${hyprctl} dispatch dpms on";
      };
      timeout = mkOption {
        type = types.int;
        default = cfg.lock.timeout - 10;
        description = ''
          The time to wait before turning off display.
          Default is lock.timeout - 10 seconds.
        '';
      };
    };
    pause = {
      enable = mkOption {
        type = types.bool;
        default = true;
        description = "Whether to pause all players before lock and suspend";
      };
      onTimeout = mkOption {
        type = types.str;
        default = "${getExe pkgs.playerctl} --all-players pause";
      };
    };
    lock = {
      onTimeout = mkOption {
        type = types.str;
        default =
          "${cfg.pause.onTimeout} ; pidof hyprlock || PATH=$PATH:${pkgs.coreutils}/bin ${
            getExe config.programs.hyprlock.package
          }";
      };
      timeout = mkOption {
        type = types.int;
        default = 600;
        description = ''
          The time to wait before locking.
          Default is 10 minutes.
        '';
      };
    };
    suspend = {
      enable = mkOption {
        type = types.bool;
        default = true;
        description = "Whether to enable automatically suspending";
      };
      onTimeout = mkOption {
        type = types.str;
        default = "systemctl suspend";
      };
      beforeCmd = mkOption {
        type = types.str;
        default =
          "${cfg.pause.onTimeout} ; ${pkgs.systemd}/bin/loginctl lock-session";
      };
      afterCmd = mkOption {
        type = types.str;
        default = "${hyprctl} dispatch dpms on";
      };
      timeout = mkOption {
        type = types.int;
        default = 3600;
        description = ''
          The time to wait before suspending.
          Default is 1 hour.
        '';
      };
    };
  };

  config = mkIf cfg.enable (mkMerge [
    {
      assertions = [{
        assertion = !(cfg.enable && config.services.swayidle.enable);
        message =
          "Only one of services.hypridle and services.swayidle can be enabled";
      }];
    }

    {
      services.hypridle = {
        enable = true;
        lockCmd = cfg.lock.onTimeout;
        beforeSleepCmd = cfg.suspend.beforeCmd;
        afterSleepCmd = cfg.suspend.afterCmd;
        listeners = [
          # Dim display
          (mkIf cfg.dim.enable {
            inherit (cfg.dim) timeout onTimeout onResume;
          })

          # Display on/off
          {
            inherit (cfg.dpms) timeout onTimeout onResume;
          }

          # Lock session
          {
            inherit (cfg.lock) timeout onTimeout;
          }

          # Suspend
          (mkIf cfg.suspend.enable { inherit (cfg.suspend) timeout onTimeout; })
        ];
      };
    }
  ]);
}

