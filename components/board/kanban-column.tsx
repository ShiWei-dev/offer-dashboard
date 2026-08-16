'use client';

import { JobApplication, JobStatus } from '@/lib/types';
import { JobCard } from './job-card';
import { STATUS_CONFIG } from '@/lib/constants';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { cn } from '@/lib/utils';

interface KanbanColumnProps {
  status: JobStatus;
  jobs: JobApplication[];
  onJobClick: (job: JobApplication) => void;
}

export function KanbanColumn({ status, jobs, onJobClick }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
  });

  const statusConfig = STATUS_CONFIG[status];

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex flex-col h-full min-w-[300px] bg-gray-50 rounded-lg p-4",
        isOver && 'ring-2 ring-blue-400'
      )}
    >
      {/* 列标题 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{statusConfig.icon}</span>
          <h3 className="font-semibold text-gray-900">
            {statusConfig.label}
          </h3>
        </div>
        <div className={cn(
          'flex items-center justify-center w-7 h-7 rounded-full text-sm font-medium',
          statusConfig.bgColor,
          statusConfig.color
        )}>
          {jobs.length}
        </div>
      </div>

      {/* 卡片列表 */}
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-3 min-h-[200px] p-1">
          <SortableContext
            items={jobs.map(job => job.id)}
            strategy={verticalListSortingStrategy}
          >
            {jobs.length === 0 ? (
              <div className="flex items-center justify-center h-32 text-gray-400 text-sm">
                暂无投递记录
              </div>
            ) : (
              jobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  onClick={() => onJobClick(job)}
                />
              ))
            )}
          </SortableContext>
        </div>
      </div>
    </div>
  );
}
