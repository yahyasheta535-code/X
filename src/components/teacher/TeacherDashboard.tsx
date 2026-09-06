import React, { useState, useEffect, useMemo } from 'react';
import {
  Grade,
  GRADES_LIST,
  Student,
  Lecture,
  Homework,
  WatchRecord,
  HomeworkSubmission,
  PasswordResetRequest,
  PasswordChangeLog,
  ParentCommunicationLog,
  Question,
} from '../../types';
import { AppStorage } from '../../utils/storage';
import {
  maskPhoneNumber,
  buildWhatsAppUrl,
  generateStrongPassword,
  checkPasswordStrength,
  hashPassword,
} from '../../utils/security';
import {
  Video,
  BookOpen,
  MessageCircle,
  KeyRound,
  Users,
  Search,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Copy,
  Trash2,
  Edit,
  Upload,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Check,
  X,
  FileCheck,
  Share2,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { ConfirmModal } from '../ConfirmModal';

interface TeacherDashboardProps {
  teacherName: string;
  onShowToast?: (type: 'success' | 'error' | 'warning' | 'info', title: string, message?: string) => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ teacherName, onShowToast: onShowToastProp }) => {
  const onShowToast = onShowToastProp || (() => {});
  const [activeSection, setActiveSection] = useState<
    'lectures_hw' | 'watch_whatsapp' | 'grades' | 'passwords' | 'students'
  >('watch_whatsapp');

  // Shared Data
  const [students, setStudents] = useState<Student[]>([]);
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [homeworks, setHomeworks] = useState<Homework[]>([]);
  const [watchRecords, setWatchRecords] = useState<WatchRecord[]>([]);
  const [submissions, setSubmissions] = useState<HomeworkSubmission[]>([]);
  const [resetRequests, setResetRequests] = useState<PasswordResetRequest[]>([]);
  const [passwordLogs, setPasswordLogs] = useState<PasswordChangeLog[]>([]);
  const [parentLogs, setParentLogs] = useState<ParentCommunicationLog[]>([]);

  // ---------------------------------------------------------------------------
  // SECTION 13: Watch & WhatsApp states
  // ---------------------------------------------------------------------------
  const [watchGradeFilter, setWatchGradeFilter] = useState<Grade>('الصف الثالث الثانوي');
  const [watchLectureId, setWatchLectureId] = useState<string>('');
  const [watchSearchQuery, setWatchSearchQuery] = useState('');
  const [watchStatusFilter, setWatchStatusFilter] = useState<'all' | 'watched' | 'not_watched'>('all');

  // WhatsApp confirm modal state
  const [whatsAppModalOpen, setWhatsAppModalOpen] = useState(false);
  const [pendingWhatsAppTarget, setPendingWhatsAppTarget] = useState<{
    student: Student;
    lectureTitle: string;
    isWatched: boolean;
    watchPct: number;
    phone: string;
    messageText: string;
  } | null>(null);

  // ---------------------------------------------------------------------------
  // SECTION 14 & 15: Lectures & Homework Creation states
  // ---------------------------------------------------------------------------
  const [lectureGradeFilter, setLectureGradeFilter] = useState<Grade>('الصف الثالث الثانوي');
  const [isNewLectureModalOpen, setIsNewLectureModalOpen] = useState(false);
  const [newLectureForm, setNewLectureForm] = useState({
    grade: 'الصف الثالث الثانوي' as Grade,
    lectureNumber: 13,
    title: '',
    description: '',
    videoFileName: '',
    videoFileSize: '4.2 GB',
    durationMinutes: 45,
  });

  // Upload Progress Simulator
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadSpeed, setUploadSpeed] = useState('14.2 MB/s');
  const [uploadUploadedGB, setUploadUploadedGB] = useState('0.0');
  const [uploadTotalGB, setUploadTotalGB] = useState('4.2');
  const [uploadRemainingTime, setUploadRemainingTime] = useState('3 دقائق');
  const [uploadIntervalId, setUploadIntervalId] = useState<any>(null);

  // Homework Question Builder State
  const [isHwBuilderOpen, setIsHwBuilderOpen] = useState(false);
  const [builderLecture, setBuilderLecture] = useState<Lecture | null>(null);
  const [builderHwTitle, setBuilderHwTitle] = useState('');
  const [builderQuestions, setBuilderQuestions] = useState<Question[]>([]);

  // Single Question Form
  const [currentQuestionText, setCurrentQuestionText] = useState('');
  const [currentOptions, setCurrentOptions] = useState<[string, string, string, string]>([
    'الاختيار الأول',
    'الاختيار الثاني',
    'الاختيار الثالث',
    'الاختيار الرابع',
  ]);
  const [currentCorrectIdx, setCurrentCorrectIdx] = useState<number>(0);
  const [currentExplanation, setCurrentExplanation] = useState('');

  // ---------------------------------------------------------------------------
  // SECTION 18: Grades state
  // ---------------------------------------------------------------------------
  const [gradesGradeFilter, setGradesGradeFilter] = useState<Grade>('الصف الثالث الثانوي');
  const [gradesLectureId, setGradesLectureId] = useState<string>('all');
  const [gradesSearchQuery, setGradesSearchQuery] = useState('');

  // WhatsApp Grade Confirm Modal
  const [gradeWhatsAppModalOpen, setGradeWhatsAppModalOpen] = useState(false);
  const [pendingGradeWhatsApp, setPendingGradeWhatsApp] = useState<{
    studentName: string;
    parentPhone: string;
    lectureTitle: string;
    lectureNumber: number;
    score: string;
    percentage: number;
    correct: number;
    wrong: number;
    messageText: string;
  } | null>(null);

  // ---------------------------------------------------------------------------
  // SECTIONS 5, 6, 7: Password Requests & Resets
  // ---------------------------------------------------------------------------
  const [passwordSearchQuery, setPasswordSearchQuery] = useState('');
  const [selectedRequestDetails, setSelectedRequestDetails] = useState<PasswordResetRequest | null>(null);
  const [adminNewPasswordInput, setAdminNewPasswordInput] = useState('');

  // Reload all storage data
  const loadData = () => {
    setStudents(AppStorage.getStudents());
    const lecs = AppStorage.getLectures();
    setLectures(lecs);
    setHomeworks(AppStorage.getHomeworks());
    setWatchRecords(AppStorage.getWatchRecords());
    setSubmissions(AppStorage.getSubmissions());
    setResetRequests(AppStorage.getResetRequests());
    setPasswordLogs(AppStorage.getPasswordLogs());
    setParentLogs(AppStorage.getParentLogs());

    // Auto select lecture for current grade if none
    if (!watchLectureId) {
      const matchLec = lecs.find((l) => l.grade === watchGradeFilter);
      if (matchLec) setWatchLectureId(matchLec.id);
    }
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('storage-updated', handleUpdate);
    return () => window.removeEventListener('storage-updated', handleUpdate);
  }, []);

  // When grade changes in watch section, update selected lecture
  useEffect(() => {
    const lecs = lectures.filter((l) => l.grade === watchGradeFilter);
    if (lecs.length > 0) {
      setWatchLectureId(lecs[0].id);
    } else {
      setWatchLectureId('');
    }
  }, [watchGradeFilter, lectures]);

  // Current lecture in watch section
  const currentWatchLecture = useMemo(() => {
    return lectures.find((l) => l.id === watchLectureId);
  }, [lectures, watchLectureId]);

  // Students in currently selected grade
  const gradeStudents = useMemo(() => {
    return students.filter((s) => s.grade === watchGradeFilter);
  }, [students, watchGradeFilter]);

  // Partition students into Watched vs Not Watched
  const { watchedStudents, notWatchedStudents, overallStats } = useMemo(() => {
    if (!currentWatchLecture) {
      return {
        watchedStudents: [],
        notWatchedStudents: [],
        overallStats: { total: 0, watched: 0, notWatched: 0, percentage: 0 },
      };
    }

    const watched: Array<{ student: Student; record?: WatchRecord; pct: number }> = [];
    const notWatched: Array<{ student: Student; record?: WatchRecord; pct: number }> = [];

    gradeStudents.forEach((st) => {
      const rec = watchRecords.find((w) => w.studentId === st.id && w.lectureId === currentWatchLecture.id);
      const pct = rec ? rec.watchPercentage : 0;
      if (pct >= 90) {
        watched.push({ student: st, record: rec, pct });
      } else {
        notWatched.push({ student: st, record: rec, pct });
      }
    });

    const total = gradeStudents.length;
    const watchedCount = watched.length;
    const notWatchedCount = notWatched.length;
    const percentage = total > 0 ? Math.round((watchedCount / total) * 100) : 0;

    return {
      watchedStudents: watched,
      notWatchedStudents: notWatched,
      overallStats: {
        total,
        watched: watchedCount,
        notWatched: notWatchedCount,
        percentage,
      },
    };
  }, [gradeStudents, currentWatchLecture, watchRecords]);

  // Trigger WhatsApp for Lecture Watch
  const initiateWhatsAppWatch = (student: Student, isWatched: boolean, pct: number) => {
    if (!currentWatchLecture) return;

    const dateStr = new Date().toLocaleDateString('ar-EG');
    let messageText = '';

    if (isWatched) {
      messageText = `السلام عليكم ورحمة الله وبركاته،

نود إبلاغ حضرتكم بمتابعة الطالب ${student.name} لمحاضرة ${currentWatchLecture.title} بتاريخ ${dateStr}.

✅ قام الطالب بمشاهدة المحاضرة.
📊 نسبة المشاهدة: ${pct}%

نشكركم على متابعة الطالب واهتمامكم بمستواه الدراسي.`;
    } else {
      messageText = `السلام عليكم ورحمة الله وبركاته،

نود إبلاغ حضرتكم بأن الطالب ${student.name} لم يشاهد محاضرة ${currentWatchLecture.title} بتاريخ ${dateStr} حتى الآن.

⚠️ نرجو متابعة الطالب وتشجيعه على مشاهدة المحاضرة.

شكرًا لتعاونكم واهتمامكم بمستوى الطالب.`;
    }

    setPendingWhatsAppTarget({
      student,
      lectureTitle: currentWatchLecture.title,
      isWatched,
      watchPct: pct,
      phone: student.parentPhone,
      messageText,
    });
    setWhatsAppModalOpen(true);
  };

  // Confirm and Open WhatsApp
  const handleConfirmWhatsAppOpen = () => {
    if (!pendingWhatsAppTarget) return;

    const url = buildWhatsAppUrl(pendingWhatsAppTarget.phone, pendingWhatsAppTarget.messageText);

    // Record in Communication Log as specified in 13.7:
    AppStorage.addParentLog({
      id: 'log_' + Date.now(),
      studentId: pendingWhatsAppTarget.student.id,
      studentName: pendingWhatsAppTarget.student.name,
      parentPhone: pendingWhatsAppTarget.phone,
      messageType: pendingWhatsAppTarget.isWatched ? 'حضور المحاضرة' : 'غياب عن المحاضرة',
      lectureTitle: pendingWhatsAppTarget.lectureTitle,
      sentAt: new Date().toISOString(),
      teacherName: teacherName,
      status: 'تم فتح WhatsApp وتجهيز الرسالة',
      messageContent: pendingWhatsAppTarget.messageText,
    });

    window.open(url, '_blank');
    onShowToast('success', 'تم فتح WhatsApp وتجهيز الرسالة', `محادثة ولي أمر الطالب: ${pendingWhatsAppTarget.student.name}`);
    setWhatsAppModalOpen(false);
    setPendingWhatsAppTarget(null);
  };

  // ---------------------------------------------------------------------------
  // Resumable / Chunked Upload Simulation
  // ---------------------------------------------------------------------------
  const startChunkedUpload = () => {
    if (!newLectureForm.title.trim()) {
      onShowToast('error', 'عنوان المحاضرة مطلوب', 'يرجى كتابة عنوان المحاضرة قبل بدء الرفع');
      return;
    }
    if (!newLectureForm.description.trim()) {
      onShowToast('error', 'وصف المحاضرة إجباري', 'لا يسمح النظام بنشر المحاضرة بدون كتابة وصف لها.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setUploadUploadedGB('0.0');

    let current = 0;
    const interval = setInterval(() => {
      current += 6;
      if (current >= 100) {
        current = 100;
        clearInterval(interval);
        setIsUploading(false);
        setUploadProgress(100);
        setUploadUploadedGB('4.2');
        onShowToast('success', 'اكتمل رفع ملف المحاضرة بنجاح', 'تم التحقق من سلامة الملف وجاهزيته للنشر');
      } else {
        setUploadProgress(current);
        const uploaded = ((current / 100) * 4.2).toFixed(1);
        setUploadUploadedGB(uploaded);
        const rem = Math.max(1, Math.round(((100 - current) / 100) * 4));
        setUploadRemainingTime(`${rem} دقائق`);
      }
    }, 250);

    setUploadIntervalId(interval);
  };

  const cancelUpload = () => {
    if (uploadIntervalId) clearInterval(uploadIntervalId);
    setIsUploading(false);
    setUploadProgress(0);
    onShowToast('info', 'تم إلغاء عملية الرفع', '');
  };

  // Publish Lecture
  const handlePublishLecture = () => {
    if (uploadProgress < 100) {
      onShowToast('warning', 'يرجى إكمال رفع الفيديو أولاً', 'يجب أن يكتمل رفع ملف المحاضرة قبل النشر');
      return;
    }

    const newLec: Lecture = {
      id: 'lec_' + Date.now(),
      grade: newLectureForm.grade,
      lectureNumber: Number(newLectureForm.lectureNumber) || lectures.length + 1,
      title: newLectureForm.title.trim(),
      description: newLectureForm.description.trim(),
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      videoFileName: newLectureForm.videoFileName || `Lecture_${newLectureForm.lectureNumber}.mp4`,
      fileSize: '4.2 GB',
      durationMinutes: newLectureForm.durationMinutes || 45,
      createdAt: new Date().toISOString(),
    };

    AppStorage.addLecture(newLec);
    setIsNewLectureModalOpen(false);
    onShowToast('success', 'تم نشر المحاضرة بنجاح', `المحاضرة رقم ${newLec.lectureNumber} متاحة الآن لطلاب ${newLec.grade}`);

    // Transition smoothly to adding homework for this lecture! (Specification #14.5)
    setBuilderLecture(newLec);
    setBuilderHwTitle(`واجب ${newLec.title}`);
    setBuilderQuestions([]);
    setIsHwBuilderOpen(true);
  };

  // Add Question to Homework Builder
  const handleAddQuestionToBuilder = () => {
    if (!currentQuestionText.trim()) {
      onShowToast('error', 'نص السؤال مطلوب', 'يرجى كتابة نص السؤال');
      return;
    }

    const newQ: Question = {
      id: 'q_' + Date.now(),
      questionText: currentQuestionText.trim(),
      options: [...currentOptions] as [string, string, string, string],
      correctOptionIndex: currentCorrectIdx,
      explanation: currentExplanation.trim(),
    };

    setBuilderQuestions([...builderQuestions, newQ]);
    setCurrentQuestionText('');
    setCurrentExplanation('');
    onShowToast('success', 'تمت إضافة السؤال بنجاح', `إجمالي الأسئلة المضافة: ${builderQuestions.length + 1}`);
  };

  // Save Homework
  const handleSaveHomework = () => {
    if (!builderLecture) return;
    if (builderQuestions.length === 0) {
      onShowToast('error', 'لا توجد أسئلة', 'يرجى إضافة سؤال واحد على الأقل قبل حفظ الواجب');
      return;
    }

    const newHw: Homework = {
      id: 'hw_' + Date.now(),
      lectureId: builderLecture.id,
      title: builderHwTitle.trim() || `واجب ${builderLecture.title}`,
      questions: builderQuestions,
      published: true,
      createdAt: new Date().toISOString(),
    };

    AppStorage.saveHomework(newHw);
    setIsHwBuilderOpen(false);
    setBuilderLecture(null);
    onShowToast('success', 'تم حفظ ونشر الواجب للطلاب بنجاح', `تم ربط الواجب بالمحاضرة رقم ${builderLecture.lectureNumber}`);
  };

  // ---------------------------------------------------------------------------
  // Grade WhatsApp Actions
  // ---------------------------------------------------------------------------
  const initiateGradeWhatsApp = (sub: HomeworkSubmission) => {
    const student = students.find((s) => s.id === sub.studentId);
    if (!student) return;

    const lec = lectures.find((l) => l.id === sub.lectureId);
    const lecTitle = lec ? lec.title : 'الكيمياء';
    const lecNumber = lec ? lec.lectureNumber : 1;

    const messageText = `السلام عليكم ورحمة الله وبركاته،

نود إبلاغكم بنتيجة الطالب ${sub.studentName} في واجب محاضرة ${lecNumber} — ${lecTitle}.

📝 الدرجة: ${sub.correctCount} / ${sub.totalQuestions}
📊 النسبة: ${sub.scorePercentage}%
✅ إجابات صحيحة: ${sub.correctCount}
❌ إجابات خاطئة: ${sub.wrongCount}

نشكركم على متابعة الطالب ونتمنى له مزيدًا من التقدم والنجاح.`;

    setPendingGradeWhatsApp({
      studentName: sub.studentName,
      parentPhone: student.parentPhone,
      lectureTitle: lecTitle,
      lectureNumber: lecNumber,
      score: `${sub.correctCount}/${sub.totalQuestions}`,
      percentage: sub.scorePercentage,
      correct: sub.correctCount,
      wrong: sub.wrongCount,
      messageText,
    });
    setGradeWhatsAppModalOpen(true);
  };

  const handleConfirmGradeWhatsApp = () => {
    if (!pendingGradeWhatsApp) return;

    const url = buildWhatsAppUrl(pendingGradeWhatsApp.parentPhone, pendingGradeWhatsApp.messageText);

    AppStorage.addParentLog({
      id: 'log_' + Date.now(),
      studentId: '',
      studentName: pendingGradeWhatsApp.studentName,
      parentPhone: pendingGradeWhatsApp.parentPhone,
      messageType: 'درجة الواجب',
      lectureTitle: pendingGradeWhatsApp.lectureTitle,
      sentAt: new Date().toISOString(),
      teacherName,
      status: 'تم فتح WhatsApp وتجهيز الرسالة',
      messageContent: pendingGradeWhatsApp.messageText,
    });

    window.open(url, '_blank');
    onShowToast('success', 'تم فتح WhatsApp وتجهيز رسالة الدرجة', `ولي أمر الطالب: ${pendingGradeWhatsApp.studentName}`);
    setGradeWhatsAppModalOpen(false);
    setPendingGradeWhatsApp(null);
  };

  // ---------------------------------------------------------------------------
  // Password Reset & Verification Handlers
  // ---------------------------------------------------------------------------
  const handleVerifyAndResetPassword = (req: PasswordResetRequest) => {
    // 1. Find registered student account by Username
    const registeredStudent = AppStorage.findStudentByUsername(req.username);

    if (!registeredStudent) {
      onShowToast('error', 'الحساب غير مسجل', `لا يوجد حساب مسجل باسم المستخدم @${req.username}`);
      return;
    }

    // 2. Strict Comparison of verification data (Specification #6)
    const isIdMatch = registeredStudent.nationalId === req.nationalId;
    const isStudentPhoneMatch = registeredStudent.studentPhone === req.studentPhone;
    const isParentPhoneMatch = registeredStudent.parentPhone === req.parentPhone;

    const isFullMatch = isIdMatch && isStudentPhoneMatch && isParentPhoneMatch;

    if (!isFullMatch) {
      onShowToast(
        'error',
        'بيانات التحقق غير متطابقة ❌',
        'البيانات المدخلة في طلب استرجاع الحساب لا تتطابق مع البيانات المسجلة رسمياً. لا يمكن تغيير كلمة المرور.'
      );
      return;
    }

    // 3. Password Strength check
    const strength = checkPasswordStrength(adminNewPasswordInput);
    if (!strength.isAcceptable) {
      onShowToast('error', 'كلمة المرور غير كافية الأمان', 'يجب إدخال كلمة مرور قوية أو الضغط على "توليد كلمة مرور قوية"');
      return;
    }

    // 4. Update Password
    const hashed = hashPassword(adminNewPasswordInput);
    AppStorage.updateStudentPassword(req.username, hashed, adminNewPasswordInput);

    // 5. Update Request Status & Add to History
    AppStorage.updateResetRequest(req.id, 'resolved', adminNewPasswordInput);
    AppStorage.addPasswordLog({
      id: 'log_pw_' + Date.now(),
      username: req.username,
      changedAt: new Date().toISOString(),
      changedBy: teacherName,
      status: 'تم التغيير بنجاح بعد التحقق من البيانات',
      newPassword: adminNewPasswordInput,
    });

    onShowToast('success', 'تم تغيير كلمة المرور بنجاح ✅', `كلمة المرور الجديدة للطالب @${req.username} أصبحت فعالة الآن.`);
    setSelectedRequestDetails(null);
    setAdminNewPasswordInput('');
  };

  const copyToClipboard = (text: string, title = 'تم النسخ') => {
    navigator.clipboard.writeText(text);
    onShowToast('success', title, text);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Top Teacher Header & Navigation Tabs */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 mb-8 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                لوحة الإدارة والمعلم
              </span>
              <span className="text-xs text-zinc-400">{teacherName}</span>
            </div>
            <h1 className="text-2xl font-black text-zinc-100">منظومة إدارة الكيمياء المتكاملة</h1>
            <p className="text-xs text-zinc-400 mt-1">
              متابعة الطلاب، المحاضرات، تصحيح الواجبات، والتواصل مع أولياء الأمور عبر واتساب
            </p>
          </div>

          {/* Quick Action to Reset Database for demo testing */}
          <button
            id="btn-reset-demo-db"
            onClick={() => {
              if (window.confirm('هل تريد إعادة تعيين البيانات التجريبية لقيمها الافتراضية؟')) {
                AppStorage.resetToDefault();
                loadData();
                onShowToast('info', 'تمت استعادة البيانات الافتراضية', '');
              }
            }}
            className="self-start md:self-auto px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-300 border border-zinc-700 flex items-center gap-2"
          >
            <RefreshCw className="w-3.5 h-3.5 text-zinc-400" />
            استعادة البيانات الافتراضية
          </button>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="flex flex-wrap gap-2 pt-4 border-t border-zinc-800">
          <button
            id="teacher-tab-watch"
            onClick={() => setActiveSection('watch_whatsapp')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeSection === 'watch_whatsapp'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950'
                : 'bg-zinc-800/80 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100'
            }`}
          >
            <MessageCircle className="w-4 h-4 text-emerald-300" />
            متابعة المشاهدات وواتساب (قسم 13)
          </button>

          <button
            id="teacher-tab-lectures"
            onClick={() => setActiveSection('lectures_hw')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeSection === 'lectures_hw'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950'
                : 'bg-zinc-800/80 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100'
            }`}
          >
            <Video className="w-4 h-4 text-cyan-300" />
            إدارة المحاضرات والواجبات (قسم 14 و15)
          </button>

          <button
            id="teacher-tab-grades"
            onClick={() => setActiveSection('grades')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeSection === 'grades'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950'
                : 'bg-zinc-800/80 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100'
            }`}
          >
            <FileCheck className="w-4 h-4 text-amber-300" />
            درجات الواجبات (قسم 18)
          </button>

          <button
            id="teacher-tab-passwords"
            onClick={() => setActiveSection('passwords')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeSection === 'passwords'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950'
                : 'bg-zinc-800/80 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100'
            }`}
          >
            <KeyRound className="w-4 h-4 text-rose-300" />
            طلبات وكلمات المرور (قسم 5 و6 و7)
            {resetRequests.filter((r) => r.status === 'pending').length > 0 && (
              <span className="w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-black flex items-center justify-center">
                {resetRequests.filter((r) => r.status === 'pending').length}
              </span>
            )}
          </button>

          <button
            id="teacher-tab-students"
            onClick={() => setActiveSection('students')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeSection === 'students'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950'
                : 'bg-zinc-800/80 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100'
            }`}
          >
            <Users className="w-4 h-4 text-purple-300" />
            سجل الطلاب المسجلين ({students.length})
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 13: متابعة مشاهدة المحاضرات والتواصل مع ولي الأمر                   */}
      {/* ========================================================================= */}
      {activeSection === 'watch_whatsapp' && (
        <div className="space-y-6">
          {/* Grade Selector Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {GRADES_LIST.map((g) => (
              <button
                key={g}
                id={`watch-grade-btn-${g}`}
                onClick={() => setWatchGradeFilter(g)}
                className={`p-3.5 rounded-2xl border text-xs font-bold transition-all text-center ${
                  watchGradeFilter === g
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-md shadow-emerald-950/40'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850'
                }`}
              >
                {g}
              </button>
            ))}
          </div>

          {/* Section 13.9: Dashboard مختصرة (الإحصائيات السريعة) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 shadow-lg">
              <span className="text-xs text-zinc-400 block mb-1">إجمالي الطلاب المسجلين</span>
              <span className="text-2xl font-black text-zinc-100">{overallStats.total}</span>
            </div>
            <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-3xl p-5 shadow-lg">
              <span className="text-xs text-emerald-300 block mb-1">🟢 شاهدوا المحاضرة (≥90%)</span>
              <span className="text-2xl font-black text-emerald-400">{overallStats.watched}</span>
            </div>
            <div className="bg-red-950/30 border border-red-500/30 rounded-3xl p-5 shadow-lg">
              <span className="text-xs text-red-300 block mb-1">🔴 لم يشاهدوا المحاضرة</span>
              <span className="text-2xl font-black text-red-400">{overallStats.notWatched}</span>
            </div>
            <div className="bg-cyan-950/30 border border-cyan-500/30 rounded-3xl p-5 shadow-lg">
              <span className="text-xs text-cyan-300 block mb-1">نسبة المشاهدة الإجمالية</span>
              <span className="text-2xl font-black text-cyan-400">{overallStats.percentage}%</span>
            </div>
          </div>

          {/* Section 13.8: البحث والفلاتر */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Lecture Picker */}
            <div className="flex-1">
              <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
                المحاضرة المراد متابعتها:
              </label>
              <select
                id="watch-lecture-select"
                value={watchLectureId}
                onChange={(e) => setWatchLectureId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-100 text-xs font-bold focus:outline-none focus:border-emerald-500"
              >
                {lectures
                  .filter((l) => l.grade === watchGradeFilter)
                  .map((l) => (
                    <option key={l.id} value={l.id}>
                      المحاضرة {l.lectureNumber}: {l.title}
                    </option>
                  ))}
              </select>
            </div>

            {/* Search input */}
            <div className="flex-1">
              <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
                البحث باسم الطالب أو اسم المستخدم:
              </label>
              <div className="relative">
                <input
                  id="watch-search-input"
                  type="text"
                  value={watchSearchQuery}
                  onChange={(e) => setWatchSearchQuery(e.target.value)}
                  placeholder="ابحث هنا..."
                  className="w-full px-4 py-2.5 pl-10 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-100 text-xs focus:outline-none focus:border-emerald-500"
                />
                <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
              </div>
            </div>
          </div>

          {/* Dual Columns: 🟢 Watched vs 🔴 Not Watched (Section 13.1) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 🟢 الطلاب الذين شاهدوا المحاضرة */}
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-emerald-950/40 border border-emerald-500/30 p-4 rounded-2xl">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                  <h3 className="text-sm font-bold text-emerald-300">
                    الطلاب الذين شاهدوا المحاضرة ({watchedStudents.length})
                  </h3>
                </div>
                <span className="text-xs text-emerald-400 font-bold">حققوا 90% فأكثر</span>
              </div>

              <div className="space-y-3">
                {watchedStudents
                  .filter((item) => {
                    if (!watchSearchQuery.trim()) return true;
                    const q = watchSearchQuery.toLowerCase();
                    return (
                      item.student.name.toLowerCase().includes(q) ||
                      item.student.username.toLowerCase().includes(q)
                    );
                  })
                  .map(({ student, pct, record }) => (
                    <div
                      key={student.id}
                      id={`watched-card-${student.id}`}
                      className="bg-zinc-900 border border-zinc-800 hover:border-emerald-500/50 rounded-2xl p-4 shadow-md transition-all text-right"
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div>
                          <h4 className="text-sm font-bold text-zinc-100">{student.name}</h4>
                          <span className="text-[11px] text-zinc-400">@{student.username}</span>
                        </div>
                        <span className="px-2.5 py-1 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          شاهَد {pct}% ✅
                        </span>
                      </div>

                      <div className="text-xs text-zinc-400 space-y-1 mb-3 pt-2 border-t border-zinc-800/60">
                        <div className="flex items-center justify-between">
                          <span>الصف الدراسي:</span>
                          <span className="text-zinc-300">{student.grade}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>هاتف ولي الأمر (واتساب):</span>
                          <span className="text-emerald-400 font-mono" dir="ltr">
                            {maskPhoneNumber(student.parentPhone)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>تاريخ آخر مشاهدة:</span>
                          <span className="text-zinc-300">
                            {record ? new Date(record.lastWatchedAt).toLocaleDateString('ar-EG') : 'اليوم'}
                          </span>
                        </div>
                      </div>

                      <button
                        id={`btn-send-whatsapp-watched-${student.id}`}
                        onClick={() => initiateWhatsAppWatch(student, true, pct)}
                        className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-950 transition-all flex items-center justify-center gap-2"
                      >
                        <MessageCircle className="w-4 h-4" />
                        واتساب | إرسال لولي الأمر
                      </button>
                    </div>
                  ))}

                {watchedStudents.length === 0 && (
                  <div className="p-8 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 text-center text-zinc-500 text-xs">
                    لم يقم أي طالب بمشاهدة هذه المحاضرة بنسبة 90% حتى الآن
                  </div>
                )}
              </div>
            </div>

            {/* 🔴 الطلاب الذين لم يشاهدوا المحاضرة */}
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-red-950/40 border border-red-500/30 p-4 rounded-2xl">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-500" />
                  <h3 className="text-sm font-bold text-red-300">
                    الطلاب الذين لم يشاهدوا المحاضرة ({notWatchedStudents.length})
                  </h3>
                </div>
                <span className="text-xs text-red-400 font-bold">أقل من 90%</span>
              </div>

              <div className="space-y-3">
                {notWatchedStudents
                  .filter((item) => {
                    if (!watchSearchQuery.trim()) return true;
                    const q = watchSearchQuery.toLowerCase();
                    return (
                      item.student.name.toLowerCase().includes(q) ||
                      item.student.username.toLowerCase().includes(q)
                    );
                  })
                  .map(({ student, pct, record }) => (
                    <div
                      key={student.id}
                      id={`not-watched-card-${student.id}`}
                      className="bg-zinc-900 border border-zinc-800 hover:border-red-500/50 rounded-2xl p-4 shadow-md transition-all text-right"
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div>
                          <h4 className="text-sm font-bold text-zinc-100">{student.name}</h4>
                          <span className="text-[11px] text-zinc-400">@{student.username}</span>
                        </div>
                        <span className="px-2.5 py-1 rounded-full text-xs font-black bg-red-500/20 text-red-300 border border-red-500/30">
                          {pct > 0 ? `شاهَد ${pct}% فقط ⚠️` : 'لم يشاهد 0% ❌'}
                        </span>
                      </div>

                      <div className="text-xs text-zinc-400 space-y-1 mb-3 pt-2 border-t border-zinc-800/60">
                        <div className="flex items-center justify-between">
                          <span>الصف الدراسي:</span>
                          <span className="text-zinc-300">{student.grade}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>هاتف ولي الأمر (واتساب):</span>
                          <span className="text-red-400 font-mono" dir="ltr">
                            {maskPhoneNumber(student.parentPhone)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>آخر تفاعل:</span>
                          <span className="text-zinc-300">
                            {record ? new Date(record.lastWatchedAt).toLocaleDateString('ar-EG') : 'لم يبدأ بعد'}
                          </span>
                        </div>
                      </div>

                      <button
                        id={`btn-send-whatsapp-not-watched-${student.id}`}
                        onClick={() => initiateWhatsAppWatch(student, false, pct)}
                        className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-lg shadow-amber-950 transition-all flex items-center justify-center gap-2"
                      >
                        <MessageCircle className="w-4 h-4" />
                        واتساب | تنبيه ولي الأمر بالغياب
                      </button>
                    </div>
                  ))}

                {notWatchedStudents.length === 0 && (
                  <div className="p-8 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 text-center text-emerald-400 text-xs font-bold">
                    ما شاء الله! جميع طلاب هذا الصف شاهدوا المحاضرة بنجاح 👏
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section 13.7: سجل التواصل الحديث */}
          {parentLogs.length > 0 && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 shadow-lg mt-8">
              <h3 className="text-sm font-bold text-zinc-200 mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-400" />
                سجل رسائل أولياء الأمور (آخر العمليات)
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead>
                    <tr className="border-b border-zinc-800 text-zinc-400">
                      <th className="py-2.5 px-3">الطالب</th>
                      <th className="py-2.5 px-3">نوع الرسالة</th>
                      <th className="py-2.5 px-3">المحاضرة</th>
                      <th className="py-2.5 px-3">رقم ولي الأمر</th>
                      <th className="py-2.5 px-3">الحالة المسجلة</th>
                      <th className="py-2.5 px-3">الوقت والتاريخ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                    {parentLogs.slice(0, 5).map((log) => (
                      <tr key={log.id} className="hover:bg-zinc-850">
                        <td className="py-2.5 px-3 font-bold text-zinc-100">{log.studentName}</td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-emerald-400 border border-zinc-700">
                            {log.messageType}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-zinc-300">{log.lectureTitle}</td>
                        <td className="py-2.5 px-3 font-mono" dir="ltr">
                          {maskPhoneNumber(log.parentPhone)}
                        </td>
                        <td className="py-2.5 px-3 text-emerald-400 font-semibold">{log.status}</td>
                        <td className="py-2.5 px-3 text-zinc-500">
                          {new Date(log.sentAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 14 & 15: إدارة المحاضرات والواجبات                                  */}
      {/* ========================================================================= */}
      {activeSection === 'lectures_hw' && (
        <div className="space-y-6">
          {/* 4 Grade divisions header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900 border border-zinc-800 p-5 rounded-3xl">
            <div>
              <h2 className="text-lg font-bold text-zinc-100">إدارة ونشر المحاضرات والواجبات</h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                كل محاضرة مرتبطة بصف دراسي وتظهر فقط لحسابات هذا الصف
              </p>
            </div>
            <button
              id="btn-open-new-lecture-modal"
              onClick={() => {
                setNewLectureForm({
                  grade: lectureGradeFilter,
                  lectureNumber: lectures.filter((l) => l.grade === lectureGradeFilter).length + 1,
                  title: '',
                  description: '',
                  videoFileName: 'Chemical_Lecture.mp4',
                  videoFileSize: '4.2 GB',
                  durationMinutes: 45,
                });
                setUploadProgress(0);
                setIsUploading(false);
                setIsNewLectureModalOpen(true);
              }}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-950 transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              + نشر محاضرة جديدة
            </button>
          </div>

          {/* Grade Selector Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {GRADES_LIST.map((g) => (
              <button
                key={g}
                id={`lec-grade-tab-${g}`}
                onClick={() => setLectureGradeFilter(g)}
                className={`p-3.5 rounded-2xl border text-xs font-bold transition-all text-center ${
                  lectureGradeFilter === g
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-md shadow-emerald-950/40'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {g}
              </button>
            ))}
          </div>

          {/* Lectures List for this Grade */}
          <div className="space-y-4">
            {lectures
              .filter((l) => l.grade === lectureGradeFilter)
              .map((lec) => {
                const hw = homeworks.find((h) => h.lectureId === lec.id);
                return (
                  <div
                    key={lec.id}
                    id={`teacher-lec-row-${lec.id}`}
                    className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4 text-right"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          المحاضرة رقم {lec.lectureNumber}
                        </span>
                        <span className="text-xs text-zinc-400">
                          {lec.durationMinutes} دقيقة • {lec.fileSize}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-zinc-100 mb-1">{lec.title}</h3>
                      <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">{lec.description}</p>
                    </div>

                    <div className="flex items-center gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-zinc-800">
                      {hw ? (
                        <div className="text-right pl-3 border-l border-zinc-800">
                          <span className="text-[11px] text-zinc-400 block">واجب المحاضرة</span>
                          <span className="text-xs font-bold text-emerald-400">
                            📝 {hw.questions.length} سؤال منشور
                          </span>
                        </div>
                      ) : (
                        <button
                          id={`btn-add-hw-${lec.id}`}
                          onClick={() => {
                            setBuilderLecture(lec);
                            setBuilderHwTitle(`واجب ${lec.title}`);
                            setBuilderQuestions([]);
                            setIsHwBuilderOpen(true);
                          }}
                          className="px-4 py-2 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/40 text-cyan-200 text-xs font-bold transition-all"
                        >
                          + إضافة واجب
                        </button>
                      )}

                      <button
                        id={`btn-edit-hw-${lec.id}`}
                        onClick={() => {
                          const existingHw = homeworks.find((h) => h.lectureId === lec.id);
                          setBuilderLecture(lec);
                          setBuilderHwTitle(existingHw?.title || `واجب ${lec.title}`);
                          setBuilderQuestions(existingHw?.questions || []);
                          setIsHwBuilderOpen(true);
                        }}
                        className="px-3.5 py-2 rounded-xl border border-zinc-700 bg-zinc-800 text-zinc-200 text-xs font-semibold hover:bg-zinc-700"
                      >
                        إدارة الأسئلة
                      </button>
                    </div>
                  </div>
                );
              })}

            {lectures.filter((l) => l.grade === lectureGradeFilter).length === 0 && (
              <div className="p-12 text-center text-zinc-500 text-xs bg-zinc-900 border border-zinc-800 rounded-3xl">
                لا توجد محاضرات منشورة لهذا الصف بعد. اضغط «+ نشر محاضرة جديدة» لبدء الإضافة.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 18: درجات الواجبات                                                 */}
      {/* ========================================================================= */}
      {activeSection === 'grades' && (
        <div className="space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-zinc-100">سجل درجات الواجبات والتواصل مع أولياء الأمور</h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                تصفح نتائج الطلاب وإرسال تقرير النتيجة الكامل لولي الأمر عبر WhatsApp
              </p>
            </div>

            {/* Filter by Grade */}
            <div className="flex items-center gap-2">
              <select
                id="grades-grade-filter"
                value={gradesGradeFilter}
                onChange={(e) => setGradesGradeFilter(e.target.value as Grade)}
                className="px-4 py-2 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs font-bold"
              >
                {GRADES_LIST.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Submissions Table / Cards */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-400 bg-zinc-950/60">
                    <th className="py-3.5 px-4 font-bold">الطالب</th>
                    <th className="py-3.5 px-4 font-bold">المحاضرة / الواجب</th>
                    <th className="py-3.5 px-4 font-bold">الدرجة</th>
                    <th className="py-3.5 px-4 font-bold">النسبة</th>
                    <th className="py-3.5 px-4 font-bold">الحالة</th>
                    <th className="py-3.5 px-4 font-bold">تاريخ التسليم</th>
                    <th className="py-3.5 px-4 font-bold text-center">إرسال النتيجة لولي الأمر</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                  {submissions
                    .filter((s) => s.grade === gradesGradeFilter)
                    .map((sub) => {
                      const lec = lectures.find((l) => l.id === sub.lectureId);
                      const hw = homeworks.find((h) => h.id === sub.homeworkId);

                      let statusBadge = {
                        label: 'ممتاز',
                        bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
                      };
                      if (sub.scorePercentage < 65) {
                        statusBadge = {
                          label: 'يحتاج متابعة',
                          bg: 'bg-red-500/20 text-red-300 border-red-500/30',
                        };
                      } else if (sub.scorePercentage < 85) {
                        statusBadge = {
                          label: 'جيد جداً',
                          bg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
                        };
                      }

                      return (
                        <tr key={sub.id} className="hover:bg-zinc-850 transition-colors">
                          <td className="py-3.5 px-4">
                            <span className="font-bold text-zinc-100 block">{sub.studentName}</span>
                            <span className="text-[11px] text-zinc-400">{sub.grade}</span>
                          </td>
                          <td className="py-3.5 px-4 font-medium text-zinc-200">
                            {lec ? `المحاضرة ${lec.lectureNumber}: ${lec.title}` : hw?.title || 'واجب كيمياء'}
                          </td>
                          <td className="py-3.5 px-4 font-black text-emerald-400 text-sm">
                            {sub.correctCount} / {sub.totalQuestions}
                          </td>
                          <td className="py-3.5 px-4 font-extrabold text-cyan-400">
                            {sub.scorePercentage}%
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${statusBadge.bg}`}>
                              {statusBadge.label}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-zinc-400">
                            {new Date(sub.submittedAt).toLocaleDateString('ar-EG')}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <button
                              id={`btn-send-grade-whatsapp-${sub.id}`}
                              onClick={() => initiateGradeWhatsApp(sub)}
                              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-950 transition-all inline-flex items-center gap-2"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              إرسال الدرجة لولي الأمر
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>

            {submissions.filter((s) => s.grade === gradesGradeFilter).length === 0 && (
              <div className="p-12 text-center text-zinc-500 text-xs">
                لا توجد تسليمات واجبات مسجلة لهذا الصف حتى الآن
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTIONS 5, 6, 7: طلبات وسجل تغيير كلمات المرور                              */}
      {/* ========================================================================= */}
      {activeSection === 'passwords' && (
        <div className="space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-zinc-100">طلبات وتغيير كلمات المرور</h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                التحقق الصارم من بيانات الطالب ومطابقتها قبل السماح بتغيير كلمة المرور
              </p>
            </div>

            <div className="relative w-full md:w-72">
              <input
                id="search-password-requests"
                type="text"
                value={passwordSearchQuery}
                onChange={(e) => setPasswordSearchQuery(e.target.value)}
                placeholder="ابحث باسم المستخدم..."
                className="w-full px-4 py-2 pl-9 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs focus:outline-none focus:border-emerald-500"
              />
              <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
            </div>
          </div>

          {/* Pending Requests List */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-zinc-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              الطلبات المعلقة الحالية ({resetRequests.filter((r) => r.status === 'pending').length})
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {resetRequests
                .filter((r) => {
                  if (passwordSearchQuery.trim()) {
                    return r.username.toLowerCase().includes(passwordSearchQuery.trim().toLowerCase());
                  }
                  return true;
                })
                .map((req) => {
                  const student = AppStorage.findStudentByUsername(req.username);
                  const isMatch =
                    student &&
                    student.nationalId === req.nationalId &&
                    student.studentPhone === req.studentPhone &&
                    student.parentPhone === req.parentPhone;

                  return (
                    <div
                      key={req.id}
                      id={`req-card-${req.id}`}
                      className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-md text-right relative overflow-hidden"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-mono text-sm font-bold text-emerald-400">
                          @{req.username}
                        </span>
                        <span
                          className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                            req.status === 'resolved'
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : req.status === 'rejected'
                              ? 'bg-red-500/20 text-red-300'
                              : 'bg-amber-500/20 text-amber-300'
                          }`}
                        >
                          {req.status === 'resolved' ? 'تم الحل ✅' : 'قيد المراجعة ⚠️'}
                        </span>
                      </div>

                      {/* Request Details (Section 5) */}
                      <div className="text-xs text-zinc-300 space-y-1.5 p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/80 mb-4">
                        <div className="flex justify-between">
                          <span className="text-zinc-400">الرقم القومي المدخل:</span>
                          <span className="font-mono">{req.nationalId}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-400">هاتف الطالب:</span>
                          <span className="font-mono" dir="ltr">{req.studentPhone}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-400">هاتف ولي الأمر:</span>
                          <span className="font-mono" dir="ltr">{req.parentPhone}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-400">تاريخ الطلب:</span>
                          <span>{new Date(req.requestedAt).toLocaleString('ar-EG')}</span>
                        </div>
                      </div>

                      {/* Verification Status Banner (Section 6) */}
                      <div
                        className={`p-3 rounded-xl border text-xs mb-4 flex items-center gap-2 ${
                          isMatch
                            ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                            : 'bg-red-950/40 border-red-500/40 text-red-300'
                        }`}
                      >
                        {isMatch ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                            <span>البيانات مطابقة تماماً مع حساب الطالب المسجل ✅</span>
                          </>
                        ) : (
                          <>
                            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                            <span>تحذير: البيانات المدخلة غير متطابقة مع بيانات الحساب ❌</span>
                          </>
                        )}
                      </div>

                      {/* Actions */}
                      {req.status === 'pending' ? (
                        <div className="space-y-3 pt-3 border-t border-zinc-800">
                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <label className="text-[11px] font-semibold text-zinc-300">
                                تعيين كلمة مرور قوية جديدة:
                              </label>
                              <button
                                type="button"
                                id={`btn-generate-strong-${req.id}`}
                                onClick={() => {
                                  const pass = generateStrongPassword();
                                  setAdminNewPasswordInput(pass);
                                  onShowToast('info', 'تم توليد كلمة مرور قوية', pass);
                                }}
                                className="text-[11px] text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1"
                              >
                                <Sparkles className="w-3 h-3" />
                                توليد كلمة مرور قوية
                              </button>
                            </div>
                            <input
                              id={`admin-new-pass-input-${req.id}`}
                              type="text"
                              value={adminNewPasswordInput}
                              onChange={(e) => setAdminNewPasswordInput(e.target.value)}
                              placeholder="أدخل كلمة المرور الجديدة للطالب"
                              className="w-full px-3 py-2 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-100 text-xs font-mono"
                              dir="ltr"
                            />
                          </div>

                          <button
                            id={`btn-save-new-pass-${req.id}`}
                            onClick={() => handleVerifyAndResetPassword(req)}
                            className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-950 transition-all flex items-center justify-center gap-2"
                          >
                            <KeyRound className="w-4 h-4" />
                            حفظ وتغيير كلمة المرور
                          </button>
                        </div>
                      ) : (
                        <div className="text-xs text-zinc-400 text-center py-1">
                          تم إنهاء هذا الطلب وتعيين كلمة المرور بنجاح
                        </div>
                      )}
                    </div>
                  );
                })}

              {resetRequests.length === 0 && (
                <div className="col-span-2 p-8 text-center text-zinc-500 text-xs bg-zinc-900 border border-zinc-800 rounded-2xl">
                  لا توجد طلبات تغيير كلمات مرور حالياً
                </div>
              )}
            </div>
          </div>

          {/* Section 7: سجل تغيير كلمات المرور (Password Change History) */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 shadow-lg mt-8">
            <h3 className="text-sm font-bold text-zinc-200 mb-3 flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-emerald-400" />
              سجل تغيير كلمات المرور (Section 7)
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-400">
                    <th className="py-2.5 px-3">اسم المستخدم</th>
                    <th className="py-2.5 px-3">التاريخ والوقت</th>
                    <th className="py-2.5 px-3">حالة الطلب</th>
                    <th className="py-2.5 px-3">كلمة المرور الجديدة</th>
                    <th className="py-2.5 px-3 text-center">نسخ لإرسالها للطالب</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                  {passwordLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-zinc-850">
                      <td className="py-2.5 px-3 font-mono font-bold text-zinc-100">@{log.username}</td>
                      <td className="py-2.5 px-3 text-zinc-400">
                        {new Date(log.changedAt).toLocaleString('ar-EG')}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                          {log.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-emerald-400" dir="ltr">
                        {log.newPassword}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          id={`btn-copy-log-pass-${log.id}`}
                          onClick={() => copyToClipboard(log.newPassword, 'تم نسخ كلمة المرور')}
                          className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold border border-zinc-700 inline-flex items-center gap-1.5"
                        >
                          <Copy className="w-3.5 h-3.5 text-cyan-400" />
                          نسخ كلمة المرور
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION: سجل الطلاب المسجلين (Directory of Students)                        */}
      {/* ========================================================================= */}
      {activeSection === 'students' && (
        <div className="space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 shadow-lg flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-zinc-100">سجل الطلاب المسجلين بالمنصة ({students.length})</h2>
              <p className="text-xs text-zinc-400 mt-0.5">جميع الحسابات محمية ومقسمة حسب الصف الدراسي</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {students.map((st) => (
              <div
                key={st.id}
                className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-md text-right space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-bold text-zinc-100">{st.name}</h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 font-bold border border-zinc-700">
                    {st.grade}
                  </span>
                </div>

                <div className="text-xs text-zinc-400 space-y-1 pt-2 border-t border-zinc-800/80">
                  <div className="flex justify-between">
                    <span>اسم المستخدم:</span>
                    <span className="font-mono text-emerald-400 font-bold">@{st.username}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>الرقم القومي:</span>
                    <span className="font-mono">{st.nationalId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>هاتف الطالب:</span>
                    <span className="font-mono text-zinc-300" dir="ltr">{st.studentPhone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>هاتف ولي الأمر:</span>
                    <span className="font-mono text-zinc-300" dir="ltr">{st.parentPhone}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: نشر محاضرة جديدة مع Chunked Upload Simulator (Section 14)          */}
      {/* ========================================================================= */}
      {isNewLectureModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div
            className="relative w-full max-w-2xl my-8 bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-right animate-in zoom-in-95"
            id="new-lecture-modal-box"
          >
            <button
              id="btn-close-new-lec"
              onClick={() => setIsNewLectureModalOpen(false)}
              className="absolute top-5 left-5 text-zinc-400 hover:text-zinc-200 transition-colors p-1 rounded-lg hover:bg-zinc-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5 border-b border-zinc-800 pb-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Video className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-zinc-100">نشر محاضرة كيمياء جديدة</h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  ارفع المحاضرة وحدد الصف الدراسي المستهدف ثم أضف واجبها
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {/* 1. Grade */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  1. الصف الدراسي المستهدف <span className="text-emerald-400">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {GRADES_LIST.map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setNewLectureForm({ ...newLectureForm, grade: g })}
                      className={`p-3 rounded-xl border text-xs font-bold text-right transition-all flex items-center justify-between ${
                        newLectureForm.grade === g
                          ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300'
                          : 'bg-zinc-800/60 border-zinc-700 text-zinc-300'
                      }`}
                    >
                      <span>{g}</span>
                      {newLectureForm.grade === g && <Check className="w-4 h-4 text-emerald-400" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Lecture Number & Title */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    2. رقم المحاضرة <span className="text-emerald-400">*</span>
                  </label>
                  <input
                    id="new-lec-num"
                    type="number"
                    value={newLectureForm.lectureNumber}
                    onChange={(e) =>
                      setNewLectureForm({ ...newLectureForm, lectureNumber: Number(e.target.value) })
                    }
                    className="w-full px-4 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-100 text-xs font-bold"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    3. عنوان المحاضرة <span className="text-emerald-400">*</span>
                  </label>
                  <input
                    id="new-lec-title"
                    type="text"
                    required
                    value={newLectureForm.title}
                    onChange={(e) => setNewLectureForm({ ...newLectureForm, title: e.target.value })}
                    placeholder="مثال: الاتزان الكيميائي والعوامل المؤثرة عليه"
                    className="w-full px-4 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-100 text-xs"
                  />
                </div>
              </div>

              {/* 4. Mandatory Description */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  4. وصف المحاضرة (إجباري) <span className="text-emerald-400">*</span>
                </label>
                <textarea
                  id="new-lec-desc"
                  required
                  rows={3}
                  value={newLectureForm.description}
                  onChange={(e) => setNewLectureForm({ ...newLectureForm, description: e.target.value })}
                  placeholder="في هذه المحاضرة سنتعرف على مفهوم الاتزان الكيميائي والعوامل المؤثرة عليه، مع حل مجموعة من الأمثلة والتطبيقات المهمة."
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-100 text-xs leading-relaxed placeholder:text-zinc-500"
                />
              </div>

              {/* 5. Resumable / Chunked Upload Progress Simulator (Section 14.3) */}
              <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 text-right">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                    <Upload className="w-4 h-4 text-emerald-400" />
                    5. رفع ملف المحاضرة / الفيديو (Chunked / Resumable Upload):
                  </span>
                  <span className="text-xs font-bold text-cyan-400">
                    {uploadProgress === 100 ? 'مكتمل ✅' : isUploading ? `${uploadProgress}%` : 'جاهز للرفع'}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-3 bg-zinc-800 rounded-full overflow-hidden mb-3">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300 rounded-full"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>

                {/* Stats */}
                <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-zinc-400 mb-4">
                  <span>
                    تم رفع {uploadUploadedGB} GB من {uploadTotalGB} GB
                  </span>
                  <span>السرعة: {uploadSpeed}</span>
                  <span>متبقي تقريبًا: {uploadRemainingTime}</span>
                </div>

                <div className="flex items-center gap-2">
                  {!isUploading && uploadProgress < 100 && (
                    <button
                      type="button"
                      id="btn-start-chunked-upload"
                      onClick={startChunkedUpload}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all flex items-center gap-1.5"
                    >
                      <Upload className="w-4 h-4" />
                      بدء رفع ملف الفيديو الضخم (4.2 GB)
                    </button>
                  )}
                  {isUploading && (
                    <button
                      type="button"
                      id="btn-cancel-upload"
                      onClick={cancelUpload}
                      className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-all"
                    >
                      إلغاء الرفع
                    </button>
                  )}
                  {uploadProgress === 100 && (
                    <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      تم رفع الفيديو والتحقق من سلامته بنجاح
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-zinc-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsNewLectureModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-zinc-700 bg-zinc-800 text-zinc-300 text-xs font-semibold"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  id="btn-confirm-publish-lecture"
                  onClick={handlePublishLecture}
                  disabled={uploadProgress < 100}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-800 disabled:text-zinc-500 disabled:cursor-not-allowed text-white text-xs font-bold shadow-lg shadow-emerald-950 transition-all flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  نشر المحاضرة والانتقال لإضافة الواجب
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: منشئ أسئلة الواجب (Section 15: إنشاء واجب المحاضرة)                   */}
      {/* ========================================================================= */}
      {isHwBuilderOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div
            className="relative w-full max-w-3xl my-8 bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-right animate-in zoom-in-95"
            id="hw-builder-modal-box"
          >
            <button
              id="btn-close-hw-builder"
              onClick={() => setIsHwBuilderOpen(false)}
              className="absolute top-5 left-5 text-zinc-400 hover:text-zinc-200 transition-colors p-1 rounded-lg hover:bg-zinc-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5 border-b border-zinc-800 pb-4">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-zinc-100">
                  إنشاء وإدارة واجب المحاضرة {builderLecture?.lectureNumber}
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  أضف الأسئلة وحدد الاختيار الصحيح لكل سؤال ثم اضغط نشر الواجب للطلاب
                </p>
              </div>
            </div>

            {/* Current Question Counter (Section 15.3) */}
            <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-between mb-5">
              <span className="text-xs font-bold text-zinc-300">
                عنوان الواجب: <strong className="text-emerald-400">{builderHwTitle}</strong>
              </span>
              <span className="text-xs font-bold text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">
                عدد الأسئلة الحالية: {builderQuestions.length}
              </span>
            </div>

            {/* Add New Question Box */}
            <div className="p-5 rounded-2xl bg-zinc-950/60 border border-zinc-800 mb-6 space-y-4">
              <h4 className="text-xs font-bold text-emerald-400">+ إضافة سؤال جديد للواجب</h4>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">نص السؤال</label>
                <input
                  id="input-q-text"
                  type="text"
                  value={currentQuestionText}
                  onChange={(e) => setCurrentQuestionText(e.target.value)}
                  placeholder="مثال: ما العامل الذي يؤدي إلى زيادة سرعة التفاعل؟"
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-100 text-xs"
                />
              </div>

              {/* 4 Choices & Selection of Correct One (Section 15.1 & 15.2) */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  الاختيارات الأربعة (اضغط على الدائرة لتحديد الإجابة الصحيحة):
                </label>
                {currentOptions.map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <button
                      type="button"
                      id={`radio-correct-opt-${idx}`}
                      onClick={() => setCurrentCorrectIdx(idx)}
                      className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                        currentCorrectIdx === idx
                          ? 'border-emerald-400 bg-emerald-500 text-zinc-950'
                          : 'border-zinc-600 bg-zinc-800'
                      }`}
                    >
                      {currentCorrectIdx === idx && <div className="w-2.5 h-2.5 rounded-full bg-zinc-950" />}
                    </button>
                    <input
                      id={`input-opt-${idx}`}
                      type="text"
                      value={opt}
                      onChange={(e) => {
                        const copy = [...currentOptions] as [string, string, string, string];
                        copy[idx] = e.target.value;
                        setCurrentOptions(copy);
                      }}
                      className={`flex-1 px-3 py-2 rounded-xl bg-zinc-800 border text-xs text-zinc-100 ${
                        currentCorrectIdx === idx ? 'border-emerald-500/80 bg-emerald-950/20' : 'border-zinc-700'
                      }`}
                    />
                    {currentCorrectIdx === idx && (
                      <span className="text-[11px] text-emerald-400 font-bold shrink-0">
                        ← الإجابة الصحيحة
                      </span>
                    )}
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  توضيح / سبب الإجابة الصحيحة (اختياري للطالب بعد الحل)
                </label>
                <input
                  id="input-q-explanation"
                  type="text"
                  value={currentExplanation}
                  onChange={(e) => setCurrentExplanation(e.target.value)}
                  placeholder="مثال: العامل الحفاز يقلل من طاقة التنشيط دون أن يتأثر"
                  className="w-full px-4 py-2 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-100 text-xs"
                />
              </div>

              <button
                type="button"
                id="btn-add-question-to-list"
                onClick={handleAddQuestionToBuilder}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                + إضافة هذا السؤال للواجب
              </button>
            </div>

            {/* List of Added Questions */}
            {builderQuestions.length > 0 && (
              <div className="space-y-3 mb-6 max-h-60 overflow-y-auto pr-1">
                <h4 className="text-xs font-bold text-zinc-300">الأسئلة المضافة ({builderQuestions.length}):</h4>
                {builderQuestions.map((q, idx) => (
                  <div
                    key={q.id}
                    className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 flex items-start justify-between gap-3 text-xs"
                  >
                    <div>
                      <span className="font-bold text-emerald-400 block mb-1">
                        السؤال {idx + 1}: {q.questionText}
                      </span>
                      <span className="text-zinc-400">
                        الإجابة الصحيحة: {q.options[q.correctOptionIndex]}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setBuilderQuestions(builderQuestions.filter((item) => item.id !== q.id))
                      }
                      className="text-red-400 hover:text-red-300 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Final Publish Button (Section 15.4) */}
            <div className="pt-4 border-t border-zinc-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsHwBuilderOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-zinc-700 bg-zinc-800 text-zinc-300 text-xs font-semibold"
              >
                إلغاء
              </button>
              <button
                type="button"
                id="btn-publish-homework-to-students"
                onClick={handleSaveHomework}
                disabled={builderQuestions.length === 0}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-40 text-white text-xs font-bold shadow-lg shadow-emerald-950 transition-all flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                حفظ ونشر الواجب للطلاب
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Lecture Watch WhatsApp (Section 13.6) */}
      <ConfirmModal
        isOpen={whatsAppModalOpen}
        title="إرسال رسالة لولي الأمر؟"
        description={`سيتم فتح WhatsApp وتجهيز الرسالة، ويمكنك مراجعتها قبل إرسالها.\n\nنص الرسالة المجهز:\n${pendingWhatsAppTarget?.messageText || ''}`}
        confirmLabel="فتح WhatsApp"
        cancelLabel="إلغاء"
        variant="whatsapp"
        onConfirm={handleConfirmWhatsAppOpen}
        onCancel={() => {
          setWhatsAppModalOpen(false);
          setPendingWhatsAppTarget(null);
        }}
      />

      {/* Confirmation Modal for Grade WhatsApp (Section 18.1) */}
      <ConfirmModal
        isOpen={gradeWhatsAppModalOpen}
        title="إرسال الدرجة لولي الأمر؟"
        description={`سيتم فتح WhatsApp وتجهيز الرسالة، ويمكنك مراجعتها قبل إرسالها.\n\nنص الرسالة المجهز:\n${pendingGradeWhatsApp?.messageText || ''}`}
        confirmLabel="فتح WhatsApp"
        cancelLabel="إلغاء"
        variant="whatsapp"
        onConfirm={handleConfirmGradeWhatsApp}
        onCancel={() => {
          setGradeWhatsAppModalOpen(false);
          setPendingGradeWhatsApp(null);
        }}
      />
    </div>
  );
};
