import React, { useState, useEffect, useRef } from 'react';
import {
  Student,
  Lecture,
  Homework,
  WatchRecord,
  HomeworkSubmission,
  Question,
} from '../../types';
import { AppStorage } from '../../utils/storage';
import {
  Play,
  CheckCircle2,
  Clock,
  BookOpen,
  Award,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Send,
  FileCheck,
  RotateCcw,
  Sparkles,
  Maximize2,
  Check,
  Video,
  ExternalLink,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ConfirmModal } from '../ConfirmModal';

interface StudentPortalProps {
  student: Student;
  onShowToast?: (type: 'success' | 'error' | 'warning' | 'info', title: string, message?: string) => void;
}

export const StudentPortal: React.FC<StudentPortalProps> = ({ student, onShowToast }) => {
  const showToast = onShowToast || (() => {});
  const [activeTab, setActiveTab] = useState<'lectures' | 'homeworks' | 'grades'>('lectures');
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [homeworks, setHomeworks] = useState<Homework[]>([]);
  const [watchRecords, setWatchRecords] = useState<WatchRecord[]>([]);
  const [submissions, setSubmissions] = useState<HomeworkSubmission[]>([]);

  // Active video player state
  const [activeLecture, setActiveLecture] = useState<Lecture | null>(null);
  const [activeWatchPct, setActiveWatchPct] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Active homework solving state
  const [activeHomework, setActiveHomework] = useState<Homework | null>(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [studentAnswers, setStudentAnswers] = useState<Record<string, number>>({});
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [viewingResultSubmission, setViewingResultSubmission] = useState<HomeworkSubmission | null>(null);

  // Homework filter
  const [hwFilter, setHwFilter] = useState<'all' | 'pending' | 'completed'>('all');

  const reloadData = () => {
    // Strictly filter lectures ONLY by the student's grade!
    const allLecs = AppStorage.getLectures();
    const gradeLecs = allLecs.filter((l) => l.grade === student.grade);
    // Sort by lecture number descending
    gradeLecs.sort((a, b) => b.lectureNumber - a.lectureNumber);
    setLectures(gradeLecs);

    const allHws = AppStorage.getHomeworks();
    const gradeHwLectureIds = new Set(gradeLecs.map((l) => l.id));
    const gradeHws = allHws.filter((h) => gradeHwLectureIds.has(h.lectureId) && h.published);
    setHomeworks(gradeHws);

    const allWatches = AppStorage.getWatchRecords().filter((w) => w.studentId === student.id);
    setWatchRecords(allWatches);

    const allSubs = AppStorage.getSubmissions().filter((s) => s.studentId === student.id);
    setSubmissions(allSubs);
  };

  useEffect(() => {
    reloadData();
    const handleUpdate = () => reloadData();
    window.addEventListener('storage-updated', handleUpdate);
    return () => window.removeEventListener('storage-updated', handleUpdate);
  }, [student.id, student.grade]);

  // Set initial active lecture
  useEffect(() => {
    if (lectures.length > 0 && !activeLecture) {
      openLecture(lectures[0]);
    }
  }, [lectures]);

  const openLecture = (lec: Lecture) => {
    setActiveLecture(lec);
    const existingRec = watchRecords.find((w) => w.lectureId === lec.id);
    const pct = existingRec ? existingRec.watchPercentage : 0;
    setActiveWatchPct(pct);
  };

  // Video progress tracking
  const handleVideoTimeUpdate = () => {
    if (!videoRef.current || !activeLecture) return;
    const duration = videoRef.current.duration;
    const currentTime = videoRef.current.currentTime;
    if (duration > 0) {
      const calculatedPct = Math.min(100, Math.round((currentTime / duration) * 100));
      if (calculatedPct > activeWatchPct) {
        setActiveWatchPct(calculatedPct);
        AppStorage.updateWatchRecord(student.id, activeLecture.id, calculatedPct);
        if (calculatedPct >= 90 && activeWatchPct < 90) {
          showToast('success', 'أحسنت! تم إتمام مشاهدة المحاضرة', 'تم تسجيل حضورك في المحاضرة بنسبة تفوق 90%');
        }
      }
    }
  };

  // Quick action to simulate watching video for rapid testing
  const handleQuickWatch = (pct: number) => {
    if (!activeLecture) return;
    setActiveWatchPct(pct);
    AppStorage.updateWatchRecord(student.id, activeLecture.id, pct);
    if (pct >= 90) {
      showToast('success', 'تم تسجيل مشاهدة المحاضرة', `نسبة المشاهدة الحالية: ${pct}% (شاهد المحاضرة ✅)`);
    } else {
      showToast('info', 'تم تحديث نسبة المشاهدة', `نسبة المشاهدة: ${pct}% (تحتاج 90% لتسجيل الإتمام)`);
    }
  };

  // Starting a homework
  const startHomework = (hw: Homework) => {
    setActiveHomework(hw);
    setCurrentQuestionIdx(0);
    // Load saved in-progress answers if any
    const saved = localStorage.getItem(`draft_hw_${hw.id}_${student.id}`);
    if (saved) {
      try {
        setStudentAnswers(JSON.parse(saved));
      } catch {
        setStudentAnswers({});
      }
    } else {
      setStudentAnswers({});
    }
  };

  // Answering a question
  const selectOption = (questionId: string, optionIdx: number) => {
    if (!activeHomework) return;
    const updated = { ...studentAnswers, [questionId]: optionIdx };
    setStudentAnswers(updated);
    // Save draft
    localStorage.setItem(`draft_hw_${activeHomework.id}_${student.id}`, JSON.stringify(updated));
  };

  // Submitting homework
  const handleFinalSubmitHomework = () => {
    if (!activeHomework) return;

    let correct = 0;
    let wrong = 0;
    let unanswered = 0;

    activeHomework.questions.forEach((q) => {
      const ans = studentAnswers[q.id];
      if (ans === undefined) {
        unanswered++;
      } else if (ans === q.correctOptionIndex) {
        correct++;
      } else {
        wrong++;
      }
    });

    const total = activeHomework.questions.length;
    const scorePct = total > 0 ? Math.round((correct / total) * 100) : 0;

    const submission: HomeworkSubmission = {
      id: 'sub_' + Date.now(),
      homeworkId: activeHomework.id,
      lectureId: activeHomework.lectureId,
      studentId: student.id,
      studentName: student.name,
      grade: student.grade,
      answers: studentAnswers,
      correctCount: correct,
      wrongCount: wrong,
      unansweredCount: unanswered,
      totalQuestions: total,
      scorePercentage: scorePct,
      submittedAt: new Date().toISOString(),
    };

    AppStorage.saveSubmission(submission);
    localStorage.removeItem(`draft_hw_${activeHomework.id}_${student.id}`);
    setIsSubmitModalOpen(false);
    setViewingResultSubmission(submission);

    if (scorePct >= 80) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
      showToast('success', 'ممتاز جداً!', `حصلت على ${correct} من ${total} بنسبة ${scorePct}%`);
    } else {
      showToast('info', 'تم تسليم الواجب', `درجتك: ${correct} من ${total} بنسبة ${scorePct}%`);
    }
  };

  // Find submission for a homework
  const getHomeworkSubmission = (homeworkId: string) => {
    return submissions.find((s) => s.homeworkId === homeworkId);
  };

  // Get watch status helper
  const getWatchStatus = (lectureId: string) => {
    const rec = watchRecords.find((w) => w.lectureId === lectureId);
    if (!rec || rec.watchPercentage === 0) {
      return { completed: false, percentage: 0, label: 'لم يشاهد 0%' };
    }
    if (rec.watchPercentage >= 90) {
      return { completed: true, percentage: rec.watchPercentage, label: `شاهد المحاضرة (${rec.watchPercentage}%)` };
    }
    return { completed: false, percentage: rec.watchPercentage, label: `شاهد ${rec.watchPercentage}%` };
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Student Welcome Banner */}
      <div className="bg-gradient-to-l from-zinc-900 via-zinc-900 to-zinc-950 border border-zinc-800 rounded-3xl p-6 mb-8 shadow-xl relative overflow-hidden">
        <div className="absolute -top-12 -left-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {student.grade}
              </span>
              <span className="text-xs text-zinc-400">اسم المستخدم: @{student.username}</span>
            </div>
            <h1 className="text-2xl font-black text-zinc-100">أهلاً بك يا {student.name}</h1>
            <p className="text-xs text-zinc-400 mt-1">
              جميع المحاضرات والواجبات المعروضة مخصصة لصفك الدراسي ({student.grade}).
            </p>
          </div>

          {/* Quick tabs */}
          <div className="flex items-center gap-2 bg-zinc-950/80 p-1.5 rounded-2xl border border-zinc-800 self-start md:self-auto">
            <button
              id="student-tab-lectures"
              onClick={() => {
                setActiveTab('lectures');
                setActiveHomework(null);
                setViewingResultSubmission(null);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'lectures' && !activeHomework && !viewingResultSubmission
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Video className="w-4 h-4" />
              المحاضرات ({lectures.length})
            </button>
            <button
              id="student-tab-homeworks"
              onClick={() => {
                setActiveTab('homeworks');
                setActiveHomework(null);
                setViewingResultSubmission(null);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'homeworks' || activeHomework || viewingResultSubmission
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              الواجبات ({homeworks.length})
            </button>
            <button
              id="student-tab-grades"
              onClick={() => {
                setActiveTab('grades');
                setActiveHomework(null);
                setViewingResultSubmission(null);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'grades'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Award className="w-4 h-4" />
              درجاتي ({submissions.length})
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. LECTURES TAB                                                          */}
      {/* ========================================================================= */}
      {activeTab === 'lectures' && !activeHomework && !viewingResultSubmission && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Video Player (Left/Center) */}
          <div className="lg:col-span-2 space-y-4">
            {activeLecture ? (
              <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 shadow-xl">
                {/* Video container */}
                <div className="relative aspect-video rounded-2xl overflow-hidden bg-black border border-zinc-800 shadow-inner group">
                  <video
                    ref={videoRef}
                    id="student-lecture-video"
                    src={activeLecture.videoUrl}
                    controls
                    onTimeUpdate={handleVideoTimeUpdate}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    className="w-full h-full object-cover"
                  />
                  {/* Subtle watermarked chemistry branding */}
                  <div className="absolute top-3 right-3 bg-zinc-950/80 backdrop-blur-md px-3 py-1 rounded-lg border border-zinc-800 text-[11px] font-bold text-emerald-400 pointer-events-none">
                    أستاذ الكيمياء • {student.grade}
                  </div>
                </div>

                {/* Video Watch Progress Tracker Banner */}
                <div className="mt-4 p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-semibold text-zinc-300 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-cyan-400" />
                        نسبة مشاهدة المحاضرة:
                      </span>
                      <span
                        className={`font-extrabold ${
                          activeWatchPct >= 90 ? 'text-emerald-400' : 'text-amber-400'
                        }`}
                      >
                        {activeWatchPct}% {activeWatchPct >= 90 ? '✅ مكتمل' : '⚠️ غير مكتمل'}
                      </span>
                    </div>
                    {/* Progress bar */}
                    <div className="w-full h-2.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 rounded-full ${
                          activeWatchPct >= 90
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                            : 'bg-gradient-to-r from-amber-500 to-orange-400'
                        }`}
                        style={{ width: `${activeWatchPct}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-zinc-500 mt-1.5">
                      * يتم تسجيل المحاضرة كمشاهدة رسمياً عند وصول النسبة إلى 90% أو أكثر.
                    </p>
                  </div>

                  {/* Simulator buttons for testing convenience */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      id="btn-simulate-complete-watch"
                      onClick={() => handleQuickWatch(100)}
                      className="px-3 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-bold transition-all"
                    >
                      شاهَد 100% ✅
                    </button>
                    <button
                      type="button"
                      id="btn-simulate-partial-watch"
                      onClick={() => handleQuickWatch(65)}
                      className="px-3 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-bold transition-all"
                    >
                      شاهَد 65% ⚠️
                    </button>
                  </div>
                </div>

                {/* Lecture details */}
                <div className="mt-5">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 mb-1">
                    <span>المحاضرة رقم {activeLecture.lectureNumber}</span>
                    <span>•</span>
                    <span className="text-zinc-400">{activeLecture.durationMinutes} دقيقة</span>
                    <span>•</span>
                    <span className="text-zinc-400">{activeLecture.fileSize}</span>
                  </div>
                  <h2 className="text-xl font-bold text-zinc-100 mb-2">{activeLecture.title}</h2>
                  <p className="text-xs text-zinc-300 leading-relaxed bg-zinc-950/40 p-3 rounded-xl border border-zinc-800/60">
                    {activeLecture.description}
                  </p>

                  {/* Related Homework CTA */}
                  {(() => {
                    const relatedHw = homeworks.find((h) => h.lectureId === activeLecture.id);
                    const sub = relatedHw ? getHomeworkSubmission(relatedHw.id) : undefined;
                    if (relatedHw) {
                      return (
                        <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 to-teal-950/30 border border-emerald-500/30 flex items-center justify-between">
                          <div>
                            <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                              <BookOpen className="w-4 h-4 text-emerald-400" />
                              واجب المحاضرة {activeLecture.lectureNumber}
                            </span>
                            <p className="text-xs text-zinc-300 mt-0.5">
                              {relatedHw.title} ({relatedHw.questions.length} سؤال)
                            </p>
                          </div>
                          {sub ? (
                            <button
                              id="btn-view-lec-hw-result"
                              onClick={() => setViewingResultSubmission(sub)}
                              className="px-4 py-2 rounded-xl bg-emerald-600/30 border border-emerald-500/40 text-emerald-200 text-xs font-bold hover:bg-emerald-600/40 transition-all"
                            >
                              عرض النتيجة ({sub.scorePercentage}%)
                            </button>
                          ) : (
                            <button
                              id="btn-start-lec-hw"
                              onClick={() => startHomework(relatedHw)}
                              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-950 transition-all"
                            >
                              ابدأ الواجب الآن
                            </button>
                          )}
                        </div>
                      );
                    }
                    return null;
                  })()}
                </div>
              </div>
            ) : (
              <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-12 text-center text-zinc-400">
                لا توجد محاضرات متاحة حالياً لهذا الصف
              </div>
            )}
          </div>

          {/* Lectures List Sidebar (Right) */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-zinc-300 flex items-center gap-2">
              <Video className="w-4 h-4 text-emerald-400" />
              محاضرات {student.grade} ({lectures.length})
            </h3>

            <div className="space-y-2.5">
              {lectures.map((lec) => {
                const status = getWatchStatus(lec.id);
                const isSelected = activeLecture?.id === lec.id;
                return (
                  <div
                    key={lec.id}
                    id={`student-lecture-item-${lec.id}`}
                    onClick={() => openLecture(lec)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer text-right relative overflow-hidden ${
                      isSelected
                        ? 'bg-zinc-800/90 border-emerald-500/80 shadow-lg shadow-emerald-950/20'
                        : 'bg-zinc-900/70 border-zinc-800 hover:bg-zinc-850 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <span className="text-xs font-bold text-emerald-400">
                        المحاضرة {lec.lectureNumber}
                      </span>
                      <span
                        className={`text-[11px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 ${
                          status.completed
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : status.percentage > 0
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                        }`}
                      >
                        {status.completed && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                        {status.label}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-zinc-100 line-clamp-1 mb-1">{lec.title}</h4>
                    <p className="text-xs text-zinc-400 line-clamp-2">{lec.description}</p>

                    {/* Progress mini bar */}
                    <div className="w-full h-1 bg-zinc-800 rounded-full mt-3 overflow-hidden">
                      <div
                        className={`h-full ${status.completed ? 'bg-emerald-500' : 'bg-amber-500'}`}
                        style={{ width: `${status.percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. HOMEWORKS TAB: List of Homeworks                                       */}
      {/* ========================================================================= */}
      {activeTab === 'homeworks' && !activeHomework && !viewingResultSubmission && (
        <div className="space-y-6">
          {/* Homework Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900 border border-zinc-800 p-4 rounded-2xl">
            <div>
              <h2 className="text-lg font-bold text-zinc-100">واجبات {student.grade}</h2>
              <p className="text-xs text-zinc-400 mt-0.5">حل الواجبات المتراكمة والمحاضرات الحالية لمتابعة مستواك</p>
            </div>
            <div className="flex items-center gap-1.5 bg-zinc-950 p-1 rounded-xl border border-zinc-800">
              <button
                id="filter-hw-all"
                onClick={() => setHwFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  hwFilter === 'all' ? 'bg-zinc-800 text-emerald-400' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                الكل ({homeworks.length})
              </button>
              <button
                id="filter-hw-pending"
                onClick={() => setHwFilter('pending')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  hwFilter === 'pending' ? 'bg-zinc-800 text-amber-400' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                غير مكتملة
              </button>
              <button
                id="filter-hw-completed"
                onClick={() => setHwFilter('completed')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  hwFilter === 'completed' ? 'bg-zinc-800 text-emerald-400' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                المكتملة
              </button>
            </div>
          </div>

          {/* Homework cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {homeworks
              .filter((hw) => {
                const isDone = !!getHomeworkSubmission(hw.id);
                if (hwFilter === 'pending') return !isDone;
                if (hwFilter === 'completed') return isDone;
                return true;
              })
              .map((hw) => {
                const sub = getHomeworkSubmission(hw.id);
                const isDone = !!sub;
                const relatedLecture = lectures.find((l) => l.id === hw.lectureId);

                return (
                  <div
                    key={hw.id}
                    id={`student-hw-card-${hw.id}`}
                    className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 shadow-lg flex flex-col justify-between hover:border-zinc-700 transition-all text-right relative overflow-hidden"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="text-xs font-extrabold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                          {relatedLecture ? `المحاضرة ${relatedLecture.lectureNumber}` : 'واجب'}
                        </span>
                        <span
                          className={`text-xs px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1 ${
                            isDone
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}
                        >
                          {isDone ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              تم الحل ({sub.scorePercentage}%)
                            </>
                          ) : (
                            <>
                              <Clock className="w-3.5 h-3.5 text-amber-400" />
                              غير مكتمل
                            </>
                          )}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-zinc-100 mb-2">{hw.title}</h3>
                      <div className="text-xs text-zinc-400 mb-4 flex items-center gap-3">
                        <span>📝 {hw.questions.length} سؤال</span>
                        <span>•</span>
                        <span>{relatedLecture?.title || 'محتوى المحاضرة'}</span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-zinc-800/80">
                      {isDone ? (
                        <button
                          id={`btn-view-result-${hw.id}`}
                          onClick={() => setViewingResultSubmission(sub)}
                          className="w-full py-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-xs font-bold transition-all flex items-center justify-center gap-2"
                        >
                          <Award className="w-4 h-4" />
                          عرض النتيجة ({sub.correctCount} / {sub.totalQuestions})
                        </button>
                      ) : (
                        <button
                          id={`btn-start-hw-${hw.id}`}
                          onClick={() => startHomework(hw)}
                          className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-950 transition-all flex items-center justify-center gap-2"
                        >
                          <BookOpen className="w-4 h-4" />
                          ابدأ الواجب
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>

          {homeworks.length === 0 && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-12 text-center text-zinc-400">
              لا توجد واجبات منشورة حالياً لهذا الصف
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* ACTIVE HOMEWORK SOLVING INTERFACE                                         */}
      {/* ========================================================================= */}
      {activeHomework && !viewingResultSubmission && (
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Header Bar */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 shadow-xl flex items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-emerald-400">واجب تفاعلي</span>
              <h2 className="text-lg font-bold text-zinc-100">{activeHomework.title}</h2>
            </div>
            <button
              id="btn-exit-hw"
              onClick={() => {
                if (window.confirm('هل تريد مغادرة الواجب؟ سيتم حفظ إجاباتك كمسودة.')) {
                  setActiveHomework(null);
                }
              }}
              className="px-3.5 py-1.5 rounded-xl border border-zinc-700 bg-zinc-800/80 text-xs font-medium text-zinc-300 hover:text-zinc-100"
            >
              حفظ وخروج
            </button>
          </div>

          {/* Progress Indicator */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-bold text-zinc-200">
                السؤال {currentQuestionIdx + 1} من {activeHomework.questions.length}
              </span>
              <span className="text-zinc-400">
                المجاب: {Object.keys(studentAnswers).length} من {activeHomework.questions.length}
              </span>
            </div>
            <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 transition-all duration-300 rounded-full"
                style={{
                  width: `${((currentQuestionIdx + 1) / activeHomework.questions.length) * 100}%`,
                }}
              />
            </div>

            {/* Questions Step Buttons */}
            <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-zinc-800/60">
              {activeHomework.questions.map((q, idx) => {
                const isAnswered = studentAnswers[q.id] !== undefined;
                const isCurrent = currentQuestionIdx === idx;
                return (
                  <button
                    key={q.id}
                    id={`btn-hw-step-${idx}`}
                    onClick={() => setCurrentQuestionIdx(idx)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                      isCurrent
                        ? 'bg-emerald-500 text-zinc-950 ring-2 ring-emerald-400'
                        : isAnswered
                        ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/40'
                        : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Current Question Card */}
          {(() => {
            const q = activeHomework.questions[currentQuestionIdx];
            if (!q) return null;
            const chosenOption = studentAnswers[q.id];

            return (
              <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-xl text-right">
                <div className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-zinc-800 text-zinc-300 mb-4 border border-zinc-700">
                  السؤال {currentQuestionIdx + 1}
                </div>

                <h3 className="text-base sm:text-lg font-bold text-zinc-100 leading-relaxed mb-6">
                  {q.questionText}
                </h3>

                {/* 4 Choices */}
                <div className="space-y-3">
                  {q.options.map((opt, optIdx) => {
                    const isSelected = chosenOption === optIdx;
                    return (
                      <div
                        key={optIdx}
                        id={`option-${q.id}-${optIdx}`}
                        onClick={() => selectOption(q.id, optIdx)}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                          isSelected
                            ? 'bg-emerald-500/15 border-emerald-500 text-emerald-100 shadow-md shadow-emerald-950/30'
                            : 'bg-zinc-800/50 border-zinc-700/80 text-zinc-300 hover:bg-zinc-800 hover:border-zinc-600'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${
                              isSelected
                                ? 'bg-emerald-500 text-zinc-950 font-black'
                                : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                            }`}
                          >
                            {String.fromCharCode(1571 + optIdx)}
                          </span>
                          <span className="text-sm font-medium">{opt}</span>
                        </div>
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                            isSelected ? 'border-emerald-400 bg-emerald-500' : 'border-zinc-600'
                          }`}
                        >
                          {isSelected && <div className="w-2 h-2 rounded-full bg-zinc-950" />}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Navigation Buttons: Previous / Next / Submit */}
                <div className="flex items-center justify-between gap-3 mt-8 pt-6 border-t border-zinc-800">
                  <button
                    id="btn-prev-question"
                    disabled={currentQuestionIdx === 0}
                    onClick={() => setCurrentQuestionIdx((p) => Math.max(0, p - 1))}
                    className="px-5 py-2.5 rounded-xl border border-zinc-700 bg-zinc-800/80 hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed text-zinc-300 text-xs font-bold transition-all flex items-center gap-2"
                  >
                    <ChevronRight className="w-4 h-4" />
                    السؤال السابق
                  </button>

                  {currentQuestionIdx < activeHomework.questions.length - 1 ? (
                    <button
                      id="btn-next-question"
                      onClick={() => setCurrentQuestionIdx((p) => Math.min(activeHomework.questions.length - 1, p + 1))}
                      className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-950 transition-all flex items-center gap-2"
                    >
                      السؤال التالي
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      id="btn-open-submit-modal"
                      onClick={() => setIsSubmitModalOpen(true)}
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black shadow-lg shadow-emerald-950 transition-all flex items-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                      تسليم الواجب
                    </button>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* ========================================================================= */}
      {/* RESULT & CORRECTION VIEW                                                 */}
      {/* ========================================================================= */}
      {viewingResultSubmission && (
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Result Score Card */}
          <div className="bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-center relative overflow-hidden">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center text-3xl font-black mb-4 shadow-lg shadow-emerald-950/40">
              🎯
            </div>

            <h2 className="text-2xl font-black text-zinc-100 mb-1">نتيجتك في الواجب</h2>
            <p className="text-xs text-zinc-400 mb-6">
              تم تصحيح إجاباتك تلقائياً بمقارنتها بنموذج إجابة أستاذ الكيمياء
            </p>

            {/* Score Big Display */}
            <div className="inline-flex items-center gap-4 bg-zinc-950/80 px-6 py-4 rounded-2xl border border-zinc-800 mb-6">
              <div className="text-right">
                <span className="text-xs text-zinc-400 block">الدرجة النهائية:</span>
                <span className="text-3xl font-black text-emerald-400">
                  {viewingResultSubmission.correctCount} / {viewingResultSubmission.totalQuestions}
                </span>
              </div>
              <div className="h-10 w-px bg-zinc-800" />
              <div className="text-right">
                <span className="text-xs text-zinc-400 block">النسبة المئوية:</span>
                <span className="text-3xl font-black text-cyan-400">
                  {viewingResultSubmission.scorePercentage}%
                </span>
              </div>
            </div>

            {/* Breakdown stats */}
            <div className="grid grid-cols-3 gap-3 max-w-md mx-auto mb-6">
              <div className="bg-emerald-950/40 border border-emerald-500/30 p-3 rounded-xl">
                <span className="text-xs text-emerald-300 block mb-1">إجابات صحيحة</span>
                <span className="text-lg font-bold text-emerald-400">
                  {viewingResultSubmission.correctCount} ✅
                </span>
              </div>
              <div className="bg-red-950/40 border border-red-500/30 p-3 rounded-xl">
                <span className="text-xs text-red-300 block mb-1">إجابات خاطئة</span>
                <span className="text-lg font-bold text-red-400">
                  {viewingResultSubmission.wrongCount} ❌
                </span>
              </div>
              <div className="bg-zinc-800/60 border border-zinc-700/60 p-3 rounded-xl">
                <span className="text-xs text-zinc-400 block mb-1">غير مجاب</span>
                <span className="text-lg font-bold text-zinc-300">
                  {viewingResultSubmission.unansweredCount}
                </span>
              </div>
            </div>

            <button
              id="btn-back-from-result"
              onClick={() => {
                setViewingResultSubmission(null);
                setActiveHomework(null);
                setActiveTab('homeworks');
              }}
              className="px-6 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold transition-all"
            >
              العودة لقائمة الواجبات
            </button>
          </div>

          {/* Detailed Question Review */}
          {(() => {
            const hw = homeworks.find((h) => h.id === viewingResultSubmission.homeworkId);
            if (!hw) return null;

            return (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-zinc-200 flex items-center gap-2">
                  <FileCheck className="w-5 h-5 text-emerald-400" />
                  مراجعة تفصيلية للإجابات
                </h3>

                {hw.questions.map((q, idx) => {
                  const studentChoice = viewingResultSubmission.answers[q.id];
                  const isCorrect = studentChoice === q.correctOptionIndex;
                  const isUnanswered = studentChoice === undefined;

                  return (
                    <div
                      key={q.id}
                      className={`p-5 rounded-2xl border text-right transition-all ${
                        isCorrect
                          ? 'bg-zinc-900 border-emerald-500/40'
                          : 'bg-zinc-900 border-red-500/40'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold text-zinc-400">السؤال {idx + 1}</span>
                        <span
                          className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                            isCorrect
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'bg-red-500/20 text-red-300'
                          }`}
                        >
                          {isCorrect ? 'إجابة صحيحة ✅' : isUnanswered ? 'لم تتم الإجابة ⚠️' : 'إجابة خاطئة ❌'}
                        </span>
                      </div>

                      <p className="text-sm font-bold text-zinc-100 mb-4">{q.questionText}</p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                        {q.options.map((opt, optIdx) => {
                          const isTheCorrectOne = optIdx === q.correctOptionIndex;
                          const isStudentPicked = optIdx === studentChoice;

                          let itemClass = 'bg-zinc-950/60 border-zinc-800 text-zinc-400';
                          if (isTheCorrectOne) {
                            itemClass = 'bg-emerald-500/15 border-emerald-500/60 text-emerald-200 font-bold';
                          } else if (isStudentPicked && !isCorrect) {
                            itemClass = 'bg-red-500/15 border-red-500/60 text-red-200 font-bold';
                          }

                          return (
                            <div
                              key={optIdx}
                              className={`p-3 rounded-xl border text-xs flex items-center justify-between ${itemClass}`}
                            >
                              <span>{opt}</span>
                              {isTheCorrectOne && <span className="text-[10px] text-emerald-400 font-bold">(الصحيحة)</span>}
                              {isStudentPicked && !isTheCorrectOne && (
                                <span className="text-[10px] text-red-400 font-bold">(إجابتك)</span>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {q.explanation && (
                        <div className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800 text-xs text-zinc-300">
                          <strong className="text-emerald-400">توضيح أستاذ الكيمياء:</strong> {q.explanation}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. GRADES TAB                                                             */}
      {/* ========================================================================= */}
      {activeTab === 'grades' && !activeHomework && !viewingResultSubmission && (
        <div className="space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-xl">
            <h2 className="text-lg font-bold text-zinc-100 mb-1">سجل درجاتي ومستواي الأكاديمي</h2>
            <p className="text-xs text-zinc-400 mb-6">
              يتم مشاركة هذه الدرجات تلقائياً مع ولي الأمر لمتابعة تقدمك المستمر
            </p>

            {submissions.length > 0 ? (
              <div className="space-y-3">
                {submissions.map((sub) => {
                  const hw = homeworks.find((h) => h.id === sub.homeworkId);
                  const lec = lectures.find((l) => l.id === sub.lectureId);

                  return (
                    <div
                      key={sub.id}
                      className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-right"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold text-emerald-400">
                            {lec ? `المحاضرة ${lec.lectureNumber}` : 'واجب'}
                          </span>
                          <span className="text-xs text-zinc-400">
                            {new Date(sub.submittedAt).toLocaleDateString('ar-EG')}
                          </span>
                        </div>
                        <h3 className="text-sm font-bold text-zinc-100">{hw?.title || 'واجب كيمياء'}</h3>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-left">
                          <span className="text-xs text-zinc-400 block">الدرجة</span>
                          <span className="text-base font-extrabold text-emerald-400">
                            {sub.correctCount} / {sub.totalQuestions} ({sub.scorePercentage}%)
                          </span>
                        </div>
                        <button
                          id={`btn-review-grade-${sub.id}`}
                          onClick={() => setViewingResultSubmission(sub)}
                          className="px-3.5 py-1.5 rounded-xl border border-zinc-700 bg-zinc-800 text-xs font-bold text-zinc-200 hover:bg-zinc-700 transition-all"
                        >
                          مراجعة الإجابات
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-zinc-500 text-xs">
                لم تقم بحل أي واجبات بعد. توجه إلى قسم الواجبات وابدأ الحل الآن!
              </div>
            )}
          </div>
        </div>
      )}

      {/* Confirmation Modal Before Homework Submit (Specification #16.3) */}
      <ConfirmModal
        isOpen={isSubmitModalOpen}
        title="تأكيد تسليم الواجب النهائي"
        description={`هل أنت متأكد من تسليم الواجب؟\nبعد التسليم لن تتمكن من تعديل إجاباتك.\n\nلقد قمت بحل ${
          Object.keys(studentAnswers).length
        } من إجمالي ${activeHomework?.questions.length || 0} سؤال.`}
        confirmLabel="تسليم الواجب"
        cancelLabel="إلغاء"
        variant="primary"
        onConfirm={handleFinalSubmitHomework}
        onCancel={() => setIsSubmitModalOpen(false)}
      />
    </div>
  );
};
