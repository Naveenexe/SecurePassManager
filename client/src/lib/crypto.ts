export function generatePassword(options: {
  length: number;
  includeUppercase: boolean;
  includeLowercase: boolean;
  includeNumbers: boolean;
  includeSymbols: boolean;
}): string {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';

  let charset = '';
  let password = '';

  if (options.includeUppercase) charset += uppercase;
  if (options.includeLowercase) charset += lowercase;
  if (options.includeNumbers) charset += numbers;
  if (options.includeSymbols) charset += symbols;

  if (charset.length === 0) {
    charset = lowercase; // fallback
  }

  // Ensure at least one character from each selected type
  if (options.includeUppercase) {
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
  }
  if (options.includeLowercase) {
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
  }
  if (options.includeNumbers) {
    password += numbers[Math.floor(Math.random() * numbers.length)];
  }
  if (options.includeSymbols) {
    password += symbols[Math.floor(Math.random() * symbols.length)];
  }

  // Fill the rest randomly
  for (let i = password.length; i < options.length; i++) {
    password += charset[Math.floor(Math.random() * charset.length)];
  }

  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

export function calculatePasswordStrength(password: string): {
  score: number;
  label: string;
  color: string;
} {
  let score = 0;
  
  // Length
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  
  // Character types
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  
  const finalScore = Math.min(4, score);
  
  const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
  const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#16a34a'];
  
  return {
    score: finalScore,
    label: labels[finalScore] || 'Very Weak',
    color: colors[finalScore] || '#ef4444',
  };
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const result = document.execCommand('copy');
    document.body.removeChild(textArea);
    return result;
  }
}
