# herdr-app-pane-picker

A [Herdr](https://herdr.dev) desktop app mod: press `ctrl-shift-j`, type the letter shown next to a
pane, and the keyboard is in that pane.

Letters follow the Colemak-DH home row first (`a`, `r`, `s`, `t`, …). Picking a pane behind a zoom
unzooms the tab. Escape, ctrl-g or ctrl-c cancels.

It makes no network requests, runs no programs and reads no files: it only reads Herdr's pane list
and runs `pane.zoom` and `pane.focus`.

## Install

Copy `mods/pane-picker/` into `~/.config/herdr-app/mods/`, then add the binding from `keys.json` to
the `global` section of `~/.config/herdr-app/keys.json`. Check it loads:

```sh
herdr-app check ~/.config/herdr-app/mods/pane-picker
```

`RECIPE.md` describes the mod in full, for rebuilding or changing it.

This is the desktop-app counterpart of
[joaoptpsa/herdr-pane-picker](https://github.com/joaoptpsa/herdr-pane-picker), the terminal herdr
plugin.

## License

MIT
