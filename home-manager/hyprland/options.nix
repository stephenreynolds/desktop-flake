{ config, lib, ... }:

let
  inherit (lib) mkIf;
  cfg = config.desktop-flake.hyprland;
in
mkIf cfg.enable {
  wayland.windowManager.hyprland.settings = {
    general = {
      gaps_in = 0;
      gaps_out = 0;
      gaps_workspaces = 50;
      border_size = 1;

      resize_on_border = true;
      no_focus_fallback = true;

      layout = "master";

      allow_tearing = cfg.tearing.enable;

      # Fallback colors
      "col.active_border" = "rgba(0DB7D4FF)";
      "col.inactive_border" = "rgba(31313600)";
    };

    input = {
      float_switch_override_focus = 0;
      follow_mouse = 2;
      kb_layout = "us";
      numlock_by_default = false;
    };

    decoration = {
      rounding = 10;

      blur = {
        enabled = true;
        brightness = 1;
        contrast = 1;
        ignore_opacity = true;
        new_optimizations = true;
        noise = 1.0e-2;
        passes = 4;
        popups = true;
        size = 5;
        special = false;
        xray = true;
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
      force_split = 2; # Split right
      no_gaps_when_only = 0;
      permanent_direction_override = true;
      preserve_split = true;
      pseudotile = true;
      special_scale_factor = 0.95;
    };

    master = {
      always_center_master = true;
      inherit_fullscreen = true;
      mfact = 0.55;
      new_is_master = true;
      new_on_top = true;
      no_gaps_when_only = 0;
      orientation = "left";
      special_scale_factor = 0.95;
    };

    binds = {
      allow_workspace_cycles = true;
      movefocus_cycles_fullscreen = false;
      workspace_back_and_forth = false;
    };

    group = {
      insert_after_current = false;

      groupbar = {
        gradients = false;
        height = 0;
        render_titles = false;
      };
    };

    misc = {
      allow_session_lock_restore = true;
      disable_hyprland_logo = true;
      disable_splash_rendering = true;
      enable_swallow = false;
      focus_on_activate = true;
      key_press_enables_dpms = true;
      mouse_move_enables_dpms = true;
      new_window_takes_over_fullscreen = 1;
      vfr = true;
    };
  };
}
