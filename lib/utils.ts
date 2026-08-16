import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { JobApplication, JobStatus, Statistics } from "./types"
import { formatDistanceToNow, differenceInDays } from "date-fns"
import { zhCN } from "date-fns/locale"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 格式化相对时间
 */
export function formatRelativeTime(date: Date | undefined): string {
  if (!date) return '未知'

  try {
    return formatDistanceToNow(date, {
      addSuffix: true,
      locale: zhCN
    })
  } catch {
    return '无效日期'
  }
}

/**
 * 格式化日期
 */
export function formatDate(date: Date | undefined, format: 'short' | 'long' = 'short'): string {
  if (!date) return '未设置'

  try {
    if (format === 'short') {
      return new Intl.DateTimeFormat('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).format(date)
    } else {
      return new Intl.DateTimeFormat('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
      }).format(date)
    }
  } catch {
    return '无效日期'
  }
}

/**
 * 计算统计数据
 */
export function calculateStatistics(jobs: JobApplication[]): Statistics {
  const total = jobs.length

  const by_status: Record<JobStatus, number> = {
    todo: 0,
    applied: 0,
    interviewing: 0,
    closed: 0
  }

  jobs.forEach(job => {
    by_status[job.status]++
  })

  // 回复率：已投递中进入面试或已完结的比例
  const appliedJobs = jobs.filter(j => j.status === 'applied' || j.status === 'interviewing' || j.status === 'closed')
  const respondedJobs = jobs.filter(j => j.status === 'interviewing' || j.status === 'closed')
  const response_rate = appliedJobs.length > 0 ? respondedJobs.length / appliedJobs.length : 0

  // 面试率：进入面试的比例
  const interviewJobs = jobs.filter(j => j.status === 'interviewing' || (j.status === 'closed' && j.interviews.length > 0))
  const interview_rate = appliedJobs.length > 0 ? interviewJobs.length / appliedJobs.length : 0

  // Offer 数量
  const offer_count = jobs.filter(j => j.status === 'closed' && j.closed_result === 'offer').length

  // 平均回复时间（投递到面试的天数）
  const responseTimes = jobs
    .filter(j => j.applied_date && j.next_interview_date)
    .map(j => differenceInDays(j.next_interview_date!, j.applied_date!))
    .filter(days => days >= 0)

  const avg_response_time = responseTimes.length > 0
    ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
    : 0

  return {
    total,
    by_status,
    response_rate,
    interview_rate,
    offer_count,
    avg_response_time
  }
}

/**
 * 筛选投递记录
 */
export function filterJobs(
  jobs: JobApplication[],
  filters: {
    status?: JobStatus[]
    priority?: string[]
    search?: string
    dateRange?: { start: Date; end: Date }
  }
): JobApplication[] {
  let filtered = [...jobs]

  // 状态筛选
  if (filters.status && filters.status.length > 0) {
    filtered = filtered.filter(job => filters.status!.includes(job.status))
  }

  // 优先级筛选
  if (filters.priority && filters.priority.length > 0) {
    filtered = filtered.filter(job => filters.priority!.includes(job.priority))
  }

  // 搜索
  if (filters.search) {
    const search = filters.search.toLowerCase()
    filtered = filtered.filter(job =>
      job.company.toLowerCase().includes(search) ||
      job.position.toLowerCase().includes(search) ||
      job.location.toLowerCase().includes(search)
    )
  }

  // 日期范围
  if (filters.dateRange) {
    filtered = filtered.filter(job => {
      if (!job.applied_date) return false
      return job.applied_date >= filters.dateRange!.start &&
             job.applied_date <= filters.dateRange!.end
    })
  }

  return filtered
}

/**
 * 导出为 JSON
 */
export function exportToJSON(jobs: JobApplication[]): string {
  return JSON.stringify(jobs, null, 2)
}

/**
 * 从 JSON 导入
 */
export function importFromJSON(json: string): JobApplication[] {
  try {
    const data = JSON.parse(json)

    // 验证数据格式
    if (!Array.isArray(data)) {
      throw new Error('数据格式错误：应为数组')
    }

    // 转换日期字段
    return data.map(job => ({
      ...job,
      created_at: new Date(job.created_at),
      updated_at: new Date(job.updated_at),
      applied_date: job.applied_date ? new Date(job.applied_date) : undefined,
      next_interview_date: job.next_interview_date ? new Date(job.next_interview_date) : undefined,
      interviews: job.interviews?.map((interview: any) => ({
        ...interview,
        date: new Date(interview.date)
      })) || [],
      written_tests: job.written_tests?.map((test: any) => ({
        ...test,
        date: new Date(test.date)
      })) || []
    }))
  } catch (error) {
    throw new Error(`导入失败：${error instanceof Error ? error.message : '未知错误'}`)
  }
}

/**
 * 下载文件
 */
export function downloadFile(content: string, filename: string, type: string = 'application/json') {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
