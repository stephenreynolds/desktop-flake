{ config, lib, pkgs, inputs, ... }:

let
  inherit (lib) mkIf optionals;
  cfg = config.desktop-flake.hyprland;
in
mkIf cfg.enable {
  wayland.windowManager.hyprland.settings = {
    "$mod" = cfg.modifier;

    bind =
      let
        hyprctl = "${config.wayland.windowManager.hyprland.package}/bin/hyprctl";

        scripts = (path:
          lib.mapAttrs'
            (file: _: {
              name = builtins.replaceStrings [ ".nix" ] [ "" ] file;
              value = import "${path}/${file}" {
                inherit pkgs hyprctl;
                rounding = cfg.rounding;
                gapsOut = cfg.gaps.outer;
                gapsIn = cfg.gaps.inner;
              };
            })
            (builtins.readDir path)) ./scripts;

        gtk-launch = "uwsm app -- ${pkgs.gtk3}/bin/gtk-launch";
        xdg-mime = "${pkgs.xdg-utils}/bin/xdg-mime";
        defaultApp = type: "${gtk-launch} $(${xdg-mime} query default ${type})";

        terminal = "xterm";
        browser = defaultApp "x-scheme-handler/https";

        cliphist = "uwsm app -- ${pkgs.cliphist}/bin/cliphist";
        wofi = "uwsm app -- ${pkgs.wofi}/bin/wofi";
        wl-copy = "uwsm app -- ${pkgs.wl-clipboard}/bin/wl-copy";

        hyprpicker = "uwsm app -- ${pkgs.hyprpicker}/bin/hyprpicker";

        grimblast = "uwsm app -- ${
          inputs.hyprland-contrib.packages.${pkgs.system}.grimblast
        }/bin/grimblast";
        swappy = "uwsm app -- ${lib.getExe pkgs.swappy}";
        tesseract = "uwsm app -- ${pkgs.tesseract}/bin/tesseract";
        notify-send = "uwsm app -- ${pkgs.libnotify}/bin/notify-send";
      in
      [
        # Kill window and switch to previous workspace if it was the last one
        "$mod, C, exec, ${scripts.killActive}"

        # Window mode
        "$mod, V, fullscreen, 1"
        "$mod SHIFT, V, fullscreen, 0"
        "$mod, F, toggleFloating"
        "$mod SHIFT, F, pin"
        "$mod ALT, F, workspaceopt, allfloat"

        # Layout
        "$mod SHIFT, U, exec, ${scripts.toggleLayout}"

        # Dwindle layout
        "$mod, S, togglesplit"
        "$mod, U, pseudo"

        # Master layout
        "$mod, S, layoutmsg, rollnext"
        "$mod SHIFT, S, layoutmsg, rollprev"
        "$mod, U, layoutmsg, orientationcycle center right"

        # Focus last window
        "$mod, Y, focuscurrentorlast"

        # Move focus with {modifier} + arrow keys
        "$mod, H, movefocus, l"
        "$mod, L, movefocus, r"
        "$mod, K, movefocus, u"
        "$mod, J, movefocus, d"

        # Move window with {modifier} + Shift + arrow keys
        "$mod SHIFT, H, movewindow, l"
        "$mod SHIFT, L, movewindow, r"
        "$mod SHIFT, K, movewindow, u"
        "$mod SHIFT, J, movewindow, d"

        # Group window
        "$mod, G, togglegroup"
        "$mod CTRL, G, moveoutofgroup"
        "$mod ALT, G, lockactivegroup, toggle"
        "$mod ALT, H, moveintogroup, l"
        "$mod ALT, L, moveintogroup, r"
        "$mod ALT, K, moveintogroup, u"
        "$mod ALT, J, moveintogroup, d"

        # Switch to next window in group
        "$mod, Comma, changegroupactive, b"
        "$mod, Period, changegroupactive, f"
        "$mod SHIFT, Comma, movegroupwindow, b"
        "$mod SHIFT, Period, movegroupwindow, f"

        # Next/previous workspace on monitor
        "$mod, N, workspace, m-1"
        "$mod, E, workspace, m+1"
        "$mod SHIFT, N, movetoworkspace, m-1"
        "$mod SHIFT, E, movetoworkspace, m+1"

        # Next empty workspace on monitor
        "$mod, O, exec, ${scripts.focusEmpty}"
        "$mod SHIFT, O, exec, ${scripts.moveToEmpty}"

        # Special workspaces
        "$mod SHIFT, Return, movetoworkspace, special"
        "$mod, Return, togglespecialworkspace"

        # Scroll through existing workspaces with {modifier} + scroll
        "$mod, mouse_down, workspace, m+1"
        "$mod, mouse_up, workspace, m-1"

        # Logout menu
        "$mod SHIFT, Q, exec, ${hyprctl} reload"
        "$mod CTRL, Q, exec, ${pkgs.wlogout}/bin/wlogout -p layer-shell"

        # Launch applications
        "$mod, T, exec, ${terminal}"
        "$mod, W, exec, ${browser}"
        "$mod SHIFT, W, exec, ${scripts.openPrivateBrowser}"

        # Toggle animations
        "$mod SHIFT, A, exec, ${scripts.toggleAnimations}"
        "$mod SHIFT, G, exec, ${scripts.toggleGaps}"

        # Clipboard history
        "$mod CTRL, V, exec, ${cliphist} list | ${wofi} --dmenu | ${cliphist} decode | ${wl-copy}"

        # Color picker
        "$mod SHIFT, C, exec, ${hyprpicker} --format=hex --autocopy"

        # Capture the active output
        ", Print, exec, ${grimblast} save output - | ${swappy} -f -"
        # Capture all visible windows
        "ALT, Print, exec, ${grimblast} save screen - | ${swappy} -f -"
        # Capture the active window
        "CTRL, Print, exec, ${grimblast} save active - | ${swappy} -f -"
        # Capture an area selection
        "SHIFT, Print, exec, ${grimblast} save area - | ${swappy} -f -"
        # Copy screenshot text using OCR
        "SUPER, Print, exec, ${grimblast} --freeze save area - | ${tesseract} - - | ${wl-copy} && ${notify-send} -t 3000 'OCR result copied to clipboard'"
      ] ++ (optionals config.desktop-flake.ags.enable
        (
          let ags = "${config.programs.ags.package}/bin/ags -b hyprland";
          in [
            # Toggle AGS windows
            "$mod, Space, exec, ${ags} -t launcher"
            "$mod, Tab, exec, ${ags} -t action-center"
          ]
        ));

    binde = [
      # Resize window with {modifier} + Ctrl + arrow keys
      "$mod CTRL, H, resizeactive, -10 0"
      "$mod CTRL, L, resizeactive, 10 0"
      "$mod CTRL, K, resizeactive, 0 -10"
      "$mod CTRL, J, resizeactive, 0 10"
    ];

    bindm = [
      # Move/resize windows with modifier + LMB/RMB and dragging
      "$mod, mouse:272, movewindow"
      "$mod, mouse:273, resizewindow"
    ];

    bindle =
      let volumeHelper = import ./scripts/volumeHelper.nix { inherit pkgs; };
      in [
        # Volume keys
        ", XF86AudioRaiseVolume, exec, ${volumeHelper} --increase"
        ", XF86AudioLowerVolume, exec, ${volumeHelper} --decrease"
      ];

    bindl =
      let
        volumectl = "${pkgs.avizo}/bin/volumectl";
        playerctl = "${config.services.playerctld.package}/bin/playerctl";
      in
      [
        # Mute volume keys
        ", XF86AudioMute, exec, ${volumectl} toggle-mute"
        ", XF86AudioMicMute, exec, ${volumectl} -m toggle-mute"

        # Media keys
        ", XF86AudioForward, exec, ${playerctl} position +10"
        ", XF86AudioRewind, exec, ${playerctl} position -10"
        ", XF86AudioNext, exec, ${playerctl} next"
        ", XF86AudioPrev, exec, ${playerctl} previous"
        ", XF86AudioPlay, exec, ${playerctl} play-pause"
        ", XF86AudioPause, exec, ${playerctl} pause"
        ", XF86AudioStop, exec, ${playerctl} stop"
      ];
  };
}
