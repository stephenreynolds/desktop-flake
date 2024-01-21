self: { config, lib, pkgs, ... }:

{
  imports = [
    (import ./ags.nix self)
  ];
}
