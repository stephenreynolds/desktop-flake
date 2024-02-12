self: { config, lib, pkgs, ... }:

let
  cfg = config.desktop-flake;

  compileWindowRulePatterns = rule:
    rule // {
      class = lib.mapNullable (x: "class:^(${lib.concatStringsSep "|" x})$")
        rule.class;
      title = lib.mapNullable (x: "title:^(${lib.concatStringsSep "|" x})$")
        rule.title;
    };

  expandRuleToList = rule2:
    let rule1 = removeAttrs rule2 [ "rules" ];
    in map (rule: rule1 // { inherit rule; }) rule2.rules;

  windowRuleToString = rule:
    lib.concatStringsSep ", " ([ rule.rule ]
      ++ (lib.optional (rule.class != null) rule.class)
      ++ (lib.optional (rule.title != null) rule.title));

  mapWindowRules = rules: lib.pipe rules [
    (map compileWindowRulePatterns)
    (map expandRuleToList)
    lib.concatLists
    (map windowRuleToString)
  ];

  rule = rules: { class ? null, title ? null }: { inherit rules class title; };
in
lib.mkIf cfg.enable {
  wayland.windowManager.hyprland.settings.windowrulev2 =
    let
      yad.class = [ "yad" ];
    in
    mapWindowRules [
      (rule [ "float" ] yad)
    ];
}
