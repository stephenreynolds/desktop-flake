{ config, lib, ... }:

let
  inherit (lib) mkIf concatStringsSep concatLists pipe optionals;
  cfg = config.desktop-flake;

  compileLayerRulePatterns = rule:
    rule // {
      namespace = "^(${concatStringsSep "|" rule.namespace})";
    };

  expandRuleToList = rule2:
    let rule1 = removeAttrs rule2 [ "rules" ];
    in map (rule: rule1 // { inherit rule; }) rule2.rules;

  layerRuleToString = rule: "${rule.rule}, ${rule.namespace}";

  mapLayerRules = rules:
    pipe rules [
      (map compileLayerRulePatterns)
      (map expandRuleToList)
      concatLists
      (map layerRuleToString)
    ];

  rule = rules: namespace: { inherit rules namespace; };
in
mkIf cfg.enable {
  wayland.windowManager.hyprland.settings.layerrule =
    (optionals config.desktop-flake.ags.enable (
      let
        bar = [ "bar-.*" ];
        notifications = [ "notifications-.*" ];
        actionCenter = [ "action-center" ];
        launcher = [ "launcher" ];
        hyprpicker = [ "hyprpicker" ];
        selection = [ "selection" ];
        avizo = [ "avizo" ];
      in
      mapLayerRules [
        (rule [ "blur" "ignorealpha 0.4" "xray on" "noanim" ] bar)
        (rule [ "blur" "ignorealpha 0.4" "xray on" "noanim" ] notifications)
        (rule [ "blur" "ignorealpha 0.4" "xray on" "noanim" ] actionCenter)
        (rule [ "blur" "ignorealpha 0.4" "xray on" "noanim" ] launcher)
        (rule [ "blur" "ignorealpha 0.65" "xray on" "noanim" ] avizo)
        (rule [ "animation fade" ] hyprpicker)
        (rule [ "animation fade" ] selection)
      ]
    ));
}
