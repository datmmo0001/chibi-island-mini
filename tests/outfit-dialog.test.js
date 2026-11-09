import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const read = name => readFileSync(new URL(`../public/${name}`, import.meta.url), 'utf8');
const html = read('index.html');
const client = read('client.js');
const scene = read('scene.js');
const shell = read('play-shell.css');

test('appearance dialog drops the 3D collection link but keeps outfits, hats and close buttons', () => {
  assert.ok(!html.includes('Xem bộ sưu tập'), 'collection link removed from index.html');
  const start = html.indexOf('id="appearance-dialog"');
  assert.ok(start >= 0, 'appearance dialog exists');
  const dialog = html.slice(start, html.indexOf('</dialog>', start));
  assert.ok(dialog.includes('id="outfits"'), 'outfit list kept');
  assert.ok(dialog.includes('id="hats"'), 'hat row stays inside the dialog');
  assert.ok(dialog.includes('data-close-dialog'), 'close buttons kept');
  assert.ok(existsSync(new URL('../public/characters.html', import.meta.url)), 'characters page itself untouched');
});

test('appearance dialog has a 3D stage and a pinned confirm button', () => {
  const start = html.indexOf('id="appearance-dialog"');
  const dialog = html.slice(start, html.indexOf('</dialog>', start));
  assert.ok(dialog.includes('id="outfit-stage"'), 'stage region present');
  assert.ok(dialog.includes('id="outfit-confirm"'), 'confirm button present');
  assert.ok(dialog.includes('id="outfit-preview-name"'), 'preview name caption present');
  assert.ok(shell.includes('#appearance-dialog::backdrop'), 'dialog backdrop override present');
  assert.ok(shell.includes('.outfit.previewing'), 'previewing card style present');
  assert.ok(shell.includes('grid-template-columns:repeat(2,minmax(0,1fr))'), 'grid is 2 columns');
});

test('client previews on tap and only commits outfit on confirm', () => {
  assert.ok(client.includes('previewOutfit'), 'preview state exists');
  assert.ok(client.includes('setDialogStage'), 'client drives the dialog stage');
  assert.ok(client.includes('syncOutfitStage'), 'stage sync helper exists');
  const tap = client.indexOf('previewOutfit = o.id');
  assert.ok(tap >= 0, 'card tap sets the preview');
  const commit = client.indexOf("$('outfit-confirm').onclick");
  assert.ok(commit >= 0, 'confirm button handler exists');
  assert.ok(client.slice(commit, commit + 200).includes("safeStore.set('chibi-outfit'"), 'confirm persists the outfit');
});

test('scene renders a dedicated dialog hero through setDialogStage', () => {
  assert.ok(scene.includes('setDialogStage(rect,outfitId,hat)'), 'setDialogStage method exists');
  assert.ok(scene.includes('this.dialogHero'), 'dialog hero tracked');
  assert.ok(scene.includes('setScissor'), 'scissor pass renders the stage region');
});
