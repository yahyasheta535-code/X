import React, { useState } from 'react';
import { X, UserPlus, Eye, EyeOff, ShieldCheck, AlertCircle, PhoneCall, Check, Sparkles } from 'lucide-react';
import { Grade, GRADES_LIST, Student } from '../../types';
import { checkPasswordStrength, hashPassword } from '../../utils/security';
import { AppStorage } from '../../utils/storage';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newStudent: Student) => void;
  onShowToast?: (type: 'success' | 'error' | 'warning' | 'info', title: string, message?: string) => void;
}

export const RegisterModal: React.FC<RegisterModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onShowToast,
}) => {
  const showToast = onShowToast || (() => {});
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [nationalId, setNationalId] = useState('');
  const [studentPhone, setStudentPhone] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [grade, setGrade] = useState<Grade>('الصف الثالث الثانوي');

  const [usernameTouched, setUsernameTouched] = useState(false);

  if (!isOpen) return null;

  // Real-time username availability check
  const trimmedUsername = username.trim();
  const isUsernameTaken = trimmedUsername ? AppStorage.isUsernameTaken(trimmedUsername) : false;
  const isUsernameValid = trimmedUsername.length >= 3 && !isUsernameTaken;

  // Real-time password strength
  const strength = checkPasswordStrength(password);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!trimmedUsername) {
      showToast('error', 'اسم المستخدم مطلوب', 'يرجى إدخال اسم مستخدم فريد للحساب');
      return;
    }

    if (isUsernameTaken) {
      showToast('error', 'اسم المستخدم غير متاح', 'اسم المستخدم مستخدم بالفعل، من فضلك اختر اسم مستخدم آخر.');
      return;
    }

    if (!name.trim()) {
      showToast('error', 'اسم الطالب مطلوب', 'يرجى كتابة الاسم ثلاثياً أو رباعياً');
      return;
    }

    if (!strength.isAcceptable) {
      showToast('error', 'كلمة المرور غير قوية', 'يجب أن تكون كلمة المرور بمستوى أمان "قوية" أو "قوية جدًا" لإتمام التسجيل.');
      return;
    }

    if (!nationalId.trim() || nationalId.trim().length !== 14) {
      showToast('error', 'الرقم القومي غير صحيح', 'يجب أن يتكون الرقم القومي من 14 رقماً صحيحاً');
      return;
    }

    if (!studentPhone.trim() || studentPhone.trim().length < 10) {
      showToast('error', 'رقم هاتف الطالب غير صحيح', 'يرجى التأكد من كتابة رقم هاتف الطالب بشكل صحيح');
      return;
    }

    if (!parentPhone.trim() || parentPhone.trim().length < 10) {
      showToast('error', 'رقم هاتف ولي الأمر غير صحيح', 'يرجى التأكد من كتابة رقم هاتف ولي الأمر بشكل صحيح');
      return;
    }

    const newStudent: Student = {
      id: 'std_' + Date.now(),
      username: trimmedUsername,
      name: name.trim(),
      passwordHash: hashPassword(password),
      plainPasswordForAdminHistory: password,
      nationalId: nationalId.trim(),
      studentPhone: studentPhone.trim(),
      parentPhone: parentPhone.trim(),
      grade,
      createdAt: new Date().toISOString(),
    };

    AppStorage.addStudent(newStudent);
    showToast('success', 'تم إنشاء الحساب بنجاح', `أهلاً بك يا ${newStudent.name} في منصة أستاذ الكيمياء`);
    onSuccess(newStudent);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div
        className="relative w-full max-w-xl my-8 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-6 sm:p-8 text-right animate-in zoom-in-95 duration-200"
        id="register-modal-box"
      >
        <button
          id="btn-close-register"
          onClick={onClose}
          className="absolute top-5 left-5 text-zinc-400 hover:text-zinc-200 transition-colors p-1 rounded-lg hover:bg-zinc-800"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5 border-b border-zinc-800/80 pb-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <UserPlus className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-zinc-100">إنشاء حساب طالب جديد</h2>
            <p className="text-xs text-zinc-400 mt-0.5">انضم لمنصة أستاذ الكيمياء وتابع دروسك وواجباتك أولاً بأول</p>
          </div>
        </div>

        {/* Mandatory WhatsApp Notice Box */}
        <div
          id="notice-whatsapp-phones"
          className="mb-6 p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-200 text-xs flex items-start gap-3"
        >
          <PhoneCall className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="font-bold text-emerald-300">تنويه هام:</strong> يُرجى التأكد من أن رقم هاتفك ورقم هاتف ولي الأمر يعملان على <strong className="text-emerald-300">WhatsApp</strong>، لأنهما قد يُستخدمان للتواصل مع الدعم واسترجاع الحساب ومتابعة الحضور والدرجات.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Student Name */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              اسم الطالب رباعي <span className="text-emerald-400">*</span>
            </label>
            <input
              id="reg-input-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثال: أحمد محمد علي حسن"
              className="w-full px-4 py-2.5 rounded-xl bg-zinc-800/80 border border-zinc-700 text-zinc-100 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-zinc-500"
            />
          </div>

          {/* Username with Real-time Check */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-zinc-300">
                اسم المستخدم (Username) <span className="text-emerald-400">*</span>
              </label>
              {usernameTouched && trimmedUsername && (
                <span className={`text-[11px] font-medium ${isUsernameTaken ? 'text-red-400' : 'text-emerald-400'}`}>
                  {isUsernameTaken ? 'غير متاح' : 'اسم المستخدم متاح'}
                </span>
              )}
            </div>
            <div className="relative">
              <input
                id="reg-input-username"
                type="text"
                required
                value={username}
                onBlur={() => setUsernameTouched(true)}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setUsernameTouched(true);
                }}
                placeholder="اسم مستخدم فريد بالإنجليزية (مثال: ahmed_chem25)"
                className={`w-full px-4 py-2.5 rounded-xl bg-zinc-800/80 border text-zinc-100 text-sm focus:outline-none transition-all placeholder:text-zinc-500 ${
                  usernameTouched && isUsernameTaken
                    ? 'border-red-500/80 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                    : usernameTouched && isUsernameValid
                    ? 'border-emerald-500/80 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500'
                    : 'border-zinc-700 focus:border-emerald-500'
                }`}
                dir="ltr"
              />
              {usernameTouched && isUsernameValid && (
                <Check className="w-4 h-4 text-emerald-400 absolute left-3 top-3" />
              )}
            </div>
            {usernameTouched && isUsernameTaken && (
              <p id="username-taken-warning" className="text-xs text-red-400 mt-1.5 flex items-center gap-1.5 font-medium">
                <AlertCircle className="w-4 h-4 shrink-0" />
                اسم المستخدم مستخدم بالفعل، من فضلك اختر اسم مستخدم آخر.
              </p>
            )}
            <p className="text-[11px] text-zinc-400 mt-1">يجب أن يكون فريداً ولا يمكن تكراره على مستوى المنصة بالكامل.</p>
          </div>

          {/* Password with Strength Meter */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              كلمة المرور <span className="text-emerald-400">*</span>
            </label>
            <div className="relative">
              <input
                id="reg-input-password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="أدخل كلمة مرور قوية"
                className="w-full px-4 py-2.5 pl-11 rounded-xl bg-zinc-800/80 border border-zinc-700 text-zinc-100 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-zinc-500"
                dir="ltr"
              />
              <button
                type="button"
                id="toggle-reg-password"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3 top-2.5 text-zinc-400 hover:text-zinc-200 transition-colors p-1"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Password Strength Meter */}
            {password && (
              <div id="password-strength-indicator" className="mt-2.5 p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/80">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-zinc-400 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-zinc-400" />
                    مستوى قوة كلمة المرور:
                  </span>
                  <span className={`text-xs font-bold ${strength.color}`}>
                    {strength.level}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden mb-2">
                  <div
                    className={`h-full transition-all duration-300 rounded-full ${strength.bgColor}`}
                    style={{ width: `${strength.percentage}%` }}
                  />
                </div>

                {/* Feedback tips */}
                <ul className="text-[11px] text-zinc-400 space-y-0.5">
                  {strength.feedback.map((msg, idx) => (
                    <li key={idx} className="flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-zinc-500" />
                      {msg}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* National ID */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              الرقم القومي (14 رقماً) <span className="text-emerald-400">*</span>
            </label>
            <input
              id="reg-input-national-id"
              type="text"
              maxLength={14}
              required
              value={nationalId}
              onChange={(e) => setNationalId(e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="الرقم القومي المكون من 14 رقماً في شهادة الميلاد أو البطاقة"
              className="w-full px-4 py-2.5 rounded-xl bg-zinc-800/80 border border-zinc-700 text-zinc-100 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-zinc-500"
              dir="ltr"
            />
          </div>

          {/* Student Phone & Parent Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                رقم هاتف الطالب (واتساب) <span className="text-emerald-400">*</span>
              </label>
              <input
                id="reg-input-student-phone"
                type="tel"
                required
                value={studentPhone}
                onChange={(e) => setStudentPhone(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="010XXXXXXXX"
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-800/80 border border-zinc-700 text-zinc-100 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-zinc-500"
                dir="ltr"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                رقم هاتف ولي الأمر (واتساب) <span className="text-emerald-400">*</span>
              </label>
              <input
                id="reg-input-parent-phone"
                type="tel"
                required
                value={parentPhone}
                onChange={(e) => setParentPhone(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="010XXXXXXXX"
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-800/80 border border-zinc-700 text-zinc-100 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-zinc-500"
                dir="ltr"
              />
            </div>
          </div>

          {/* Grade Selection */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              الصف الدراسي <span className="text-emerald-400">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {GRADES_LIST.map((g) => (
                <button
                  type="button"
                  key={g}
                  id={`btn-grade-${g}`}
                  onClick={() => setGrade(g)}
                  className={`p-3 rounded-xl border text-xs font-semibold text-right transition-all flex items-center justify-between ${
                    grade === g
                      ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300 shadow-sm shadow-emerald-950'
                      : 'bg-zinc-800/50 border-zinc-700/80 text-zinc-300 hover:bg-zinc-800'
                  }`}
                >
                  <span>{g}</span>
                  {grade === g && <Check className="w-4 h-4 text-emerald-400" />}
                </button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t border-zinc-800 flex items-center justify-end gap-3">
            <button
              type="button"
              id="btn-cancel-register"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-zinc-700 bg-zinc-800/60 hover:bg-zinc-800 text-zinc-300 text-sm font-medium transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              id="btn-submit-register"
              disabled={isUsernameTaken || (password.length > 0 && !strength.isAcceptable)}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-800 disabled:text-zinc-500 disabled:cursor-not-allowed text-white text-sm font-bold shadow-lg shadow-emerald-900/30 transition-all flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              إنشاء الحساب
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
