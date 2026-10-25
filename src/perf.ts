// Performance overlay (MangoHud) background, applied by the Python backend.

import { callable } from '@decky/api';

export const setPerfStyle = callable<[enabled: boolean, color: string, alpha: number], boolean>('set_perf_style');

export const getPerfInfo = callable<[], { path: string | null; content: string | null }>('get_perf_info');

/** Background color presets, RRGGBB. */
export const PERF_COLORS: { label: string; value: string }[] = [
  { label: 'Black', value: '000000' },
  { label: 'Charcoal', value: '141414' },
  { label: 'Gray', value: '2b2b2b' },
  { label: 'Midnight Blue', value: '0b1630' },
  { label: 'Purple', value: '2a0845' },
  { label: 'Dark Red', value: '2a0a0a' },
  { label: 'Dark Green', value: '0a2a12' },
];
