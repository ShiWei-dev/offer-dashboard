import { JobApplication, Channel } from './types';
import { nanoid } from 'nanoid';

/**
 * 邮件解析结果
 */
export interface EmailParseResult {
  company?: string;
  position?: string;
  location?: string;
  email_subject: string;
  email_from: string;
  applied_date?: Date;
  channel: Channel;
  job_url?: string;
  confidence: number; // 0-1 置信度
}

/**
 * 解析投递确认邮件
 * 支持常见招聘平台的邮件格式
 */
export function parseApplicationEmail(emailContent: string, subject: string, from: string): EmailParseResult | null {
  const result: EmailParseResult = {
    email_subject: subject,
    email_from: from,
    channel: detectChannel(from, subject),
    confidence: 0
  };

  // 检测是否是投递确认邮件
  if (!isApplicationConfirmation(subject, emailContent)) {
    return null;
  }

  // 提取公司名
  result.company = extractCompany(emailContent, subject);

  // 提取职位名
  result.position = extractPosition(emailContent, subject);

  // 提取地点
  result.location = extractLocation(emailContent);

  // 提取投递日期
  result.applied_date = extractDate(emailContent) || new Date();

  // 提取职位链接
  result.job_url = extractJobUrl(emailContent);

  // 计算置信度
  result.confidence = calculateConfidence(result);

  return result.confidence > 0.3 ? result : null;
}

/**
 * 检测投递渠道
 */
function detectChannel(from: string, subject: string): Channel {
  const lowerFrom = from.toLowerCase();
  const lowerSubject = subject.toLowerCase();

  if (lowerFrom.includes('boss') || lowerFrom.includes('zhipin')) return 'boss';
  if (lowerFrom.includes('liepin')) return 'liepin';
  if (lowerFrom.includes('lagou')) return 'lagou';
  if (lowerFrom.includes('zhaopin')) return 'zhipin';
  if (lowerSubject.includes('内推') || lowerSubject.includes('referral')) return 'referral';

  return 'email';
}

/**
 * 判断是否是投递确认邮件
 */
function isApplicationConfirmation(subject: string, content: string): boolean {
  const keywords = [
    '投递成功', '简历已投递', '已收到您的简历', '申请已提交',
    'application received', 'application submitted', 'resume received',
    '您的简历已发送', '投递确认', '报名成功'
  ];

  const text = (subject + ' ' + content).toLowerCase();
  return keywords.some(keyword => text.includes(keyword.toLowerCase()));
}

/**
 * 提取公司名
 */
function extractCompany(content: string, subject: string): string | undefined {
  const patterns = [
    /(?:公司[：:]\s*|Company:\s*)([^\n\r，,。.]{2,30})/i,
    /(?:来自|From)\s*[:：]?\s*([^\n\r，,。.]{2,30}?)(?:的|邀请)/,
    /([^\n\r，,。.]{2,30}?)(?:公司|集团|科技|有限公司)/,
    /^(.+?)(?:招聘|职位|岗位)/,
  ];

  const text = subject + '\n' + content;

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }

  return undefined;
}

/**
 * 提取职位名
 */
function extractPosition(content: string, subject: string): string | undefined {
  const patterns = [
    /(?:职位[：:]\s*|Position:\s*)([^\n\r，,。.]{2,40})/i,
    /(?:岗位[：:]\s*)([^\n\r，,。.]{2,40})/,
    /(?:申请|应聘|投递)[:：]?\s*([^\n\r，,。.]{2,40})/,
    /([^\n\r，,。.]{2,40}?)(?:岗位|职位)/,
  ];

  const text = subject + '\n' + content;

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const pos = match[1].trim();
      // 过滤掉无效结果
      if (!pos.includes('公司') && !pos.includes('确认')) {
        return pos;
      }
    }
  }

  return undefined;
}

/**
 * 提取地点
 */
function extractLocation(content: string): string | undefined {
  const cityPattern = /(北京|上海|广州|深圳|杭州|成都|武汉|西安|南京|苏州|重庆|天津|郑州|长沙|青岛|大连|厦门|宁波|济南|沈阳|合肥)/;
  const match = content.match(cityPattern);
  return match ? match[1] : undefined;
}

/**
 * 提取日期
 */
function extractDate(content: string): Date | undefined {
  // 提取 YYYY-MM-DD 或 YYYY/MM/DD 格式
  const datePattern = /(\d{4})[-/年](\d{1,2})[-/月](\d{1,2})/;
  const match = content.match(datePattern);

  if (match) {
    const [, year, month, day] = match;
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  }

  return undefined;
}

/**
 * 提取职位链接
 */
function extractJobUrl(content: string): string | undefined {
  const urlPattern = /(https?:\/\/[^\s<>"{}|\\^`\[\]]+)/g;
  const matches = content.match(urlPattern);

  if (matches) {
    // 优先返回包含 job/position/recruitment 的链接
    const jobUrl = matches.find(url =>
      /job|position|recruitment|zhaopin|geek|boss|liepin|lagou/i.test(url)
    );
    return jobUrl || matches[0];
  }

  return undefined;
}

/**
 * 计算置信度
 */
function calculateConfidence(result: EmailParseResult): number {
  let score = 0;

  if (result.company) score += 0.3;
  if (result.position) score += 0.3;
  if (result.location) score += 0.1;
  if (result.job_url) score += 0.2;
  if (result.channel !== 'email') score += 0.1;

  return Math.min(score, 1);
}

/**
 * 从邮件创建投递记录
 */
export function createJobFromEmail(parseResult: EmailParseResult): JobApplication {
  return {
    id: nanoid(),
    company: parseResult.company || '未知公司',
    position: parseResult.position || '未知职位',
    location: parseResult.location || '',
    status: 'applied',
    priority: 'medium',
    applied_date: parseResult.applied_date,
    channel: parseResult.channel,
    job_url: parseResult.job_url,
    email_subject: parseResult.email_subject,
    email_from: parseResult.email_from,
    interviews: [],
    written_tests: [],
    notes: `从邮件自动创建 (置信度: ${Math.round(parseResult.confidence * 100)}%)\n主题: ${parseResult.email_subject}`,
    created_at: new Date(),
    updated_at: new Date()
  };
}

/**
 * 批量解析邮件
 */
export function parseMultipleEmails(emails: Array<{ content: string; subject: string; from: string }>): JobApplication[] {
  const jobs: JobApplication[] = [];

  for (const email of emails) {
    const result = parseApplicationEmail(email.content, email.subject, email.from);
    if (result) {
      jobs.push(createJobFromEmail(result));
    }
  }

  return jobs;
}
