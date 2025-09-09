// src/data/text.ts

// ---------- Types ----------
export type TextCategory = 'classic' | 'latin' | 'short' | 'long' | 'custom';

export interface TextMeta {
  category: TextCategory;      // explicit tag
  label: string;               // human label for UI
  index?: number | null;       // item index in catalog (non-custom)
  presetId?: string | null;    // optional: id if chosen from user's saved presets
}

// ---------- Catalogs ----------
export const classicOpeners: string[] = [
  "It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife. — Jane Austen",
  "All happy families are alike; each unhappy family is unhappy in its own way. — Leo Tolstoy",
  "It was the best of times, it was the worst of times, it was the age of wisdom, it was the age of foolishness. — Charles Dickens",
  "Call me Ishmael. — Herman Melville",
  "It was a bright cold day in April, and the clocks were striking thirteen. — George Orwell",
  "I am an invisible man. — Ralph Ellison",
  "The sun shone, having no alternative, on the nothing new. — Samuel Beckett",
  "If you really want to hear about it, the first thing you'll probably want to know is where I was born. — J.D. Salinger",
  "It was a pleasure to burn. — Ray Bradbury",
  "You don't know about me without you have read a book by the name of The Adventures of Tom Sawyer. — Mark Twain",
  "When he was nearly thirteen, my brother Jem got his arm badly broken at the elbow. — Harper Lee",
  "I had the story, bit by bit, from various people… — Edith Wharton",
];

export const latinAphorisms: string[] = [
  "Veni, vidi, vici. — Julius Caesar",
  "Carpe diem. — Horace",
  "Amor vincit omnia. — Virgil",
  "Faber est suae quisque fortunae.",
  "Alea iacta est. — Julius Caesar",
  "In vino veritas.",
  "Si vis pacem, para bellum.",
  "Vivere est cogitare. — Cicero",
  "Ad astra per aspera.",
  "Dulce et decorum est pro patria mori. — Horace",
  "Non ducor, duco.",
  "Sapere aude.",
  "Vox populi, vox Dei.",
  "Panem et circenses. — Juvenal",
  "Per aspera ad astra.",
  "Veritas vos liberabit.",
];

export const longParagraphs: string[] = [
  `I set the timer and begin to type at an even pace, letting the cursor lead the way like a metronome in the corner of the screen. The goal is not speed but consistency: equal pressure, repeatable rhythm, and a steady return to the home row. When the background shifts, it feels as if the page itself is breathing under the letters, a soft tide rising and falling. I try not to chase the motion. Instead, I keep my attention on the line I am copying, letting the words arrive one after another, neither forced nor hesitant. Small slips happen: an extra space, a swapped letter, a brief pause to find the next phrase. That is fine. The practice is to notice the interruption without reacting, and then continue as before, as if the sentence had never been interrupted at all.`,
  `The lab is quiet except for the gentle hum of ventilation and the occasional ring of a phone somewhere down the hallway. I sit with my shoulders relaxed and my elbows lightly anchored, allowing my hands to hover above the keys. Before starting, I check that the font is legible, the contrast is comfortable, and the window is large enough that no scrolling will be needed. A deep breath, and then the first line begins. I let the eyes travel a second ahead of the fingers, gathering the next few words like stepping stones. When the animation appears, I acknowledge it as background—useful information, not a command. If a hesitation creeps in, I release it with an exhale and resume the steady pattern: press, release, move, return. The cadence becomes familiar and, with practice, reassuring.`,
  `On some days the work feels like tuning an instrument that learns as you play it. The keyboard has a personality, the desk has a temperature, and the chair finds a height that encourages a balanced posture. What changes is my attention. I begin by copying a paragraph that asks nothing of me except patience, letting each line resolve before starting the next. When the moving field arrives, I treat it the way a reader treats the margins of a page: present, supportive, and not the main event. The trick is to let the body take care of the routine while the mind keeps the horizon in view. Errors are invitations to slow down, not reasons to stop. By the end of a block, I can usually feel a small clarity where the clutter used to be.`,
  `A reliable routine helps: place both feet flat on the floor, adjust the screen so that the top line sits just below eye level, and choose a font size that makes the words look calm instead of crowded. I glance at the clock but do not count seconds; the timer will keep time for me. The first sentence is copied slowly to set the texture of the session. The second sentence follows with a touch more confidence. When the background begins to slide, I allow the hands to keep their rhythm while the gaze softens, as if listening to music at low volume. If the mind wanders, I note where it went and invite it back without scolding. By repeating this loop—notice, return, continue—I often discover that steadiness comes from gentleness, not force.`,
  `Imagine the task as walking along a well-lit path. Each word is a step, each line a small stretch of ground, and the paragraph a block of distance that can be completed without hurry. When the visual field moves, it is like a breeze crossing the path: it may shift your attention but it does not change the destination. I do not try to match the wind; I keep my pace. Fingers press and release, wrists remain neutral, shoulders stay easy. The copy text offers clear targets so the eyes can land and the hands can follow. When a stumble happens—an accidental key or an empty beat—I mark it with a quiet breath and resume. The point is not perfection, but repeatability: the same calm motion, again and again, until it feels ordinary.`,
  `Before finishing, I add a short cool-down paragraph that reminds me to check in with posture and breath. I loosen the jaw, drop the shoulders, and let the hands rest. Then I review the block: Were the pauses evenly spaced? Did certain words invite hesitation? Did the moving background help me keep a gentle tempo? These questions are not tests; they are notes for next time. The text I copy today is unremarkable by design, because ordinary material is the best stage on which to notice small changes. With that, I clear the screen, take one last breath, and prepare for the next run. The goal remains the same: a steady practice that can accommodate variation and return to center without drama.`,
];

export const shortParagraphs: string[] = [
  `Please copy this line exactly as shown, including spaces and punctuation.`,
  `The quick brown fox jumps over the lazy dog; then it trots back again.`,
  `Pack my box with five dozen liquor jugs, then label it and rest.`,
  `We measured the time between taps and the distance between errors.`,
  `Calm hands, steady rhythm, simple text—repeat until it feels ordinary.`,
  `Numbers to copy: 1 2 3 4 5 6 7 8 9 0.`,
  `Symbols to copy: ! @ # $ % ^ & * ( ) — : ; , . ?`,
  `Short paragraph with two sentences. It ends here.`,
  `Focus on the next two words, not the whole line.`,
  `Breathe in, type the phrase; breathe out, move on.`,
];

// ---------- Labels & map ----------
export const CATEGORY_LABELS: Record<TextCategory, string> = {
  classic: 'Classic first lines',
  latin: 'Latin aphorisms',
  short: 'Short paragraphs',
  long: 'Long paragraphs',
  custom: 'Custom',
};

export const CATALOG: Record<
  Exclude<TextCategory, 'custom'>,
  { label: string; items: string[] }
> = {
  classic: { label: CATEGORY_LABELS.classic, items: classicOpeners },
  latin:   { label: CATEGORY_LABELS.latin,   items: latinAphorisms },
  short:   { label: CATEGORY_LABELS.short,   items: shortParagraphs },
  long:    { label: CATEGORY_LABELS.long,    items: longParagraphs },
};

// nice for building dropdowns
export const CATEGORY_ORDER: TextCategory[] = ['classic', 'latin', 'short', 'long', 'custom'];
export const CATEGORY_OPTIONS = CATEGORY_ORDER.map((value) => ({
  value,
  label: CATEGORY_LABELS[value],
}));

// ---------- Helpers ----------
export type NonCustom = Exclude<TextCategory, 'custom'>;

export function pickRandom(category: NonCustom): { text: string; meta: TextMeta } {
  const list = CATALOG[category].items;
  if (!list || list.length === 0) return { text: '', meta: { category, label: CATALOG[category].label, index: null } };
  const index = Math.floor(Math.random() * list.length);
  const text = list[index];
  const meta: TextMeta = {
    category,
    label: CATALOG[category].label,
    index,
    presetId: null,
  };
  return { text, meta };
}

export function makeCustomMeta(presetId: string | null = null): TextMeta {
  return { category: 'custom', label: CATEGORY_LABELS.custom, index: null, presetId };
}

export function labelForCategory(category: TextCategory): string {
  return CATEGORY_LABELS[category];
}
