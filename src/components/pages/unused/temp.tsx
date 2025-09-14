 // build the same full payload used for submit/resets
 const buildPayload = (): KeystrokeSavePayload => {
   // === paste everything from your current handleSubmit up to `const payload: KeystrokeSavePayload = { ... }` ===
   // (don’t change any logic below; this is your code)
   const payload: KeystrokeSavePayload = {
     typedText: inputValue,
     targetText: displayText,
     keyData,
     textMeta: meta,
     textContext: {
       category: meta.category,
       label: meta.label,
       index: meta.index ?? null,
       presetId: meta.presetId ?? null,
       targetTextSnapshot: displayText,
     },
     tags: { category: meta.category },
     analysis: { /* ...unchanged... */ },
     metrics:  { /* ...unchanged... */ },
     ui:       { font, fontSize, isBold, textColor, backgroundColor, backgroundOpacity },
   };
   return payload;
 };
