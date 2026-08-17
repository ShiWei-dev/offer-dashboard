// 投递状态
export type JobStatus = 'todo' | 'applied' | 'interviewing' | 'closed';

// 优先级
export type Priority = 'high' | 'medium' | 'low';

// 投递渠道
export type Channel = 'official' | 'boss' | 'liepin' | 'lagou' | 'zhipin' | 'referral' | 'email' | 'other';

// 面试类型（形式）
export type InterviewType = 'onsite' | 'video' | 'phone';

// 面试内容类型
export type InterviewContentType = 'technical' | 'hr' | 'manager' | 'ceo' | 'other';

// 笔试类型
export type WrittenTestType = 'online' | 'onsite';

// 笔试题目类型
export type WrittenTestCategory = 'algorithm' | 'aptitude' | 'personality' | 'technical' | 'mixed' | 'other';

// 笔试结果
export type WrittenTestResult = 'pass' | 'fail' | 'pending';

// 笔试记录
export interface WrittenTest {
  id: string;
  date: Date;
  type: WrittenTestType;       // 在线笔试或现场笔试
  duration?: number;            // 时长（分钟）
  platform?: string;            // 笔试平台（如：牛客、赛码）
  topics?: string[];            // 题目类型（算法、SQL、系统设计等）
  notes?: string;               // 题目记录和复盘
  result?: WrittenTestResult;
}

// 面试结果
export type InterviewResult = 'pass' | 'fail' | 'pending';

// 结束状态
export type ClosedResult = 'offer' | 'rejected' | 'withdrew' | 'ghosted';

// 问答对
export interface QAPair {
  id: string;
  question: string;
  answer: string;
  reflection?: string;
}

// 面试记录
export interface Interview {
  id: string;
  date: Date;
  type: InterviewType;
  content_type?: InterviewContentType;  // 面试内容类型（技术面/HR面等）
  round: number;               // 第几轮
  interviewer?: string;        // 面试官
  notes?: string;              // 自由文本备注
  qa_pairs?: QAPair[];         // 结构化问答
  result?: InterviewResult;
}

// 投递记录
export interface JobApplication {
  id: string;

  // 基础信息
  company: string;             // 公司名
  position: string;            // 职位
  location: string;            // 地点
  salary_range?: string;       // 薪资范围
  job_url?: string;            // JD 链接

  // 状态信息
  status: JobStatus;           // 当前状态
  priority: Priority;          // 优先级

  // 投递信息
  applied_date?: Date;         // 投递日期
  channel?: Channel;           // 投递渠道
  resume_version?: string;     // 简历版本

  // 面试相关
  interviews: Interview[];     // 面试记录
  written_tests: WrittenTest[]; // 笔试记录
  next_interview_date?: Date;  // 下次笔试/面试时间
  next_event_type?: 'written' | 'interview'; // 下次安排的类型
  next_interview_content_type?: InterviewContentType; // 下次面试的内容类型（技术/HR等）
  next_written_test_category?: WrittenTestCategory;   // 下次笔试的题目类型（算法/测评等）

  // 结果
  closed_result?: ClosedResult; // 结束状态
  offer_salary?: string;       // Offer 薪资
  rejection_reason?: string;   // 拒绝原因

  // 邮件追踪
  email_subject?: string;      // 邮件主题
  email_from?: string;         // 发件人

  // 其他
  notes?: string;              // 备注
  tags?: string[];             // 标签

  // 元数据
  created_at: Date;
  updated_at: Date;
}

// 统计数据
export interface Statistics {
  total: number;
  by_status: Record<JobStatus, number>;
  response_rate: number;       // 回复率 (已投递中有回复的比例)
  interview_rate: number;      // 面试率 (面试中 / 已投递)
  offer_count: number;         // Offer 数量
  avg_response_time: number;   // 平均回复时间（天）
}

// 状态配置
export interface StatusConfig {
  value: JobStatus;
  label: string;
  color: string;
  bgColor: string;
  icon: string;
}

// 筛选条件
export interface FilterOptions {
  status?: JobStatus[];
  priority?: Priority[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  search?: string;
}
