{ pkgs, ... }:
pkgs.writeShellScript "open_private_browser" ''
  BROWSER=$(${pkgs.xdg-utils}/bin/xdg-mime query default "x-scheme-handler/https")

  case $BROWSER in
    "firefox.desktop")
      firefox --private-window
      ;;
  esac
''
