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
              value = import "${path}/${file}" { inherit pkgs hyprctl; };
            })
            (builtins.readDir path)) ./scripts;

        dwindleMonocle = "dwindle:no_gaps_when_only";
        masterMonocle = "master:no_gaps_when_only";
        jaq = "${pkgs.jaq}/bin/jaq";

        cliphist = "${pkgs.cliphist}/bin/cliphist";
        wofi = "${pkgs.wofi}/bin/wofi";
        wl-copy = "${pkgs.wl-clipboard}/bin/wl-copy";

        hyprpicker = "${pkgs.hyprpicker}/bin/hyprpicker";

        grimblast = "${
          inputs.hyprland-contrib.packages.${pkgs.system}.grimblast
        }/bin/grimblast";
        swappy = lib.getExe pkgs.swappy;
        tesseract = "${pkgs.tesseract}/bin/tesseract";
        notify-send = "${pkgs.libnotify}/bin/notify-send";
      in
      [
        # Kill window and switch to previous workspace if it was the last one
        ", D, exec, ${scripts.killActive}"

        # Window mode
        ", V, fullscreen, 1"
        "SHIFT, V, fullscreen, 0"
        ", F, toggleFloating"
        "SHIFT, F, pin"
        "ALT, F, workspaceopt, allfloat"

        # Layout
        "SHIFT, U, exec, ${scripts.toggleLayout}"

        # Dwindle layout
        ", S, togglesplit"
        ", U, pseudo"

        # Master layout
        ", S, layoutmsg, rollnext"
        "SHIFT, S, layoutmsg, rollprev"
        ", U, layoutmsg, orientationcycle right center left"

        # Focus last window
        ", D, focuscurrentorlast"

        # Move focus with {modifier} + arrow keys
        ", H, movefocus, l"
        ", L, movefocus, r"
        ", K, movefocus, u"
        ", J, movefocus, d"

        # Move window with {modifier} + Shift + arrow keys
        "SHIFT, H, movewindow, l"
        "SHIFT, L, movewindow, r"
        "SHIFT, K, movewindow, u"
        "SHIFT, J, movewindow, d"

        # Group window
        ", G, togglegroup"
        "CTRL, G, moveoutofgroup"
        "ALT, G, lockactivegroup, toggle"
        "ALT, H, moveintogroup, l"
        "ALT, L, moveintogroup, r"
        "ALT, K, moveintogroup, u"
        "ALT, J, moveintogroup, d"

        # Switch to next window in group
        ", 8, changegroupactive, b"
        ", 9, changegroupactive, f"
        "SHIFT, 8, movegroupwindow, b"
        "SHIFT, 9, movegroupwindow, f"

        # Next/previous workspace on monitor
        ", left, workspace, m-1"
        ", right, workspace, m+1"
        "SHIFT, left, movetoworkspace, m-1"
        "SHIFT, right, movetoworkspace, m+1"
        "CTRL, left, movetoworkspace, r-1"

        # Next empty workspace on monitor
        ", E, exec, ${scripts.focusEmpty}"
        "SHIFT, E, exec, ${scripts.moveToEmpty}"

        # Previous workspace
        ", P, workspace, previous"
        "SHIFT, P, movetoworkspace, previous"

        # Special workspaces
        "SHIFT, 0, movetoworkspace, special"
        ", 0, togglespecialworkspace"

        # Move to monitor
        ", 1, focusmonitor, l"
        ", 2, focusmonitor, r"
        "SHIFT, 1, movewindow, mon:l"
        "SHIFT, 2, movewindow, mon:r"
        "CTRL, 1, movecurrentworkspacetomonitor, l"
        "CTRL, 2, movecurrentworkspacetomonitor, r"

        # Scroll through existing workspaces with {modifier} + scroll
        "$mod, mouse_down, workspace, m+1"
        "$mod, mouse_up, workspace, m-1"

        # Logout menu
        "CTRL, U, exec, ${pkgs.wlogout}/bin/wlogout -p layer-shell"

        # Toggle no_gaps_when_only
        "SHIFT, M, exec, ${hyprctl} keyword ${dwindleMonocle} $(($(${hyprctl} getoption ${dwindleMonocle} -j | ${jaq} -r '.int') ^ 1))"
        "SHIFT, M, exec, ${hyprctl} keyword ${masterMonocle} $(($(${hyprctl} getoption ${masterMonocle} -j | ${jaq} -r '.int') ^ 1))"
        "SHIFT, M, submap"

        # Toggle animations
        "SHIFT, A, exec, ${scripts.toggleAnimations}"
        "SHIFT, G, exec, ${scripts.toggleGaps}"

        # Clipboard history
        "CTRL, V, exec, ${cliphist} list | ${wofi} --dmenu | ${cliphist} decode | ${wl-copy}"

        # Color picker
        "SHIFT, C, exec, ${hyprpicker} --format=hex --autocopy"

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
            ", Space, exec, ${ags} -t launcher"
            ", N, exec, ${ags} -t action-center"
          ]
        ));

    binde = [
      # Resize window with {modifier} + Ctrl + arrow keys
      "CTRL, H, resizeactive, -10 0"
      "CTRL, L, resizeactive, 10 0"
      "CTRL, K, resizeactive, 0 -10"
      "CTRL, J, resizeactive, 0 10"
    ];

    bindm = [
      # Move/resize windows with modifier + LMB/RMB and dragging
      ", mouse:272, movewindow"
      ", mouse:273, resizewindow"
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
        wpctl = "${pkgs.wireplumber}/bin/wpctl";
        playerctl = "${config.services.playerctld.package}/bin/playerctl";
      in
      [
        # Mute volume keys
        ", XF86AudioMute, exec, ${wpctl} set-mute @DEFAULT_SINK@ toggle"
        ", XF86AudioMicMute, exec, ${wpctl} set-mute @DEFAULT_SOURCE@ toggle"

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
