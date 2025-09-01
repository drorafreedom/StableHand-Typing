// src\utils\presets.ts

export type PresetModule =
  | 'baseline-typing'
  | 'color'
  | 'shape'
  | 'multifunction';

// Firestore collection path for this user's module presets
export const presetsColPath = (uid: string, module: PresetModule) =>
  `users/${uid}/${module}-settings`;

// Firestore doc path for one preset (by name)
export const presetDocPath = (uid: string, module: PresetModule, name: string) =>
  `${presetsColPath(uid, module)}/${name}`;

// Optional: convenience storage paths for CSV/JSON backups
export const presetCsvPath = (uid: string, module: PresetModule, name: string) =>
  `users/${uid}/${module}-settings/${name}.csv`;

export const presetJsonPath = (uid: string, module: PresetModule, name: string) =>
  `users/${uid}/${module}-settings/${name}.json`;
//--------------------------------------------------
/* export type PresetModule =
  | 'baseline-typing'
  | 'color'
  | 'shape'
  | 'multifunction';

// Firestore collection path for presets
export const presetsColPath = (uid: string, mod: PresetModule) =>
  `users/${uid}/${mod}-settings`;

// Firestore doc path for a specific preset
export const presetDocPath = (uid: string, mod: PresetModule, name: string) =>
  `${presetsColPath(uid, mod)}/${name}`;

// Storage (CSV/JSON) folder for presets
export const presetStoragePrefix = (uid: string, mod: PresetModule) =>
  `users/${uid}/${mod}-settings`;

// Storage object paths
export const presetCsvPath = (uid: string, mod: PresetModule, name: string) =>
  `${presetStoragePrefix(uid, mod)}/${name}.csv`;

export const presetJsonPath = (uid: string, mod: PresetModule, name: string) =>
  `${presetStoragePrefix(uid, mod)}/${name}.json`;
 */


