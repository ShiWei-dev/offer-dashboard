'use client';

import { JobApplication } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PRIORITY_CONFIG, CHANNEL_CONFIG } from '@/lib/constants';
import { formatRelativeTime, cn } from '@/lib/utils';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { CalendarIcon, MapPinIcon, DollarSignIcon, ExternalLinkIcon } from 'lucide-react';

interface JobCardProps {
  job: JobApplication;
  onClick?: () => void;
}

export function JobCard({ job, onClick }: JobCardProps) {
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
        {/* 优先级和渠道 */}
        <div className="flex items-center justify-between mb-2">
          <Badge variant="secondary" className="text-xs">
            {priorityConfig.icon} {priorityConfig.label}
          </Badge>
          {job.channel && (
            <span className="text-xs text-gray-500">
              {CHANNEL_CONFIG[job.channel]}
            </span>
          )}
        </div>

        {/* 公司名 */}
        <h3 className="font-semibold text-lg mb-1 text-gray-900">
          {job.company}
        </h3>

        {/* 职位名 */}
        <p className="text-sm text-gray-700 mb-3">
          {job.position}
        </p>

        {/* 详细信息 */}
        <div className="space-y-2 text-xs text-gray-600">
          {/* 地点 */}
          {job.location && (
            <div className="flex items-center gap-1">
              <MapPinIcon className="w-3 h-3" />
              <span>{job.location}</span>
            </div>
          )}

          {/* 薪资 */}
          {job.salary_range && (
            <div className="flex items-center gap-1">
              <DollarSignIcon className="w-3 h-3" />
              <span>{job.salary_range}</span>
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
              <span>面试: {formatRelativeTime(job.next_interview_date)}</span>
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
                className="hover:underline"
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

        {/* Offer 标识 */}
        {job.status === 'closed' && job.closed_result === 'offer' && (
          <div className="mt-3 text-center">
            <Badge className="bg-green-600 text-white">
              ✅ 已获 Offer
            </Badge>
          </div>
        )}
      </Card>
    </div>
  );
}
