 // helpers used by panel
 const setUrls = (urls: string[]) => {
   setSettings(s => ({ ...s, urls }));
   setResetSeed(v => v + 1);
 };

+const loadSingleFromFolder = (folder: string, index: number, ext = 'jpg') => {
+  const base = import.meta.env.BASE_URL || '/';
+  const one = `${base}${folder}/${index}.${ext}`;
+  setSettings(s => ({ ...s, urls: [one] }));
+  setAuto(false);             // manual mode
+  setResetSeed(v => v + 1);   // reset p5 state
+};

 <ControlPanelPhoto
   settings={settings}
   setSettings={(updater) => setSettings(prev => {
     const next = typeof updater === 'function' ? (updater as any)(prev) : updater;
     next.overlayColor = clampHex6(next.overlayColor);
     return next;
   })}
   startAnimation={() => setRunning(true)}
   stopAnimation={() => setRunning(false)}
   resetAnimation={() => setResetSeed(s => s + 1)}
   autoAdvance={autoAdvance}
   setAutoAdvance={setAuto}
   prevImage={prevImage}
   nextImage={nextImage}
   shuffleNow={shuffleNow}
   setUrls={setUrls}
   loadSequence={loadSequence}
+  loadSingleFromFolder={loadSingleFromFolder}
 />

 // --- inside sketch() top locals ---
 let lastAutoFlag = true;

 // --- inside p.updateWithProps ---
 isAuto = !!props.autoAdvance;
+if (lastAutoFlag && !isAuto) {
+  phase = 'hold';
+  timer = 0;
+  panX = 0; panY = 0;
+}
+lastAutoFlag = isAuto;


ken burn slide and crossfade  also shuffle adn auto slide show on adn off . 