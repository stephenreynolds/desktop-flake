{
  description = "The flake for my desktop environment built on Hyprland";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";

    flake-parts.url = "github:hercules-ci/flake-parts";
    devshell.url = "github:numtide/devshell";

    ags = {
      url = "github:Aylur/ags/524bad0e5ea8560ad4d9bd46862b25d7636296b6";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };

  outputs = inputs@{ flake-parts, ... }:
    flake-parts.lib.mkFlake { inherit inputs; } {
      imports = [ inputs.devshell.flakeModule ];

      systems = [ "x86_64-linux" ];

      flake = { };

      perSystem = { config, pkgs, ... }: {
        devshells.default =
          let
            ags = inputs.ags.packages.${pkgs.system}.agsWithTypes;
            projectRoot = toString (builtins.getEnv "PWD");
            agsRoot = "${projectRoot}/ags";
          in
          {
            packages = with pkgs; [
              (writeShellScriptBin "ags" ''
                ${ags}/bin/ags --config ${agsRoot}/config.js --bus-name hyprland $@
              '')
              nodePackages_latest.npm
              nodePackages_latest.eslint
              typescript
            ];
            devshell.startup.types.text = ''
              if [ ! -d ${agsRoot}/node_modules ]; then
                npm --prefix ${agsRoot} install
              fi
              ln -sf ${ags}/share/com.github.Aylur.ags/types ${agsRoot}/
            '';
            motd = "";
          };
      };
    };
}
