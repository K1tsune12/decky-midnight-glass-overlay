import { DropdownItem, PanelSection, PanelSectionRow, SliderField, ToggleField } from '@decky/ui';

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
  const s = settings;
  const colorKnown = PERF_COLORS.some((c) => c.value === s.perfColor);
  return (
    <PanelSection title="Performance Overlay">
      <PanelSectionRow>
        <ToggleField
          label="Blur behind the overlay"
          description="Keeps the game blur on while playing, which also blurs the game behind the FPS overlay. Off: blur only while a Steam menu is open."
          checked={s.blurWhilePlaying}
          disabled={!blurAvailable || !s.blurEnabled}
          onChange={(v) => onChange({ blurWhilePlaying: v })}
        />
      </PanelSectionRow>
      <PanelSectionRow>
        <ToggleField
          label="Custom background"
          description="Change the color and opacity behind the FPS overlay."
          checked={s.perfStyleEnabled}
          onChange={(v) => onChange({ perfStyleEnabled: v })}
        />
      </PanelSectionRow>
      {s.perfStyleEnabled && (
        <>
          <PanelSectionRow>
            <DropdownItem
              label="Background color"
              rgOptions={[
                ...PERF_COLORS.map((c) => ({ data: c.value, label: c.label })),
                ...(colorKnown ? [] : [{ data: s.perfColor, label: `#${s.perfColor}` }]),
              ]}
              selectedOption={s.perfColor}
              onChange={(o) => onChange({ perfColor: o.data as string })}
            />
          </PanelSectionRow>
          <PanelSectionRow>
            <SliderField
              label="Background opacity"
              description="0% = transparent"
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
