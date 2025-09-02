Totally hear you—let’s keep changes surgical and consistent with what you already have. Below are minimal patches to add transparency (with optional pulsing) to Multifunction and Shape animations. This touches only:

settings interfaces + defaults

1–2 lines in the p5 draw path to apply alpha

a few small controls in each Control Panel

No TherapyPage changes are needed; your snapshot code will automatically include the new fields.

1) MultifunctionAnimation — add background & line transparency (+ pulse)
a) Extend the Settings interface & defaults

In src/components/Therapy/MultifunctionAnimation.tsx

Add these fields to the Settings interface:

  bgOpacity: number;                // 0..1
  lineOpacity: number;              // 0..1
  lineOpacityMode: 'constant' | 'pulse';
  lineOpacitySpeed: number;         // >= 0


Add default values in defaultSettings:

  bgOpacity: 1,
  lineOpacity: 1,
  lineOpacityMode: 'constant',
  lineOpacitySpeed: 1,

b) Apply alpha in the sketch draw loop

Replace the top of your drawing block (just after p5.noFill();) with this:

p5.noFill();
p5.clear();

// background with alpha
const bg = p5.color(settings.bgColor);
bg.setAlpha(Math.round(255 * (settings.bgOpacity ?? 1)));
p5.background(bg);

// compute line alpha (optionally pulsing)
const lineAlpha255 = (() => {
  let a = settings.lineOpacity ?? 1;
  if ((settings.lineOpacityMode ?? 'constant') === 'pulse') {
    const pulse = (p5.sin(time * (settings.lineOpacitySpeed || 0)) + 1) * 0.5; // 0..1
    a = Math.max(0, Math.min(1, a * pulse));
  }
  return Math.round(255 * a);
})();

p5.strokeWeight(settings.thickness);


Then, where you set stroke color, set alpha too:

For a single color:

const sCol = p5.color(settings.lineColor);
sCol.setAlpha(lineAlpha255);
p5.stroke(sCol);


For palette colors (inside your loop):

if (settings.selectedPalette !== 'none') {
  const col = p5.color(palettes[settings.selectedPalette][i % palettes[settings.selectedPalette].length]);
  col.setAlpha(lineAlpha255);
  p5.stroke(col);
} else {
  const sCol = p5.color(settings.lineColor);
  sCol.setAlpha(lineAlpha255);
  p5.stroke(sCol);
}

c) Controls (Minimal UI add)

In your existing ControlPanel.tsx for Multifunction add these small blocks (anywhere sensible, e.g., near the color pickers):

<Slider
  label="Background Opacity"
  min={0}
  max={1}
  step={0.01}
  value={settings.bgOpacity ?? 1}
  onChange={(v) => setSettings((s:any) => ({ ...s, bgOpacity: v }))}
/>

<Slider
  label="Line Opacity"
  min={0}
  max={1}
  step={0.01}
  value={settings.lineOpacity ?? 1}
  onChange={(v) => setSettings((s:any) => ({ ...s, lineOpacity: v }))}
/>

<div className="control-group text-xs">
  <label>Line Opacity Mode:</label>
  <select
    value={settings.lineOpacityMode ?? 'constant'}
    onChange={(e) => setSettings((s:any) => ({ ...s, lineOpacityMode: e.target.value as any }))}
    className="border p-2 rounded w-full"
  >
    <option value="constant">Constant</option>
    <option value="pulse">Pulse</option>
  </select>
</div>

{(settings.lineOpacityMode ?? 'constant') === 'pulse' && (
  <Slider
    label="Line Opacity Speed"
    min={0}
    max={5}
    step={0.1}
    value={settings.lineOpacitySpeed ?? 1}
    onChange={(v) => setSettings((s:any) => ({ ...s, lineOpacitySpeed: v }))}
  />
)}


That’s it for Multifunction. ✅

2) ShapeAnimations — add background & shape transparency (+ pulse)
a) Extend the Settings interface & defaults

In src/components/Therapy/ShapeAnimations.tsx

Add fields:

  bgOpacity: number;                  // 0..1
  shapeOpacity: number;               // 0..1 (fill alpha)
  shapeOpacityMode: 'constant' | 'pulse';
  shapeOpacitySpeed: number;          // >= 0


Defaults:

  bgOpacity: 1,
  shapeOpacity: 1,
  shapeOpacityMode: 'constant',
  shapeOpacitySpeed: 1,

b) Use alpha in setup/draw & when building palette colors

In p5.setup, make alpha predictable for HSB palettes:

p5.colorMode(p5.HSB, 360, 100, 100, 255); // add 255 alpha range


In p5.draw, use a background color with alpha:

const bg = p5.color(settings.bgColor);
bg.setAlpha(Math.round(255 * (settings.bgOpacity ?? 1)));
p5.background(bg);


When you build fillColors in createShapes(), compute a per-frame alpha in draw or precompute a base alpha and set it on every color. Easiest is compute per-frame before drawing each shape:

Add near top of p5.draw (before the loop):

const t = p5.frameCount * 0.016; // ~seconds
const shapeAlpha255 = (() => {
  let a = settings.shapeOpacity ?? 1;
  if ((settings.shapeOpacityMode ?? 'constant') === 'pulse') {
    const pulse = (p5.sin(t * (settings.shapeOpacitySpeed || 0)) + 1) * 0.5; // 0..1
    a = Math.max(0, Math.min(1, a * pulse));
  }
  return Math.round(255 * a);
})();


Then, inside s.display() (right before drawing the geometry), set the fill with alpha:

// If your fillColor was created as p5.color(...), clone & set alpha each frame:
const c = this.p5.color(this.fillColor);
c.setAlpha(shapeAlpha255);
this.p5.fill(c);


Note: if you prefer to carry alpha inside fillColor precomputed, you can also rebuild fillColors on each updateWithProps—but the per-frame setAlpha is simpler and light-weight.

If you’d rather bake alpha when constructing palettes in createShapes(), you can, but then you must rebuild shapes/colors whenever opacity changes. The per-frame approach avoids that churn.

c) Controls (Minimal UI add)

In your ControlPanelShape.tsx (the version that already uses PresetControls or your older one—either way works), add:

<Slider
  label="Background Opacity"
  min={0}
  max={1}
  step={0.01}
  value={settings.bgOpacity ?? 1}
  onChange={(v) => setSettings((s) => ({ ...s, bgOpacity: v }))}
/>

<Slider
  label="Shape Opacity"
  min={0}
  max={1}
  step={0.01}
  value={settings.shapeOpacity ?? 1}
  onChange={(v) => setSettings((s) => ({ ...s, shapeOpacity: v }))}
/>

<div className="space-y-1 text-xs">
  <label>Shape Opacity Mode:</label>
  <select
    value={settings.shapeOpacityMode ?? 'constant'}
    onChange={(e) => setSettings((s) => ({ ...s, shapeOpacityMode: e.target.value as any }))}
    className="w-full border px-2 py-1 rounded"
  >
    <option value="constant">Constant</option>
    <option value="pulse">Pulse</option>
  </select>
</div>

{(settings.shapeOpacityMode ?? 'constant') === 'pulse' && (
  <Slider
    label="Shape Opacity Speed"
    min={0}
    max={5}
    step={0.1}
    value={settings.shapeOpacitySpeed ?? 1}
    onChange={(v) => setSettings((s) => ({ ...s, shapeOpacitySpeed: v }))}
  />
)}

Why this design?

Background opacity is always constant (cleaner visually; fewer moving parts).

Line/Shape opacity can be constant or pulse, same mechanism as Color Animation—so it’s consistent across modules.

We apply alpha where the color is set (stroke/fill) without changing your wave/shape math.

If you want the background to pulse too, we can add bgOpacityMode + bgOpacitySpeed later using the same pattern; I kept it simple for now.

Want me to paste these patches directly into your three files exactly where they go?