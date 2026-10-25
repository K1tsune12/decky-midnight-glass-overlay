// Blurs the game behind Steam menus using gamescope's compositor blur.
//
// SteamUI already has a small store that turns gamescope blur on for a few of
// its own dialogs: it keeps a ref count and calls
// `GamescopeService.SetBlurParams({ mode: 1, radius: 32 })` while the count is
// above zero, and `SetBlurParams({ mode: 0 })` otherwise. Mode 1 only blurs the
// game while Steam is drawn on top of it, so it is exactly "blur behind menus".
//
// We override that store's ApplyBlurState on the instance: when Steam itself
// wants blur (or wants it suppressed) we defer to the original; otherwise we
// keep mode 1 with the user's radius instead of turning blur off.
//
// Mode 1 also blurs the game behind gamescope's own overlays, like the
// performance overlay (MangoHud). With "blur while playing" off, blur is only
// kept while a Steam menu is drawn over the game, so the performance overlay
// stays sharp during gameplay.

import { findModuleExport } from '@decky/ui';

interface BlurParams {
  mode: number;
  radius?: number;
  fade_duration_ms?: number;
}

interface GamescopeService {
  SetBlurParams(params: BlurParams): Promise<unknown>;
}

interface BlurStore {
  m_nBlurRefCount: number;
  m_bForceSuppressBlur: boolean;
  ApplyBlurState(): void;
}

const BLUR_MODE_OFF = 0;
const BLUR_MODE_BEHIND_STEAM = 1;
const FADE_MS = 300;
const MENU_POLL_MS = 250;

// Steam's window composition modes (main window): 0 Hidden, 1 Notification,
// 2 Overlay, 3 Opaque, 4 OverlayKeyboard. 2+ means Steam is drawn over the game.
const COMPOSITION_OVERLAY = 2;

function steamMenuOverGame(): boolean {
  try {
    const store = (window as any).SteamUIStore?.m_WindowStore?.MainWindowInstance?.m_CompositionStateStore;
    const mode = store?.m_eLastPushedToWebHelperCompositionState?.eCompositionMode;
    return typeof mode === 'number' ? mode >= COMPOSITION_OVERLAY : true;
  } catch {
    return true;
  }
}

const isGamescopeService = (e: any): e is GamescopeService =>
  !!e && typeof e.SetBlurParams === 'function' && typeof e.GetState === 'function';

const isBlurStore = (e: any): e is BlurStore =>
  !!e &&
  typeof e.ApplyBlurState === 'function' &&
  typeof e.SetBlurEnabled === 'function' &&
  'm_nBlurRefCount' in e;

export class GameBlur {
  private service?: GamescopeService;
  private store?: BlurStore;
  private enabled = false;
  private radius = 20;
  private whilePlaying = true;
  private menuOpen = true;
  private poll?: ReturnType<typeof setInterval>;

  /** Finds Steam's gamescope service and blur store. Returns false if missing. */
  init(): boolean {
    try {
      this.service = findModuleExport(isGamescopeService) as GamescopeService | undefined;
      this.store = findModuleExport(isBlurStore) as BlurStore | undefined;
    } catch (e) {
      console.error('[midnight-glass-overlay] module lookup failed', e);
    }
    if (!this.service || !this.store) {
      console.warn('[midnight-glass-overlay] gamescope blur not available', {
        service: !!this.service,
        store: !!this.store,
      });
      return false;
    }

    const service = this.service;
    const original = Object.getPrototypeOf(this.store).ApplyBlurState as () => void;
    const self = this;
    this.store.ApplyBlurState = function (this: BlurStore) {
      const wanted = self.enabled && (self.whilePlaying || self.menuOpen);
      if (!wanted || this.m_bForceSuppressBlur || this.m_nBlurRefCount > 0) {
        return original.call(this);
      }
      void service.SetBlurParams({
        mode: BLUR_MODE_BEHIND_STEAM,
        radius: self.radius,
        fade_duration_ms: FADE_MS,
      });
    };
    this.menuOpen = steamMenuOverGame();
    this.poll = setInterval(() => {
      const open = steamMenuOverGame();
      if (open !== this.menuOpen) {
        this.menuOpen = open;
        if (!this.whilePlaying) this.reapply();
      }
    }, MENU_POLL_MS);
    return true;
  }

  get available(): boolean {
    return !!this.store;
  }

  update(enabled: boolean, radius: number, whilePlaying: boolean) {
    this.enabled = enabled;
    this.radius = radius;
    this.whilePlaying = whilePlaying;
    this.reapply();
  }

  dispose() {
    if (this.poll) clearInterval(this.poll);
    this.poll = undefined;
    if (!this.store) return;
    // Drop the instance override so the prototype method is used again.
    delete (this.store as Partial<BlurStore>).ApplyBlurState;
    this.enabled = false;
    this.reapply();
    this.store = undefined;
    this.service = undefined;
  }

  private reapply() {
    try {
      this.store?.ApplyBlurState();
    } catch (e) {
      console.error('[midnight-glass-overlay] failed to apply blur', e);
      void this.service?.SetBlurParams({ mode: BLUR_MODE_OFF });
    }
  }
}
