// Settings model + persistence (localStorage, kept by SteamUI across sessions).

export interface OverlaySettings {
  /** Blur the game behind Steam menus (gamescope blur). */
  blurEnabled: boolean;
  /** Blur radius in pixels. */
  blurRadius: number;
  /**
   * Keep the blur on while playing too. Gamescope then also blurs the game
   * behind the performance overlay (MangoHud). Off = blur only while a Steam
   * menu is over the game.
   */
  blurWhilePlaying: boolean;
  /** Override the performance overlay background. */
  perfStyleEnabled: boolean;
  /** Performance overlay background color, RRGGBB. */
  perfColor: string;
  /** Performance overlay background opacity, 0..1 (0 = transparent). */
  perfAlpha: number;
}

const STORAGE_KEY = 'midnight-glass-overlay:settings';

export const BLUR_RADIUS_MIN = 4;
export const BLUR_RADIUS_MAX = 64;

export const BLUR_DEFAULTS: OverlaySettings = {
  blurEnabled: true,
  blurRadius: 20,
  blurWhilePlaying: false,
  perfStyleEnabled: false,
  perfColor: '000000',
  perfAlpha: 0.4,
};

const bool = (v: unknown, d: boolean) => (typeof v === 'boolean' ? v : d);
const clamp = (v: unknown, min: number, max: number, d: number) => {
  const n = Number(v);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : d;
};
const hex = (v: unknown, d: string) => (typeof v === 'string' && /^[0-9a-fA-F]{6}$/.test(v) ? v.toLowerCase() : d);

export function getSettings(): OverlaySettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...BLUR_DEFAULTS };
    const p = JSON.parse(raw) as Partial<OverlaySettings>;
    const d = BLUR_DEFAULTS;
    return {
      blurEnabled: bool(p.blurEnabled, d.blurEnabled),
      blurRadius: clamp(p.blurRadius, BLUR_RADIUS_MIN, BLUR_RADIUS_MAX, d.blurRadius),
      blurWhilePlaying: bool(p.blurWhilePlaying, d.blurWhilePlaying),
      perfStyleEnabled: bool(p.perfStyleEnabled, d.perfStyleEnabled),
      perfColor: hex(p.perfColor, d.perfColor),
      perfAlpha: clamp(p.perfAlpha, 0, 1, d.perfAlpha),
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
