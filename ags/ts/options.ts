import {
  Option,
  resetOptions,
  getValues,
  apply,
  getOptions,
} from "./settings/option.js";

export default {
  reset: resetOptions,
  values: getValues,
  apply: apply,
  list: getOptions,

  bar: {
    position: Option("bottom", {
      enum: ["top", "bottom"],
      type: "enum",
    }),
    showOnAllMonitors: Option(true),
  },

  primaryMonitor: Option(0),

  hyprland: {
    borders: {
      size: Option(1),
    },
    gaps: {
      gapsIn: Option(5),
      gapsOut: Option(10),
      noGapsWhenOnly: Option(0),
      noGapsWindowClasses: Option([
        "firefox",
        "firefox-nightly",
        "firefox-devedition",
        "firefox-aurora",
      ]),
    },
    rounding: Option(10),
  },

  locale: {
    dateFormat: Option("%a %b %-e"),
    timeFormat: Option("%-I:%M %p"),
  },
};
