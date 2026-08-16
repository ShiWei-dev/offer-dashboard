import { JobStatus, Priority, Channel, StatusConfig } from './types';

/**
 * 状态配置
 */
export const STATUS_CONFIG: Record<JobStatus, StatusConfig> = {
  todo: {
    value: 'todo',
    label: '待投递',
    color: 'text-gray-700',
    bgColor: 'bg-gray-100',
    icon: '📝'
  },
  applied: {
    value: 'applied',
    label: '已投递',
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
    icon: '📤'
  },
  interviewing: {
    value: 'interviewing',
    label: '流程中',
    color: 'text-orange-700',
    bgColor: 'bg-orange-100',
    icon: '🎯'
  },
  closed: {
    value: 'closed',
    label: '已完结',
    color: 'text-green-700',
    bgColor: 'bg-green-100',
    icon: '✅'
  }
};

/**
 * 优先级配置
 */
export const PRIORITY_CONFIG: Record<Priority, { label: string; color: string; icon: string }> = {
  high: {
    label: '高优先级',
    color: 'text-red-600',
    icon: '🔥'
  },
  medium: {
    label: '中优先级',
    color: 'text-yellow-600',
    icon: '⭐'
  },
  low: {
    label: '低优先级',
    color: 'text-gray-600',
    icon: '💤'
  }
};

/**
 * 投递渠道配置
 */
export const CHANNEL_CONFIG: Record<Channel, string> = {
  official: '官网',
  boss: 'Boss直聘',
  liepin: '猎聘',
  lagou: '拉勾',
  zhipin: '智联招聘',
  referral: '内推',
  email: '邮件',
  other: '其他'
};

/**
 * 看板列顺序
 */
export const BOARD_COLUMNS: JobStatus[] = ['todo', 'applied', 'interviewing', 'closed'];

/**
 * 默认简历版本
 */
export const DEFAULT_RESUME_VERSIONS = [
  '通用版',
  '前端专版',
  '后端专版',
  '算法专版',
  '产品专版',
  '数据分析专版'
];
