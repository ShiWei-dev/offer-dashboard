'use client';

import { useState } from 'react';
import { JobApplication, JobStatus, Priority, ClosedResult } from '@/lib/types';
import { KanbanColumn } from './kanban-column';
import { BOARD_COLUMNS } from '@/lib/constants';
import { useJobStore } from '@/lib/store';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners
} from '@dnd-kit/core';
import { JobCard } from './job-card';

interface KanbanBoardProps {
  onJobClick: (job: JobApplication) => void;
}

export function KanbanBoard({ onJobClick }: KanbanBoardProps) {
  const { jobs, updateJob } = useJobStore();
  const [activeJob, setActiveJob] = useState<JobApplication | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // 按状态分组
  const jobsByStatus = BOARD_COLUMNS.reduce((acc, status) => {
    acc[status] = jobs.filter(job => job.status === status);
    return acc;
  }, {} as Record<JobStatus, JobApplication[]>);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const job = jobs.find(j => j.id === active.id);
    if (job) {
      setActiveJob(job);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      setActiveJob(null);
      return;
    }

    const jobId = active.id as string;
    const newStatus = over.id as JobStatus;

    // 检查是否是有效的状态
    if (BOARD_COLUMNS.includes(newStatus)) {
      const job = jobs.find(j => j.id === jobId);

      if (job && job.status !== newStatus) {
        // 更新状态
        const updates: Partial<JobApplication> = { status: newStatus };

        // 如果移动到"已投递"，设置投递日期
        if (newStatus === 'applied' && !job.applied_date) {
          updates.applied_date = new Date();
        }

        updateJob(jobId, updates);
      }
    }

    setActiveJob(null);
  };

  const handlePriorityChange = (jobId: string, priority: Priority) => {
    updateJob(jobId, { priority });
  };

  const handleStatusChange = (jobId: string, status: JobStatus) => {
    updateJob(jobId, { status });
  };

  const handleResultChange = (jobId: string, result: ClosedResult | null) => {
    updateJob(jobId, { closed_result: result || undefined });
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-6 h-full overflow-x-auto pb-4">
        {BOARD_COLUMNS.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            jobs={jobsByStatus[status]}
            onJobClick={onJobClick}
            onPriorityChange={handlePriorityChange}
            onStatusChange={handleStatusChange}
            onResultChange={handleResultChange}
          />
        ))}
      </div>

      <DragOverlay>
        {activeJob ? (
          <div className="rotate-3">
            <JobCard job={activeJob} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
