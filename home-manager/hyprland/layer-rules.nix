self: { config, lib, pkgs, ... }:

let
  cfg = config.desktop-flake;

  compileLayerRulePatterns = rule:
    rule // {
      namespace = "^(${lib.concatStringsSep "|" rule.namespace})";
    };

  expandRuleToList = rule2:
    let rule1 = removeAttrs rule2 [ "rules" ];
    in map (rule: rule1 // { inherit rule; }) rule2.rules;

  layerRuleToString = rule: "${rule.rule}, ${rule.namespace}";

  mapLayerRules = rules: lib.pipe rules [
    (map compileLayerRulePatterns)
    (map expandRuleToList)
    lib.concatLists
    (map layerRuleToString)
  ];

  rule = rules: namespace: { inherit rules namespace; };
in
lib.mkIf cfg.enable {
  wayland.windowManager.hyprland.settings.layerrule =
    let
      bar = [ "^(bar-.*)$" ];
      notifications = [ "^(notifications-.*)$" ];
      actionCenter = [ "action-center" ];
      launcher = [ "launcher" ];
    in
    mapLayerRules [
      (rule [ "blur" "ignorealpha 0.4" "xray on" "noanim" ] bar)
      (rule [ "blur" "ignorealpha 0.4" "xray on" "noanim" ] notifications)
      (rule [ "blur" "ignorealpha 0.4" "xray on" "noanim" ] actionCenter)
      (rule [ "blur" "ignorealpha 0.4" "xray on" "noanim" ] launcher)
    ];
}
