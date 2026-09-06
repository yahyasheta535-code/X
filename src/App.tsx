/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { CurrentUser, Student } from './types';
import { AppStorage } from './utils/storage';
import { ToastContainer, ToastMessage } from './components/Toast';
import { LoginView } from './components/auth/LoginView';
import { RegisterModal } from './components/auth/RegisterModal';
import { ForgotPasswordModal } from './components/auth/ForgotPasswordModal';
import { StudentPortal } from './components/student/StudentPortal';
import { TeacherDashboard } from './components/teacher/TeacherDashboard';
import { LogOut, User, ShieldCheck, Sparkles } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isForgotPassOpen, setIsForgotPassOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Initialize storage and load session
  useEffect(() => {
    AppStorage.init();
    const savedSession = localStorage.getItem('chem_current_user');
    if (savedSession) {
      try {
        setCurrentUser(JSON.parse(savedSession));
      } catch (e) {
        console.error('Failed to parse user session', e);
      }
    }
  }, []);

  const showToast = (type: 'success' | 'error' | 'warning' | 'info', title: string, message?: string) => {
    const newToast: ToastMessage = {
      id: 'toast_' + Date.now() + Math.random(),
      type,
      title,
      message,
    };
    setToasts((prev) => [...prev, newToast]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleLoginSuccess = (user: CurrentUser) => {
    setCurrentUser(user);
    localStorage.setItem('chem_current_user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('chem_current_user');
    showToast('info', 'تم تسجيل الخروج', 'نراك قريباً في منصة أستاذ الكيمياء');
  };

  const handleRegisterSuccess = (newStudent: Student) => {
    setIsRegisterOpen(false);
    showToast('success', 'تم إنشاء الحساب بنجاح!', 'يمكنك الآن تسجيل الدخول مباشرة');
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-zinc-950">
      {/* Toast notifications container */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} onCloseToast={removeToast} />

      {/* Main App Bar / Navigation Header */}
      <header className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800/80 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-zinc-950 font-black shadow-lg shadow-emerald-950/50 flex items-center justify-center text-xl">
              ⚗️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-black text-zinc-100 tracking-tight">منصة أستاذ الكيمياء</span>
                <span className="hidden sm:inline-block text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                  2025/2026
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 hidden sm:block">
                المنظومة التعليمية الرقمية الشاملة لطلاب الإعدادية والثانوية
              </p>
            </div>
          </div>

          {/* User Session Info / Controls */}
          {currentUser ? (
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <span className="text-xs font-bold text-zinc-200 block">
                  {currentUser.role === 'teacher' ? currentUser.teacherName : currentUser.studentData?.name}
                </span>
                <span className="text-[11px] text-emerald-400 font-semibold">
                  {currentUser.role === 'teacher' ? 'المعلم الإداري' : currentUser.studentData?.grade}
                </span>
              </div>

              <button
                id="btn-app-logout"
                type="button"
                onClick={handleLogout}
                className="px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-red-400 text-xs font-bold transition-all flex items-center gap-1.5"
                title="تسجيل الخروج"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">تسجيل الخروج</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                id="btn-nav-register"
                type="button"
                onClick={() => setIsRegisterOpen(true)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-950 transition-all flex items-center gap-1.5"
              >
                إنشاء حساب طالب
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content View */}
      <main className="flex-1">
        {!currentUser ? (
          <LoginView
            onLoginSuccess={handleLoginSuccess}
            onOpenRegister={() => setIsRegisterOpen(true)}
            onOpenForgotPassword={() => setIsForgotPassOpen(true)}
            onShowToast={showToast}
          />
        ) : currentUser.role === 'student' && currentUser.studentData ? (
          <StudentPortal
            student={currentUser.studentData}
            onShowToast={showToast}
          />
        ) : (
          <TeacherDashboard
            teacherName={currentUser.teacherName || 'أ. محمد عبد السلام'}
            onShowToast={showToast}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-zinc-950/90 py-6 px-4 text-center text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2025-2026 جميع الحقوق محفوظة — منصة أستاذ الكيمياء للمرحلتين الإعدادية والثانوية.</p>
          <div className="flex items-center gap-4 text-zinc-400 text-[11px]">
            <span>بث محاضرات عالي الجودة</span>
            <span>•</span>
            <span>تصحيح فوري للواجبات</span>
            <span>•</span>
            <span>ربط وتواصل مباشر عبر WhatsApp</span>
          </div>
        </div>
      </footer>

      {/* Register Modal */}
      <RegisterModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onSuccess={handleRegisterSuccess}
        onShowToast={showToast}
      />

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={isForgotPassOpen}
        onClose={() => setIsForgotPassOpen(false)}
        onShowToast={showToast}
      />
    </div>
  );
}
