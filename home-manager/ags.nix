self: { config, lib, pkgs, ... }:

let
  inherit (lib) mkOption mkIf mkMerge types;
  system = pkgs.stdenv.hostPlatform.system;
  cfg = config.desktop-flake.ags;
in
{
  imports = [ self.inputs.ags.homeManagerModules.default ];

  options.desktop-flake.ags = {
    enable = mkOption {
      type = types.bool;
      default = config.desktop-flake.enable;
      description = "Whether to enable Aylur's Gtk Shell";
    };
    package = mkOption {
      default = self.inputs.ags.packages.${system}.default;
    };
  };

  config = mkIf cfg.enable (mkMerge [
    {
      programs.ags = {
        enable = true;
        package = cfg.package;
        configDir = self.configDir;
      };

      home.packages = self.runtimeDependencies.${system};
    }
  ]);
}
