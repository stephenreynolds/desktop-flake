{ config, lib, pkgs, inputs, ... }:

let
  inherit (lib) mkIf mkMerge mkOption mkEnableOption types getExe optionalString;
  cfg = config.desktop-flake.hypridle;

  hyprctl = "${config.wayland.windowManager.hyprland.package}/bin/hyprctl";
in
{
  imports = [ inputs.hypridle.homeManagerModules.default ];

  options.desktop-flake.hypridle = {
    enable = mkOption {
      type = types.bool;
      default = config.desktop-flake.hyprland.enable;
      description = "Whether to enable hypridle";
    };
    dim = {
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
        default = getExe (pkgs.writeShellApplication {
          name = "dimBrightness";
          runtimeInputs = [ pkgs.brightnessctl ];
          text = ''
            brightnessctl -s set 10
          '';
        });
      };
      onResume = mkOption {
        type = types.str;
        default = getExe (pkgs.writeShellApplication {
          name = "restoreBrightness";
          runtimeInputs = [ pkgs.brightnessctl ];
          text = ''
            brightnessctl -r
          '';
        });
      };
    };
    dpms = {
      onTimeout = mkOption {
        type = types.str;
        default = getExe (pkgs.writeShellApplication {
          name = "dpmsOff";
          runtimeInputs = [ hyprctl ];
          text = ''
            hyprctl dispatch dpms off
          '';
        });
      };
      onResume = mkOption {
        type = types.str;
        default = getExe (pkgs.writeShellApplication {
          name = "dpmsOn";
          runtimeInputs = [ hyprctl ];
          text = ''
            hyprctl dispatch dpms on
          '';
        });
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
        default = getExe (pkgs.writeShellApplication {
          name = "pause";
          runtimeInputs = [ pkgs.playerctl ];
          text = ''
            playerctl --all-players pause
          '';
        });
      };
    };
    lock = {
      onTimeout = mkOption {
        type = types.str;
        default = optionalString config.desktop-flake.hyprlock.enable
          (getExe (pkgs.writeShellApplication {
            name = "lock";
            runtimeInputs = [ pkgs.coreutils config.programs.hyprlock.package ];
            text = ''
              ${cfg.pause.onTimeout}
              pidof hyprlock || hyprlock
            '';
          }));
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
        default = getExe (pkgs.writeShellApplication {
          name = "suspend";
          runtimeInputs = [ pkgs.systemd ];
          text = ''
            systemctl suspend
          '';
        });
      };
      beforeCmd = mkOption {
        type = types.str;
        default = getExe (pkgs.writeShellApplication {
          name = "beforeSuspend";
          runtimeInputs = [ pkgs.systemd ];
          text = ''
            ${cfg.pause.onTimeout} 
            loginctl lock-session
          '';
        });
      };
      afterCmd = mkOption {
        type = types.str;
        default = getExe (pkgs.writeShellApplication {
          name = "afterSuspend";
          runtimeInputs = [ hyprctl ];
          text = ''
            hyprctl dispatch dpms on
          '';
        });
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

