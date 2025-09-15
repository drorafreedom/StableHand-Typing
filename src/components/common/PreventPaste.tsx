

// -------------------Block paste into the textarea- version 0 -------------------------------------------
/* e.preventDefault() = actually blocks the browser’s default action (the paste/drop).
deny() = just your helper to tell the user (e.g., alert(...)). It does not block anything by itself.
So the correct pattern is: call e.preventDefault() to stop the action, and (optionally) call deny() for feedback. */

/* const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
  e.preventDefault();  // <-- blocks
  deny();              // <-- optional feedback
};

// Block drag/drop text into the textarea
const handleDrop = (e: React.DragEvent<HTMLTextAreaElement>) => {
  e.preventDefault();  // <-- blocks
  deny();              // <-- optional
};

// Block keyboard paste (Ctrl/⌘+V, Shift+Insert)
const handleKeyDownHardBlock = (e: KeyboardEvent) => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'v') {
    e.preventDefault();  // <-- blocks
    deny();
    return;
  }
  if (e.shiftKey && e.key === 'Insert') {
    e.preventDefault();  // <-- blocks
    deny();
  }
};

useEffect(() => {
  const down = (ev: KeyboardEvent) => { 
    handleKeyDownHardBlock(ev);
    handleKeyDown(ev);   // your existing typing logic
  };
  const up = (ev: KeyboardEvent) => handleKeyUp(ev);
  document.addEventListener('keydown', down);
  document.addEventListener('keyup', up);
  return () => {
    document.removeEventListener('keydown', down);
    document.removeEventListener('keyup', up);
  };
}, []);
 */
 
 //-----------------------version 1
/* //const deny = (msg = 'Paste is disabled — please type the passage.') => window.alert(msg);
// Show a message only once (so we don’t spam alerts)
const toldRef = React.useRef(false);
const deny = (msg = 'Paste is disabled — please type the passage.') => {
  if (!toldRef.current) {
    window.alert(msg);
    toldRef.current = true;
  }
};

const handleKeyDownHardBlock = (e: KeyboardEvent) => {
  // ⬇️ Only block when the typing box has focus
  if (document.activeElement !== textareaRef.current) return;

  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'v') {
    e.preventDefault();
    deny();
  }
  if (e.shiftKey && e.key === 'Insert') {
    e.preventDefault();
    deny();
  }
};


useEffect(() => {
  const down = (ev: KeyboardEvent) => { 
    handleKeyDownHardBlock(ev);   // now it only fires when textarea is focused
    handleKeyDown(ev);
  };
  const up   = (ev: KeyboardEvent) => handleKeyUp(ev);

  document.addEventListener('keydown', down);
  document.addEventListener('keyup', up);
  return () => {
    document.removeEventListener('keydown', down);
    document.removeEventListener('keyup', up);
  };
}, []);

const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
  e.preventDefault();
  deny();
};
const handleDrop = (e: React.DragEvent<HTMLTextAreaElement>) => {
  e.preventDefault();
  deny();
}; */




//--------------------------version 2---------------------
const deny = (msg = 'Paste is disabled — please type the passage.') => window.alert(msg);

const handleKeyDownHardBlock = (e: KeyboardEvent) => {
  // ⬇️ Only block when the typing box has focus
  if (document.activeElement !== textareaRef.current) return;

  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'v') {
    e.preventDefault();
    deny();
  }
  if (e.shiftKey && e.key === 'Insert') {
    e.preventDefault();
    deny();
  }
};
useEffect(() => {
  const down = (ev: KeyboardEvent) => { 
    handleKeyDownHardBlock(ev);   // now it only fires when textarea is focused
    handleKeyDown(ev);
  };
  const up   = (ev: KeyboardEvent) => handleKeyUp(ev);

  document.addEventListener('keydown', down);
  document.addEventListener('keyup', up);
  return () => {
    document.removeEventListener('keydown', down);
    document.removeEventListener('keyup', up);
  };
}, []);

//---------------------------verson 3--------------------------
// Show the popup every time and restore focus to the typing box
const showDeny = () => {
  // run after the event finishes so it consistently fires
  setTimeout(() => {
    window.alert('Paste is disabled — please type the passage.');
    textareaRef.current?.focus();
  }, 0);
};

// 1) Block keyboard paste (Ctrl/Cmd+V, Shift+Insert) ONLY when the textarea is focused
const handleKeyDownHardBlock = (e: KeyboardEvent) => {
  if (document.activeElement !== textareaRef.current) return;

  const isKbPaste =
    ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'v') ||
    (e.shiftKey && e.key === 'Insert');

  if (isKbPaste) {
    e.preventDefault();
    e.stopPropagation?.();
    showDeny();
  }
};

// 2) Block mouse/OS paste/drop on THIS textarea only
const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
  e.preventDefault();
  e.stopPropagation();
  showDeny();
};

const handleDrop = (e: React.DragEvent<HTMLTextAreaElement>) => {
  e.preventDefault();
  e.stopPropagation();
  showDeny();
};

useEffect(() => {
  const down = (ev: KeyboardEvent) => { handleKeyDownHardBlock(ev); handleKeyDown(ev); };
  const up   = (ev: KeyboardEvent) => handleKeyUp(ev);
  document.addEventListener('keydown', down);
  document.addEventListener('keyup', up);
  return () => {
    document.removeEventListener('keydown', down);
    document.removeEventListener('keyup', up);
  };
}, []);
//--------------------------------version 4 final -----------------------------------------
// prevent double popups from keydown + paste firing back-to-back
const lastBlockTs = useRef(0);

const denyOnce = (msg = 'Paste is disabled — please type the passage.') => {
  const now = Date.now();
  if (now - lastBlockTs.current < 300) return; // suppress duplicate within 300ms
  lastBlockTs.current = now;
  setTimeout(() => {
    window.alert(msg);
    textareaRef.current?.focus();
  }, 0);
};



// Keyboard shortcut block (only when textarea focused)
const handleKeyDownHardBlock = (e: KeyboardEvent) => {
  if (document.activeElement !== textareaRef.current) return;

  const isKbPaste =
    ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'v') ||
    (e.shiftKey && e.key === 'Insert');

  if (isKbPaste) {
    e.preventDefault();
    e.stopPropagation?.();
    denyOnce();
  }
};

// Mouse/OS paste/drop on THIS textarea only
const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
  e.preventDefault();
  e.stopPropagation();
  denyOnce();
};

const handleDrop = (e: React.DragEvent<HTMLTextAreaElement>) => {
  e.preventDefault();
  e.stopPropagation();
  denyOnce();
};
//---------------------------------------------------------

useEffect(() => {
  const down = (ev: KeyboardEvent) => { handleKeyDownHardBlock(ev); handleKeyDown(ev); };
  const up   = (ev: KeyboardEvent) => handleKeyUp(ev);
  document.addEventListener('keydown', down);
  document.addEventListener('keyup', up);
  return () => {
    document.removeEventListener('keydown', down);
    document.removeEventListener('keyup', up);
  };
}, []);
//----------------------------------------------------



//in tihe end in the button 

return (<textarea
  ref={textareaRef}
  value={inputValue}
  placeholder={placeholder}
  onChange={(e) => setInputValue(e.target.value)}
  onPaste={handlePaste}
  onDrop={handleDrop}
  /* ...styles... */
/>
)
