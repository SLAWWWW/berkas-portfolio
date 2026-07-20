// tokens/colors.ts — single source of truth
export const colors = {
  // Backgrounds — soft sky-blue canvas, macOS-wallpaper style
  void:        '#EAF3FC',   // page canvas — soft light blue
  obsidian:    '#DCECFA',   // primary surface
  ashstone:    '#CCE3F7',   // elevated card surface / folder face — light blue
  graphite:    '#B9D3EF',   // border / subtle divider

  // Text
  pearl:       '#10151D',   // primary text — near-black, cool cast
  mist:        '#54627A',   // secondary / muted text
  ghost:       '#8FA2B8',   // disabled / hint text

  // Accent — "The Luminous"
  arcane:      '#65B8F0',   // primary accent — sky blue
  arcaneDeep:  '#3A8DC7',   // hover/active state for accent, and default borders on light surfaces
  arcaneInk:   '#1B5C86',   // deep navy — the only arcane variant safe as TEXT on light surfaces
  arcaneGlow:  'rgba(101, 184, 240, 0.16)', // ambient glow fill
  arcaneTrace: 'rgba(101, 184, 240, 0.32)', // border highlight on hover

  // Contrast surface (the folder's inner face — a paper-meets-digital moment)
  vellum:      '#F5F4F0',   // warm off-white — "old map parchment"
  ink:         '#12120F',   // dark text on vellum
} as const;
