import { definePlugin } from '@decky/api';
import {
  DropdownItem,
  PanelSection,
  PanelSectionRow,
  SliderField,
  ToggleField,
  staticClasses,
} from '@decky/ui';
import { FC, useCallback, useEffect, useState } from 'react';
import { FaGlasses } from 'react-icons/fa';

import { PerfOverlaySection } from './PerfOverlaySection';
import { PresetsSection } from './PresetsSection';
import { GameBlur } from './blur';
import { Key, LANGUAGE_NAMES, Lang, LangSetting, getLangSetting, initLanguage, setLangSetting, steamLanguageNow, t, themeText, useLanguage } from './i18n';
import { setPerfStyle } from './perf';
import { BLUR_RADIUS_MAX, BLUR_RADIUS_MIN, OverlaySettings, getSettings, saveSettings } from './settings';
import { THEME_NAME, ThemeInfo, ThemePatch, getTheme, setThemeEnabled, setThemePatch } from './theme';
import { UpdateCheckButton } from './updateCheck';

let blur: GameBlur | undefined;

/** Applies the plugin's own settings: game blur and performance overlay background. */
function applySettings(s: OverlaySettings) {
  blur?.update(s.blurEnabled, s.blurRadius, s.blurWhilePlaying, s.blurToastRadius);
  setPerfStyle(s.perfStyleEnabled, s.perfColor, s.perfAlpha).catch((e) =>
    console.error('[midnight-glass-overlay] failed to style the performance overlay', e),
  );
}

/** Theme options shown in the panel, grouped. Missing ones are skipped. */
// Theme options by what they change, in the order the panel shows them.
const LOOK_GROUP: { title: Key; patches: string[] } = {
  title: 'group.look',
  patches: [
    'Main Color',
    'Accent Color',
    'Menu Opacity',
    'Dialog Opacity',
    'Chat Opacity',
    'Notification Opacity',
    'Selection Color',
    'Selection Opacity',
    'Text Shadow',
  ],
};
const MENU_SIZE_GROUP: { title: Key; patches: string[] } = {
  title: 'group.menuSizes',
  patches: ['Quick Access Width', 'Main Menu Width', 'Decky Plugin Names'],
};
const PROTONDB_GROUP: { title: Key; patches: string[] } = {
  title: 'group.protondb',
  patches: ['ProtonDB Icon Position', 'ProtonDB Icon Background', 'ProtonDB Icon Color'],
};
const IN_GAME_GROUP: { title: Key; patches: string[] } = {
  title: 'group.inGame',
  patches: ['In-Game Menu Style', 'In-Game Bars Follow Menus', 'In-Game Dim'],
};


function PatchControl({ patch, onChange }: { patch: ThemePatch; onChange: (value: string) => void }) {
  const index = Math.max(0, patch.options.indexOf(patch.value));

  if (patch.type === 'checkbox') {
    return (
      <ToggleField
        label={themeText(patch.name)}
        checked={patch.value === 'Yes'}
        onChange={(on) => onChange(on ? 'Yes' : 'No')}
      />
    );
  }

  if (patch.type === 'slider' && patch.options.length > 1) {
    return (
      <SliderField
        label={themeText(patch.name)}
        description={themeText(patch.value)}
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
      label={themeText(patch.name)}
      rgOptions={patch.options.map((o) => ({ data: o, label: themeText(o) }))}
      selectedOption={patch.value}
      onChange={(o) => onChange(o.data as string)}
    />
  );
}

function SettingsPanel() {
  const lang = useLanguage();
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

  const group = (g: { title: Key; patches: string[] }) => {
    if (!theme?.enabled) return null;
    const patches = g.patches
      .map((n) => theme.patches.find((p) => p.name === n))
      .filter((p): p is ThemePatch => !!p);
    if (!patches.length) return null;
    return (
      <PanelSection title={t(g.title)}>
        {patches.map((p) => (
          <PanelSectionRow key={p.name}>
            <PatchControl patch={p} onChange={(v) => void changePatch(p.name, v)} />
          </PanelSectionRow>
        ))}
      </PanelSection>
    );
  };

  // Theme and presets first (a preset changes everything below), then how menus
  // look, the blur, what happens during a game, and the menu sizes.
  return (
    <>
      <PanelSection title={t('section.theme')}>
        {!themeLoaded ? (
          <PanelSectionRow>
            <div>{t('section.themeLoading')}</div>
          </PanelSectionRow>
        ) : !theme ? (
          <PanelSectionRow>
            <div>{t('section.themeMissing', { theme: THEME_NAME })}</div>
          </PanelSectionRow>
        ) : (
          <PanelSectionRow>
            <ToggleField
              label={THEME_NAME}
              description={t('section.themeDesc')}
              checked={theme.enabled}
              onChange={toggleTheme}
            />
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

      {group(LOOK_GROUP)}

      <PanelSection title={t('blur.title')}>
        <PanelSectionRow>
          <ToggleField
            label={t('blur.toggle')}
            description={blur?.available ? t('blur.toggleDesc') : t('blur.unavailable')}
            checked={s.blurEnabled}
            disabled={!blur?.available}
            onChange={(v) => updateBlur({ blurEnabled: v })}
          />
        </PanelSectionRow>
        <PanelSectionRow>
          <SliderField
            label={t('blur.strength')}
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
        <PanelSectionRow>
          <SliderField
            label={t('blur.toastStrength')}
            description={t('blur.toastStrengthDesc')}
            value={s.blurToastRadius}
            min={0}
            max={BLUR_RADIUS_MAX}
            step={4}
            showValue
            valueSuffix="px"
            disabled={!s.blurEnabled || !blur?.available}
            onChange={(v) => updateBlur({ blurToastRadius: v })}
          />
        </PanelSectionRow>
      </PanelSection>

      {group(IN_GAME_GROUP)}

      <PerfOverlaySection settings={s} blurAvailable={!!blur?.available} onChange={updateBlur} />

      {group(MENU_SIZE_GROUP)}
      {group(PROTONDB_GROUP)}

      <LanguageSection />
      <PanelSection>
        <UpdateCheckButton repo="K1tsune12/decky-midnight-glass-overlay" pluginName="Midnight Glass Overlay" lang={lang} />
      </PanelSection>
    </>
  );
}

/** Language: automatic (Steam's) or picked here. */
const LanguageSection: FC = () => {
  const lang = useLanguage();
  const [setting, setSetting] = useState<LangSetting>(getLangSetting);
  const [steamLang, setSteamLang] = useState<Lang>(lang);
  useEffect(() => {
    void steamLanguageNow().then(setSteamLang);
  }, []);
  return (
    <PanelSection title={t('lang.title')}>
      <PanelSectionRow>
        <DropdownItem
          label={t('lang.label')}
          rgOptions={[
            { data: 'auto', label: t('lang.auto', { lang: steamLang }) },
            { data: 'en', label: LANGUAGE_NAMES.en },
            { data: 'pt-BR', label: LANGUAGE_NAMES['pt-BR'] },
          ]}
          selectedOption={setting}
          onChange={(o) => {
            setSetting(o.data as LangSetting);
            void setLangSetting(o.data as LangSetting);
          }}
        />
      </PanelSectionRow>
    </PanelSection>
  );
};

export default definePlugin(() => {
  void initLanguage();
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
