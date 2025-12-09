
import React, { useState, useEffect, useRef } from 'react';
import { 
  BookOpen, 
  Upload, 
  CheckCircle2, 
  LogOut, 
  Plus, 
  Bot,
  Sparkles,
  Zap,
  Star,
  Heart,
  GraduationCap,
  LayoutDashboard,
  ArrowRight,
  Menu,
  MessageSquare,
  Send,
  Inbox,
  AlertCircle,
  Copy,
  Check,
  RefreshCw,
  Lock,
  Users,
  Smile,
  Shield,
  CheckSquare,
  BarChart3,
  UserCog,
  Ban,
  Unlock,
  MessageCircle,
  ChevronLeft,
  ThumbsUp,
  Eye,
  Clock,
  Calculator,
  Atom,
  FlaskConical,
  Leaf,
  Globe,
  Languages,
  Hourglass,
  Monitor,
  Library,
  Search,
  Lightbulb,
  Compass,
  Dna,
  Book,
  Code,
  List,
  Grid,
  Camera,
  Image as ImageIcon,
  Save,
  X,
  Settings
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { Assignment, Submission, User as UserType, FriendRequest, Question, ClassGroup, Feedback, ForumPost, ForumReply, Subject } from './types';
import { autoGradeSubmission, generateQuizQuestions, extractQuestionsFromImage, explainConcept } from './services/geminiService';

// Add type for MathJax on window
declare global {
  interface Window {
    MathJax: {
      typesetPromise: () => Promise<void>;
      typeset: () => void;
    };
  }
}

// --- MOCK DATA ---
const INITIAL_USERS: UserType[] = [
  { id: 'ADMIN01', name: 'Quản Trị Viên', role: 'admin', connections: [], classCode: 'ADMIN_KEY', joinedClassIds: [], avatar: 'preset-6', status: 'active' },
  { id: 'GV8888', name: 'Thầy Hưng', role: 'teacher', connections: [], classCode: 'TEACHER123', joinedClassIds: [], avatar: 'preset-1', status: 'active' },
  { id: 'GV9999', name: 'Cô Mai', role: 'teacher', connections: [], classCode: 'TEACHER123', joinedClassIds: [], avatar: 'preset-2', status: 'active' },
  { id: 'HS1001', name: 'Nguyễn Văn An', role: 'student', connections: ['GV8888'], classCode: 'LOP12A', joinedClassIds: [], avatar: 'preset-3', status: 'active' },
  { id: 'HS1002', name: 'Trần Thị Bình', role: 'student', connections: ['GV8888'], classCode: 'LOP12A', joinedClassIds: [], status: 'active' },
  { id: 'HS1003', name: 'Lê Văn Cường', role: 'student', connections: [], classCode: 'LOP12A', joinedClassIds: [], status: 'active' }
];

const INITIAL_GROUPS: ClassGroup[] = [
  {
    id: 'TOAN12',
    name: 'Đội tuyển Toán 12',
    password: '123',
    teacherId: 'GV8888',
    memberIds: ['HS1001'],
    maxCapacity: 50
  }
];

const INITIAL_ASSIGNMENTS: Assignment[] = [
  {
    id: '1',
    title: 'Đại số 10: Mệnh đề và Tập hợp',
    description: 'Bài tập về các phép toán trên tập hợp (Hợp, Giao, Hiệu).',
    dueDate: '2023-11-15',
    answerKey: '1. A U B = {1,2,3,4}; 2. A ^ B = {2}',
    teacherName: 'Thầy Hưng',
    teacherId: 'GV8888',
    subject: 'math'
  },
  {
    id: '2',
    title: 'Lịch sử 10: Các nền văn minh cổ đại',
    description: 'Trắc nghiệm về Văn minh Ai Cập và Lưỡng Hà.',
    dueDate: '2023-11-20',
    answerKey: '1.B, 2.C, 3.A, 4.D, 5.B',
    teacherName: 'Cô Mai',
    teacherId: 'GV9999',
    subject: 'history'
  },
  {
    id: '3',
    title: 'Bài tập nhóm Toán',
    description: 'Dành riêng cho nhóm Toán.',
    dueDate: '2023-11-25',
    answerKey: '',
    teacherName: 'Thầy Hưng',
    teacherId: 'GV8888',
    classGroupIds: ['TOAN12'],
    subject: 'math'
  },
  {
    id: '4',
    title: 'Vật Lý 10: Động học chất điểm',
    description: 'Bài toán về chuyển động thẳng biến đổi đều.',
    dueDate: '2023-11-22',
    answerKey: 'v = v0 + at; s = v0t + 0.5at^2',
    teacherName: 'Thầy Hưng',
    teacherId: 'GV8888',
    subject: 'physics'
  },
  {
    id: '5',
    title: 'Hóa Học 10: Cấu tạo nguyên tử',
    description: 'Xác định số proton, neutron, electron và viết cấu hình electron.',
    dueDate: '2023-11-23',
    answerKey: 'Na: 1s2 2s2 2p6 3s1',
    teacherName: 'Cô Mai',
    teacherId: 'GV9999',
    subject: 'chemistry'
  },
  {
    id: '6',
    title: 'Tiếng Anh 10: Family Life',
    description: 'Viết đoạn văn về chia sẻ công việc nhà (Unit 1).',
    dueDate: '2023-11-28',
    answerKey: '',
    teacherName: 'Cô Mai',
    teacherId: 'GV9999',
    subject: 'english'
  }
];

const INITIAL_SUBMISSIONS: Submission[] = [
  {
    id: '101',
    assignmentId: '1',
    studentName: 'Nguyễn Văn An',
    studentId: 'HS1001',
    submittedAt: '2023-11-14',
    status: 'graded',
    score: 9.5,
    feedback: 'Bài làm tốt. Hiểu rõ về các phép toán tập hợp.'
  },
  {
    id: '102',
    assignmentId: '1',
    studentName: 'Trần Thị Bình',
    studentId: 'HS1002',
    submittedAt: '2023-11-15',
    status: 'pending'
  }
];

const INITIAL_REQUESTS: FriendRequest[] = [
  {
    id: 'req_1',
    fromId: 'HS1003',
    fromName: 'Lê Văn Cường',
    toId: 'GV8888',
    toName: 'Thầy Hưng',
    status: 'pending',
    createdAt: '2023-11-16'
  }
];

const INITIAL_FEEDBACKS: Feedback[] = [
  {
    id: 'fb-1',
    userId: 'HS1001',
    userName: 'Nguyễn Văn An',
    role: 'student',
    content: 'Ứng dụng chạy rất mượt, nhưng em muốn có thêm chế độ tối (Dark Mode).',
    type: 'feature',
    status: 'new',
    createdAt: '2023-11-18'
  },
  {
    id: 'fb-2',
    userId: 'GV8888',
    userName: 'Thầy Hưng',
    role: 'teacher',
    content: 'Cần thêm chức năng xuất bảng điểm ra Excel.',
    type: 'feature',
    status: 'reviewed',
    createdAt: '2023-11-19'
  }
];

const INITIAL_FORUM_POSTS: ForumPost[] = [
  {
    id: 'post-1',
    userId: 'HS1001',
    userName: 'Nguyễn Văn An',
    userRole: 'student',
    userAvatar: 'preset-3',
    title: 'Làm sao để phân tích vectơ nhanh?',
    content: 'Em đang học chương Vectơ lớp 10, phần phân tích một vectơ theo hai vectơ không cùng phương khó quá. Có mẹo nào không ạ?',
    views: 45,
    likes: 5,
    createdAt: '2023-11-20T10:00:00Z',
    replies: [
      {
        id: 'rep-1',
        userId: 'GV8888',
        userName: 'Thầy Hưng',
        userRole: 'teacher',
        userAvatar: 'preset-1',
        content: 'Em hãy nhớ quy tắc hình bình hành và quy tắc 3 điểm (xen điểm). Thầy sẽ gửi video hướng dẫn thêm.',
        createdAt: '2023-11-20T10:30:00Z'
      }
    ]
  },
  {
    id: 'post-2',
    userId: 'HS1002',
    userName: 'Trần Thị Bình',
    userRole: 'student',
    userAvatar: 'preset-4',
    title: 'Hỏi về cấu hình electron',
    content: 'Có ai giải thích giúp mình quy tắc Klechkovski với ạ?',
    views: 12,
    likes: 1,
    createdAt: '2023-11-21T08:00:00Z',
    replies: []
  }
];

// --- AVATAR CONFIG ---
const AVATAR_PRESETS = [
  { id: 'preset-1', color: 'bg-gradient-to-br from-blue-400 to-blue-600', icon: <Bot className="text-white" /> },
  { id: 'preset-2', color: 'bg-gradient-to-br from-purple-400 to-purple-600', icon: <Sparkles className="text-white" /> },
  { id: 'preset-3', color: 'bg-gradient-to-br from-emerald-400 to-emerald-600', icon: <Zap className="text-white" /> },
  { id: 'preset-4', color: 'bg-gradient-to-br from-amber-400 to-amber-600', icon: <Star className="text-white" /> },
  { id: 'preset-5', color: 'bg-gradient-to-br from-rose-400 to-rose-600', icon: <Heart className="text-white" /> },
  { id: 'preset-6', color: 'bg-gradient-to-br from-slate-700 to-slate-900', icon: <GraduationCap className="text-white" /> },
];

const SUBJECT_CONFIG: Record<string, { label: string, color: string, icon: React.ReactNode }> = {
    all: { label: 'Tất cả', color: 'bg-slate-100 text-slate-700', icon: <LayoutDashboard size={18} /> },
    math: { label: 'Toán', color: 'bg-blue-100 text-blue-700', icon: <Calculator size={18} /> },
    physics: { label: 'Vật Lý', color: 'bg-purple-100 text-purple-700', icon: <Atom size={18} /> },
    chemistry: { label: 'Hóa Học', color: 'bg-emerald-100 text-emerald-700', icon: <FlaskConical size={18} /> },
    biology: { label: 'Sinh Học', color: 'bg-green-100 text-green-700', icon: <Leaf size={18} /> },
    history: { label: 'Lịch Sử', color: 'bg-amber-100 text-amber-700', icon: <Hourglass size={18} /> },
    geography: { label: 'Địa Lý', color: 'bg-orange-100 text-orange-700', icon: <Globe size={18} /> },
    literature: { label: 'Ngữ Văn', color: 'bg-pink-100 text-pink-700', icon: <BookOpen size={18} /> },
    english: { label: 'Tiếng Anh', color: 'bg-indigo-100 text-indigo-700', icon: <Languages size={18} /> },
    informatics: { label: 'Tin Học', color: 'bg-cyan-100 text-cyan-700', icon: <Monitor size={18} /> },
    other: { label: 'Khác', color: 'bg-gray-100 text-gray-700', icon: <CheckCircle2 size={18} /> }
};

// --- STRUCTURED KNOWLEDGE DATA (SPECIFIC FOR GRADE 10) ---
interface TopicCategory {
  category: string;
  items: string[];
}

const KNOWLEDGE_DATA: Record<string, TopicCategory[]> = {
  math: [
    { category: 'Đại số: Mệnh đề & Tập hợp', items: ['Mệnh đề logic', 'Tập hợp & Các phép toán', 'Số gần đúng & Sai số'] },
    { category: 'Đại số: Bất phương trình', items: ['Bất phương trình bậc nhất hai ẩn', 'Hệ bất phương trình bậc nhất'] },
    { category: 'Đại số: Hàm số', items: ['Hàm số bậc hai', 'Dấu của tam thức bậc hai', 'Đồ thị hàm số bậc hai'] },
    { category: 'Hình học: Vectơ', items: ['Khái niệm Vectơ', 'Tổng & Hiệu của hai vectơ', 'Tích của vectơ với một số', 'Tích vô hướng của hai vectơ'] },
    { category: 'Hình học: Tọa độ', items: ['Hệ trục tọa độ Oxy', 'Phương trình đường thẳng', 'Phương trình đường tròn'] },
    { category: 'Thống kê & Xác suất', items: ['Số đặc trưng đo xu thế trung tâm', 'Số đặc trưng đo độ phân tán', 'Xác suất của biến cố', 'Biến cố hợp, giao, độc lập'] }
  ],
  physics: [
     { category: 'Mở đầu', items: ['Các phép đo trong Vật lý', 'Sai số phép đo', 'An toàn trong phòng thực hành'] },
     { category: 'Động học', items: ['Độ dịch chuyển & Quãng đường', 'Tốc độ & Vận tốc', 'Chuyển động thẳng biến đổi đều', 'Sự rơi tự do'] },
     { category: 'Động lực học', items: ['Ba định luật Newton', 'Lực ma sát', 'Lực cản của chất lưu', 'Tổng hợp & Phân tích lực', 'Momen lực'] },
     { category: 'Năng lượng & Công', items: ['Công cơ học', 'Công suất', 'Động năng & Thế năng', 'Cơ năng', 'Hiệu suất'] },
     { category: 'Động lượng', items: ['Động lượng', 'Định luật bảo toàn động lượng', 'Chuyển động tròn đều'] }
  ],
  chemistry: [
      { category: 'Cấu tạo nguyên tử', items: ['Thành phần nguyên tử', 'Hạt nhân nguyên tử', 'Cấu hình electron nguyên tử'] },
      { category: 'Bảng tuần hoàn', items: ['Bảng tuần hoàn các nguyên tố', 'Xu hướng biến đổi bán kính nguyên tử', 'Độ âm điện'] },
      { category: 'Liên kết hóa học', items: ['Quy tắc Octet', 'Liên kết ion', 'Liên kết cộng hóa trị', 'Liên kết Hydrogen', 'Tương tác van der Waals'] },
      { category: 'Phản ứng Oxi hóa - Khử', items: ['Số oxi hóa', 'Phản ứng oxi hóa - khử', 'Cân bằng phản ứng oxi hóa - khử'] },
      { category: 'Năng lượng & Tốc độ', items: ['Enthalpy tạo thành', 'Biến thiên Enthalpy', 'Tốc độ phản ứng', 'Các yếu tố ảnh hưởng tốc độ phản ứng'] }
  ],
  biology: [
      { category: 'Giới thiệu Sinh học', items: ['Các cấp độ tổ chức sống', 'Giới thiệu về tế bào học'] },
      { category: 'Thành phần tế bào', items: ['Nguyên tố hóa học trong tế bào', 'Nước & Vai trò sinh học', 'Carbohydrate & Lipid', 'Protein & Nucleic Acid'] },
      { category: 'Cấu trúc tế bào', items: ['Tế bào nhân sơ', 'Tế bào nhân thực', 'Màng sinh chất', 'Ti thể & Lục lạp'] },
      { category: 'Trao đổi chất', items: ['Vận chuyển qua màng sinh chất', 'Chuyển hóa năng lượng', 'Enzyme', 'Hô hấp tế bào', 'Quang hợp'] },
      { category: 'Chu kỳ tế bào & Virus', items: ['Phân bào (Nguyên phân/Giảm phân)', 'Công nghệ tế bào', 'Cấu trúc Virus', 'Ứng dụng của Virus'] }
  ],
  history: [
      { category: 'Lịch sử & Sử học', items: ['Hiện thực lịch sử & Nhận thức', 'Vai trò của Sử học', 'Sử học với bảo tồn di sản'] },
      { category: 'Văn minh Thế giới', items: ['Văn minh Ai Cập cổ đại', 'Văn minh Ấn Độ cổ - trung đại', 'Văn minh Trung Hoa cổ - trung đại', 'Văn minh Hy Lạp - La Mã'] },
      { category: 'Các cuộc CMCN', items: ['Cách mạng công nghiệp lần 1 & 2', 'Cách mạng công nghiệp lần 3 & 4 (4.0)'] },
      { category: 'Văn minh Đông Nam Á', items: ['Hành trình phát triển ĐNA', 'Văn minh Văn Lang - Âu Lạc', 'Văn minh Champa', 'Văn minh Phù Nam'] }
  ],
  geography: [
      { category: 'Kiến thức chung', items: ['Hệ quả chuyển động Trái Đất', 'Phương pháp bản đồ', 'Hệ thống định vị toàn cầu (GPS)'] },
      { category: 'Thạch quyển', items: ['Cấu tạo Trái Đất', 'Thuyết kiến tạo mảng', 'Nội lực & Ngoại lực'] },
      { category: 'Khí quyển', items: ['Nhiệt độ không khí', 'Khí áp & Gió', 'Mưa & Sự phân bố mưa'] },
      { category: 'Thủy quyển', items: ['Nước biển & Đại dương', 'Sóng & Thủy triều', 'Dòng biển'] },
      { category: 'Sinh quyển & Đất', items: ['Đất & Sinh quyển', 'Sự phân bố sinh vật'] },
      { category: 'Dân cư', items: ['Gia tăng dân số', 'Cơ cấu dân số', 'Đô thị hóa'] }
  ],
  literature: [
      { category: 'Truyện kể', items: ['Thần thoại (Thần Trụ Trời...)', 'Sử thi (Đăm Săn...)', 'Truyền thuyết'] },
      { category: 'Thơ', items: ['Thơ Đường luật', 'Thơ tự do', 'Thơ Nôm'] },
      { category: 'Văn bản nghị luận', items: ['Nghị luận xã hội', 'Nghị luận văn học', 'Bình Ngô đại cáo'] },
      { category: 'Văn bản thông tin', items: ['Bản tin', 'Văn bản thuyết minh'] },
      { category: 'Sân khấu', items: ['Chèo cổ', 'Tuồng', 'Nghệ thuật chèo'] }
  ],
  english: [
      { category: 'Unit 1-3: Life & Environment', items: ['Family Life (Unit 1)', 'Humans and the Environment (Unit 2)', 'Music (Unit 3)', 'Present Simple vs Continuous'] },
      { category: 'Unit 4-6: Society', items: ['For a Better Community (Unit 4)', 'Inventions (Unit 5)', 'Gender Equality (Unit 6)', 'Past Simple vs Past Continuous'] },
      { category: 'Unit 7-10: Global & Eco', items: ['Vietnam & Int. Organisations (Unit 7)', 'New Ways to Learn (Unit 8)', 'Protecting the Environment (Unit 9)', 'Ecotourism (Unit 10)'] },
      { category: 'Grammar Focus', items: ['Passive Voice', 'Relative Clauses', 'Conditional Sentences (Type 1, 2)', 'Reported Speech'] }
  ],
  informatics: [
      { category: 'Tin học & Xã hội', items: ['Dữ liệu & Thông tin', 'Điện toán đám mây', 'Pháp luật & Đạo đức số', 'Bản quyền thông tin'] },
      { category: 'Mạng máy tính', items: ['Internet & IoT', 'Kết nối mạng', 'An toàn thông tin mạng'] },
      { category: 'Lập trình Python', items: ['Biến & Kiểu dữ liệu', 'Cấu trúc rẽ nhánh (if-else)', 'Vòng lặp (for, while)', 'Kiểu dữ liệu danh sách (List)', 'Xâu ký tự (String)'] },
      { category: 'Ứng dụng tin học', items: ['Phần mềm thiết kế đồ họa', 'Soạn thảo văn bản nâng cao'] }
  ]
};

// --- STORAGE KEYS ---
const STORAGE_KEYS = {
  USERS: 'EDULITE_USERS',
  ASSIGNMENTS: 'EDULITE_ASSIGNMENTS',
  SUBMISSIONS: 'EDULITE_SUBMISSIONS',
  GROUPS: 'EDULITE_GROUPS',
  REQUESTS: 'EDULITE_REQUESTS',
  FEEDBACKS: 'EDULITE_FEEDBACKS',
  FORUM: 'EDULITE_FORUM',
  CURRENT_USER: 'EDULITE_CURRENT_USER'
};

// --- HELPER COMPONENTS ---

const EduLogo = ({ className = "w-12 h-12" }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className={className}>
        <rect x="20" y="55" width="60" height="12" rx="2" fill="#fbbf24" />
        <rect x="20" y="67" width="60" height="12" rx="2" fill="#ef4444" />
        <rect x="20" y="79" width="60" height="12" rx="2" fill="#3b82f6" />
        <path d="M50 15 L90 35 L50 55 L10 35 Z" fill="#374151" />
        <circle cx="50" cy="15" r="2" fill="#374151" />
        <path d="M90 35 L90 60" stroke="#fbbf24" strokeWidth="3" />
        <circle cx="90" cy="60" r="4" fill="#fbbf24" />
    </svg>
);

const UserAvatar = ({ user, size = 'md', className = '' }: { user: Partial<UserType> | undefined, size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl', className?: string }) => {
  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-24 h-24 text-3xl',
    '2xl': 'w-32 h-32 text-4xl'
  };

  if (!user) return <div className={`${sizeClasses[size]} rounded-full bg-slate-200 ${className}`}></div>;

  if (user.avatar && user.avatar.startsWith('data:')) {
    return (
      <img 
        src={user.avatar} 
        alt={user.name} 
        className={`${sizeClasses[size]} rounded-full object-cover shadow-sm border border-slate-200 ${className}`} 
      />
    );
  }

  const preset = AVATAR_PRESETS.find(p => p.id === user.avatar);
  if (preset) {
    return (
      <div className={`${sizeClasses[size]} rounded-full ${preset.color} flex items-center justify-center shadow-sm border border-white/20 ${className}`}>
        {React.cloneElement(preset.icon as React.ReactElement<{ className?: string }>, { className: size === 'sm' ? 'w-3 h-3' : size === 'md' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-10 h-10' })}
      </div>
    );
  }

  return (
    <div className={`${sizeClasses[size]} rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 shadow-sm border border-slate-200 ${className}`}>
      {user.name ? user.name.charAt(0).toUpperCase() : '?'}
    </div>
  );
};

const ToastNotification = ({ message, type, onClose }: { message: string, type: 'success' | 'error', onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed bottom-5 right-5 z-50 px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-slide-up ${type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-500 text-white'}`}>
      {type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
      <span className="font-bold">{message}</span>
    </div>
  );
}

// --- NEW COMPONENT: PROFILE SETTINGS VIEW ---
const ProfileSettingsView = ({ 
    user, 
    onSave, 
    onCancel 
}: { 
    user: UserType; 
    onSave: (updatedData: Partial<UserType>) => void; 
    onCancel: () => void;
}) => {
    const [name, setName] = useState(user.name);
    const [avatar, setAvatar] = useState(user.avatar || 'preset-1');
    const [backgroundImage, setBackgroundImage] = useState(user.backgroundImage || '');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const bgInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, isBackground: boolean) => {
        const file = e.target.files?.[0];
        if (file) {
            // Basic size check (limit to 2MB for browser performance)
            if (file.size > 2 * 1024 * 1024) {
                alert("File ảnh quá lớn! Vui lòng chọn ảnh dưới 2MB.");
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                if (isBackground) {
                    setBackgroundImage(base64String);
                } else {
                    setAvatar(base64String);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = () => {
        onSave({
            name,
            avatar,
            backgroundImage
        });
    };

    return (
        <div className="max-w-4xl mx-auto animate-fade-in">
            <button onClick={onCancel} className="flex items-center gap-1 text-slate-500 hover:text-indigo-600 font-bold mb-4 transition-colors">
                <ChevronLeft size={20} /> Quay lại
            </button>
            
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                {/* Header / Banner Area */}
                <div className="relative h-48 bg-slate-100 group">
                    {backgroundImage ? (
                         <img src={backgroundImage} alt="Cover" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-r from-indigo-400 to-purple-500 flex items-center justify-center text-white/30">
                            <ImageIcon size={48} />
                        </div>
                    )}
                    
                    {/* Change Cover Button */}
                    <button 
                        onClick={() => bgInputRef.current?.click()}
                        className="absolute bottom-4 right-4 bg-black/50 hover:bg-black/70 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 backdrop-blur-sm transition-all"
                    >
                        <Camera size={14} /> Thay đổi ảnh bìa
                    </button>
                    <input 
                        type="file" 
                        ref={bgInputRef} 
                        className="hidden" 
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, true)} 
                    />
                </div>

                <div className="px-8 pb-8">
                    {/* Avatar Section */}
                    <div className="relative -mt-16 mb-6 w-fit">
                        <div className="p-1.5 bg-white rounded-full inline-block">
                             <UserAvatar user={{ ...user, avatar }} size="2xl" />
                        </div>
                        <button 
                            onClick={() => fileInputRef.current?.click()}
                            className="absolute bottom-2 right-2 p-2 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition-colors border-2 border-white"
                        >
                            <Camera size={16} />
                        </button>
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            className="hidden" 
                            accept="image/*"
                            onChange={(e) => handleFileChange(e, false)} 
                        />
                    </div>

                    {/* Form Section */}
                    <div className="grid gap-6 max-w-xl">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Họ và tên</label>
                            <input 
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Vai trò</label>
                            <div className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 font-medium">
                                {user.role === 'teacher' ? 'Giáo viên' : user.role === 'admin' ? 'Quản trị viên' : 'Học sinh'}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">ID Đăng nhập</label>
                            <div className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 font-medium font-mono">
                                {user.id}
                            </div>
                        </div>

                        {/* Avatar Presets (Optional) */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-3">Hoặc chọn Avatar có sẵn</label>
                            <div className="flex flex-wrap gap-3">
                                {AVATAR_PRESETS.map(preset => (
                                    <button
                                        key={preset.id}
                                        onClick={() => setAvatar(preset.id)}
                                        className={`p-1 rounded-full border-2 transition-all ${avatar === preset.id ? 'border-indigo-600 scale-110' : 'border-transparent hover:scale-105'}`}
                                    >
                                        <div className={`w-10 h-10 rounded-full ${preset.color} flex items-center justify-center`}>
                                            {React.cloneElement(preset.icon as React.ReactElement<{ className?: string }>, { className: 'w-5 h-5' })}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="pt-4 flex gap-3">
                            <button 
                                onClick={handleSave}
                                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 transition-colors flex items-center gap-2"
                            >
                                <Save size={18} /> Lưu thay đổi
                            </button>
                            <button 
                                onClick={onCancel}
                                className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl transition-colors"
                            >
                                Hủy bỏ
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- NEW COMPONENT: KNOWLEDGE LOOKUP VIEW ---
const KnowledgeLookupView = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSubject, setSelectedSubject] = useState<Subject | 'all'>('math');
    const [result, setResult] = useState<string | null>(null);
    const [isSearching, setIsSearching] = useState(false);
    const [activeTopic, setActiveTopic] = useState<string | null>(null);
    const resultRef = useRef<HTMLDivElement>(null);

    const handleSearch = async (term: string) => {
        if (!term.trim()) return;
        setSearchTerm(term);
        setActiveTopic(term);
        setIsSearching(true);
        setResult(null);

        const subjectLabel = SUBJECT_CONFIG[selectedSubject].label;
        const explanation = await explainConcept(term, subjectLabel);
        
        setResult(explanation);
        setIsSearching(false);
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleSearch(searchTerm);
    };

    // Effect to trigger MathJax typesetting when result changes
    useEffect(() => {
        if (result && window.MathJax) {
            setTimeout(() => {
                if (window.MathJax.typesetPromise) {
                    window.MathJax.typesetPromise();
                } else if (window.MathJax.typeset) {
                    window.MathJax.typeset();
                }
            }, 100);
        }
    }, [result]);

    const categories = selectedSubject !== 'all' && KNOWLEDGE_DATA[selectedSubject] ? KNOWLEDGE_DATA[selectedSubject] : [];

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
                <div className="text-center mb-8">
                    <div className="bg-indigo-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Library className="w-8 h-8 text-indigo-600" />
                    </div>
                    <h2 className="text-2xl font-extrabold text-slate-800 mb-2">Tra cứu Kiến thức Lớp 10</h2>
                    <p className="text-slate-500">
                        Chọn chủ đề hoặc tìm kiếm để xem giải thích chi tiết từ AI (Chương trình mới).
                    </p>
                </div>

                <div className="space-y-6">
                    {/* Subject Selector */}
                    <div>
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide justify-start md:justify-center">
                            {(Object.keys(SUBJECT_CONFIG) as (Subject | 'all')[]).map(key => (
                                <button
                                    key={key}
                                    type="button"
                                    onClick={() => { setSelectedSubject(key); setResult(null); setSearchTerm(''); setActiveTopic(null); }}
                                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-all border ${
                                        selectedSubject === key 
                                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-200' 
                                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                                    }`}
                                >
                                    {SUBJECT_CONFIG[key].icon}
                                    {SUBJECT_CONFIG[key].label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Search Input (Secondary) */}
                    <form onSubmit={handleFormSubmit} className="relative max-w-2xl mx-auto">
                        <input
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Tìm kiếm nội dung khác trong chương trình Lớp 10..."
                            className="w-full pl-5 pr-14 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all font-medium"
                        />
                        <button 
                            type="submit"
                            disabled={isSearching || !searchTerm.trim()}
                            className="absolute right-1.5 top-1.5 bottom-1.5 aspect-square bg-white text-indigo-600 rounded-lg hover:bg-indigo-50 border border-transparent hover:border-indigo-100 disabled:bg-transparent disabled:text-slate-300 transition-colors flex items-center justify-center"
                        >
                            {isSearching ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                        </button>
                    </form>
                </div>
            </div>

            {/* Result Area */}
            {result ? (
                <div ref={resultRef} className="animate-slide-up">
                    <button 
                        onClick={() => setResult(null)} 
                        className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold mb-4 transition-colors"
                    >
                        <ChevronLeft size={20} /> Quay lại danh sách chủ đề
                    </button>
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100">
                            <div className="bg-emerald-50 p-2 rounded-lg">
                                <Lightbulb className="w-6 h-6 text-emerald-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-slate-800">Kiến thức: {activeTopic}</h3>
                                <div className="flex items-center gap-2 text-sm text-slate-500">
                                    <span className={`flex items-center gap-1 font-bold ${SUBJECT_CONFIG[selectedSubject].color.split(' ')[1]}`}>
                                        {SUBJECT_CONFIG[selectedSubject].label}
                                    </span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed whitespace-pre-wrap">
                            {result}
                        </div>
                    </div>
                </div>
            ) : (
                /* Categories and Topics List */
                <div className="animate-fade-in">
                    {selectedSubject === 'all' ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {Object.entries(SUBJECT_CONFIG).filter(([k]) => k !== 'all' && k !== 'other').map(([key, config]) => (
                                <button
                                    key={key}
                                    onClick={() => setSelectedSubject(key as Subject)}
                                    className="p-6 bg-white border border-slate-200 hover:border-indigo-300 hover:shadow-md rounded-2xl flex flex-col items-center justify-center gap-3 transition-all text-center group"
                                >
                                    <div className={`p-3 rounded-full ${config.color} bg-opacity-20`}>
                                        {config.icon}
                                    </div>
                                    <span className="font-bold text-slate-700 group-hover:text-indigo-600">{config.label}</span>
                                </button>
                            ))}
                        </div>
                    ) : categories.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {categories.map((cat, idx) => (
                                <div key={idx} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
                                    <div className="bg-slate-50 px-5 py-4 border-b border-slate-100 font-bold text-slate-700 flex items-center gap-2">
                                        <Book className="w-4 h-4 text-indigo-500" />
                                        {cat.category}
                                    </div>
                                    <div className="p-2 flex flex-col gap-1 flex-1">
                                        {cat.items.map((item, i) => (
                                            <button
                                                key={i}
                                                onClick={() => handleSearch(item)}
                                                className="w-full text-left px-4 py-3 rounded-xl hover:bg-indigo-50 text-slate-600 hover:text-indigo-700 font-medium text-sm transition-colors flex items-center justify-between group"
                                            >
                                                {item}
                                                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-indigo-400" />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <div className="inline-block p-4 rounded-full bg-slate-100 mb-4">
                                <Search className="w-8 h-8 text-slate-400" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-700">Chưa có danh mục</h3>
                            <p className="text-slate-500">Hãy thử tìm kiếm bằng từ khóa ở trên.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// --- COMPONENT: FORUM VIEW ---
const ForumView = ({
    currentUser,
    posts,
    onAddPost,
    onAddReply
}: {
    currentUser: UserType;
    posts: ForumPost[];
    onAddPost: (post: ForumPost) => void;
    onAddReply: (postId: string, reply: ForumReply) => void;
}) => {
    const [viewMode, setViewMode] = useState<'list' | 'detail' | 'create'>('list');
    const [selectedPost, setSelectedPost] = useState<ForumPost | null>(null);
    const [newPostTitle, setNewPostTitle] = useState('');
    const [newPostContent, setNewPostContent] = useState('');
    const [newReplyContent, setNewReplyContent] = useState('');

    const handleCreatePost = (e: React.FormEvent) => {
        e.preventDefault();
        if(!newPostTitle.trim() || !newPostContent.trim()) return;

        const post: ForumPost = {
            id: uuidv4(),
            userId: currentUser.id,
            userName: currentUser.name,
            userRole: currentUser.role,
            userAvatar: currentUser.avatar,
            title: newPostTitle,
            content: newPostContent,
            createdAt: new Date().toISOString(),
            views: 0,
            likes: 0,
            replies: []
        };
        onAddPost(post);
        setNewPostTitle('');
        setNewPostContent('');
        setViewMode('list');
    };

    const handleCreateReply = (e: React.FormEvent) => {
        e.preventDefault();
        if(!selectedPost || !newReplyContent.trim()) return;

        const reply: ForumReply = {
            id: uuidv4(),
            userId: currentUser.id,
            userName: currentUser.name,
            userRole: currentUser.role,
            userAvatar: currentUser.avatar,
            content: newReplyContent,
            createdAt: new Date().toISOString()
        };
        onAddReply(selectedPost.id, reply);
        setNewReplyContent('');
    };

    // Helper to format dates simply
    const formatDate = (isoString: string) => {
        return new Date(isoString).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute:'2-digit' });
    };

    if (viewMode === 'create') {
        return (
            <div className="max-w-3xl mx-auto animate-fade-in">
                 <button onClick={() => setViewMode('list')} className="flex items-center gap-1 text-slate-500 hover:text-indigo-600 font-bold mb-4 transition-colors">
                    <ChevronLeft size={20} /> Quay lại
                </button>
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                    <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <MessageCircle className="text-indigo-500" /> Tạo câu hỏi mới
                    </h2>
                    <form onSubmit={handleCreatePost} className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Tiêu đề câu hỏi</label>
                            <input 
                                value={newPostTitle}
                                onChange={(e) => setNewPostTitle(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                                placeholder="Ví dụ: Cách giải hệ phương trình bậc 2..."
                                autoFocus
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Nội dung chi tiết</label>
                            <textarea 
                                value={newPostContent}
                                onChange={(e) => setNewPostContent(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none h-40 resize-none"
                                placeholder="Mô tả chi tiết vấn đề của bạn..."
                            />
                        </div>
                        <div className="flex justify-end gap-3 pt-2">
                            <button 
                                type="button"
                                onClick={() => setViewMode('list')}
                                className="px-5 py-2.5 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                            >
                                Hủy bỏ
                            </button>
                            <button 
                                type="submit"
                                disabled={!newPostTitle.trim() || !newPostContent.trim()}
                                className="px-6 py-2.5 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 disabled:opacity-50 transition-colors flex items-center gap-2"
                            >
                                <Send size={18} /> Đăng bài
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }

    if (viewMode === 'detail' && selectedPost) {
        // Find the fresh version of the post from props to show new replies immediately
        const currentPost = posts.find(p => p.id === selectedPost.id) || selectedPost;

        return (
            <div className="max-w-3xl mx-auto animate-fade-in">
                <button onClick={() => setViewMode('list')} className="flex items-center gap-1 text-slate-500 hover:text-indigo-600 font-bold mb-4 transition-colors">
                    <ChevronLeft size={20} /> Quay lại diễn đàn
                </button>

                {/* Main Post */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-6">
                    <div className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <UserAvatar user={{ name: currentPost.userName, avatar: currentPost.userAvatar }} size="md" />
                            <div>
                                <h3 className="font-bold text-slate-800">{currentPost.userName}</h3>
                                <div className="text-xs text-slate-500 flex items-center gap-2">
                                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${currentPost.userRole === 'teacher' ? 'bg-emerald-50 text-emerald-600' : currentPost.userRole === 'admin' ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-600'}`}>
                                        {currentPost.userRole === 'teacher' ? 'Giáo viên' : currentPost.userRole === 'admin' ? 'Admin' : 'Học sinh'}
                                    </span>
                                    <span>•</span>
                                    <span>{formatDate(currentPost.createdAt)}</span>
                                </div>
                            </div>
                        </div>
                        <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 mb-4 leading-tight">{currentPost.title}</h1>
                        <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">{currentPost.content}</p>
                    </div>
                    <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 flex items-center gap-6 text-sm text-slate-500 font-medium">
                        <span className="flex items-center gap-1.5"><Eye size={16} /> {currentPost.views} lượt xem</span>
                        <span className="flex items-center gap-1.5"><ThumbsUp size={16} /> {currentPost.likes} thích</span>
                        <span className="flex items-center gap-1.5"><MessageSquare size={16} /> {currentPost.replies.length} trả lời</span>
                    </div>
                </div>

                {/* Replies Section */}
                <div className="space-y-4 mb-8">
                    <h3 className="font-bold text-slate-700 text-lg">Câu trả lời ({currentPost.replies.length})</h3>
                    {currentPost.replies.length === 0 ? (
                        <div className="p-8 text-center text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">
                            Chưa có câu trả lời nào. Hãy là người đầu tiên!
                        </div>
                    ) : (
                        currentPost.replies.map(reply => (
                            <div key={reply.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex gap-4">
                                <div className="flex-shrink-0">
                                    <UserAvatar user={{ name: reply.userName, avatar: reply.userAvatar }} size="sm" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-sm text-slate-800">{reply.userName}</span>
                                            {reply.userRole === 'teacher' && <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-1.5 py-0.5 rounded">GV</span>}
                                            {reply.userRole === 'admin' && <span className="bg-indigo-100 text-indigo-700 text-[10px] font-bold px-1.5 py-0.5 rounded">ADMIN</span>}
                                        </div>
                                        <span className="text-xs text-slate-400">{formatDate(reply.createdAt)}</span>
                                    </div>
                                    <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">{reply.content}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Reply Form */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-lg shadow-slate-200/50 sticky bottom-4">
                    <form onSubmit={handleCreateReply} className="flex gap-3">
                        <UserAvatar user={currentUser} size="md" className="hidden md:flex" />
                        <div className="flex-1 relative">
                            <input
                                value={newReplyContent}
                                onChange={(e) => setNewReplyContent(e.target.value)} 
                                placeholder="Viết câu trả lời của bạn..."
                                className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                            />
                            <button 
                                type="submit"
                                disabled={!newReplyContent.trim()}
                                className="absolute right-2 top-1.5 p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:bg-slate-300 transition-colors"
                            >
                                <Send size={16} />
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }

    // Default: List View
    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div className="flex gap-2">
                   <button className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-sm font-bold">Mới nhất</button>
                   <button className="px-4 py-2 text-slate-500 hover:bg-slate-50 rounded-xl text-sm font-bold transition-colors">Phổ biến</button>
                   <button className="px-4 py-2 text-slate-500 hover:bg-slate-50 rounded-xl text-sm font-bold transition-colors">Chưa trả lời</button>
                </div>
                <button 
                    onClick={() => setViewMode('create')}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 flex items-center gap-2 transition-all w-fit"
                >
                    <Plus size={18} /> Đặt câu hỏi
                </button>
            </div>

            <div className="space-y-3">
                {posts.map(post => (
                    <div 
                        key={post.id} 
                        onClick={() => { setSelectedPost(post); setViewMode('detail'); }}
                        className="group bg-white p-5 rounded-2xl border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer"
                    >
                        <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 pt-1">
                                <UserAvatar user={{ name: post.userName, avatar: post.userAvatar }} size="md" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-lg text-slate-800 group-hover:text-indigo-600 transition-colors mb-1 truncate pr-4">
                                    {post.title}
                                </h3>
                                <p className="text-slate-500 text-sm line-clamp-2 mb-3">{post.content}</p>
                                
                                <div className="flex items-center gap-4 text-xs text-slate-400 font-medium">
                                    <span className="text-slate-600 font-semibold">{post.userName}</span>
                                    <span className="flex items-center gap-1"><Clock size={12} /> {formatDate(post.createdAt)}</span>
                                    <span className="flex items-center gap-1 ml-auto md:ml-0 bg-slate-100 px-2 py-0.5 rounded-full text-slate-600">
                                        <MessageSquare size={12} /> {post.replies.length}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- USER MANAGEMENT VIEW (ADMIN) ---
const UserManagementView = ({ 
    users, 
    currentUser,
    onToggleStatus 
}: { 
    users: UserType[], 
    currentUser: UserType,
    onToggleStatus: (userId: string) => void 
}) => {
    // Filter out the current admin so they don't ban themselves
    const displayUsers = users.filter(u => u.id !== currentUser.id);

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="p-4 text-sm font-bold text-slate-500">Người dùng</th>
                                <th className="p-4 text-sm font-bold text-slate-500">Vai trò</th>
                                <th className="p-4 text-sm font-bold text-slate-500">ID / Mã lớp</th>
                                <th className="p-4 text-sm font-bold text-slate-500">Trạng thái</th>
                                <th className="p-4 text-sm font-bold text-slate-500 text-right">Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {displayUsers.map(user => (
                                <tr key={user.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <UserAvatar user={user} size="sm" />
                                            <div>
                                                <div className="font-bold text-slate-800">{user.name}</div>
                                                <div className="text-xs text-slate-400">{user.id}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`text-xs font-bold px-2 py-1 rounded-full border ${
                                            user.role === 'admin' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                                            user.role === 'teacher' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                            'bg-sky-50 text-sky-600 border-sky-100'
                                        }`}>
                                            {user.role === 'admin' ? 'Quản trị' : user.role === 'teacher' ? 'Giáo viên' : 'Học sinh'}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <span className="text-sm text-slate-600 font-mono">
                                            {user.classCode || user.classCode || '-'}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        {user.status === 'banned' ? (
                                            <span className="flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-full w-fit">
                                                <Ban size={12} /> Bị khóa
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full w-fit">
                                                <CheckCircle2 size={12} /> Hoạt động
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-4 text-right">
                                        <button 
                                            onClick={() => onToggleStatus(user.id)}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all flex items-center gap-1 ml-auto ${
                                                user.status === 'banned' 
                                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' 
                                                : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                                            }`}
                                        >
                                            {user.status === 'banned' ? (
                                                <><Unlock size={14} /> Mở khóa</>
                                            ) : (
                                                <><Ban size={14} /> Cấm TK</>
                                            )}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {displayUsers.length === 0 && (
                     <div className="p-8 text-center text-slate-500">Chưa có người dùng nào khác trong hệ thống.</div>
                )}
            </div>
        </div>
    );
};

// --- COMPONENT: FEEDBACK VIEW ---
const FeedbackView = ({ 
    user, 
    feedbacks, 
    onSubmit,
    onStatusChange
}: { 
    user: UserType, 
    feedbacks: Feedback[], 
    onSubmit: (f: Feedback) => void,
    onStatusChange?: (id: string, status: Feedback['status']) => void
}) => {
  const [content, setContent] = useState('');
  const [type, setType] = useState<Feedback['type']>('feature');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filter, setFilter] = useState<'all' | 'new' | 'resolved'>('all');

  const isAdmin = user.role === 'admin';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setIsSubmitting(true);
    
    // Simulate network delay
    await new Promise(r => setTimeout(r, 800));
    
    const newFeedback: Feedback = {
      id: uuidv4(),
      userId: user.id,
      userName: user.name,
      role: user.role,
      content: content,
      type: type,
      status: 'new',
      createdAt: new Date().toISOString()
    };
    
    onSubmit(newFeedback);
    setContent('');
    setIsSubmitting(false);
  };

  // Admin sees all, User sees own
  let displayedFeedbacks = isAdmin 
    ? feedbacks 
    : feedbacks.filter(f => f.userId === user.id);

  // Apply filters for admin
  if (isAdmin && filter !== 'all') {
    displayedFeedbacks = displayedFeedbacks.filter(f => 
        filter === 'new' ? f.status !== 'resolved' : f.status === 'resolved'
    );
  }

  // Sort by date new to old
  displayedFeedbacks = displayedFeedbacks.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Regular User Form */}
      {!isAdmin && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-indigo-500" />
            Đóng góp ý kiến & Báo lỗi
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-1">
                    <label className="block text-sm font-bold text-slate-700 mb-2">Loại góp ý</label>
                    <select 
                        value={type} 
                        onChange={(e) => setType(e.target.value as any)}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                        <option value="feature">💡 Tính năng mới</option>
                        <option value="bug">🐛 Báo lỗi</option>
                        <option value="content">📚 Nội dung</option>
                        <option value="other">📝 Khác</option>
                    </select>
                </div>
                <div className="md:col-span-3">
                    <label className="block text-sm font-bold text-slate-700 mb-2">Nội dung chi tiết</label>
                    <textarea 
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Hãy chia sẻ ý kiến của bạn để giúp EduLite tốt hơn..."
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none h-32 resize-none"
                        required
                    />
                </div>
            </div>
            <div className="flex justify-end">
                <button 
                    disabled={isSubmitting || !content.trim()}
                    type="submit" 
                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all"
                >
                    {isSubmitting ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                    Gửi góp ý
                </button>
            </div>
            </form>
        </div>
      )}

      {/* Filter Tabs (Admin Only) */}
      {isAdmin && (
        <div className="flex gap-2 p-1 bg-slate-100 rounded-xl w-fit">
            {(['all', 'new', 'resolved'] as const).map((f) => (
                <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${filter === f ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    {f === 'all' ? 'Tất cả' : f === 'new' ? 'Chưa xử lý' : 'Đã xử lý'}
                </button>
            ))}
        </div>
      )}

      <div className="space-y-4">
        <h3 className="font-bold text-slate-700 text-lg flex items-center justify-between">
            {isAdmin ? 'Danh sách phản hồi từ người dùng' : 'Lịch sử góp ý của bạn'}
            <span className="text-sm font-normal text-slate-400 bg-slate-100 px-2 py-1 rounded-full">{displayedFeedbacks.length}</span>
        </h3>
        
        {displayedFeedbacks.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300">
                <Inbox className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">{isAdmin ? 'Chưa có dữ liệu.' : 'Bạn chưa có góp ý nào.'}</p>
            </div>
        ) : (
            <div className="grid gap-4">
                {displayedFeedbacks.map(fb => (
                    <div key={fb.id} className={`bg-white p-5 rounded-2xl border ${fb.status === 'resolved' ? 'border-emerald-200 bg-emerald-50/30' : 'border-slate-200'} shadow-sm flex gap-4 transition-all`}>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 
                            ${fb.type === 'bug' ? 'bg-red-100 text-red-600' : 
                              fb.type === 'feature' ? 'bg-amber-100 text-amber-600' : 
                              'bg-indigo-100 text-indigo-600'}`}
                        >
                            {fb.type === 'bug' ? <Zap size={20} /> : fb.type === 'feature' ? <Sparkles size={20} /> : <MessageSquare size={20} />}
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between items-start mb-1">
                                <div className="flex items-center gap-2">
                                    <span className={`text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wider
                                        ${fb.type === 'bug' ? 'bg-red-50 text-red-600 border border-red-100' : 
                                          fb.type === 'feature' ? 'bg-amber-50 text-amber-600 border border-amber-100' : 
                                          'bg-indigo-50 text-indigo-600 border border-indigo-100'}`}
                                    >
                                        {fb.type === 'bug' ? 'Báo lỗi' : fb.type === 'feature' ? 'Tính năng' : fb.type === 'content' ? 'Nội dung' : 'Khác'}
                                    </span>
                                    {isAdmin && (
                                        <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                                            {fb.userName} ({fb.role === 'teacher' ? 'GV' : 'HS'})
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    {fb.status === 'resolved' && (
                                        <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">
                                            <CheckCircle2 size={12} /> Đã xử lý
                                        </span>
                                    )}
                                    <span className="text-xs text-slate-400 font-mono">
                                        {new Date(fb.createdAt).toLocaleDateString('vi-VN')}
                                    </span>
                                </div>
                            </div>
                            <p className="text-slate-700 leading-relaxed">{fb.content}</p>
                            
                            {/* Admin Actions */}
                            {isAdmin && fb.status !== 'resolved' && onStatusChange && (
                                <div className="mt-3 pt-3 border-t border-slate-100 flex justify-end">
                                    <button 
                                        onClick={() => onStatusChange(fb.id, 'resolved')}
                                        className="text-xs font-bold flex items-center gap-1 text-emerald-600 hover:bg-emerald-50 px-3 py-1.5 rounded-lg transition-colors"
                                    >
                                        <CheckSquare size={14} /> Đánh dấu đã xử lý
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>
    </div>
  );
};

// --- LANDING PAGE ---
const LandingPage = ({ onLogin }: { onLogin: (role: 'teacher' | 'student' | 'admin', id: string, code: string, remember: boolean) => void }) => {
  const [role, setRole] = useState<'teacher' | 'student' | 'admin'>('student');
  const [identifier, setIdentifier] = useState('');
  const [code, setCode] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // Demo buttons state
  const demoTeacher = { id: 'GV8888', code: 'TEACHER123' };
  const demoStudent = { id: 'HS1001', code: 'LOP12A' };
  const demoAdmin = { id: 'ADMIN01', code: 'ADMIN_KEY' };

  const fillDemo = (demoRole: 'teacher' | 'student' | 'admin') => {
    setRole(demoRole);
    if (demoRole === 'teacher') {
        setIdentifier(demoTeacher.id);
        setCode(demoTeacher.code);
    } else if (demoRole === 'student') {
        setIdentifier(demoStudent.id);
        setCode(demoStudent.code);
    } else {
        setIdentifier(demoAdmin.id);
        setCode(demoAdmin.code);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Left Side: Hero */}
      <div className="flex-1 bg-gradient-to-br from-indigo-600 to-violet-600 p-8 md:p-12 lg:p-20 flex flex-col justify-center text-white relative overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
             <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-white blur-3xl"></div>
             <div className="absolute bottom-20 right-20 w-64 h-64 rounded-full bg-white blur-3xl"></div>
        </div>

        <div className="relative z-10 animate-fade-in max-w-lg">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md">
                <EduLogo className="w-10 h-10" />
            </div>
            <span className="font-bold text-3xl tracking-tight">EduLite<span className="text-indigo-200">AI</span></span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight">
             Nền tảng giáo dục <br/>
             <span className="text-indigo-200">Thông minh & Trực tuyến</span>
          </h1>
          
          <p className="text-indigo-100 text-lg mb-10 leading-relaxed">
             Quản lý lớp học, giao bài tập và chấm điểm tự động bằng AI. 
             Kết nối giáo viên và học sinh mọi lúc, mọi nơi.
          </p>

          <div className="grid grid-cols-2 gap-4">
             <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-md border border-white/10">
                <Zap className="w-6 h-6 text-amber-300 mb-2" />
                <h3 className="font-bold text-lg">Chấm điểm AI</h3>
                <p className="text-xs text-indigo-200 mt-1">Tự động chấm bài trắc nghiệm và tự luận.</p>
             </div>
             <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-md border border-white/10">
                <Users className="w-6 h-6 text-emerald-300 mb-2" />
                <h3 className="font-bold text-lg">Lớp học Online</h3>
                <p className="text-xs text-indigo-200 mt-1">Kết nối, tạo nhóm và quản lý học sinh dễ dàng.</p>
             </div>
          </div>
        </div>
      </div>

      {/* Right Side: Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 border border-slate-100 animate-slide-up">
           <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-slate-800">Đăng Nhập</h2>
              <p className="text-slate-500 mt-2">Chào mừng bạn quay trở lại!</p>
           </div>

           {/* Role Toggle */}
           <div className="flex bg-slate-100 p-1 rounded-xl mb-8 relative">
                <div 
                    className={`absolute top-1 bottom-1 w-[32%] bg-white rounded-lg shadow-sm transition-all duration-300 ease-out 
                    ${role === 'student' ? 'left-1' : role === 'teacher' ? 'left-[34%]' : 'left-[67%]'}`}
                ></div>
                <button 
                    className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all relative z-10 flex items-center justify-center gap-1 ${role === 'student' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                    onClick={() => setRole('student')}
                >
                    <Smile className="w-4 h-4" /> HS
                </button>
                <button 
                    className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all relative z-10 flex items-center justify-center gap-1 ${role === 'teacher' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                    onClick={() => setRole('teacher')}
                >
                    <GraduationCap className="w-4 h-4" /> GV
                </button>
                <button 
                    className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all relative z-10 flex items-center justify-center gap-1 ${role === 'admin' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                    onClick={() => setRole('admin')}
                >
                    <Shield className="w-4 h-4" /> Admin
                </button>
            </div>

            {/* Inputs */}
            <div className="space-y-5">
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">
                        {role === 'teacher' || role === 'admin' ? 'Tên đăng nhập / ID' : 'Họ tên hoặc ID'}
                    </label>
                    <div className="relative group">
                        <Users className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-indigo-500 transition-colors w-5 h-5" />
                        <input 
                            type="text" 
                            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all font-medium"
                            placeholder={role === 'teacher' ? 'Ví dụ: GV8888' : role === 'admin' ? 'Ví dụ: ADMIN01' : 'Ví dụ: HS1001'}
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">
                        {role === 'teacher' || role === 'admin' ? 'Mật khẩu / Mã xác thực' : 'Mã lớp / Mật khẩu'}
                    </label>
                    <div className="relative group">
                        <Lock className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-indigo-500 transition-colors w-5 h-5" />
                        <input 
                            type="password" 
                            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all font-medium"
                            placeholder="••••••••"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    id="remember" 
                    checked={rememberMe} 
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                  <label htmlFor="remember" className="text-sm text-slate-600 font-bold select-none cursor-pointer">Ghi nhớ đăng nhập</label>
                </div>

                <button 
                    onClick={() => onLogin(role, identifier, code, rememberMe)}
                    className="w-full text-white py-3.5 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all transform active:scale-95 flex items-center justify-center gap-2 mt-2"
                >
                    Đăng Nhập <ArrowRight className="w-5 h-5" />
                </button>
            </div>

            {/* Quick Demo Links */}
            <div className="mt-8 pt-6 border-t border-slate-100">
                <p className="text-xs font-bold text-slate-400 text-center mb-3 uppercase tracking-wider">Dùng thử tài khoản Demo</p>
                <div className="flex gap-2 mb-4">
                    <button onClick={() => fillDemo('teacher')} className="flex-1 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors">
                        Giáo viên
                    </button>
                    <button onClick={() => fillDemo('student')} className="flex-1 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors">
                        Học sinh
                    </button>
                    <button onClick={() => fillDemo('admin')} className="flex-1 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors">
                        Admin
                    </button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

// --- MAIN APP ---
function App() {
  const [user, setUser] = useState<UserType | null>(null);
  const [users, setUsers] = useState<UserType[]>(INITIAL_USERS);
  const [assignments, setAssignments] = useState<Assignment[]>(INITIAL_ASSIGNMENTS);
  const [submissions, setSubmissions] = useState<Submission[]>(INITIAL_SUBMISSIONS);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>(INITIAL_FEEDBACKS);
  const [forumPosts, setForumPosts] = useState<ForumPost[]>(INITIAL_FORUM_POSTS);
  const [selectedSubject, setSelectedSubject] = useState<Subject | 'all'>('all');
  
  const [currentView, setCurrentView] = useState<'dashboard' | 'assignments' | 'feedback' | 'users' | 'forum' | 'knowledge' | 'settings'>('dashboard');
  const [toast, setToast] = useState<{msg: string, type: 'success' | 'error'} | null>(null);

  useEffect(() => {
    // Load data from localStorage
    const storedUser = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (storedUser) setUser(JSON.parse(storedUser));
    
    // In a real app, you would load other data here too
    // For now we use the initial mock data state
  }, []);

  const handleLogin = (role: 'teacher' | 'student' | 'admin', id: string, code: string, remember: boolean) => {
    const foundUser = users.find(u => u.id === id && u.role === role);
    if (foundUser) {
        if (foundUser.status === 'banned') {
            setToast({ msg: 'Tài khoản này đã bị khóa. Vui lòng liên hệ quản trị viên.', type: 'error' });
            return;
        }

        if (remember) localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(foundUser));
        setUser(foundUser);
        setToast({ msg: `Chào mừng ${foundUser.name}!`, type: 'success' });
        // Reset view when logging in
        setCurrentView('dashboard');
    } else {
        setToast({ msg: 'Thông tin đăng nhập không chính xác', type: 'error' });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    setUser(null);
    setCurrentView('dashboard');
  };

  const handleAddFeedback = (newFeedback: Feedback) => {
    setFeedbacks(prev => [newFeedback, ...prev]);
    setToast({ msg: 'Cảm ơn đóng góp ý kiến của bạn!', type: 'success' });
  };

  const handleFeedbackStatusChange = (id: string, status: Feedback['status']) => {
    setFeedbacks(prev => prev.map(f => f.id === id ? { ...f, status } : f));
    setToast({ msg: 'Đã cập nhật trạng thái phản hồi', type: 'success' });
  };

  const handleToggleUserStatus = (userId: string) => {
    setUsers(prev => prev.map(u => {
        if (u.id === userId) {
            const newStatus = u.status === 'banned' ? 'active' : 'banned';
            return { ...u, status: newStatus };
        }
        return u;
    }));
    setToast({ msg: 'Đã cập nhật trạng thái người dùng', type: 'success' });
  };

  const handleAddForumPost = (post: ForumPost) => {
    setForumPosts(prev => [post, ...prev]);
    setToast({ msg: 'Đã đăng câu hỏi thành công!', type: 'success' });
  };

  const handleAddForumReply = (postId: string, reply: ForumReply) => {
    setForumPosts(prev => prev.map(post => {
        if (post.id === postId) {
            return { ...post, replies: [...post.replies, reply] };
        }
        return post;
    }));
    setToast({ msg: 'Đã trả lời câu hỏi!', type: 'success' });
  };

  const handleUpdateProfile = (updatedData: Partial<UserType>) => {
      if (!user) return;
      const updatedUser = { ...user, ...updatedData };
      
      // Update local state
      setUser(updatedUser);
      
      // Update in users list
      setUsers(prev => prev.map(u => u.id === user.id ? updatedUser : u));
      
      // Update storage
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(updatedUser));
      
      setToast({ msg: 'Đã cập nhật hồ sơ thành công!', type: 'success' });
      setCurrentView('dashboard');
  };

  if (!user) {
    return (
        <>
            {toast && <ToastNotification message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
            <LandingPage onLogin={handleLogin} />
        </>
    );
  }

  const isAdmin = user.role === 'admin';
  const filteredAssignments = selectedSubject === 'all' 
    ? assignments 
    : assignments.filter(a => a.subject === selectedSubject);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
        {toast && <ToastNotification message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
        
        {/* Sidebar */}
        <aside className={`w-64 border-r border-slate-200 hidden md:flex flex-col z-20 ${isAdmin ? 'bg-slate-900 text-white' : 'bg-white'}`}>
            <div className={`p-6 border-b flex items-center gap-3 ${isAdmin ? 'border-slate-700' : 'border-slate-100'}`}>
                <EduLogo className="w-8 h-8" />
                <span className={`font-bold text-xl ${isAdmin ? 'text-white' : 'text-slate-800'}`}>EduLite</span>
                {isAdmin && <span className="text-xs bg-indigo-500 text-white px-1.5 py-0.5 rounded font-bold">ADMIN</span>}
            </div>

            <div className="p-4 flex flex-col gap-1 flex-1 overflow-y-auto">
                <button 
                    onClick={() => setCurrentView('dashboard')}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all 
                        ${currentView === 'dashboard' 
                            ? (isAdmin ? 'bg-indigo-600 text-white' : 'bg-indigo-50 text-indigo-600') 
                            : (isAdmin ? 'text-slate-400 hover:bg-slate-800 hover:text-white' : 'text-slate-600 hover:bg-slate-50')}`}
                >
                    <LayoutDashboard className="w-5 h-5" /> Tổng quan
                </button>
                
                {/* Regular Users Menu */}
                {!isAdmin && (
                    <>
                        <button 
                            onClick={() => setCurrentView('assignments')}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${currentView === 'assignments' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-50'}`}
                        >
                            <BookOpen className="w-5 h-5" /> Bài tập
                        </button>
                        <button 
                            onClick={() => setCurrentView('knowledge')}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${currentView === 'knowledge' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-50'}`}
                        >
                            <Library className="w-5 h-5" /> Tra cứu kiến thức
                        </button>
                    </>
                )}

                {/* Forum Menu - Available for everyone */}
                <button 
                    onClick={() => setCurrentView('forum')}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all 
                        ${currentView === 'forum' 
                            ? (isAdmin ? 'bg-indigo-600 text-white' : 'bg-indigo-50 text-indigo-600') 
                            : (isAdmin ? 'text-slate-400 hover:bg-slate-800 hover:text-white' : 'text-slate-600 hover:bg-slate-50')}`}
                >
                    <MessageCircle className="w-5 h-5" /> Diễn đàn hỏi đáp
                </button>

                {/* Admin Users Menu */}
                {isAdmin && (
                    <button 
                        onClick={() => setCurrentView('users')}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all 
                            ${currentView === 'users' 
                                ? 'bg-indigo-600 text-white' 
                                : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                    >
                        <UserCog className="w-5 h-5" /> Quản lý người dùng
                    </button>
                )}

                <button 
                    onClick={() => setCurrentView('feedback')}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all 
                        ${currentView === 'feedback' 
                            ? (isAdmin ? 'bg-indigo-600 text-white' : 'bg-indigo-50 text-indigo-600') 
                            : (isAdmin ? 'text-slate-400 hover:bg-slate-800 hover:text-white' : 'text-slate-600 hover:bg-slate-50')}`}
                >
                    <MessageSquare className="w-5 h-5" /> {isAdmin ? 'Quản lý Góp ý' : 'Góp ý & Báo lỗi'}
                </button>

                <button 
                    onClick={() => setCurrentView('settings')}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all 
                        ${currentView === 'settings' 
                            ? (isAdmin ? 'bg-indigo-600 text-white' : 'bg-indigo-50 text-indigo-600') 
                            : (isAdmin ? 'text-slate-400 hover:bg-slate-800 hover:text-white' : 'text-slate-600 hover:bg-slate-50')}`}
                >
                    <Settings className="w-5 h-5" /> Cài đặt tài khoản
                </button>
            </div>

            <div className={`p-4 border-t ${isAdmin ? 'border-slate-700' : 'border-slate-100'}`}>
                <div className="flex items-center gap-3 mb-4 px-2">
                    <UserAvatar user={user} size="md" />
                    <div className="overflow-hidden">
                        <p className={`font-bold text-sm truncate ${isAdmin ? 'text-white' : 'text-slate-800'}`}>{user.name}</p>
                        <p className={`text-xs truncate ${isAdmin ? 'text-slate-400' : 'text-slate-500'}`}>
                            {user.role === 'teacher' ? 'Giáo viên' : user.role === 'admin' ? 'Quản trị viên' : 'Học sinh'}
                        </p>
                    </div>
                </div>
                <button 
                    onClick={handleLogout}
                    className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-colors ${isAdmin ? 'bg-slate-800 text-red-400 hover:bg-slate-700' : 'text-red-500 bg-red-50 hover:bg-red-100'}`}
                >
                    <LogOut className="w-4 h-4" /> Đăng xuất
                </button>
            </div>
        </aside>

        {/* Mobile Header */}
        <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 z-30">
             <div className="flex items-center gap-2">
                <EduLogo className="w-8 h-8" />
                <span className="font-bold text-lg">EduLite</span>
             </div>
             <button onClick={() => {}} className="p-2 text-slate-600">
                <Menu />
             </button>
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-4 md:p-8 pt-20 md:pt-8">
            <header className="mb-8 flex justify-between items-end">
                <div>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">
                        {currentView === 'dashboard' ? (isAdmin ? 'Admin Dashboard' : 'Tổng quan') : 
                         currentView === 'assignments' ? 'Danh sách bài tập' : 
                         currentView === 'users' ? 'Quản lý người dùng' :
                         currentView === 'forum' ? 'Diễn đàn hỏi đáp' :
                         currentView === 'knowledge' ? 'Tra cứu Kiến thức' :
                         currentView === 'settings' ? 'Cài đặt tài khoản' :
                         (isAdmin ? 'Quản lý Góp ý & Báo lỗi' : 'Góp ý & Báo lỗi')}
                    </h1>
                    <p className="text-slate-500 mt-1">
                        {currentView === 'dashboard' ? (isAdmin ? 'Quản lý toàn bộ hệ thống EduLite.' : `Chào mừng trở lại, ${user.name}!`) : 
                         currentView === 'assignments' ? 'Lọc theo môn học và quản lý bài tập.' : 
                         currentView === 'users' ? 'Danh sách và trạng thái tài khoản thành viên.' :
                         currentView === 'forum' ? 'Thảo luận và chia sẻ kiến thức.' :
                         currentView === 'knowledge' ? 'Hỏi đáp và tra cứu công thức nhanh chóng.' :
                         currentView === 'settings' ? 'Chỉnh sửa thông tin cá nhân và hình ảnh.' :
                         (isAdmin ? 'Xem và xử lý phản hồi từ người dùng.' : 'Chúng tôi luôn lắng nghe ý kiến của bạn.')}
                    </p>
                </div>
            </header>

            {currentView === 'users' && isAdmin && (
                <div className="animate-fade-in">
                    <UserManagementView 
                        users={users} 
                        currentUser={user} 
                        onToggleStatus={handleToggleUserStatus} 
                    />
                </div>
            )}

            {currentView === 'feedback' && (
                <div className="animate-fade-in">
                    <FeedbackView 
                        user={user} 
                        feedbacks={feedbacks} 
                        onSubmit={handleAddFeedback} 
                        onStatusChange={isAdmin ? handleFeedbackStatusChange : undefined}
                    />
                </div>
            )}
            
            {currentView === 'forum' && (
                <div className="animate-fade-in">
                    <ForumView 
                        currentUser={user}
                        posts={forumPosts}
                        onAddPost={handleAddForumPost}
                        onAddReply={handleAddForumReply}
                    />
                </div>
            )}

            {currentView === 'knowledge' && (
                <div className="animate-fade-in">
                    <KnowledgeLookupView />
                </div>
            )}

            {currentView === 'settings' && (
                <div className="animate-fade-in">
                    <ProfileSettingsView 
                        user={user} 
                        onSave={handleUpdateProfile} 
                        onCancel={() => setCurrentView('dashboard')}
                    />
                </div>
            )}

            {currentView === 'assignments' && !isAdmin && (
                <div className="space-y-6 animate-fade-in">
                    {/* Subject Tabs */}
                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                        {(Object.keys(SUBJECT_CONFIG) as (Subject | 'all')[]).map(key => (
                            <button
                                key={key}
                                onClick={() => setSelectedSubject(key)}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-all border ${
                                    selectedSubject === key 
                                    ? 'bg-slate-800 text-white border-slate-800 shadow-lg shadow-slate-200' 
                                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                                }`}
                            >
                                {SUBJECT_CONFIG[key].icon}
                                {SUBJECT_CONFIG[key].label}
                            </button>
                        ))}
                    </div>

                    {/* Assignments List */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {filteredAssignments.length > 0 ? (
                            filteredAssignments.map(assign => (
                                <div key={assign.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:border-indigo-200 transition-all group flex flex-col">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 w-fit ${SUBJECT_CONFIG[assign.subject]?.color || SUBJECT_CONFIG['other'].color}`}>
                                            {SUBJECT_CONFIG[assign.subject]?.icon}
                                            {SUBJECT_CONFIG[assign.subject]?.label}
                                        </div>
                                        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded font-mono flex items-center gap-1">
                                            <Clock size={12} /> {assign.dueDate}
                                        </span>
                                    </div>
                                    <h3 className="font-bold text-lg text-slate-800 group-hover:text-indigo-600 transition-colors mb-2">
                                        {assign.title}
                                    </h3>
                                    <p className="text-slate-600 text-sm mb-4 line-clamp-2 flex-1">{assign.description}</p>
                                    
                                    <div className="pt-4 border-t border-slate-50 mt-auto flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                                            <UserAvatar user={users.find(u => u.id === assign.teacherId)} size="sm" />
                                            <span>{assign.teacherName}</span>
                                        </div>
                                        <button className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-bold hover:bg-indigo-100 transition-colors">
                                            {user.role === 'teacher' ? 'Xem chi tiết' : 'Làm bài'}
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-dashed border-slate-300">
                                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400">
                                    <BookOpen size={24} />
                                </div>
                                <p className="text-slate-500 font-medium">Chưa có bài tập nào cho môn này.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {currentView === 'dashboard' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
                    {/* Welcome Banner with Background */}
                    <div className="col-span-full bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-200 relative group">
                        <div className="h-32 w-full absolute top-0 left-0 bg-slate-100">
                             {user.backgroundImage ? (
                                <img src={user.backgroundImage} alt="Cover" className="w-full h-full object-cover" />
                             ) : (
                                <div className="w-full h-full bg-gradient-to-r from-indigo-500 to-purple-600"></div>
                             )}
                        </div>
                        <div className="relative pt-20 px-6 pb-6 flex items-end justify-between">
                            <div className="flex items-end gap-4">
                                <div className="p-1 bg-white rounded-full">
                                    <UserAvatar user={user} size="xl" />
                                </div>
                                <div className="mb-2">
                                    <h2 className="text-2xl font-bold text-slate-800">{user.name}</h2>
                                    <p className="text-slate-500 font-medium">
                                        {user.role === 'teacher' ? 'Giáo viên' : user.role === 'admin' ? 'Quản trị viên' : `Học sinh • Lớp ${user.classCode || '?'}`}
                                    </p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setCurrentView('settings')}
                                className="mb-3 px-4 py-2 bg-white/80 hover:bg-white backdrop-blur-sm border border-slate-200 text-slate-700 rounded-lg text-sm font-bold shadow-sm transition-all"
                            >
                                Chỉnh sửa hồ sơ
                            </button>
                        </div>
                    </div>

                    {isAdmin ? (
                        /* ADMIN STATS */
                        <>
                            <div className="bg-slate-800 rounded-2xl p-6 text-white shadow-lg shadow-slate-300">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                                        <Users className="w-6 h-6 text-white" />
                                    </div>
                                    <span className="text-slate-300 text-sm font-medium">Người dùng</span>
                                </div>
                                <h3 className="text-3xl font-extrabold mb-1">{users.length}</h3>
                                <p className="text-slate-400 text-sm">Tổng số tài khoản</p>
                            </div>
                            
                            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-amber-50 rounded-xl">
                                        <MessageSquare className="w-6 h-6 text-amber-600" />
                                    </div>
                                    <span className="text-slate-500 text-sm font-medium">Phản hồi mới</span>
                                </div>
                                <h3 className="text-3xl font-extrabold text-slate-800 mb-1">
                                    {feedbacks.filter(f => f.status === 'new').length}
                                </h3>
                                <p className="text-slate-500 text-sm">Cần xem xét</p>
                            </div>

                            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-indigo-50 rounded-xl">
                                        <BarChart3 className="w-6 h-6 text-indigo-600" />
                                    </div>
                                    <span className="text-slate-500 text-sm font-medium">Hoạt động</span>
                                </div>
                                <h3 className="text-3xl font-extrabold text-slate-800 mb-1">{submissions.length}</h3>
                                <p className="text-slate-500 text-sm">Lượt nộp bài toàn hệ thống</p>
                            </div>
                        </>
                    ) : (
                        /* USER STATS */
                        <>
                            <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg shadow-indigo-200">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                                        <BookOpen className="w-6 h-6 text-white" />
                                    </div>
                                    <span className="text-indigo-100 text-sm font-medium">Bài tập</span>
                                </div>
                                <h3 className="text-3xl font-extrabold mb-1">{assignments.length}</h3>
                                <p className="text-indigo-100 text-sm">Tổng số bài tập đang có</p>
                            </div>

                            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-indigo-50 rounded-xl">
                                        <MessageCircle className="w-6 h-6 text-indigo-600" />
                                    </div>
                                    <span className="text-slate-500 text-sm font-medium">Diễn đàn</span>
                                </div>
                                <h3 className="text-3xl font-extrabold text-slate-800 mb-1">
                                    {forumPosts.length}
                                </h3>
                                <p className="text-slate-500 text-sm">Chủ đề thảo luận</p>
                            </div>

                            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-amber-50 rounded-xl">
                                        <MessageSquare className="w-6 h-6 text-amber-600" />
                                    </div>
                                    <span className="text-slate-500 text-sm font-medium">Góp ý</span>
                                </div>
                                <h3 className="text-3xl font-extrabold text-slate-800 mb-1">{feedbacks.filter(f => f.userId === user.id).length}</h3>
                                <p className="text-slate-500 text-sm">Tổng số góp ý của bạn</p>
                            </div>
                        </>
                    )}
                </div>
            )}
        </main>
    </div>
  );
}

export default App;
