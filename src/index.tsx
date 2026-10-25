import { definePlugin } from '@decky/api';
import {
  DropdownItem,
  PanelSection,
  PanelSectionRow,
  SliderField,
  ToggleField,
  staticClasses,
} from '@decky/ui';
import { useCallback, useEffect, useState } from 'react';
import { FaGlasses } from 'react-icons/fa';

import { PerfOverlaySection } from './PerfOverlaySection';
import { PresetsSection } from './PresetsSection';
import { GameBlur } from './blur';
import { setPerfStyle } from './perf';
import { BLUR_RADIUS_MAX, BLUR_RADIUS_MIN, OverlaySettings, getSettings, saveSettings } from './settings';
import { THEME_NAME, ThemeInfo, ThemePatch, getTheme, setThemeEnabled, setThemePatch } from './theme';

let blur: GameBlur | undefined;

/** Applies the plugin's own settings: game blur and performance overlay background. */
function applySettings(s: OverlaySettings) {
  blur?.update(s.blurEnabled, s.blurRadius, s.blurWhilePlaying);
  setPerfStyle(s.perfStyleEnabled, s.perfColor, s.perfAlpha).catch((e) =>
    console.error('[midnight-glass-overlay] failed to style the performance overlay', e),
  );
}

/** Theme options shown in the panel, grouped. Missing ones are skipped. */
const THEME_GROUPS: { title: string; patches: string[] }[] = [
  {
    title: 'In-Game Overlay',
    patches: [
      'In-Game Menu Style',
      'In-Game Bars Follow Menus',
      'In-Game Dim',
      'Selection Opacity',
      'Text Shadow',
    ],
  },
  {
    title: 'Menus, Dialogs & Notifications',
    patches: ['Menu Opacity', 'Chat Opacity', 'Dialog Opacity', 'Notification Opacity', 'Main Color', 'Accent Color'],
  },
];

function PatchControl({ patch, onChange }: { patch: ThemePatch; onChange: (value: string) => void }) {
  const index = Math.max(0, patch.options.indexOf(patch.value));

  if (patch.type === 'checkbox') {
    return (
      <ToggleField
        label={patch.name}
        checked={patch.value === 'Yes'}
        onChange={(on) => onChange(on ? 'Yes' : 'No')}
      />
    );
  }

  if (patch.type === 'slider' && patch.options.length > 1) {
    return (
      <SliderField
        label={patch.name}
        description={patch.value}
        value={index}
        min={0}
        max={patch.options.length - 1}
        step={1}
        notchCount={patch.options.length}
        notchTicksVisible
        onChange={(i) => {
          const next = patch.options[i];
          if (next !== undefined && next !== patch.value) onChange(next);
        }}
      />
    );
  }

  return (
    <DropdownItem
      label={patch.name}
      rgOptions={patch.options.map((o) => ({ data: o, label: o }))}
      selectedOption={patch.value}
      onChange={(o) => onChange(o.data as string)}
    />
  );
}

function SettingsPanel() {
  const [s, setS] = useState<OverlaySettings>(getSettings());
  const [theme, setTheme] = useState<ThemeInfo | undefined>();
  const [themeLoaded, setThemeLoaded] = useState(false);

  const refreshTheme = useCallback(async () => {
    setTheme(await getTheme());
    setThemeLoaded(true);
  }, []);

  useEffect(() => {
    void refreshTheme();
  }, [refreshTheme]);

  const updateBlur = (patch: Partial<OverlaySettings>) => {
    const next = saveSettings(patch);
    setS(next);
    applySettings(next);
  };

  const changePatch = async (name: string, value: string) => {
    // Optimistic update so sliders feel instant.
    setTheme((t) =>
      t && { ...t, patches: t.patches.map((p) => (p.name === name ? { ...p, value } : p)) },
    );
    try {
      await setThemePatch(name, value);
    } catch (e) {
      console.error('[midnight-glass-overlay] failed to set theme option', e);
      void refreshTheme();
    }
  };

  const toggleTheme = async (on: boolean) => {
    setTheme((t) => t && { ...t, enabled: on });
    try {
      await setThemeEnabled(on);
    } catch (e) {
      console.error('[midnight-glass-overlay] failed to toggle theme', e);
    }
    void refreshTheme();
  };

  return (
    <>
      <PanelSection title="Game Blur">
        <PanelSectionRow>
          <ToggleField
            label="Blur game behind menus"
            description={
              blur?.available
                ? 'Blurs the game while Steam menus are open.'
                : 'Not available on this Steam version.'
            }
            checked={s.blurEnabled}
            disabled={!blur?.available}
            onChange={(v) => updateBlur({ blurEnabled: v })}
          />
        </PanelSectionRow>
        <PanelSectionRow>
          <SliderField
            label="Blur strength"
            value={s.blurRadius}
            min={BLUR_RADIUS_MIN}
            max={BLUR_RADIUS_MAX}
            step={4}
            showValue
            valueSuffix="px"
            disabled={!s.blurEnabled || !blur?.available}
            onChange={(v) => updateBlur({ blurRadius: v })}
          />
        </PanelSectionRow>
      </PanelSection>

      <PerfOverlaySection settings={s} blurAvailable={!!blur?.available} onChange={updateBlur} />

      <PanelSection title="Theme">
        {!themeLoaded ? (
          <PanelSectionRow>
            <div>Loading…</div>
          </PanelSectionRow>
        ) : !theme ? (
          <PanelSectionRow>
            <div>Install the {THEME_NAME} theme in CSS Loader to change its options here.</div>
          </PanelSectionRow>
        ) : (
          <PanelSectionRow>
            <ToggleField label={THEME_NAME} checked={theme.enabled} onChange={toggleTheme} />
          </PanelSectionRow>
        )}
      </PanelSection>

      {theme?.enabled && (
        <PresetsSection
          theme={theme}
          onApplied={(next) => {
            setS(next);
            applySettings(next);
            void refreshTheme();
          }}
        />
      )}

      {theme?.enabled &&
        THEME_GROUPS.map((group) => {
          const patches = group.patches
            .map((n) => theme.patches.find((p) => p.name === n))
            .filter((p): p is ThemePatch => !!p);
          if (!patches.length) return null;
          return (
            <PanelSection key={group.title} title={group.title}>
              {patches.map((p) => (
                <PanelSectionRow key={p.name}>
                  <PatchControl patch={p} onChange={(v) => void changePatch(p.name, v)} />
                </PanelSectionRow>
              ))}
            </PanelSection>
          );
        })}
    </>
  );
}

export default definePlugin(() => {
  blur = new GameBlur();
  blur.init();
  applySettings(getSettings());

  return {
    name: 'Midnight Glass Overlay',
    titleView: <div className={staticClasses.Title}>Midnight Glass Overlay</div>,
    content: <SettingsPanel />,
    icon: <FaGlasses />,
    onDismount() {
      blur?.dispose();
      blur = undefined;
    },
  };
});
