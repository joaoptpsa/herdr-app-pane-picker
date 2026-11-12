/**
 * @fileoverview Focuses a pane of the shown tab by typing its hint letter.
 * Opened as a dialog by mod.open; Escape, ctrl-g or ctrl-c cancels. Picking
 * a pane hidden behind a zoom unzooms the tab first.
 */

import {View, div, image, svg} from 'gpui-kit';
import {h_flex, v_flex} from 'gpui-base';
import {closeOverlay, focused, home, panes, props, run, theme} from 'herdr';

/**
 * Hint letters in assignment order: Colemak-DH home row first, as in the
 * terminal herdr's joaoptpsa/herdr-pane-picker.
 */
const HINT_ALPHABET = 'arstgmneioqwfpbjluyzxcdvkh';

const CANCEL_KEYSTROKES = new Set(['escape', 'ctrl-g', 'ctrl-c']);

/**
 * Returns the shown tab's panes, each paired with its hint letter.
 * @return {!Array<{hint: ?string, pane: !Object}>}
 */
function hintedPanes() {
  const tab = focused()?.tab;
  const tabPanes = panes().filter((pane) => pane.tab === tab);
  return tabPanes.map((pane, index) => ({
    hint: HINT_ALPHABET[index] ?? null,
    pane,
  }));
}

/**
 * Returns a folder with the home directory written as ~.
 * @param {?string} folder
 * @return {string}
 */
function shortFolder(folder) {
  if (!folder) {
    return '';
  }
  const homeFolder = home();
  const insideHome = folder === homeFolder ||
      folder.startsWith(`${homeFolder}/`);
  return insideHome ? `~${folder.slice(homeFolder.length)}` : folder;
}

/** A dialog listing the shown tab's panes under their hint letters. */
export default class PanePicker extends View {
  /**
   * Takes the keyboard so the first keystroke picks a pane.
   * @param {?Object} _props
   * @param {!Object} cx
   */
  init(_props, cx) {
    /** @type {!Object} */
    this.keyboard = cx.focus_handle();
    this.keyboard.focus();
    // The dialog can open before its window has keyboard focus.
    cx.timer.after(100, () => this.keyboard.focus());
  }

  /** Closes this dialog. */
  close() {
    closeOverlay(props().overlay);
  }

  /**
   * Focuses a pane, first unzooming its tab when another pane fills it.
   * @param {!Object} pane
   */
  pick(pane) {
    this.close();
    const zoomed = panes().find(
        (other) => other.tab === pane.tab && other.zoomed);
    if (zoomed && zoomed.pane !== pane.pane) {
      run('pane.zoom', {pane: zoomed.pane});
    }
    run('pane.focus', {pane: pane.pane});
  }

  /**
   * Picks the pane whose hint was typed, or cancels.
   * @param {!Object} event
   * @param {!Object} cx
   */
  onKeyDown(event, cx) {
    cx.stop_propagation();
    if (CANCEL_KEYSTROKES.has(event.keystroke)) {
      this.close();
      return;
    }
    const match = hintedPanes().find(({hint}) => hint === event.keystroke);
    if (match) {
      this.pick(match.pane);
    }
  }

  /**
   * Draws a pane's program icon, tinted when it is a one-color glyph.
   * @param {!Object} program
   * @param {!Object} colors
   * @return {?Object}
   */
  icon(program, colors) {
    if (!program?.icon) {
      return div().w(14).flex_none();
    }
    if (program.tint) {
      return svg(program.icon).size(14).flex_none().text_color(colors.muted);
    }
    return image(program.icon).size(14).flex_none();
  }

  /**
   * Draws one pane's row: hint, icon, title, folder and branch.
   * @param {{hint: ?string, pane: !Object}} entry
   * @param {!Object} colors
   * @return {!Object}
   */
  row({hint, pane}, colors) {
    const title = pane.title || pane.program?.name || pane.mod || 'pane';
    const where = [shortFolder(pane.cwd), pane.branch]
        .filter(Boolean)
        .join('  ');
    const badge = div()
        .w(22).h(22).flex_none().rounded(5)
        .flex().items_center().justify_center()
        .bg(hint ? colors.accent : colors.raised)
        .text_color(colors.accent_foreground)
        .font_bold()
        .child(hint ?? '·');
    return h_flex()
        .id(`pane-picker-${pane.pane}`)
        .px(10).h(34).gap(10).items_center().rounded(7)
        .cursor_pointer()
        .when(pane.focused, (element) => element.bg(colors.selected))
        .hover((style) => style.bg(colors.hover))
        .on_click(() => this.pick(pane))
        .child(badge)
        .child(this.icon(pane.program, colors))
        .child(div()
            .flex_1().truncate()
            .text_color(colors.foreground)
            .when(pane.focused, (element) => element.font_semibold())
            .child(title))
        .child(div().truncate().text_size(11).text_color(colors.dim)
            .child(where));
  }

  /**
   * @override
   * @return {!Object}
   */
  render() {
    const colors = theme();
    const entries = hintedPanes();
    return v_flex()
        .id('pane-picker')
        .track_focus(this.keyboard)
        .on_key_down((event, cx) => this.onKeyDown(event, cx))
        .w_full().p(14).gap(4)
        .bg(colors.popover)
        .text_size(13)
        .child(div()
            .pb(6).text_size(15).font_semibold()
            .text_color(colors.foreground)
            .child('Go to pane'))
        .children(entries.map((entry) => this.row(entry, colors)));
  }
}
