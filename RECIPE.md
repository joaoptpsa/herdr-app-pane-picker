# Pane picker

A keyboard dialog for the Herdr desktop app that jumps to any pane of the shown tab. Press the
binding, see every pane listed under a letter, type the letter and the keyboard lands in that
pane. It replaces walking across a tab one direction at a time when a tab holds three or more
panes.

## What you see

- A dialog 460px wide, centered over the window, on the theme's `popover` color with Herdr's own
  dialog frame. 14px padding, 4px between rows, 13px text.
- A title, "Go to pane", 15px semibold in `foreground`, with 6px below it.
- One row per pane of the shown tab, in `panes()` order, 34px tall, 10px side padding, 10px gaps,
  7px corners:
  - a 22×22 badge with 5px corners: the hint letter, bold, in `accent_foreground` on `accent`;
    past the 26th pane a `·` on `raised` and no letter;
  - the pane's program icon at 14px: `svg` tinted `muted` when the program's icon is a one-color
    glyph, else `image`; an empty 14px slot when the program has no icon;
  - the pane's title (the terminal's title, else its program's name, else the mod's name),
    truncated, in `foreground`, semibold for the focused pane;
  - its folder (home written as `~`) and git branch, two spaces apart, 11px in `dim`, truncated.
- The focused pane's row has the `selected` background; a hovered row has `hover`.

## How it behaves

- Hint letters follow the Colemak-DH home row first: `arstgmneioqwfpbjluyzxcdvkh`. The first
  pane gets `a`, the second `r`, and so on.
- Typing a bare hint letter, or clicking a row, closes the dialog and focuses that pane.
- If another pane of the tab is zoomed, picking a pane unzooms the tab first, so the picked pane
  is visible.
- Escape, ctrl-g and ctrl-c close the dialog without moving focus. Every other key is swallowed:
  nothing reaches the terminal underneath while the dialog is open. Shifted or modified letters
  pick nothing.
- Agent status doesn't change the rows; the list redraws live as panes open, close or retitle.
- Running the binding again while the dialog is open closes it (`mod.open` toggles).

## Built from

- One mod, `mods/pane-picker/` (`main.js`, `mod.json`), opened as an overlay. No layout changes.
- `mod.json`: `{ "place": "none", "title": "Pane picker", "overlay": { "kind": "dialog", "width": 460 } }`.
- `keys.json` binds it: `"ctrl-shift-j": "mod.open:pane-picker"` in `global`.
- `herdr` functions: `focused()` for the shown tab, `panes()` for its panes, `home()`,
  `theme()`, `props().overlay` with `closeOverlay`, and `run` for `pane.zoom {pane}` (to
  unzoom) and `pane.focus {pane}`.
- `gpui-kit`: `div`, `svg`, `image`; `gpui-base`: `h_flex`, `v_flex`. Keyboard: a
  `cx.focus_handle()` made in `init`, focused at once and again 100ms later, attached with
  `.track_focus()`; `.on_key_down` compares `event.keystroke`.
- No `exec`, `fetch`, `hc` or file access: it reads Herdr's live data and runs pane commands only.

## Watch out

- Mods aren't told where panes sit on screen, so the letters can't be drawn over the panes
  themselves; the list order is `panes()` order, which follows the tab's split tree rather than
  strict top-to-bottom, left-to-right reading order.
- The dialog can open before its window has the keyboard; without the second `focus()` the first
  letter can go to the terminal instead.
- Call `cx.stop_propagation()` on every key, not just hint letters, or unhandled keys type into
  the terminal under the dialog.
- `pane.zoom` toggles: call it with the zoomed pane's id, only when the picked pane isn't the
  zoomed one.
- `overlay.close` with the mod's name does nothing; the dialog closes itself with
  `closeOverlay(props().overlay)`.
- With a layout terminal block focused, `focused().pane` is null but `focused().tab` is still the
  shown tab, which is all the list needs.
- 26 letters: panes past the 26th still show and can be clicked, but have no letter.

## Done when

- `herdr-app check mods/pane-picker` passes.
- In a tab with three panes, the binding opens a dialog listing them under `a`, `r`, `s`, with
  the focused one highlighted.
- Typing `r` closes the dialog and the second pane has the keyboard: typing goes into it.
- With the first pane zoomed, picking `s` shows all panes again with the third focused.
- Escape closes the dialog and focus stays where it was; typing a letter that has no pane does
  nothing and leaves the dialog open.
