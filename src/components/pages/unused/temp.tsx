@@
   // ---------- SAVE (unchanged structure) ----------
   const saveKeystrokeData = async (payload: KeystrokeSavePayload) => {
@@
-    try {
-      // ---------- STORAGE: JSON ----------
-      const basePath = `users/${uid}/keystroke-data/sessions/${sessionId}`;
-      const jsonPath = `${basePath}/${sessionId}.json`;
-      const jsonText = JSON.stringify(fullRecord, null, 2);
-      await uploadBytes(storageRef(storage, jsonPath), new Blob([jsonText], { type: 'application/json' }));
   try {
     // ---------- STORAGE: JSON (single or chunked) ----------
     const basePath = `users/${uid}/keystroke-data/sessions/${sessionId}`;
+
     // Tuning knobs (safe defaults)
     const SINGLE_JSON_THRESHOLD = 1_500_000;   // if total JSON > ~1.5MB, use chunked mode
     const KEYS_PER_PART        = 5_000;        // key events per part file
     const OPS_PER_PART         = 50_000;       // alignment ops per part file
+
     const writeJson = async (path: string, obj: any) => {
       const txt = JSON.stringify(obj, null, 2);
       await uploadBytes(storageRef(storage, path), new Blob([txt], { type: 'application/json' }));
       return txt.length;
     };
     const chunkArray = <T,>(arr: T[], size: number): T[][] => {
       if (!Array.isArray(arr) || !arr.length) return [];
       const out: T[][] = [];
       for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i size));
       return out;
     };
+
     // Decide whether to keep a single JSON or split
     const fullRecordApproxSize = JSON.stringify(fullRecord).length;
     const jsonMode: 'single' | 'chunked' =
       fullRecordApproxSize <= SINGLE_JSON_THRESHOLD ? 'single' : 'chunked';
+
     let jsonPath: string | null = null;
     let jsonHeadPath: string | null = null;
     let jsonManifestPath: string | null = null;
     let jsonPartPaths = {
       keyData: [] as string[],
       charOps: [] as string[],
       wordOps: [] as string[],
     };
+
     if (jsonMode === 'single') {
       // Original behavior
       jsonPath = `${basePath}/${sessionId}.json`;
       await writeJson(jsonPath, fullRecord);
     } else {
       // Chunked mode
       const head = {
         ...fullRecord,
         keyData: undefined, // moved to parts
         analysis: fullRecord.analysis
           ? {
               ...fullRecord.analysis,
               char: fullRecord.analysis.char
                 ? { ...fullRecord.analysis.char, ops: [] }
                 : fullRecord.analysis.char,
               word: fullRecord.analysis.word
                 ? { ...fullRecord.analysis.word, ops: [] }
                 : fullRecord.analysis.word,
             }
           : fullRecord.analysis,
       };
       jsonHeadPath = `${basePath}/${sessionId}.head.json`;
       await writeJson(jsonHeadPath, head);
+
       // Parts folder
       const partsBase = `${basePath}/parts`;
+
       // keyData parts
       const keyParts = chunkArray(fullRecord.keyData || [], KEYS_PER_PART);
       for (let i = 0; i < keyParts.length; i++) {
         const p = `${partsBase}/${sessionId}.keyData.${i 1}.json`;
         await writeJson(p, keyParts[i]);
         jsonPartPaths.keyData.push(p);
       }
+
       // analysis.char.ops parts
       const charOps = fullRecord.analysis?.char?.ops || [];
       const charParts = chunkArray(charOps, OPS_PER_PART);
       for (let i = 0; i < charParts.length; i++) {
         const p = `${partsBase}/${sessionId}.charOps.${i 1}.json`;
         await writeJson(p, charParts[i]);
         jsonPartPaths.charOps.push(p);
       }
+
       // analysis.word.ops parts
       const wordOps = fullRecord.analysis?.word?.ops || [];
       const wordParts = chunkArray(wordOps, OPS_PER_PART);
       for (let i = 0; i < wordParts.length; i++) {
         const p = `${partsBase}/${sessionId}.wordOps.${i 1}.json`;
         await writeJson(p, wordParts[i]);
         jsonPartPaths.wordOps.push(p);
       }
+
       // Manifest tying everything together (for reconstruction)
       const manifest = {
         version: 1,
         sessionId,
         createdAt: new Date().toISOString(),
         headPath: jsonHeadPath,
         chunks: {
           keyData: jsonPartPaths.keyData.map((path, idx) => ({
             index: idx 1,
             path,
             count: keyParts[idx]?.length || 0,
           })),
           charOps: jsonPartPaths.charOps.map((path, idx) => ({
             index: idx 1,
             path,
             count: charParts[idx]?.length || 0,
           })),
           wordOps: jsonPartPaths.wordOps.map((path, idx) => ({
             index: idx 1,
             path,
             count: wordParts[idx]?.length || 0,
           })),
         },
         counts: {
           keyData: (fullRecord.keyData || []).length,
           charOps: charOps.length,
           wordOps: wordOps.length,
         },
       };
       jsonManifestPath = `${basePath}/${sessionId}.manifest.json`;
       await writeJson(jsonManifestPath, manifest);
     }
@@
-      // ---------- STORAGE: XLSX (multi-sheet) ----------
     // ---------- STORAGE: XLSX (multi-sheet) ----------
       // (keep your existing XLSX & CSV code unchanged)
@@
-      const jsonSize = jsonText.length;
-      const storagePaths = {
-        json: jsonPath,
     // ---------- FIRESTORE pointer payload ----------
     const jsonSize = fullRecordApproxSize; // use the pre-computed size
     const storagePaths = {
       mode: jsonMode,                // 'single' | 'chunked'
       json: jsonPath,                // present in single mode
       jsonHead: jsonHeadPath,        // present in chunked mode
       jsonManifest: jsonManifestPath,// present in chunked mode
       jsonParts: jsonPartPaths,      // present in chunked mode
         xlsx: xlsxPath,
         csv: {
           flat: `${basePath}/${sessionId}.session_flat.csv`,
           keyEvents: `${basePath}/${sessionId}.key_events.csv`,
           perKey: `${basePath}/${sessionId}.per_key.csv`,
           charOps: `${basePath}/${sessionId}.char_ops.csv`,
           wordOps: `${basePath}/${sessionId}.word_ops.csv`,
         },
       };
@@
-      if (jsonSize < 900_000) {
-        await addDoc(collection(db, `users/${uid}/keystroke-data`), { ...fullRecord, storagePaths });
     if (jsonSize < 900_000) {
       // Small sessions can still inline the full object in Firestore if you want
       await addDoc(collection(db, `users/${uid}/keystroke-data`), { ...fullRecord, storagePaths });
       } else {
         await addDoc(collection(db, `users/${uid}/keystroke-data`), {
           userId: uid,
           sessionId,
           animationTab: fullRecord.animationTab,
           animationAtStart: fullRecord.animationAtStart,
           animationAtSubmit: fullRecord.animationAtSubmit,
           targetText: fullRecord.targetText,
           typedText: fullRecord.typedText,
           metrics: fullRecord.metrics,
         // Optional: add queryable text metadata if you have it in state
         // (make sure TextDisplay passes meta via onMetaChange -> setTextMeta)
         // textCategory: textMeta?.category ?? 'unknown',
         // textPresetId: textMeta?.presetId ?? null,
           approxKeyCount: (fullRecord.keyData || []).length,
           timestamp: fullRecord.timestamp,
           localDateTime: fullRecord.localDateTime,
           schemaVersion: fullRecord.schemaVersion,
           storagePaths,
         });
       }
@@
-      await rtdbSet(
      await rtdbSet(
         rtdbRef(rtdb, `users/${uid}/keystroke-data/${sessionId}`),
         {
           status: 'submitted',
           animationTab: fullRecord.animationTab,
           targetLength: fullRecord.targetText?.length ?? 0,
           typedLength: fullRecord.typedText?.length ?? 0,
           wordCount: (fullRecord.typedText || '').trim().split(/\s+/).filter(Boolean).length,
           createdAt: serverTimestamp(),
           clientTs: fullRecord.timestamp,
-          storageJsonPath: jsonPath,
+          // expose pointers for downstream tools
         storageJsonPath: jsonPath ?? undefined,
         storageJsonHead: jsonHeadPath ?? undefined,
         storageJsonManifest: jsonManifestPath ?? undefined,
           storageXlsxPath: xlsxPath,
         }
       );