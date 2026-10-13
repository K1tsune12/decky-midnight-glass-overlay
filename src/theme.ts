// Talks to CSS Loader so the Kitsune Midnight Glass theme options can be changed
// from this plugin's panel. CSS Loader is a legacy Decky plugin, so its methods
// are reached through the loader's legacy plugin-method route.

export const THEME_NAME = 'Kitsune Midnight Glass';

export interface ThemePatchComponent {
  name: string;
  type: string;
  on: string;
  value: string;
}

export interface ThemePatch {
  name: string;
  value: string;
  default: string;
  options: string[];
  type: 'slider' | 'dropdown' | 'checkbox' | 'none' | string;
  components: ThemePatchComponent[];
}

export interface ThemeInfo {
  name: string;
  enabled: boolean;
  patches: ThemePatch[];
}

interface LegacyResult<T> {
  success: boolean;
  result: T;
}

async function cssLoader<T>(method: string, args: Record<string, unknown> = {}): Promise<T> {
  const backend = (window as any).DeckyBackend;
  if (!backend?.call) throw new Error('Decky backend not available');
  const res = (await backend.call(
    'loader/call_legacy_plugin_method',
    'CSS Loader',
    method,
    args,
  )) as LegacyResult<T>;
  if (!res?.success) throw new Error(`CSS Loader ${method} failed`);
  return res.result;
}

/** Returns the theme, or undefined when CSS Loader or the theme is missing. */
export async function getTheme(): Promise<ThemeInfo | undefined> {
  try {
    const themes = await cssLoader<ThemeInfo[]>('get_themes');
    return themes.find((t) => t.name === THEME_NAME);
  } catch (e) {
    console.warn('[midnight-glass-overlay] could not read themes', e);
    return undefined;
  }
}

export async function setThemeEnabled(enabled: boolean): Promise<void> {
  await cssLoader('set_theme_state', { name: THEME_NAME, state: enabled });
}

export async function setThemePatch(patchName: string, value: string): Promise<void> {
  await cssLoader('set_patch_of_theme', { themeName: THEME_NAME, patchName, value });
}

export async function setThemeComponent(patchName: string, componentName: string, value: string): Promise<void> {
  await cssLoader('set_component_of_theme_patch', { themeName: THEME_NAME, patchName, componentName, value });
}
