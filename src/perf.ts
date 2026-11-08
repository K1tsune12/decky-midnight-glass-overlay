// Performance overlay (MangoHud) background, applied by the Python backend.

import { callable } from '@decky/api';

import { Key } from './i18n';

export const setPerfStyle = callable<[enabled: boolean, color: string, alpha: number], boolean>('set_perf_style');

export const getPerfInfo = callable<[], { path: string | null; content: string | null }>('get_perf_info');

/** Background color presets, RRGGBB. */
export const PERF_COLORS: { label: Key; value: string }[] = [
  { label: 'perf.color.black', value: '000000' },
  { label: 'perf.color.charcoal', value: '141414' },
  { label: 'perf.color.gray', value: '2b2b2b' },
  { label: 'perf.color.midnightBlue', value: '0b1630' },
  { label: 'perf.color.purple', value: '2a0845' },
  { label: 'perf.color.darkRed', value: '2a0a0a' },
  { label: 'perf.color.darkGreen', value: '0a2a12' },
];
