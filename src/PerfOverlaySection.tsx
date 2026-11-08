import { DropdownItem, PanelSection, PanelSectionRow, SliderField, ToggleField } from '@decky/ui';

import { t, useLanguage } from './i18n';
import { PERF_COLORS } from './perf';
import { OverlaySettings } from './settings';

export function PerfOverlaySection({
  settings,
  blurAvailable,
  onChange,
}: {
  settings: OverlaySettings;
  blurAvailable: boolean;
  onChange: (patch: Partial<OverlaySettings>) => void;
}) {
  useLanguage();
  const s = settings;
  const colorKnown = PERF_COLORS.some((c) => c.value === s.perfColor);
  return (
    <PanelSection title={t('perf.title')}>
      <PanelSectionRow>
        <ToggleField
          label={t('perf.blurBehind')}
          description={t('perf.blurBehindDesc')}
          checked={s.blurWhilePlaying}
          disabled={!blurAvailable || !s.blurEnabled}
          onChange={(v) => onChange({ blurWhilePlaying: v })}
        />
      </PanelSectionRow>
      <PanelSectionRow>
        <ToggleField
          label={t('perf.customBg')}
          description={t('perf.customBgDesc')}
          checked={s.perfStyleEnabled}
          onChange={(v) => onChange({ perfStyleEnabled: v })}
        />
      </PanelSectionRow>
      {s.perfStyleEnabled && (
        <>
          <PanelSectionRow>
            <DropdownItem
              label={t('perf.bgColor')}
              rgOptions={[
                ...PERF_COLORS.map((c) => ({ data: c.value, label: t(c.label) })),
                ...(colorKnown ? [] : [{ data: s.perfColor, label: `#${s.perfColor}` }]),
              ]}
              selectedOption={s.perfColor}
              onChange={(o) => onChange({ perfColor: o.data as string })}
            />
          </PanelSectionRow>
          <PanelSectionRow>
            <SliderField
              label={t('perf.bgOpacity')}
              description={t('perf.bgOpacityDesc')}
              value={Math.round(s.perfAlpha * 100)}
              min={0}
              max={100}
              step={5}
              showValue
              valueSuffix="%"
              onChange={(v) => onChange({ perfAlpha: v / 100 })}
            />
          </PanelSectionRow>
        </>
      )}
    </PanelSection>
  );
}
