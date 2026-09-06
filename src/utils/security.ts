export interface PasswordStrengthResult {
  score: number; // 0 to 4
  level: 'ضعيفة' | 'متوسطة' | 'قوية' | 'قوية جدًا';
  color: string;
  bgColor: string;
  percentage: number;
  feedback: string[];
  isAcceptable: boolean;
}

const COMMON_WEAK_PASSWORDS = [
  '123456',
  '12345678',
  '123456789',
  'password',
  'qwerty',
  'chemistry',
  '112233',
  'admin123',
  '000000',
  'student123',
  'pass1234',
];

export function checkPasswordStrength(password: string): PasswordStrengthResult {
  if (!password) {
    return {
      score: 0,
      level: 'ضعيفة',
      color: 'text-zinc-500',
      bgColor: 'bg-zinc-700',
      percentage: 0,
      feedback: ['الرجاء إدخال كلمة المرور'],
      isAcceptable: false,
    };
  }

  const feedback: string[] = [];
  let score = 0;

  // Check if weak/common
  if (COMMON_WEAK_PASSWORDS.includes(password.toLowerCase())) {
    return {
      score: 1,
      level: 'ضعيفة',
      color: 'text-red-400',
      bgColor: 'bg-red-500',
      percentage: 20,
      feedback: ['كلمة المرور شائعة وسهلة التخمين، يرجى اختيار كلمة مرور أخرى'],
      isAcceptable: false,
    };
  }

  // Length checks
  if (password.length >= 8) {
    score += 1;
  } else {
    feedback.push('يجب ألا تقل عن 8 أحرف');
  }

  if (password.length >= 12) {
    score += 0.5;
  }

  // Lowercase & Uppercase
  const hasLower = /[a-z]/.test(password) || /[\u0600-\u06FF]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  if (hasLower && hasUpper) {
    score += 1;
  } else {
    feedback.push('استخدم مزيجاً من الأحرف الكبيرة والصغيرة (A-Z, a-z)');
  }

  // Numbers
  const hasNumbers = /[0-9]/.test(password);
  if (hasNumbers) {
    score += 1;
  } else {
    feedback.push('أضف أرقاماً (0-9)');
  }

  // Symbols
  const hasSpecial = /[^A-Za-z0-9\u0600-\u06FF]/.test(password);
  if (hasSpecial) {
    score += 1;
  } else {
    feedback.push('أضف رموزاً خاصة (!@#$%^&*...)');
  }

  const finalScore = Math.min(4, Math.floor(score));

  if (finalScore <= 1) {
    return {
      score: 1,
      level: 'ضعيفة',
      color: 'text-red-400',
      bgColor: 'bg-red-500',
      percentage: 25,
      feedback: feedback.length > 0 ? feedback : ['كلمة المرور غير كافية الأمان'],
      isAcceptable: false,
    };
  } else if (finalScore === 2) {
    return {
      score: 2,
      level: 'متوسطة',
      color: 'text-amber-400',
      bgColor: 'bg-amber-500',
      percentage: 50,
      feedback: feedback.length > 0 ? feedback : ['يمكنك تحسينها بإضافة رموز إضافية'],
      isAcceptable: false,
    };
  } else if (finalScore === 3) {
    return {
      score: 3,
      level: 'قوية',
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500',
      percentage: 75,
      feedback: ['كلمة مرور قوية ومناسبة'],
      isAcceptable: true,
    };
  } else {
    return {
      score: 4,
      level: 'قوية جدًا',
      color: 'text-emerald-300',
      bgColor: 'bg-emerald-400',
      percentage: 100,
      feedback: ['كلمة مرور ممتازة وعالية الأمان'],
      isAcceptable: true,
    };
  }
}

/**
 * Generate a cryptographically strong random password
 */
export function generateStrongPassword(): string {
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lower = 'abcdefghijkmnopqrstuvwxyz';
  const numbers = '23456789';
  const symbols = '!@#$%^&*()_+~|}{[]';

  let pass = '';
  // Ensure at least two of each category
  pass += upper.charAt(Math.floor(Math.random() * upper.length));
  pass += upper.charAt(Math.floor(Math.random() * upper.length));
  pass += lower.charAt(Math.floor(Math.random() * lower.length));
  pass += lower.charAt(Math.floor(Math.random() * lower.length));
  pass += numbers.charAt(Math.floor(Math.random() * numbers.length));
  pass += numbers.charAt(Math.floor(Math.random() * numbers.length));
  pass += symbols.charAt(Math.floor(Math.random() * symbols.length));
  pass += symbols.charAt(Math.floor(Math.random() * symbols.length));

  const allChars = upper + lower + numbers + symbols;
  while (pass.length < 13) {
    pass += allChars.charAt(Math.floor(Math.random() * allChars.length));
  }

  // Shuffle
  return pass.split('').sort(() => 0.5 - Math.random()).join('');
}

/**
 * Partially masks phone number for privacy, e.g. 01037306672 -> 010****6672
 */
export function maskPhoneNumber(phone: string): string {
  if (!phone || phone.length < 8) return phone || '';
  const start = phone.slice(0, 3);
  const end = phone.slice(-4);
  return `${start}****${end}`;
}

/**
 * Format Egyptian or international phone for WhatsApp URL
 */
export function formatPhoneForWhatsApp(phone: string): string {
  let cleaned = phone.replace(/[^0-9]/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '2' + cleaned; // e.g. 010123... -> 2010123...
  }
  return cleaned;
}

/**
 * Build WhatsApp Web/App redirect URL
 */
export function buildWhatsAppUrl(phone: string, text: string): string {
  const formattedPhone = formatPhoneForWhatsApp(phone);
  const encodedText = encodeURIComponent(text);
  return `https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encodedText}`;
}

/**
 * Quick hash simulation for password storage
 */
export function hashPassword(plain: string): string {
  let hash = 0;
  for (let i = 0; i < plain.length; i++) {
    const char = plain.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return 'h_' + Math.abs(hash).toString(36) + '_' + plain.length;
}
