self: { config, lib, pkgs, ... }:

let
  inherit (lib) mkOption mkIf mkMerge;
  system = pkgs.stdenv.hostPlatform.system;
  cfg = config.desktop-flake;
in
{
  imports = [ self.inputs.ags.homeManagerModules.default ];

  options.desktop-flake = {
    ags = {
      package = mkOption {
        default = self.inputs.ags.packages.${system}.default;
      };
    };
  };

  config = mkIf cfg.enable (mkMerge [
    {
      programs.ags = {
        enable = true;
        package = cfg.ags.package;
        configDir = self.configDir;
      };

      home.packages = self.runtimeDependencies.${system};
    }
  ]);
}
