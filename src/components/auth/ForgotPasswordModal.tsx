import React, { useState } from 'react';
import { X, KeyRound, MessageCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { buildWhatsAppUrl } from '../../utils/security';
import { AppStorage } from '../../utils/storage';
import { PasswordResetRequest } from '../../types';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast?: (type: 'success' | 'error' | 'warning' | 'info', title: string, message?: string) => void;
}

const SUPPORT_WHATSAPP_NUMBER = '01037306672';

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  onClose,
  onShowToast,
}) => {
  const showToast = onShowToast || (() => {});
  const [username, setUsername] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [studentPhone, setStudentPhone] = useState('');
  const [parentPhone, setParentPhone] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim() || !nationalId.trim() || !studentPhone.trim() || !parentPhone.trim()) {
      showToast('error', 'بيانات ناقصة', 'يرجى ملء جميع الخانات المطلوبة لمطابقة الحساب');
      return;
    }

    // 1. Prepare WhatsApp formatted message exactly as specified in the prompt
    const messageText = `طلب تغيير كلمة المرور

اسم المستخدم: ${username.trim()}
الرقم القومي: ${nationalId.trim()}
رقم هاتف الطالب: ${studentPhone.trim()}
رقم هاتف ولي الأمر: ${parentPhone.trim()}

أطلب تغيير كلمة المرور الخاصة بحسابي.`;

    // 2. Also register this request in the platform database for teacher administration
    const newRequest: PasswordResetRequest = {
      id: 'req_' + Date.now(),
      username: username.trim(),
      nationalId: nationalId.trim(),
      studentPhone: studentPhone.trim(),
      parentPhone: parentPhone.trim(),
      requestedAt: new Date().toISOString(),
      status: 'pending',
    };
    AppStorage.addResetRequest(newRequest);

    // 3. Open WhatsApp support link
    const whatsappUrl = buildWhatsAppUrl(SUPPORT_WHATSAPP_NUMBER, messageText);
    window.open(whatsappUrl, '_blank');

    showToast(
      'success',
      'تم إرسال الطلب وتجهيز WhatsApp',
      'تم تسجيل طلبك بالمنصة وفتح محادثة الدعم الفني لمراجعة بياناتك'
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div
        className="relative w-full max-w-lg my-8 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-6 sm:p-8 text-right animate-in zoom-in-95 duration-200"
        id="forgot-password-modal-box"
      >
        <button
          id="btn-close-forgot"
          onClick={onClose}
          className="absolute top-5 left-5 text-zinc-400 hover:text-zinc-200 transition-colors p-1 rounded-lg hover:bg-zinc-800"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4 border-b border-zinc-800/80 pb-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
            <KeyRound className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-zinc-100">استرجاع وتغيير كلمة المرور</h2>
            <p className="text-xs text-zinc-400 mt-0.5">أدخل بيانات التحقق للتواصل مع المدرس عبر واتساب</p>
          </div>
        </div>

        {/* Guidance info */}
        <div className="mb-5 p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-800 text-xs text-zinc-300 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            سيتم توجيهك إلى رقم دعم المنصة (<strong className="text-emerald-400" dir="ltr">{SUPPORT_WHATSAPP_NUMBER}</strong>) برسالة مجهزة بالبيانات التي تدخلها ليقوم المدرس بمطابقتها وتعيين كلمة مرور جديدة لك.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 1. Username */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              1. اسم المستخدم (Username) <span className="text-amber-400">*</span>
            </label>
            <input
              id="forgot-input-username"
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="اسم المستخدم المسجل في المنصة"
              className="w-full px-4 py-2.5 rounded-xl bg-zinc-800/80 border border-zinc-700 text-zinc-100 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all placeholder:text-zinc-500"
              dir="ltr"
            />
          </div>

          {/* 2. National ID */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              2. الرقم القومي <span className="text-amber-400">*</span>
            </label>
            <input
              id="forgot-input-national-id"
              type="text"
              maxLength={14}
              required
              value={nationalId}
              onChange={(e) => setNationalId(e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="14 رقماً مسجلاً في الحساب"
              className="w-full px-4 py-2.5 rounded-xl bg-zinc-800/80 border border-zinc-700 text-zinc-100 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all placeholder:text-zinc-500"
              dir="ltr"
            />
          </div>

          {/* 3. Student Phone */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              3. رقم هاتف الطالب <span className="text-amber-400">*</span>
            </label>
            <input
              id="forgot-input-student-phone"
              type="tel"
              required
              value={studentPhone}
              onChange={(e) => setStudentPhone(e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="010XXXXXXXX"
              className="w-full px-4 py-2.5 rounded-xl bg-zinc-800/80 border border-zinc-700 text-zinc-100 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all placeholder:text-zinc-500"
              dir="ltr"
            />
          </div>

          {/* 4. Parent Phone */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              4. رقم هاتف ولي الأمر <span className="text-amber-400">*</span>
            </label>
            <input
              id="forgot-input-parent-phone"
              type="tel"
              required
              value={parentPhone}
              onChange={(e) => setParentPhone(e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="010XXXXXXXX"
              className="w-full px-4 py-2.5 rounded-xl bg-zinc-800/80 border border-zinc-700 text-zinc-100 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all placeholder:text-zinc-500"
              dir="ltr"
            />
          </div>

          {/* Action Button */}
          <div className="pt-4 border-t border-zinc-800 flex items-center justify-end gap-3">
            <button
              type="button"
              id="btn-cancel-forgot"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-zinc-700 bg-zinc-800/60 hover:bg-zinc-800 text-zinc-300 text-sm font-medium transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              id="btn-submit-forgot"
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold shadow-lg shadow-emerald-950/40 transition-all flex items-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              إرسال طلب تغيير كلمة المرور
              <ArrowLeft className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
