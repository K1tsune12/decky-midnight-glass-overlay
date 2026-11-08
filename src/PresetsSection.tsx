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
import { t, useLanguage } from './i18n';
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
  useLanguage();
  const [name, setName] = useState(initialName);
  const trimmed = name.trim();
  const overwrite = existing.includes(trimmed);
  return (
    <ConfirmModal
      strTitle={t('presets.saveTitle')}
      strOKButtonText={overwrite ? t('presets.overwrite') : t('presets.save')}
      bOKDisabled={!trimmed || trimmed === 'Default'}
      onOK={() => onSave(trimmed)}
      closeModal={closeModal}
    >
      <TextField
        label={t('presets.name')}
        description={overwrite ? t('presets.nameExists') : undefined}
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
  useLanguage();
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
    <PanelSection title={t('presets.title')}>
      <PanelSectionRow>
        <DropdownItem
          label={t('presets.preset')}
          rgOptions={[
            { data: DEFAULT_ID, label: t('presets.default') },
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
          {busy ? t('presets.applying') : t('presets.apply')}
        </ButtonItem>
      </PanelSectionRow>
      <PanelSectionRow>
        <ButtonItem layout="below" disabled={busy} onClick={() => openSave('')}>
          {t('presets.saveNew')}
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
                  t('presets.overwriteTitle'),
                  t('presets.overwriteConfirm', { name: selected }),
                  t('presets.overwrite'),
                  () => setPresets(savePreset(capturePreset(selected, theme))),
                )
              }
            >
              {t('presets.overwriteNamed', { name: selected })}
            </ButtonItem>
          </PanelSectionRow>
          <PanelSectionRow>
            <ButtonItem
              layout="below"
              disabled={busy}
              onClick={() =>
                confirm(t('presets.deleteTitle'), t('presets.deleteConfirm', { name: selected }), t('presets.delete'), () => {
                  setPresets(deletePreset(selected));
                  setSelected(DEFAULT_ID);
                })
              }
            >
              {t('presets.deleteNamed', { name: selected })}
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
              t('presets.resetTitle'),
              t('presets.resetConfirm'),
              t('presets.reset'),
              () => void run(defaultPreset(theme, BLUR_DEFAULTS)),
            )
          }
        >
          {t('presets.resetTitle')}
        </ButtonItem>
      </PanelSectionRow>
    </PanelSection>
  );
}
