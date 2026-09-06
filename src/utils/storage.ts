import {
  Student,
  Lecture,
  Homework,
  WatchRecord,
  HomeworkSubmission,
  PasswordResetRequest,
  PasswordChangeLog,
  ParentCommunicationLog,
} from '../types';
import { hashPassword } from './security';

const STORAGE_KEYS = {
  STUDENTS: 'chem_platform_students',
  LECTURES: 'chem_platform_lectures',
  HOMEWORKS: 'chem_platform_homeworks',
  WATCH_RECORDS: 'chem_platform_watch_records',
  SUBMISSIONS: 'chem_platform_submissions',
  RESET_REQUESTS: 'chem_platform_reset_requests',
  PASSWORD_LOGS: 'chem_platform_password_logs',
  PARENT_LOGS: 'chem_platform_parent_logs',
  SESSION: 'chem_platform_session',
};

// Initial realistic students
const INITIAL_STUDENTS: Student[] = [
  {
    id: 'std_1',
    username: 'ahmed_chem',
    name: 'أحمد محمد الشناوي',
    passwordHash: hashPassword('Chem@2025!Pass'),
    plainPasswordForAdminHistory: 'Chem@2025!Pass',
    nationalId: '30405120102578',
    studentPhone: '01012345678',
    parentPhone: '01098765432',
    grade: 'الصف الثالث الثانوي',
    createdAt: '2026-08-15T10:30:00Z',
  },
  {
    id: 'std_2',
    username: 'mariam_k',
    name: 'مريم خالد الزيات',
    passwordHash: hashPassword('Mariam#9988!'),
    plainPasswordForAdminHistory: 'Mariam#9988!',
    nationalId: '30507200103412',
    studentPhone: '01123456789',
    parentPhone: '01187654321',
    grade: 'الصف الثالث الثانوي',
    createdAt: '2026-08-18T14:15:00Z',
  },
  {
    id: 'std_3',
    username: 'omar_tarek',
    name: 'عمر طارق المهدي',
    passwordHash: hashPassword('Omar@Chem#24'),
    plainPasswordForAdminHistory: 'Omar@Chem#24',
    nationalId: '30409150106789',
    studentPhone: '01234567890',
    parentPhone: '01276543210',
    grade: 'الصف الثالث الثانوي',
    createdAt: '2026-08-20T09:00:00Z',
  },
  {
    id: 'std_4',
    username: 'youssef_1st',
    name: 'يوسف إبراهيم بدر',
    passwordHash: hashPassword('Youssef$2026!'),
    plainPasswordForAdminHistory: 'Youssef$2026!',
    nationalId: '30701100108923',
    studentPhone: '01555543211',
    parentPhone: '01037306672',
    grade: 'الصف الأول الثانوي',
    createdAt: '2026-08-22T11:45:00Z',
  },
  {
    id: 'std_5',
    username: 'sara_prep',
    name: 'سارة عادل عبد الرحمن',
    passwordHash: hashPassword('Sara@Prep3!'),
    plainPasswordForAdminHistory: 'Sara@Prep3!',
    nationalId: '30811250104567',
    studentPhone: '01099887766',
    parentPhone: '01066778899',
    grade: 'الصف الثالث الإعدادي',
    createdAt: '2026-08-25T16:20:00Z',
  },
  {
    id: 'std_6',
    username: 'ali_sec2',
    name: 'علي مصطفى الدسوقي',
    passwordHash: hashPassword('Ali#Desouky2!'),
    plainPasswordForAdminHistory: 'Ali#Desouky2!',
    nationalId: '30604080109988',
    studentPhone: '01200112233',
    parentPhone: '01299887766',
    grade: 'الصف الثاني الثانوي',
    createdAt: '2026-08-26T13:00:00Z',
  }
];

// Initial Lectures
const INITIAL_LECTURES: Lecture[] = [
  {
    id: 'lec_3sec_12',
    grade: 'الصف الثالث الثانوي',
    lectureNumber: 12,
    title: 'الاتزان الكيميائي والعوامل المؤثرة عليه (قاعدة لوشاتيليه)',
    description: 'في هذه المحاضرة سنتعرف بالتفصيل على مفهوم الاتزان الكيميائي والديناميكي، وتأثير التركيز والضغط ودرجة الحرارة والعوامل الحفازة طبقاً لقاعدة لوشاتيليه مع مسائل قانون فعل الكتلة وتطبيقات هامة.',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    videoFileName: 'Lecture12_Chemical_Equilibrium_3Sec.mp4',
    fileSize: '4.2 GB',
    durationMinutes: 48,
    createdAt: '2026-08-28T18:00:00Z',
  },
  {
    id: 'lec_3sec_11',
    grade: 'الصف الثالث الثانوي',
    lectureNumber: 11,
    title: 'معدل التفاعل الكيميائي وطاقة التنشيط',
    description: 'شرح مفهوم سرعة التفاعل الكيميائي ونظرية التصادم ومنحنيات طاقة التنشيط للتفاعلات الماصة والطاردة للحرارة.',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    videoFileName: 'Lecture11_Reaction_Rate_3Sec.mp4',
    fileSize: '3.8 GB',
    durationMinutes: 42,
    createdAt: '2026-08-21T18:00:00Z',
  },
  {
    id: 'lec_1sec_5',
    grade: 'الصف الأول الثانوي',
    lectureNumber: 5,
    title: 'المول والمعادلة الكيميائية الموزونة وحساب الكتلة المولية',
    description: 'تأسيس شامل في مفهوم المول، عدد أفوجادرو، وحسابات الكتل المتبادلة وحجم الغاز في الظروف القياسية STP.',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    videoFileName: 'Lecture05_The_Mole_1Sec.mp4',
    fileSize: '2.9 GB',
    durationMinutes: 38,
    createdAt: '2026-08-27T17:30:00Z',
  },
  {
    id: 'lec_2sec_6',
    grade: 'الصف الثاني الثانوي',
    lectureNumber: 6,
    title: 'قواعد توزيع الإلكترونات وأعداد الكم الأربعة',
    description: 'شرح مفصل لمبدأ البناء التصاعدي، قاعدة هوند، ومبدأ الاستبعاد لباولي وتطبيقها على ذرات العناصر.',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    videoFileName: 'Lecture06_Quantum_Numbers_2Sec.mp4',
    fileSize: '3.1 GB',
    durationMinutes: 45,
    createdAt: '2026-08-26T19:00:00Z',
  },
  {
    id: 'lec_3prep_4',
    grade: 'الصف الثالث الإعدادي',
    lectureNumber: 4,
    title: 'التفاعلات الكيميائية: تفاعلات الانحلال الحراري والإحلال',
    description: 'شرح مبسط وتجارب عملية تفاعلية لتفاعلات الانحلال الحراري لمركبات الفلزات وتفاعلات الإحلال البسيط والمزدوج ومتسلسلة النشاط الكيميائي.',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    videoFileName: 'Lecture04_Chemical_Reactions_3Prep.mp4',
    fileSize: '2.4 GB',
    durationMinutes: 35,
    createdAt: '2026-08-25T16:00:00Z',
  }
];

// Initial Homeworks
const INITIAL_HOMEWORKS: Homework[] = [
  {
    id: 'hw_3sec_12',
    lectureId: 'lec_3sec_12',
    title: 'واجب المحاضرة 12 — الاتزان الكيميائي وقاعدة لوشاتيليه',
    published: true,
    createdAt: '2026-08-28T19:00:00Z',
    questions: [
      {
        id: 'q1',
        questionText: 'ما العامل الذي يؤدي إلى زيادة سرعة التفاعل الكيميائي دون أن يستهلك؟',
        options: ['تقليل درجة الحرارة', 'إضافة العامل الحفاز', 'تقليل تركيز المتفاعلات', 'زيادة حجم وعاء التفاعل'],
        correctOptionIndex: 1,
        explanation: 'العامل الحفاز يقلل من طاقة التنشيط ويزيد من سرعة التفاعل دون أن يتغير أو يستهلك.'
      },
      {
        id: 'q2',
        questionText: 'في التفاعل المتزن الطارد للحرارة: N2 + 3H2 ⇌ 2NH3 + Heat، ماذا يحدث عند رفع درجة الحرارة؟',
        options: ['يزاح التفاعل في الاتجاه الطردي ويزداد تركيز NH3', 'يزاح التفاعل في الاتجاه العكسي ويقل تركيز NH3', 'لا يتأثر موضع الاتزان', 'تزداد قيمة ثابت الاتزان Kc'],
        correctOptionIndex: 1,
        explanation: 'وفقاً لقاعدة لوشاتيليه، في التفاعلات الطاردة للحرارة يؤدي رفع درجة الحرارة لإزاحة التفاعل في الاتجاه العكسي وتقليل الناتج.'
      },
      {
        id: 'q3',
        questionText: 'أي من التفاعلات التالية لا يتأثر موضع اتزانه بتغيير الضغط؟',
        options: ['N2(g) + 3H2(g) ⇌ 2NH3(g)', 'H2(g) + I2(g) ⇌ 2HI(g)', '2SO2(g) + O2(g) ⇌ 2SO3(g)', 'PCl5(g) ⇌ PCl3(g) + Cl2(g)'],
        correctOptionIndex: 1,
        explanation: 'لأن عدد مولات الغازات في المتفاعلات (2 مول) يساوي عدد مولات الغازات في النواتج (2 مول).'
      },
      {
        id: 'q4',
        questionText: 'ما هو تعريف طاقة التنشيط؟',
        options: ['الحد الأدنى من الطاقة التي يجب أن يمتلكها الجزيء ليتفاعل عند الاصطدام', 'متوسط الطاقة الحركية لجزيئات المادة', 'الحرارة الناتجة عن احتراق مول واحد', 'طاقة الروابط في النواتج فقط'],
        correctOptionIndex: 0,
        explanation: 'طاقة التنشيط هي الحد الأدنى اللازم لبدء التفاعل الكيميائي عند التصادم الفعال.'
      },
      {
        id: 'q5',
        questionText: 'عند ثبوت درجة الحرارة، ماذا يحدث لقيمة ثابت الاتزان Kc عند مضاعفة تركيز المتفاعلات؟',
        options: ['تتضاعف قيمته', 'تقل إلى النصف', 'تظل قيمته ثابتة لا تتغير', 'تصل إلى الصفر'],
        correctOptionIndex: 2,
        explanation: 'قيمة ثابت الاتزان Kc لا تتغير إلا بتغير درجة الحرارة فقط.'
      }
    ]
  },
  {
    id: 'hw_3sec_11',
    lectureId: 'lec_3sec_11',
    title: 'واجب المحاضرة 11 — معدل التفاعل وطاقة التنشيط',
    published: true,
    createdAt: '2026-08-21T19:00:00Z',
    questions: [
      {
        id: 'q11_1',
        questionText: 'أي التفاعلات الآتية يعتبر تفاعلاً لحظياً سريعاً جداً؟',
        options: ['صدأ الحديد في الهواء الرطب', 'تفاعل نترات الفضة مع كلوريد الصوديوم', 'تفاعل الزيوت مع الصودا الكاوية لتكوين الصابون', 'تكوين النفط في باطن الأرض'],
        correctOptionIndex: 1,
        explanation: 'تفاعل الترسيب بين المركبات الأيونية لحظي وسريع جداً بمجرد خلط المحلولين.'
      },
      {
        id: 'q11_2',
        questionText: 'تزداد سرعة التفاعل بزيادة مساحة السطح المعرض للتفاعل بسبب:',
        options: ['زيادة عدد الجزيئات المنشطة', 'زيادة عدد التصادمات المحتملة بين الجزيئات', 'انخفاض طاقة التنشيط', 'زيادة طاقة وضع المتفاعلات'],
        correctOptionIndex: 1,
        explanation: 'زيادة مساحة السطح تزيد من مساحة التلامس وفرص التصادم الفعال بين دقائق المتفاعلات.'
      }
    ]
  }
];

// Initial Watch Records
const INITIAL_WATCH_RECORDS: WatchRecord[] = [
  {
    id: 'w1',
    studentId: 'std_1', // Ahmed
    lectureId: 'lec_3sec_12',
    watchPercentage: 96,
    lastWatchedAt: '2026-08-30T14:22:00Z',
    completed: true,
  },
  {
    id: 'w2',
    studentId: 'std_2', // Mariam
    lectureId: 'lec_3sec_12',
    watchPercentage: 42,
    lastWatchedAt: '2026-08-30T11:05:00Z',
    completed: false,
  },
  {
    id: 'w3',
    studentId: 'std_3', // Omar
    lectureId: 'lec_3sec_12',
    watchPercentage: 0,
    lastWatchedAt: '2026-08-29T10:00:00Z',
    completed: false,
  },
  {
    id: 'w4',
    studentId: 'std_1',
    lectureId: 'lec_3sec_11',
    watchPercentage: 100,
    lastWatchedAt: '2026-08-22T16:00:00Z',
    completed: true,
  }
];

// Initial Submissions
const INITIAL_SUBMISSIONS: HomeworkSubmission[] = [
  {
    id: 'sub_1',
    homeworkId: 'hw_3sec_11',
    lectureId: 'lec_3sec_11',
    studentId: 'std_1',
    studentName: 'أحمد محمد الشناوي',
    grade: 'الصف الثالث الثانوي',
    answers: {
      'q11_1': 1,
      'q11_2': 1,
    },
    correctCount: 2,
    wrongCount: 0,
    unansweredCount: 0,
    totalQuestions: 2,
    scorePercentage: 100,
    submittedAt: '2026-08-23T18:10:00Z',
  }
];

// Initial Reset Request for demo
const INITIAL_RESET_REQUESTS: PasswordResetRequest[] = [
  {
    id: 'req_1',
    username: 'youssef_1st',
    nationalId: '30701100108923',
    studentPhone: '01555543211',
    parentPhone: '01037306672',
    requestedAt: '2026-09-01T11:30:00Z',
    status: 'pending',
  }
];

// Initial Password Change Logs
const INITIAL_PASSWORD_LOGS: PasswordChangeLog[] = [
  {
    id: 'log_1',
    username: 'ahmed_chem',
    changedAt: '2026-08-20T12:00:00Z',
    changedBy: 'أستاذ الكيمياء (لوحة الإدارة)',
    status: 'تم التغيير بنجاح بعد التحقق',
    newPassword: 'Chem@2025!Pass',
  }
];

// Helper functions for safe local storage
function getStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new Event('storage-updated'));
  } catch (e) {
    console.error('Storage error', e);
  }
}

export class AppStorage {
  static init(): void {
    this.initDefaults();
  }

  static initDefaults(): void {
    if (!localStorage.getItem(STORAGE_KEYS.STUDENTS)) {
      setStorage(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.LECTURES)) {
      setStorage(STORAGE_KEYS.LECTURES, INITIAL_LECTURES);
    }
    if (!localStorage.getItem(STORAGE_KEYS.HOMEWORKS)) {
      setStorage(STORAGE_KEYS.HOMEWORKS, INITIAL_HOMEWORKS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.WATCH_RECORDS)) {
      setStorage(STORAGE_KEYS.WATCH_RECORDS, INITIAL_WATCH_RECORDS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.SUBMISSIONS)) {
      setStorage(STORAGE_KEYS.SUBMISSIONS, INITIAL_SUBMISSIONS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.RESET_REQUESTS)) {
      setStorage(STORAGE_KEYS.RESET_REQUESTS, INITIAL_RESET_REQUESTS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.PASSWORD_LOGS)) {
      setStorage(STORAGE_KEYS.PASSWORD_LOGS, INITIAL_PASSWORD_LOGS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.PARENT_LOGS)) {
      setStorage(STORAGE_KEYS.PARENT_LOGS, []);
    }
  }

  static resetToDefault(): void {
    setStorage(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS);
    setStorage(STORAGE_KEYS.LECTURES, INITIAL_LECTURES);
    setStorage(STORAGE_KEYS.HOMEWORKS, INITIAL_HOMEWORKS);
    setStorage(STORAGE_KEYS.WATCH_RECORDS, INITIAL_WATCH_RECORDS);
    setStorage(STORAGE_KEYS.SUBMISSIONS, INITIAL_SUBMISSIONS);
    setStorage(STORAGE_KEYS.RESET_REQUESTS, INITIAL_RESET_REQUESTS);
    setStorage(STORAGE_KEYS.PASSWORD_LOGS, INITIAL_PASSWORD_LOGS);
    setStorage(STORAGE_KEYS.PARENT_LOGS, []);
  }

  // Students
  static getStudents(): Student[] {
    return getStorage<Student[]>(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS);
  }

  static addStudent(student: Student): void {
    const list = this.getStudents();
    list.push(student);
    setStorage(STORAGE_KEYS.STUDENTS, list);
  }

  static updateStudentPassword(username: string, newPasswordHash: string, plainForHistory: string): boolean {
    const list = this.getStudents();
    const index = list.findIndex(s => s.username.toLowerCase() === username.toLowerCase());
    if (index !== -1) {
      list[index].passwordHash = newPasswordHash;
      list[index].plainPasswordForAdminHistory = plainForHistory;
      setStorage(STORAGE_KEYS.STUDENTS, list);
      return true;
    }
    return false;
  }

  static isUsernameTaken(username: string): boolean {
    if (!username.trim()) return false;
    const list = this.getStudents();
    return list.some(s => s.username.toLowerCase() === username.trim().toLowerCase());
  }

  static findStudentByUsername(username: string): Student | undefined {
    return this.getStudents().find(s => s.username.toLowerCase() === username.trim().toLowerCase());
  }

  // Lectures
  static getLectures(): Lecture[] {
    return getStorage<Lecture[]>(STORAGE_KEYS.LECTURES, INITIAL_LECTURES);
  }

  static addLecture(lecture: Lecture): void {
    const list = this.getLectures();
    list.unshift(lecture);
    setStorage(STORAGE_KEYS.LECTURES, list);
  }

  // Homeworks
  static getHomeworks(): Homework[] {
    return getStorage<Homework[]>(STORAGE_KEYS.HOMEWORKS, INITIAL_HOMEWORKS);
  }

  static getHomeworkByLectureId(lectureId: string): Homework | undefined {
    return this.getHomeworks().find(h => h.lectureId === lectureId);
  }

  static saveHomework(homework: Homework): void {
    const list = this.getHomeworks();
    const index = list.findIndex(h => h.id === homework.id || h.lectureId === homework.lectureId);
    if (index !== -1) {
      list[index] = homework;
    } else {
      list.push(homework);
    }
    setStorage(STORAGE_KEYS.HOMEWORKS, list);
  }

  // Watch Records
  static getWatchRecords(): WatchRecord[] {
    return getStorage<WatchRecord[]>(STORAGE_KEYS.WATCH_RECORDS, INITIAL_WATCH_RECORDS);
  }

  static updateWatchRecord(studentId: string, lectureId: string, watchPercentage: number): WatchRecord {
    const list = this.getWatchRecords();
    const existingIndex = list.findIndex(w => w.studentId === studentId && w.lectureId === lectureId);
    const completed = watchPercentage >= 90;
    const now = new Date().toISOString();

    if (existingIndex !== -1) {
      // Don't decrease watch percentage if student already watched more
      const currentPct = list[existingIndex].watchPercentage;
      const finalPct = Math.max(currentPct, watchPercentage);
      list[existingIndex].watchPercentage = finalPct;
      list[existingIndex].completed = finalPct >= 90;
      list[existingIndex].lastWatchedAt = now;
      setStorage(STORAGE_KEYS.WATCH_RECORDS, list);
      return list[existingIndex];
    } else {
      const record: WatchRecord = {
        id: 'w_' + Date.now(),
        studentId,
        lectureId,
        watchPercentage,
        lastWatchedAt: now,
        completed,
      };
      list.push(record);
      setStorage(STORAGE_KEYS.WATCH_RECORDS, list);
      return record;
    }
  }

  // Submissions
  static getSubmissions(): HomeworkSubmission[] {
    return getStorage<HomeworkSubmission[]>(STORAGE_KEYS.SUBMISSIONS, INITIAL_SUBMISSIONS);
  }

  static saveSubmission(sub: HomeworkSubmission): void {
    const list = this.getSubmissions();
    const existingIndex = list.findIndex(s => s.homeworkId === sub.homeworkId && s.studentId === sub.studentId);
    if (existingIndex !== -1) {
      list[existingIndex] = sub;
    } else {
      list.push(sub);
    }
    setStorage(STORAGE_KEYS.SUBMISSIONS, list);
  }

  // Password Reset Requests
  static getResetRequests(): PasswordResetRequest[] {
    return getStorage<PasswordResetRequest[]>(STORAGE_KEYS.RESET_REQUESTS, INITIAL_RESET_REQUESTS);
  }

  static addResetRequest(req: PasswordResetRequest): void {
    const list = this.getResetRequests();
    list.unshift(req);
    setStorage(STORAGE_KEYS.RESET_REQUESTS, list);
  }

  static updateResetRequest(id: string, status: 'resolved' | 'rejected', newPass?: string): void {
    const list = this.getResetRequests();
    const index = list.findIndex(r => r.id === id);
    if (index !== -1) {
      list[index].status = status;
      list[index].resolvedAt = new Date().toISOString();
      if (newPass) list[index].newPasswordSet = newPass;
      setStorage(STORAGE_KEYS.RESET_REQUESTS, list);
    }
  }

  // Password Logs
  static getPasswordLogs(): PasswordChangeLog[] {
    return getStorage<PasswordChangeLog[]>(STORAGE_KEYS.PASSWORD_LOGS, INITIAL_PASSWORD_LOGS);
  }

  static addPasswordLog(log: PasswordChangeLog): void {
    const list = this.getPasswordLogs();
    list.unshift(log);
    setStorage(STORAGE_KEYS.PASSWORD_LOGS, list);
  }

  // Parent Communication Logs
  static getParentLogs(): ParentCommunicationLog[] {
    return getStorage<ParentCommunicationLog[]>(STORAGE_KEYS.PARENT_LOGS, []);
  }

  static addParentLog(log: ParentCommunicationLog): void {
    const list = this.getParentLogs();
    list.unshift(log);
    setStorage(STORAGE_KEYS.PARENT_LOGS, list);
  }
}
