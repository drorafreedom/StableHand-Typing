-const DEFAULT_SETTINGS: ColorAnimationSettings = {
+export const COLOR_DEFAULTS: ColorAnimationSettings = {
   // muted palette (replace with your picks)
-  colors: ['#FF0000', '#00FF00', '#0000FF', '#FFFF00'],
+  colors: ['#94a3b8', '#a7c4bc', '#cbd5e1', '#fde68a'],
   animationStyle: 'sine',
-  duration: 1,
-  opacity: 1,
+  duration: 0.8,
+  opacity: 0.35,
   opacityMode: 'constant',
   opacitySpeed: 1,
   direction: 'forward',
   linearAngle: 45,
 };
 
-const cloneDefaults = (): ColorAnimationSettings => ({
-  ...DEFAULT_SETTINGS,
-  colors: [...DEFAULT_SETTINGS.colors],
-});
+export const cloneColorDefaults = (): ColorAnimationSettings => ({
+  ...COLOR_DEFAULTS,
+  colors: [...COLOR_DEFAULTS.colors], // keep array unshared
+});
 
 const ColorAnimation: React.FC<{ setCurrentAnimation: (animation: string) => void }> = ({ setCurrentAnimation }) => {
-  const [settings, setSettings] = useState<ColorAnimationSettings>(cloneDefaults());
+  const [settings, setSettings] = useState<ColorAnimationSettings>(cloneColorDefaults());
   ...
-  const resetAnimation = () => {
-    setSettings(cloneDefaults());
+  const resetAnimation = () => {
+    setSettings(cloneColorDefaults());
     setResetKey((k) => k + 1);
     setRunning(false);
   };
 
   const sketch = useCallback((p5: any) => {
     let t = 0;
-    let current: ColorAnimationSettings = DEFAULT_SETTINGS;
+    let current: ColorAnimationSettings = COLOR_DEFAULTS;
