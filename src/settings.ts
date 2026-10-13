// Settings model + persistence (localStorage, kept by SteamUI across sessions).

export interface OverlaySettings {
  /** Blur the game behind Steam menus (gamescope blur). */
  blurEnabled: boolean;
  /** Blur radius in pixels. */
  blurRadius: number;
}

const STORAGE_KEY = 'midnight-glass-overlay:settings';

export const BLUR_RADIUS_MIN = 4;
export const BLUR_RADIUS_MAX = 64;

export const BLUR_DEFAULTS: OverlaySettings = {
  blurEnabled: true,
  blurRadius: 20,
};

export function getSettings(): OverlaySettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...BLUR_DEFAULTS };
    const parsed = JSON.parse(raw) as Partial<OverlaySettings>;
    const radius = Number(parsed.blurRadius);
    return {
      blurEnabled: typeof parsed.blurEnabled === 'boolean' ? parsed.blurEnabled : BLUR_DEFAULTS.blurEnabled,
      blurRadius: Number.isFinite(radius)
        ? Math.min(BLUR_RADIUS_MAX, Math.max(BLUR_RADIUS_MIN, radius))
        : BLUR_DEFAULTS.blurRadius,
    };
  } catch {
    return { ...BLUR_DEFAULTS };
  }
}

export function saveSettings(patch: Partial<OverlaySettings>): OverlaySettings {
  const next = { ...getSettings(), ...patch };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch (e) {
    console.error('[midnight-glass-overlay] failed to save settings', e);
  }
  return next;
}
