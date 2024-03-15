self: { config, lib, pkgs, ... }:

let
  inherit (lib) mkIf mkOption types;
  cfg = config.desktop-flake.hyprlock;
in
{
  imports = [ self.inputs.hyprlock.homeManagerModules.default ];

  options.desktop-flake.hyprlock = {
    enable = mkOption {
      type = types.bool;
      default = config.desktop-flake.enable;
      description = "Whether to enable hyprlock";
    };
    clockFormat = mkOption {
      type = types.str;
      default = "%-I:%M %p";
      description = ''
        The format of the clock widget.
        See `man date`.
      '';
    };
    grace = mkOption {
      type = types.int;
      default = 0;
      description = ''
        The amount of seconds for which the lockscreen will unlock on mouse movement.
      '';
    };
  };

  config = mkIf cfg.enable {
    programs.hyprlock =
      let
        monitor = config.desktop-flake.primaryMonitor;
        text_color = "rgba(ede0deff)";
        entry_background_color = "rgba(130f0f11)";
        entry_border_color = "rgba(a08c8955)";
        entry_color = "rgba(d8c2bfff)";
        font_family = "Gabarito";
        font_family_clock = "Gabarito";
        font_material_symbols = "Material Symbols Rounded";
      in
      {
        enable = true;

        general = {
          disable_loading_bar = true;
          grace = cfg.grace;
        };

        backgrounds = [
          {
            path =
              if config.desktop-flake.ags.enable then
                "${config.xdg.cacheHome}/ags/user/wallpaper"
              else "screenshot";
            color = "rgba(130f0f77)";
            blur_size = 5;
            blur_passes = 4;
          }
        ];

        input-fields = [
          {
            inherit monitor;
            size = {
              width = 250;
              height = 50;
            };
            outline_thickness = 2;
            dots_size = 0.1;
            dots_spacing = 0.3;
            outer_color = entry_border_color;
            inner_color = entry_background_color;
            font_color = entry_color;
            fade_on_empty = true;
            position = {
              x = 0;
              y = 20;
            };
            halign = "center";
            valign = "center";
          }
        ];

        labels = [
          # Clock
          {
            inherit monitor;
            text = ''cmd[update:1000:1] echo "<span>$(date +'${cfg.clockFormat}')</span>"'';
            color = text_color;
            font_size = 65;
            font_family = font_family_clock;
            position = {
              x = 0;
              y = 300;
            };
            halign = "center";
            valign = "center";
          }
          # Greeting
          {
            inherit monitor;
            text = "$USER";
            color = text_color;
            font_size = 20;
            font_family = font_family;
            position = {
              x = 0;
              y = 240;
            };
            halign = "center";
            valign = "center";
          }
          # Lock icon
          {
            inherit monitor;
            text = "lock";
            color = text_color;
            font_size = 21;
            font_family = font_material_symbols;
            position = {
              x = 0;
              y = 65;
            };
            halign = "center";
            valign = "bottom";
          }
          # "locked" text
          {
            inherit monitor;
            text = "locked";
            color = text_color;
            font_size = 14;
            font_family = font_family;
            position = {
              x = 0;
              y = 50;
            };
            halign = "center";
            valign = "bottom";
          }
        ];
      };

    home.packages = [
      pkgs.material-symbols
      (pkgs.google-fonts.override {
        fonts = [ "Gabarito" ];
      })
    ];
  };
}
