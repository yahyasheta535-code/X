import React, { useState } from 'react';
import { LogIn, Eye, EyeOff, ShieldAlert, Sparkles, User, UserPlus, KeyRound } from 'lucide-react';
import { CurrentUser } from '../../types';
import { AppStorage } from '../../utils/storage';
import { hashPassword } from '../../utils/security';

interface LoginViewProps {
  onLoginSuccess: (user: CurrentUser) => void;
  onOpenRegister: () => void;
  onOpenForgotPassword: () => void;
  onShowToast?: (type: 'success' | 'error' | 'warning' | 'info', title: string, message?: string) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({
  onLoginSuccess,
  onOpenRegister,
  onOpenForgotPassword,
  onShowToast,
}) => {
  const showToast = onShowToast || (() => {});
  const [activeTab, setActiveTab] = useState<'student' | 'teacher'>('student');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      const trimmedUser = username.trim();

      if (activeTab === 'teacher') {
        // Teacher admin login
        if (
          (trimmedUser.toLowerCase() === 'admin' || trimmedUser.toLowerCase() === 'teacher') &&
          (password === 'admin123' || password === 'ChemTeacher@2025!' || password === '123456')
        ) {
          onLoginSuccess({
            role: 'teacher',
            teacherName: 'أ. محمد عبد السلام (أستاذ الكيمياء)',
          });
          showToast('success', 'مرحباً بك يا أستاذ', 'تم تسجيل الدخول إلى لوحة إدارة المنصة');
        } else {
          showToast('error', 'فشل الدخول كمعلم', 'اسم المستخدم أو كلمة المرور غير صحيحة للحساب الإداري');
        }
      } else {
        // Student login
        const student = AppStorage.findStudentByUsername(trimmedUser);
        if (!student) {
          showToast('error', 'الحساب غير موجود', 'اسم المستخدم غير مسجل، يمكنك إنشاء حساب جديد أو التحقق من الاسم');
        } else {
          // verify password
          const hashedInput = hashPassword(password);
          const isMatch = student.passwordHash === hashedInput || student.plainPasswordForAdminHistory === password;

          if (isMatch) {
            onLoginSuccess({
              role: 'student',
              studentData: student,
            });
            showToast('success', 'أهلاً بك', `تم تسجيل الدخول بنجاح: ${student.name}`);
          } else {
            showToast('error', 'كلمة المرور غير صحيحة', 'تأكد من كتابة كلمة المرور الصحيحة أو اضغط "نسيت كلمة المرور؟"');
          }
        }
      }
      setLoading(false);
    }, 400);
  };

  // Quick helper to fill demo credentials
  const fillDemoStudent = (demoUsername: string) => {
    const std = AppStorage.findStudentByUsername(demoUsername);
    if (std) {
      setUsername(std.username);
      setPassword(std.plainPasswordForAdminHistory || 'Chem@2025!Pass');
    }
  };

  const fillDemoTeacher = () => {
    setActiveTab('teacher');
    setUsername('admin');
    setPassword('ChemTeacher@2025!');
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
      <div
        className="w-full max-w-md bg-zinc-900 border border-zinc-800/90 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden"
        id="login-card-container"
      >
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Brand header */}
        <div className="text-center mb-6 relative">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-zinc-950 font-black shadow-lg shadow-emerald-950/50 mb-3">
            <span className="text-2xl font-mono">⚗️</span>
          </div>
          <h1 className="text-2xl font-black text-zinc-100 tracking-tight">منصة أستاذ الكيمياء</h1>
          <p className="text-xs text-zinc-400 mt-1">بوابتك للتميز والتفوق في الكيمياء للمرحلتين الإعدادية والثانوية</p>
        </div>

        {/* Tab switch between Student and Teacher */}
        <div className="flex rounded-xl bg-zinc-950/80 p-1 mb-6 border border-zinc-800">
          <button
            type="button"
            id="tab-login-student"
            onClick={() => {
              setActiveTab('student');
              setUsername('');
              setPassword('');
            }}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'student'
                ? 'bg-zinc-800 text-emerald-400 shadow-md border border-zinc-700/60'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            دخول الطالب
          </button>
          <button
            type="button"
            id="tab-login-teacher"
            onClick={() => {
              setActiveTab('teacher');
              setUsername('admin');
              setPassword('ChemTeacher@2025!');
            }}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'teacher'
                ? 'bg-zinc-800 text-amber-400 shadow-md border border-zinc-700/60'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            لوحة المدرس (الإدارة)
          </button>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5 text-right">
              اسم المستخدم (Username)
            </label>
            <input
              id="login-input-username"
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={activeTab === 'student' ? 'أدخل اسم المستخدم الخاص بك' : 'admin'}
              className="w-full px-4 py-2.5 rounded-xl bg-zinc-800/80 border border-zinc-700 text-zinc-100 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-zinc-500 text-right"
              dir="ltr"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-zinc-300">
                كلمة المرور
              </label>
              {activeTab === 'student' && (
                <button
                  type="button"
                  id="btn-forgot-password"
                  onClick={onOpenForgotPassword}
                  className="text-xs text-amber-400 hover:text-amber-300 font-medium transition-colors"
                >
                  نسيت كلمة المرور؟
                </button>
              )}
            </div>
            <div className="relative">
              <input
                id="login-input-password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-4 py-2.5 pl-11 rounded-xl bg-zinc-800/80 border border-zinc-700 text-zinc-100 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-zinc-500 text-right"
                dir="ltr"
              />
              <button
                type="button"
                id="toggle-login-password"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3 top-2.5 text-zinc-400 hover:text-zinc-200 transition-colors p-1"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            id="btn-submit-login"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-950/50 transition-all flex items-center justify-center gap-2 mt-2"
          >
            <LogIn className="w-4 h-4" />
            {loading ? 'جاري التحقق...' : 'تسجيل الدخول'}
          </button>
        </form>

        {/* Register CTA */}
        {activeTab === 'student' && (
          <div className="mt-6 pt-5 border-t border-zinc-800/80 text-center">
            <p className="text-xs text-zinc-400 mb-2.5">طالب جديد وتريد الانضمام للمنصة؟</p>
            <button
              id="btn-open-register"
              type="button"
              onClick={onOpenRegister}
              className="w-full py-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-xs font-bold transition-all flex items-center justify-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              إنشاء حساب طالب جديد
            </button>
          </div>
        )}

        {/* Quick Demo Credentials for Convenience */}
        <div className="mt-6 pt-4 border-t border-zinc-800/50">
          <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>تسجيل سريع للتجربة بضغطة واحدة:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              id="quick-demo-ahmed"
              onClick={() => {
                setActiveTab('student');
                fillDemoStudent('ahmed_chem');
              }}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-zinc-800/80 hover:bg-zinc-800 text-zinc-300 border border-zinc-700/60"
            >
              طالب: أحمد (3ث)
            </button>
            <button
              type="button"
              id="quick-demo-mariam"
              onClick={() => {
                setActiveTab('student');
                fillDemoStudent('mariam_k');
              }}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-zinc-800/80 hover:bg-zinc-800 text-zinc-300 border border-zinc-700/60"
            >
              طالبة: مريم (3ث)
            </button>
            <button
              type="button"
              id="quick-demo-youssef"
              onClick={() => {
                setActiveTab('student');
                fillDemoStudent('youssef_1st');
              }}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-zinc-800/80 hover:bg-zinc-800 text-zinc-300 border border-zinc-700/60"
            >
              طالب: يوسف (1ث)
            </button>
            <button
              type="button"
              id="quick-demo-teacher"
              onClick={fillDemoTeacher}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 font-medium"
            >
              حساب المعلم (Admin)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
