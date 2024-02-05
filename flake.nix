{
  description = "The flake for my desktop environment built on Hyprland";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";

    ags = {
      url = "github:Aylur/ags/v1.7.4";
      inputs.nixpkgs.follows = "nixpkgs";
    };

    hyprland = {
      url = "github:hyprwm/Hyprland";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };

  outputs = inputs@{ self, nixpkgs, ... }:
    let
      genSystems = nixpkgs.lib.genAttrs [ "x86_64-linux" ];
      pkgs = genSystems (system: import nixpkgs { inherit system; });

      configDir = builtins.path { path = ./ags; name = "ags-config"; };

      runtimeDependencies = genSystems (system: with pkgs.${system}; [
        inotify-tools
        dart-sass
      ]);
    in
    {
      inherit configDir runtimeDependencies;

      homeManagerModules.default = import ./home-manager self;
      nixosModules.default = import ./nixos self;

      devShells = genSystems (system: {
        default =
          let
            ags = inputs.ags.packages.${system}.agsWithTypes;
            projectRoot = toString (builtins.getEnv "PWD");
            agsRoot = "${projectRoot}/ags";
          in
          pkgs.${system}.mkShell {
            buildInputs = with pkgs.${system}; [
              (writeShellScriptBin "ags" ''
                ${ags}/bin/ags --config ${agsRoot}/config.js $@
              '')
              nodejs
              nodePackages_latest.eslint
              typescript
            ] ++ runtimeDependencies.${system};
            shellHook = ''
              if [ ! -d ${agsRoot}/node_modules ]; then
                npm --prefix ${agsRoot} install
              fi
              ln -sf ${ags}/share/com.github.Aylur.ags/types ${agsRoot}/
            '';
            AGS_DEBUG = 1;
          };
      });
    };
}
