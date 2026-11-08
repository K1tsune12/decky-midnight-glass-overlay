// Minimal i18n: English + Brazilian Portuguese. The language follows Steam's
// UI language (Portuguese -> pt-BR, anything else -> English).

import { useEffect, useReducer } from 'react';

export type Lang = 'en' | 'pt-BR';

const en = {
  'lang.title': 'Language',
  'lang.label': 'Language',
  'lang.auto': 'Automatic ({lang})',
  // game blur
  'blur.title': 'Game Blur',
  'blur.toggle': 'Blur game behind menus',
  'blur.toggleDesc': 'Blurs the game while Steam menus are open.',
  'blur.unavailable': 'Not available on this Steam version.',
  'blur.strength': 'Blur strength',

  // performance overlay
  'perf.title': 'Performance Overlay (FPS)',
  'perf.blurBehind': 'Blur behind the overlay',
  'perf.blurBehindDesc':
    'Keeps the game blur on while playing, which also blurs the game behind the FPS overlay. Off: blur only while a Steam menu is open.',
  'perf.customBg': 'Custom background',
  'perf.customBgDesc': 'Change the color and opacity behind the FPS overlay.',
  'perf.bgColor': 'Background color',
  'perf.bgOpacity': 'Background opacity',
  'perf.bgOpacityDesc': '0% = transparent',
  'perf.color.black': 'Black',
  'perf.color.charcoal': 'Charcoal',
  'perf.color.gray': 'Gray',
  'perf.color.midnightBlue': 'Midnight Blue',
  'perf.color.purple': 'Purple',
  'perf.color.darkRed': 'Dark Red',
  'perf.color.darkGreen': 'Dark Green',

  // theme
  'section.theme': 'Theme',
  'section.themeLoading': 'Loading…',
  'section.themeMissing': 'Install the {theme} theme in CSS Loader to change its options here.',
  'group.inGame': 'During a Game',
  'group.menus': 'Menus, Dialogs & Notifications',
  'group.look': 'Look',
  'group.qam': 'Quick Access Menu',
  'section.themeDesc': 'The glass look of menus, dialogs and notifications. The options below change it.',

  // theme option names and values, as they appear in theme.json (looked up by themeText)
  'theme.In-Game Menu Style': 'In-Game Menu Style',
  'theme.Quick Access Width': 'Width',
  'theme.Wide': 'Wide',
  'theme.Default': 'Default',
  'theme.Extra Wide': 'Extra wide',
  'theme.In-Game Bars Follow Menus': 'In-Game Bars Follow Menus',
  'theme.In-Game Dim': 'In-Game Dim',
  'theme.Selection Opacity': 'Selection Opacity',
  'theme.Text Shadow': 'Text Shadow',
  'theme.Menu Opacity': 'Menu Opacity',
  'theme.Chat Opacity': 'Chat Opacity',
  'theme.Dialog Opacity': 'Dialog Opacity',
  'theme.Notification Opacity': 'Notification Opacity',
  'theme.Main Color': 'Main Color',
  'theme.Accent Color': 'Accent Color',
  'theme.Black': 'Black',
  'theme.Dark Gray': 'Dark Gray',
  'theme.Gray': 'Gray',
  'theme.Red': 'Red',
  'theme.Orange': 'Orange',
  'theme.Yellow': 'Yellow',
  'theme.Green': 'Green',
  'theme.Blue': 'Blue',
  'theme.Indigo': 'Indigo',
  'theme.Violet': 'Violet',
  'theme.Custom': 'Custom',
  'theme.Steam Blue': 'Steam Blue',
  'theme.Purple': 'Purple',
  'theme.Pink': 'Pink',
  'theme.Gold': 'Gold',
  'theme.Teal': 'Teal',
  'theme.White': 'White',
  'theme.Off': 'Off',
  'theme.Soft': 'Soft',
  'theme.Strong': 'Strong',

  // presets
  'presets.title': 'Presets',
  'presets.preset': 'Preset',
  'presets.default': 'Default',
  'presets.applying': 'Applying…',
  'presets.apply': 'Apply preset',
  'presets.saveNew': 'Save current as new preset',
  'presets.saveTitle': 'Save preset',
  'presets.save': 'Save',
  'presets.overwrite': 'Overwrite',
  'presets.name': 'Preset name',
  'presets.nameExists': 'A preset with this name exists and will be replaced.',
  'presets.overwriteTitle': 'Overwrite preset',
  'presets.overwriteConfirm': 'Replace "{name}" with the current settings?',
  'presets.overwriteNamed': 'Overwrite "{name}"',
  'presets.deleteTitle': 'Delete preset',
  'presets.deleteConfirm': 'Delete "{name}"? This can\'t be undone.',
  'presets.delete': 'Delete',
  'presets.deleteNamed': 'Delete "{name}"',
  'presets.resetTitle': 'Reset to defaults',
  'presets.resetConfirm':
    'Restore every theme option and the game blur to their default values? Saved presets are kept.',
  'presets.reset': 'Reset',
};

export type Key = keyof typeof en;

const ptBR: Record<Key, string> = {
  'lang.title': 'Idioma',
  'lang.label': 'Idioma',
  'lang.auto': 'Automático ({lang})',
  'blur.title': 'Desfoque do jogo',
  'blur.toggle': 'Desfocar o jogo atrás dos menus',
  'blur.toggleDesc': 'Desfoca o jogo enquanto os menus do Steam estão abertos.',
  'blur.unavailable': 'Indisponível nesta versão do Steam.',
  'blur.strength': 'Intensidade do desfoque',

  'perf.title': 'Sobreposição de desempenho (FPS)',
  'perf.blurBehind': 'Desfoque atrás da sobreposição',
  'perf.blurBehindDesc':
    'Mantém o desfoque ligado durante o jogo, o que também desfoca o jogo atrás da sobreposição de FPS. Desligado: só desfoca com um menu do Steam aberto.',
  'perf.customBg': 'Fundo personalizado',
  'perf.customBgDesc': 'Muda a cor e a opacidade atrás da sobreposição de FPS.',
  'perf.bgColor': 'Cor do fundo',
  'perf.bgOpacity': 'Opacidade do fundo',
  'perf.bgOpacityDesc': '0% = transparente',
  'perf.color.black': 'Preto',
  'perf.color.charcoal': 'Grafite',
  'perf.color.gray': 'Cinza',
  'perf.color.midnightBlue': 'Azul-marinho',
  'perf.color.purple': 'Roxo',
  'perf.color.darkRed': 'Vermelho-escuro',
  'perf.color.darkGreen': 'Verde-escuro',

  'section.theme': 'Tema',
  'section.themeLoading': 'Carregando…',
  'section.themeMissing': 'Instale o tema {theme} no CSS Loader para mudar as opções dele aqui.',
  'group.inGame': 'Durante o jogo',
  'group.menus': 'Menus, janelas e notificações',
  'group.look': 'Aparência',
  'group.qam': 'Menu de acesso rápido',
  'section.themeDesc': 'O visual de vidro dos menus, janelas e notificações. As opções abaixo o ajustam.',

  'theme.In-Game Menu Style': 'Estilo do menu no jogo',
  'theme.Quick Access Width': 'Largura',
  'theme.Wide': 'Larga',
  'theme.Default': 'Padrão',
  'theme.Extra Wide': 'Extra larga',
  'theme.In-Game Bars Follow Menus': 'Barras no jogo seguem os menus',
  'theme.In-Game Dim': 'Escurecimento no jogo',
  'theme.Selection Opacity': 'Opacidade da seleção',
  'theme.Text Shadow': 'Sombra do texto',
  'theme.Menu Opacity': 'Opacidade dos menus',
  'theme.Chat Opacity': 'Opacidade do chat',
  'theme.Dialog Opacity': 'Opacidade das janelas',
  'theme.Notification Opacity': 'Opacidade das notificações',
  'theme.Main Color': 'Cor principal',
  'theme.Accent Color': 'Cor de destaque',
  'theme.Black': 'Preto',
  'theme.Dark Gray': 'Cinza-escuro',
  'theme.Gray': 'Cinza',
  'theme.Red': 'Vermelho',
  'theme.Orange': 'Laranja',
  'theme.Yellow': 'Amarelo',
  'theme.Green': 'Verde',
  'theme.Blue': 'Azul',
  'theme.Indigo': 'Índigo',
  'theme.Violet': 'Violeta',
  'theme.Custom': 'Personalizada',
  'theme.Steam Blue': 'Azul Steam',
  'theme.Purple': 'Roxo',
  'theme.Pink': 'Rosa',
  'theme.Gold': 'Dourado',
  'theme.Teal': 'Verde-azulado',
  'theme.White': 'Branco',
  'theme.Off': 'Desligado',
  'theme.Soft': 'Suave',
  'theme.Strong': 'Forte',

  'presets.title': 'Predefinições',
  'presets.preset': 'Predefinição',
  'presets.default': 'Padrão',
  'presets.applying': 'Aplicando…',
  'presets.apply': 'Aplicar predefinição',
  'presets.saveNew': 'Salvar as configurações atuais como nova predefinição',
  'presets.saveTitle': 'Salvar predefinição',
  'presets.save': 'Salvar',
  'presets.overwrite': 'Substituir',
  'presets.name': 'Nome da predefinição',
  'presets.nameExists': 'Já existe uma predefinição com esse nome, e ela será substituída.',
  'presets.overwriteTitle': 'Substituir predefinição',
  'presets.overwriteConfirm': 'Substituir "{name}" pelas configurações atuais?',
  'presets.overwriteNamed': 'Substituir "{name}"',
  'presets.deleteTitle': 'Excluir predefinição',
  'presets.deleteConfirm': 'Excluir "{name}"? Não dá para desfazer.',
  'presets.delete': 'Excluir',
  'presets.deleteNamed': 'Excluir "{name}"',
  'presets.resetTitle': 'Restaurar padrões',
  'presets.resetConfirm':
    'Voltar todas as opções do tema e o desfoque do jogo aos valores padrão? As predefinições salvas são mantidas.',
  'presets.reset': 'Restaurar',
};

const TABLES: Record<Lang, Record<Key, string>> = { en, 'pt-BR': ptBR };

let current: Lang = 'en';
const listeners = new Set<() => void>();

export function t(key: Key, vars?: Record<string, string | number>): string {
  let text = TABLES[current][key] ?? en[key];
  if (vars) for (const [k, v] of Object.entries(vars)) text = text.split(`{${k}}`).join(String(v));
  return text;
}

/**
 * Theme option names and values come from the theme itself. Shows a
 * translation when one is known, otherwise the text as the theme has it.
 */
export function themeText(text: string): string {
  const key = `theme.${text}`;
  return key in en ? t(key as Key) : text;
}

async function steamLanguage(): Promise<Lang> {
  try {
    const lang: string = await (window as any).SteamClient.Settings.GetCurrentLanguage();
    return lang === 'brazilian' || lang === 'portuguese' ? 'pt-BR' : 'en';
  } catch {
    return 'en';
  }
}

export type LangSetting = 'auto' | Lang;
const SETTING_KEY = 'midnight-glass-overlay:lang';

/** Language names are always shown in their own language. */
export const LANGUAGE_NAMES: Record<Lang, string> = { en: 'English', 'pt-BR': 'Português (Brasil)' };

/** 'auto' follows Steam's language; otherwise the language picked in the panel. */
export function getLangSetting(): LangSetting {
  try {
    const v = localStorage.getItem(SETTING_KEY);
    return v === 'en' || v === 'pt-BR' ? v : 'auto';
  } catch {
    return 'auto';
  }
}

/** The language Steam itself uses, for the "Automatic" label. */
export const steamLanguageNow = steamLanguage;

async function apply(setting: LangSetting): Promise<void> {
  current = setting === 'auto' ? await steamLanguage() : setting;
  listeners.forEach((l) => l());
}

/** Applies the saved choice (or Steam's language) and re-renders anything using useLanguage(). */
export function initLanguage(): Promise<void> {
  return apply(getLangSetting());
}

export function setLangSetting(setting: LangSetting): Promise<void> {
  try {
    if (setting === 'auto') localStorage.removeItem(SETTING_KEY);
    else localStorage.setItem(SETTING_KEY, setting);
  } catch {
    // only a convenience: the language still changes for this session
  }
  return apply(setting);
}

/** Re-render the calling component when the language changes. */
export function useLanguage(): Lang {
  const [, rerender] = useReducer((x: number) => x + 1, 0);
  useEffect(() => {
    listeners.add(rerender);
    return () => {
      listeners.delete(rerender);
    };
  }, []);
  return current;
}
