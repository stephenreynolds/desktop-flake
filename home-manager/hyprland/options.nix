self:
{ config, lib, pkgs, ... }:

let
  inherit (lib) mkIf;
  cfg = config.desktop-flake.hyprland;
in mkIf cfg.enable {
  wayland.windowManager.hyprland.settings = {
    general = {
      gaps_in = 4;
      gaps_out = 5;
      gaps_workspaces = 50;
      border_size = 1;

      resize_on_border = true;
      no_focus_fallback = true;

      # Fallback colors
      "col.active_border" = "rgba(0DB7D4FF)";
      "col.inactive_border" = "rgba(31313600)";
    };

    input = {
      kb_layout = "us";
      follow_mouse = 2;
      float_switch_override_focus = 0;
      numlock_by_default = true;
    };

    decoration = {
      rounding = 10;

      blur = {
        enabled = true;
        xray = true;
        special = false;
        size = 5;
        passes = 4;
        brightness = 1;
        noise = 1.0e-2;
        contrast = 1;
        new_optimizations = true;
        ignore_opacity = true;
        popups = true;
      };

      drop_shadow = true;
      shadow_ignore_window = true;
      shadow_range = 20;
      shadow_offset = "0 2";
      shadow_render_power = 2;
      "col.shadow" = "rgba(0000001A)";
    };

    animations = {
      enabled = true;
      animation = [
        "windows, 1, 3, md3_decel, popin 60%"
        "border, 1, 10, default"
        "workspaces, 1, 7, fluent_decel, slide"
        "specialWorkspace, 1, 3, md3_decel, slidevert"
      ];
      bezier = [ "md3_decel, 0.05, 0.7, 0.1, 1" "fluent_decel, 0.1, 1, 0, 1" ];
    };

    dwindle = {
      no_gaps_when_only = 0;
      pseudotile = true;
      preserve_split = true;
      permanent_direction_override = true;
      force_split = 2; # Split right
      special_scale_factor = 0.95;
    };

    master = {
      no_gaps_when_only = 0;
      mfact = 0.55;
      new_is_master = true;
      new_on_top = true;
      orientation = "left";
      inherit_fullscreen = true;
      always_center_master = true;
      special_scale_factor = 0.95;
    };

    binds = {
      workspace_back_and_forth = false;
      allow_workspace_cycles = true;
    };

    group = {
      insert_after_current = false;

      groupbar = {
        height = 0;
        render_titles = false;
        gradients = false;
      };
    };

    misc = {
      disable_hyprland_logo = true;
      disable_splash_rendering = true;
      focus_on_activate = true;
      mouse_move_enables_dpms = true;
      key_press_enables_dpms = true;
      allow_session_lock_restore = true;
      enable_swallow = false;
      new_window_takes_over_fullscreen = 1;
      vfr = true;
    };
  };
}
