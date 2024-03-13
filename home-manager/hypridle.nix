self: { config, lib, pkgs, ... }:

let
  inherit (lib) mkIf mkMerge mkOption types getExe;
  cfg = config.desktop-flake.hypridle;
in
{
  imports = [ self.inputs.hypridle.homeManagerModules.default ];

  options.desktop-flake.hypridle = {
    enable = mkOption {
      type = types.bool;
      default = config.desktop-flake.enable;
      description = "Whether to enable hypridle";
    };
    lock = {
      cmd = mkOption {
        type = types.str;
        default = "pidof hyprlock || PATH=$PATH:${pkgs.coreutils}/bin ${getExe config.programs.hyprlock.package}";
      };
      timeout = mkOption {
        type = types.int;
        default = 180;
        description = ''
          The time to wait before locking.
          Default is 3 minutes.
        '';
      };
    };
    dpms =
      let
        hyprctl = "${config.wayland.windowManager.hyprland.package}/bin/hyprctl";
      in
      {
        onCmd = mkOption {
          type = types.str;
          default = "${hyprctl} dispatch dpms on";
        };
        offCmd = mkOption {
          type = types.str;
          default = "${hyprctl} dispatch dpms off";
        };
        timeout = mkOption {
          type = types.int;
          default = 240;
          description = ''
            The time to wait before turning off display.
            Default is 4 minutes.
          '';
        };
      };
    suspend = {
      enable = mkOption {
        type = types.bool;
        default = true;
        description = "Whether to enable automatically suspending";
      };
      cmd = mkOption {
        type = types.str;
        default = "systemctl suspend";
      };
      beforeCmd = mkOption {
        type = types.str;
        default = "${pkgs.systemd}/bin/loginctl lock-session";
      };
      timeout = mkOption {
        type = types.int;
        default = 540;
        description = ''
          The time to wait before suspending.
          Default is 9 minutes.
        '';
      };
    };
  };

  config = mkIf cfg.enable (mkMerge [
    {
      assertions = [{
        assertion = !(cfg.enable && config.services.swayidle.enable);
        message = "Only one of services.hypridle and services.swayidle can be enabled";
      }];
    }

    {
      services.hypridle = {
        enable = true;
        lockCmd = cfg.lock.cmd;
        beforeSleepCmd = cfg.suspend.beforeCmd;
        listeners = [
          {
            timeout = cfg.lock.timeout;
            onTimeout = cfg.lock.cmd;
          }
          {
            timeout = cfg.dpms.timeout;
            onTimeout = cfg.dpms.offCmd;
            onResume = cfg.dpms.onCmd;
          }
          (mkIf cfg.suspend.enable {
            timeout = cfg.suspend.timeout;
            onTimeout = cfg.suspend.cmd;
          })
        ];
      };
    }
  ]);
}








