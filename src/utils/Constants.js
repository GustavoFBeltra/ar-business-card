// ─── Contact Information ────────────────────────────────────────────
export const CONTACT = {
  name: 'Gustavo F Beltra',
  firstName: 'Gustavo',
  lastName: 'Beltra',
  title: 'Founder',
  company: 'Beltra Industries',
  phoneWork: '+18504074909',
  phonePersonal: '+18509829436',
  emailWork: 'Gustavo@Beltraindustries.com',
  emailPersonal: 'Gustavo.f.beltra@outlook.com',
  website: 'https://Beltraindustries.com',
};

// ─── Social Links ───────────────────────────────────────────────────
// TODO: Fill in your actual social handles
export const SOCIAL = {
  linkedin: '',
  instagram: '',
  x: '',
  github: '',
  youtube: '',
  tiktok: '',
};

// ─── Portfolio Items ────────────────────────────────────────────────
export const PORTFOLIO = [
  { title: 'Turn & Burn', subtitle: 'Point of Sale System', image: null, url: 'https://Beltraindustries.com' },
  { title: 'Growth-ly', subtitle: 'CRM Platform', image: null, url: 'https://Beltraindustries.com' },
  { title: 'Yapr', subtitle: 'Language Companion', image: null, url: 'https://Beltraindustries.com' },
  { title: 'ProbonoAI', subtitle: 'Legal Assistant', image: null, url: 'https://Beltraindustries.com' },
  { title: 'Third Eye Security', subtitle: 'CV-Based Security', image: null, url: 'https://Beltraindustries.com' },
];

// ─── Colors ─────────────────────────────────────────────────────────
export const COLORS = {
  primary: 0x00d2ff,
  secondary: 0x7b2ffc,
  accent: 0xff006e,
  cardFront: 0x111116,
  cardBack: 0x0d0d12,
  cardEdge: 0x1a1a24,
  text: 0xffffff,
  textDim: 0x888899,
  glow: 0x00d2ff,
  particle: 0x00d2ff,
  menuBg: 0x16161e,
  menuBgHover: 0x22222e,
  menuBorder: 0x00d2ff,
};

export const CSS_COLORS = {
  primary: '#00d2ff',
  secondary: '#7b2ffc',
  accent: '#ff006e',
};

// ─── Dimensions ─────────────────────────────────────────────────────
// Business card proportions (3.5 x 2 inches → aspect ratio 1.75:1)
export const CARD = {
  width: 0.85,
  height: 0.5,
  depth: 0.008,
  cornerRadius: 0.015,
};

// ─── Menu Configuration ─────────────────────────────────────────────
export const MENU = {
  arcRadius: 0.55,
  arcStartAngle: Math.PI * 0.65,
  arcEndAngle: Math.PI * 1.35,
  itemWidth: 0.28,
  itemHeight: 0.065,
  itemDepth: 0.01,
  offsetX: -0.15,
  offsetY: 0.0,
};

// ─── Menu Items Definition ──────────────────────────────────────────
// Build menu items dynamically - only include social links that are filled in
const _socialItems = [
  SOCIAL.linkedin && { id: 'linkedin', label: 'LinkedIn', icon: 'in', category: 'social', action: 'linkedin' },
  SOCIAL.github && { id: 'github', label: 'GitHub', icon: '⌨', category: 'social', action: 'github' },
  SOCIAL.instagram && { id: 'instagram', label: 'Instagram', icon: '📷', category: 'social', action: 'instagram' },
  SOCIAL.x && { id: 'x', label: 'X / Twitter', icon: '𝕏', category: 'social', action: 'x' },
  SOCIAL.youtube && { id: 'youtube', label: 'YouTube', icon: '▶', category: 'social', action: 'youtube' },
  SOCIAL.tiktok && { id: 'tiktok', label: 'TikTok', icon: '♪', category: 'social', action: 'tiktok' },
].filter(Boolean);

export const MENU_ITEMS = [
  { id: 'call', label: 'Call', icon: '📞', category: 'contact', action: 'call' },
  { id: 'email', label: 'Email', icon: '✉️', category: 'contact', action: 'email' },
  { id: 'website', label: 'Website', icon: '🌐', category: 'contact', action: 'website' },
  { id: 'vcard', label: 'Save Contact', icon: '👤', category: 'contact', action: 'vcard' },
  ..._socialItems,
  { id: 'portfolio', label: 'Portfolio', icon: '◆', category: 'portfolio', action: 'portfolio' },
];

// ─── Animation Timing ───────────────────────────────────────────────
export const TIMING = {
  cardEntrance: 1.2,
  logoDropIn: 0.8,
  menuStaggerDelay: 0.08,
  menuItemEntrance: 0.5,
  cardFlip: 0.8,
  hoverPulse: 0.3,
  typingSpeed: 0.04,
  particleCycle: 4.0,
};

// ─── AR Settings ────────────────────────────────────────────────────
export const AR = {
  targetFile: '/targets/card.mind',
  modelFile: '/models/logo.glb',
  filterMinCF: 0.0001,
  filterBeta: 1000,
  warmupTolerance: 5,
  missTolerance: 5,
};

// ─── Particle Settings ──────────────────────────────────────────────
export const PARTICLES = {
  count: 60,
  radius: 0.7,
  size: 0.015,
  speed: 0.3,
  opacity: 0.6,
};
