import {
  ButtonItem,
  ConfirmModal,
  DropdownItem,
  PanelSection,
  PanelSectionRow,
  TextField,
  showModal,
} from '@decky/ui';
import { useState } from 'react';

import {
  Preset,
  applyPreset,
  capturePreset,
  defaultPreset,
  deletePreset,
  getPresets,
  savePreset,
} from './presets';
import { BLUR_DEFAULTS, OverlaySettings } from './settings';
import { ThemeInfo } from './theme';

const DEFAULT_ID = '__default__';

function SavePresetModal({
  initialName,
  existing,
  onSave,
  closeModal,
}: {
  initialName: string;
  existing: string[];
  onSave: (name: string) => void;
  closeModal?: () => void;
}) {
  const [name, setName] = useState(initialName);
  const trimmed = name.trim();
  const overwrite = existing.includes(trimmed);
  return (
    <ConfirmModal
      strTitle="Save preset"
      strOKButtonText={overwrite ? 'Overwrite' : 'Save'}
      bOKDisabled={!trimmed || trimmed === 'Default'}
      onOK={() => onSave(trimmed)}
      closeModal={closeModal}
    >
      <TextField
        label="Preset name"
        description={overwrite ? 'A preset with this name exists and will be replaced.' : undefined}
        value={name}
        onChange={(e) => setName(e.currentTarget.value)}
      />
    </ConfirmModal>
  );
}

export function PresetsSection({
  theme,
  onApplied,
}: {
  theme: ThemeInfo;
  onApplied: (blur: OverlaySettings) => void;
}) {
  const [presets, setPresets] = useState<Preset[]>(getPresets());
  const [selected, setSelected] = useState<string>(DEFAULT_ID);
  const [busy, setBusy] = useState(false);

  const selectedPreset =
    selected === DEFAULT_ID ? defaultPreset(theme, BLUR_DEFAULTS) : presets.find((p) => p.name === selected);
  const isUserPreset = selected !== DEFAULT_ID && !!selectedPreset;

  const run = async (preset: Preset) => {
    setBusy(true);
    try {
      onApplied(await applyPreset(preset));
    } catch (e) {
      console.error('[midnight-glass-overlay] failed to apply preset', e);
    } finally {
      setBusy(false);
    }
  };

  const openSave = (initialName: string) =>
    showModal(
      <SavePresetModal
        initialName={initialName}
        existing={presets.map((p) => p.name)}
        onSave={(name) => {
          setPresets(savePreset(capturePreset(name, theme)));
          setSelected(name);
        }}
      />,
    );

  const confirm = (title: string, description: string, ok: string, action: () => void) =>
    showModal(<ConfirmModal strTitle={title} strDescription={description} strOKButtonText={ok} onOK={action} />);

  return (
    <PanelSection title="Presets">
      <PanelSectionRow>
        <DropdownItem
          label="Preset"
          rgOptions={[
            { data: DEFAULT_ID, label: 'Default' },
            ...presets.map((p) => ({ data: p.name, label: p.name })),
          ]}
          selectedOption={selected}
          onChange={(o) => setSelected(o.data as string)}
        />
      </PanelSectionRow>
      <PanelSectionRow>
        <ButtonItem
          layout="below"
          disabled={busy || !selectedPreset}
          onClick={() => selectedPreset && void run(selectedPreset)}
        >
          {busy ? 'Applying…' : 'Apply preset'}
        </ButtonItem>
      </PanelSectionRow>
      <PanelSectionRow>
        <ButtonItem layout="below" disabled={busy} onClick={() => openSave('')}>
          Save current as new preset
        </ButtonItem>
      </PanelSectionRow>
      {isUserPreset && (
        <>
          <PanelSectionRow>
            <ButtonItem
              layout="below"
              disabled={busy}
              onClick={() =>
                confirm(
                  'Overwrite preset',
                  `Replace "${selected}" with the current settings?`,
                  'Overwrite',
                  () => setPresets(savePreset(capturePreset(selected, theme))),
                )
              }
            >
              Overwrite "{selected}"
            </ButtonItem>
          </PanelSectionRow>
          <PanelSectionRow>
            <ButtonItem
              layout="below"
              disabled={busy}
              onClick={() =>
                confirm('Delete preset', `Delete "${selected}"? This can't be undone.`, 'Delete', () => {
                  setPresets(deletePreset(selected));
                  setSelected(DEFAULT_ID);
                })
              }
            >
              Delete "{selected}"
            </ButtonItem>
          </PanelSectionRow>
        </>
      )}
      <PanelSectionRow>
        <ButtonItem
          layout="below"
          disabled={busy}
          onClick={() =>
            confirm(
              'Reset to defaults',
              'Restore every theme option and the game blur to their default values? Saved presets are kept.',
              'Reset',
              () => void run(defaultPreset(theme, BLUR_DEFAULTS)),
            )
          }
        >
          Reset to defaults
        </ButtonItem>
      </PanelSectionRow>
    </PanelSection>
  );
}
