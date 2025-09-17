import { useState, useEffect } from "react";

export function useMasterPassword() {
  const [isLocked, setIsLocked] = useState(true);
  const [masterPassword, setMasterPassword] = useState<string | null>(null);
  const [hasSetup, setHasSetup] = useState(false);

  useEffect(() => {
    // Check if master password is already set up
    const storedHash = localStorage.getItem('masterPasswordHash');
    setHasSetup(!!storedHash);
    
    // Check if user is currently unlocked (session storage)
    const sessionUnlocked = sessionStorage.getItem('isUnlocked');
    if (sessionUnlocked === 'true' && storedHash) {
      setIsLocked(false);
    }
  }, []);

  const unlock = (password: string) => {
    setMasterPassword(password);
    setIsLocked(false);
    sessionStorage.setItem('isUnlocked', 'true');
  };

  const lock = () => {
    setMasterPassword(null);
    setIsLocked(true);
    sessionStorage.removeItem('isUnlocked');
  };

  const setup = (password: string) => {
    setMasterPassword(password);
    setHasSetup(true);
    setIsLocked(false);
    sessionStorage.setItem('isUnlocked', 'true');
  };

  return {
    isLocked,
    masterPassword,
    hasSetup,
    unlock,
    lock,
    setup,
  };
}
