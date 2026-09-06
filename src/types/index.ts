export type Grade = 
  | 'الصف الثالث الإعدادي'
  | 'الصف الأول الثانوي'
  | 'الصف الثاني الثانوي'
  | 'الصف الثالث الثانوي';

export const GRADES_LIST: Grade[] = [
  'الصف الثالث الإعدادي',
  'الصف الأول الثانوي',
  'الصف الثاني الثانوي',
  'الصف الثالث الثانوي',
];

export interface Student {
  id: string;
  username: string;
  name: string;
  passwordHash: string;
  plainPasswordForAdminHistory?: string; // used when admin generates/resets password to copy
  nationalId: string;
  studentPhone: string;
  parentPhone: string;
  grade: Grade;
  createdAt: string;
}

export interface Question {
  id: string;
  questionText: string;
  options: [string, string, string, string];
  correctOptionIndex: number; // 0, 1, 2, 3
  explanation?: string;
}

export interface Homework {
  id: string;
  lectureId: string;
  title: string;
  questions: Question[];
  createdAt: string;
  published: boolean;
}

export interface Lecture {
  id: string;
  grade: Grade;
  lectureNumber: number;
  title: string;
  description: string;
  videoUrl: string;
  videoFileName: string;
  fileSize: string;
  durationMinutes: number;
  createdAt: string;
}

export interface WatchRecord {
  id: string;
  studentId: string;
  lectureId: string;
  watchPercentage: number; // 0 to 100
  lastWatchedAt: string;
  completed: boolean; // >= 90%
}

export interface HomeworkSubmission {
  id: string;
  homeworkId: string;
  lectureId: string;
  studentId: string;
  studentName: string;
  grade: Grade;
  answers: Record<string, number>; // questionId -> chosenOptionIndex
  correctCount: number;
  wrongCount: number;
  unansweredCount: number;
  totalQuestions: number;
  scorePercentage: number;
  submittedAt: string;
}

export interface PasswordResetRequest {
  id: string;
  username: string;
  nationalId: string;
  studentPhone: string;
  parentPhone: string;
  requestedAt: string;
  status: 'pending' | 'resolved' | 'rejected';
  resolvedAt?: string;
  newPasswordSet?: string;
}

export interface PasswordChangeLog {
  id: string;
  username: string;
  changedAt: string;
  changedBy: string;
  status: string;
  newPassword: string;
}

export interface ParentCommunicationLog {
  id: string;
  studentId: string;
  studentName: string;
  parentPhone: string;
  messageType: 'حضور المحاضرة' | 'غياب عن المحاضرة' | 'درجة الواجب';
  lectureTitle: string;
  sentAt: string;
  teacherName: string;
  status: string; // 'تم فتح WhatsApp وتجهيز الرسالة'
  messageContent: string;
}

export interface CurrentUser {
  role: 'student' | 'teacher';
  studentData?: Student;
  teacherName?: string;
}
