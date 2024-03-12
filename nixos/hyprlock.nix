self: { config, lib, ... }:

let
  inherit (lib) mkIf mkOption types;
  cfg = config.desktop-flake.hyprlock;
in
{
  options.desktop-flake.hyprlock = {
    enable = mkOption {
      type = types.bool;
      default = config.desktop-flake.enable;
      description = "Whether to enable hyprlock";
    };
  };

  config = mkIf cfg.enable {
    # https://github.com/hyprwm/hyprlock/blob/main/pam/hyprlock
    security.pam.services.hyprlock.text = "auth include login";
  };
}
