{ config, lib, ... }:

let
  inherit (lib) mkIf concatStringsSep concatLists mapNullable optional pipe;
  cfg = config.desktop-flake.hyprland;

  compileWindowRulePatterns = rule:
    rule // {
      class = mapNullable (x: "class:^(${concatStringsSep "|" x})$") rule.class;
      title = mapNullable (x: "title:^(${concatStringsSep "|" x})$") rule.title;
    };

  expandRuleToList = rule2:
    let rule1 = removeAttrs rule2 [ "rules" ];
    in map (rule: rule1 // { inherit rule; }) rule2.rules;

  windowRuleToString = rule:
    concatStringsSep ", " ([ rule.rule ]
      ++ (optional (rule.class != null) rule.class)
      ++ (optional (rule.title != null) rule.title));

  mapWindowRules = rules:
    pipe rules [
      (map compileWindowRulePatterns)
      (map expandRuleToList)
      concatLists
      (map windowRuleToString)
    ];

  rule = rules: { class ? null, title ? null }: { inherit rules class title; };
in mkIf cfg.enable {
  wayland.windowManager.hyprland.settings.windowrulev2 = let
    ags.class = [ "com.github.Aylur.ags" ];
    polkitAgent.class = [
      "lxqt-policykit-agent"
      "polkit-gnome-authentication-agent-1"
      "polkit-mate-authentication-agent-1"
      "org.kde.polkit-kde-authentication-agent-1"
    ];
    xdgPortal.class =
      [ "xdg-desktop-portal.*" "org.freedesktop.impl.portal.desktop.kde" ];
    yad.class = [ "yad" ];
  in mapWindowRules (concatLists [
    (map (rule [ "float" ]) [ ags xdgPortal yad ])

    (map (rule [ "float" "center" ]) [ polkitAgent ])
  ]);
}
