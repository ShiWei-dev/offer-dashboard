'use client';

import { JobApplication, Priority, JobStatus, ClosedResult } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { PRIORITY_CONFIG, CHANNEL_CONFIG, STATUS_CONFIG } from '@/lib/constants';
import { formatRelativeTime, cn } from '@/lib/utils';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { CalendarIcon, MapPinIcon, DollarSignIcon, ExternalLinkIcon, MoreVerticalIcon } from 'lucide-react';

interface JobCardProps {
  job: JobApplication;
  onClick?: () => void;
  onPriorityChange?: (jobId: string, priority: Priority) => void;
  onStatusChange?: (jobId: string, status: JobStatus) => void;
  onResultChange?: (jobId: string, result: ClosedResult | null) => void;
}

export function JobCard({ job, onClick, onPriorityChange, onStatusChange, onResultChange }: JobCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: job.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const priorityConfig = PRIORITY_CONFIG[job.priority];

  // 计算当前进度
  const getCurrentProgress = () => {
    // 如果有笔试记录，找最近的未完成笔试
    if (job.written_tests && job.written_tests.length > 0) {
      const pendingTests = job.written_tests.filter(t =>
        !t.result || t.result === 'pending' || new Date(t.date) > new Date()
      );
      if (pendingTests.length > 0) {
        return '📝 笔试';
      }
    }

    // 根据面试记录判断进度
    if (job.interviews && job.interviews.length > 0) {
      const sortedInterviews = [...job.interviews].sort((a, b) => b.round - a.round);
      const latestInterview = sortedInterviews[0];

      // 如果最新一轮面试未完成
      if (!latestInterview.result || latestInterview.result === 'pending') {
        // 根据 content_type 判断
        if (latestInterview.content_type === 'hr') {
          return '💼 HR面';
        } else if (latestInterview.content_type === 'manager') {
          return '👔 主管面';
        } else if (latestInterview.content_type === 'ceo') {
          return '🎯 高管面';
        } else if (latestInterview.content_type === 'technical') {
          return `💻 技术${latestInterview.round}面`;
        }
        return `🎯 ${latestInterview.round}面`;
      }

      // 如果最新一轮面试通过，显示下一轮
      if (latestInterview.result === 'pass') {
        const nextRound = latestInterview.round + 1;
        return `🎯 待${nextRound}面`;
      }
    }

    // 如果有下次面试/笔试安排
    if (job.next_interview_date) {
      if (job.next_event_type === 'written') {
        return '📝 待笔试';
      }
      // 根据已有面试记录推断下一轮
      const nextRound = (job.interviews?.length || 0) + 1;
      return `🎯 待${nextRound}面`;
    }

    return null;
  };

  const currentProgress = getCurrentProgress();

  const handlePriorityChange = (priority: Priority) => {
    if (onPriorityChange) {
      onPriorityChange(job.id, priority);
    }
  };

  const handleStatusChange = (status: JobStatus) => {
    if (onStatusChange) {
      onStatusChange(job.id, status);
    }
  };

  const handleResultChange = (result: ClosedResult | null) => {
    if (onResultChange) {
      onResultChange(job.id, result);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        'touch-none',
        isDragging && 'opacity-50'
      )}
    >
      <Card
        className={cn(
          'p-4 cursor-pointer hover:shadow-md transition-all duration-200',
          'hover:-translate-y-0.5 border-l-4',
          job.priority === 'high' && 'border-l-red-500',
          job.priority === 'medium' && 'border-l-yellow-500',
          job.priority === 'low' && 'border-l-gray-400'
        )}
        onClick={onClick}
      >
        {/* 标题和快速操作 */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <h3 className="font-semibold text-gray-900 text-base flex-1">{job.company}</h3>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={<Button variant="ghost" size="icon" className="h-7 w-7 -mt-1" />}
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
            >
              <MoreVerticalIcon className="w-4 h-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
              {/* 优先级子菜单 */}
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <span>⭐ 优先级</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePriorityChange('high');
                    }}
                  >
                    ⭐⭐⭐ 高优先级
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePriorityChange('medium');
                    }}
                  >
                    ⭐⭐ 中优先级
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePriorityChange('low');
                    }}
                  >
                    ⭐ 低优先级
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>

              <DropdownMenuSeparator />

              {/* 状态子菜单 */}
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <span>📊 状态</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStatusChange('todo');
                    }}
                  >
                    📋 待投递
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStatusChange('applied');
                    }}
                  >
                    📮 已投递
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStatusChange('interviewing');
                    }}
                  >
                    💬 面试中
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStatusChange('closed');
                    }}
                  >
                    📁 已完结
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>

              <DropdownMenuSeparator />

              {/* 完结结果子菜单 */}
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <span>🎯 结果</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      handleResultChange('offer');
                    }}
                  >
                    ✅ 获得 Offer
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      handleResultChange('rejected');
                    }}
                  >
                    ❌ 被拒绝
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      handleResultChange('withdrew');
                    }}
                  >
                    🚫 主动放弃
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      handleResultChange('ghosted');
                    }}
                  >
                    👻 被鸽了
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      handleResultChange(null);
                    }}
                  >
                    ⭕ 清除结果
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* 优先级、渠道和进度 */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {priorityConfig.icon} {priorityConfig.label}
            </Badge>
            {currentProgress && (
              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                {currentProgress}
              </Badge>
            )}
          </div>
          {job.channel && (
            <span className="text-xs text-gray-500">
              {CHANNEL_CONFIG[job.channel]}
            </span>
          )}
        </div>

        {/* 职位名 */}
        <p className="text-sm text-gray-700 mb-2">
          {job.position}
        </p>

        {/* 详细信息 - 紧凑布局 */}
        <div className="space-y-1.5 text-xs text-gray-600">
          {/* 地点和薪资同行 */}
          {(job.location || job.salary_range) && (
            <div className="flex items-center gap-3">
              {job.location && (
                <div className="flex items-center gap-1">
                  <MapPinIcon className="w-3 h-3" />
                  <span>{job.location}</span>
                </div>
              )}
              {job.salary_range && (
                <div className="flex items-center gap-1">
                  <DollarSignIcon className="w-3 h-3" />
                  <span>{job.salary_range}</span>
                </div>
              )}
            </div>
          )}

          {/* 投递日期 */}
          {job.applied_date && (
            <div className="flex items-center gap-1">
              <CalendarIcon className="w-3 h-3" />
              <span>{formatRelativeTime(job.applied_date)}</span>
            </div>
          )}

          {/* 下次面试 */}
          {job.next_interview_date && (
            <div className="flex items-center gap-1 text-orange-600 font-medium">
              <CalendarIcon className="w-3 h-3" />
              <span>
                {job.next_event_type === 'written' ? '笔试' : '面试'}: {formatRelativeTime(job.next_interview_date)}
              </span>
            </div>
          )}

          {/* JD 链接 */}
          {job.job_url && (
            <div className="flex items-center gap-1 text-blue-600">
              <ExternalLinkIcon className="w-3 h-3" />
              <a
                href={job.job_url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="hover:underline text-xs"
              >
                查看职位详情
              </a>
            </div>
          )}
        </div>

        {/* 标签 */}
        {job.tags && job.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {job.tags.map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* 结果标识 */}
        {job.closed_result && (
          <div className="mt-3 text-center">
            {job.closed_result === 'offer' && (
              <Badge className="bg-green-600 text-white">
                ✅ 已获 Offer
              </Badge>
            )}
            {job.closed_result === 'rejected' && (
              <Badge className="bg-red-600 text-white">
                ❌ 被拒绝
              </Badge>
            )}
            {job.closed_result === 'withdrew' && (
              <Badge className="bg-gray-600 text-white">
                🚫 主动放弃
              </Badge>
            )}
            {job.closed_result === 'ghosted' && (
              <Badge className="bg-purple-600 text-white">
                👻 被鸽了
              </Badge>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
