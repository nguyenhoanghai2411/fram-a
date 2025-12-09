
export type UserRole = 'teacher' | 'student' | 'admin' | null;

export type Subject = 'math' | 'physics' | 'chemistry' | 'biology' | 'history' | 'geography' | 'literature' | 'english' | 'informatics' | 'other';

export interface Question {
  id: string;
  text: string; // e.g. "Câu 1", "Question 1"
  type: 'text' | 'choice'; // New field: Short Answer vs Multiple Choice
  options?: string[]; // New field: Options for multiple choice (e.g. ["A", "B", "C", "D"])
  correctAnswer?: string;
  points?: number;
}

export interface ClassGroup {
  id: string; // Custom ID set by teacher (e.g. MATH101)
  name: string;
  password?: string;
  teacherId: string;
  memberIds: string[]; // List of student IDs
  maxCapacity: number; // Default 50
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  answerKey?: string; // For legacy text-based description auto-grading
  subject: Subject; // New field for categorization
  
  // New fields for File-based Assignments
  attachmentBase64?: string; // The exam paper image
  questions?: Question[]; // The structured answer sheet
  
  teacherId: string;
  teacherName: string;
  
  // Optional: Assign to specific groups
  classGroupIds?: string[]; // Changed from single ID to array
}

export interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName: string;
  submittedAt: string;
  
  // Legacy file upload
  fileBase64?: string; 
  fileType?: string;
  
  // New text answers
  answers?: Record<string, string>; // questionId -> studentAnswer
  
  score?: number;
  feedback?: string;
  status: 'pending' | 'graded';
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  classCode?: string;
  connections: string[];
  joinedClassIds?: string[]; // IDs of ClassGroups the student is in
  avatar?: string; // base64 string or preset ID (e.g., 'preset-1')
  backgroundImage?: string; // base64 string for profile banner
  status: 'active' | 'banned'; // New field for account status
}

export interface FriendRequest {
  id: string;
  fromId: string;
  fromName: string;
  toId: string;
  toName: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

export interface Feedback {
  id: string;
  userId: string;
  userName: string;
  role: UserRole;
  content: string;
  type: 'bug' | 'feature' | 'content' | 'other';
  status: 'new' | 'reviewed' | 'resolved'; // Admin status tracking
  createdAt: string;
}

export interface ForumReply {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  userAvatar?: string;
  content: string;
  createdAt: string;
}

export interface ForumPost {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  userAvatar?: string;
  title: string;
  content: string;
  replies: ForumReply[];
  createdAt: string;
  views: number;
  likes: number;
}
