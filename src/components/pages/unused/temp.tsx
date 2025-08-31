// ---------- key listeners (cleaned) ----------
const lastKeyPressRef = useRef<number | null>(null);
const lastKeyReleaseRef = useRef<number | null>(null);
const typingStartedRef = useRef(false);            // fired once per session

const handleKeyDown = (e: KeyboardEvent) => {
  const pressTime = Date.now();

  // Fire ONCE on first visible character
  if (!typingStartedRef.current && e.key.match(/^.$/)) {
    typingStartedRef.current = true;
    onTypingStart?.();                               // notify parent (optional)
  }

  // Start session clock on first keydown
  if (sessionStart === null) setSessionStart(pressTime);

  // Count backspace, don't record as a char event
  if (e.key === 'Backspace') {
    setBackspaceCount((c) => c + 1);
    return;
  }

  // Only record single visible characters
  if (!e.key.match(/^.$/)) return;

  const lagTime =
    lastKeyReleaseRef.current !== null ? pressTime - lastKeyReleaseRef.current : 0;
  const totalLagTime =
    lastKeyPressRef.current !== null ? pressTime - lastKeyPressRef.current : 0;

  setKeyData((prev) => [
    ...prev,
    {
      key: e.key,
      pressTime,
      releaseTime: null,
      holdTime: null,
      lagTime,
      totalLagTime,
    },
  ]);

  lastKeyPressRef.current = pressTime;
};

const handleKeyUp = (e: KeyboardEvent) => {
  const releaseTime = Date.now();

  setKeyData((prev) => {
    // update only the earliest un-released matching key
    let updated = false;
    const next = prev.map((k) => {
      if (!updated && k.key === e.key && k.releaseTime === null) {
        updated = true;
        return { ...k, releaseTime, holdTime: releaseTime - k.pressTime };
      }
      return k;
    });
    return next;
  });

  lastKeyReleaseRef.current = releaseTime;
};
