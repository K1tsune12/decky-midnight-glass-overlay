// Presets: named snapshots of every theme option (plus custom colors) and the
// plugin's blur settings, stored in localStorage.

import { OverlaySettings, getSettings, saveSettings } from './settings';
import { ThemeInfo, getTheme, setThemeComponent, setThemePatch } from './theme';

export interface Preset {
  name: string;
  /** Theme option name -> value. */
  options: Record<string, string>;
  /** Theme option name -> component name -> value (custom colors). */
  components: Record<string, Record<string, string>>;
  blur: OverlaySettings;
}

const STORAGE_KEY = 'midnight-glass-overlay:presets';

export function getPresets(): Preset[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const list = raw ? (JSON.parse(raw) as Preset[]) : [];
    return Array.isArray(list) ? list.filter((p) => p && typeof p.name === 'string') : [];
  } catch {
    return [];
  }
}

function storePresets(list: Preset[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

/** Snapshot of the current theme options and blur settings. */
export function capturePreset(name: string, theme: ThemeInfo): Preset {
  const options: Record<string, string> = {};
  const components: Record<string, Record<string, string>> = {};
  for (const p of theme.patches) {
    options[p.name] = p.value;
    if (p.components?.length) {
      components[p.name] = Object.fromEntries(p.components.map((c) => [c.name, c.value]));
    }
  }
  return { name, options, components, blur: getSettings() };
}

/** Saves (or overwrites, by name) a preset. Returns the updated list. */
export function savePreset(preset: Preset): Preset[] {
  const list = getPresets().filter((p) => p.name !== preset.name);
  list.push(preset);
  list.sort((a, b) => a.name.localeCompare(b.name));
  storePresets(list);
  return list;
}

export function deletePreset(name: string): Preset[] {
  const list = getPresets().filter((p) => p.name !== name);
  storePresets(list);
  return list;
}

/**
 * Applies a preset: only options that differ are changed (each change makes
 * CSS Loader reinject the theme). Options the preset doesn't know about keep
 * their value. Returns the blur settings that were applied.
 */
export async function applyPreset(preset: Preset): Promise<OverlaySettings> {
  const theme = await getTheme();
  if (theme) {
    for (const p of theme.patches) {
      const value = preset.options[p.name];
      if (value !== undefined && value !== p.value && p.options.includes(value)) {
        await setThemePatch(p.name, value);
      }
      const comps = preset.components[p.name];
      if (comps) {
        for (const c of p.components ?? []) {
          const v = comps[c.name];
          if (v !== undefined && v !== c.value) await setThemeComponent(p.name, c.name, v);
        }
      }
    }
  }
  return saveSettings(preset.blur);
}

/** Theme defaults (from theme.json) + plugin defaults, as a preset. */
export function defaultPreset(theme: ThemeInfo, blurDefaults: OverlaySettings): Preset {
  return {
    name: 'Default',
    options: Object.fromEntries(theme.patches.map((p) => [p.name, p.default])),
    components: {},
    blur: blurDefaults,
  };
}
