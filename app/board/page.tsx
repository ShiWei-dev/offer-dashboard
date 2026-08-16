'use client';

import { useState } from 'react';
import { KanbanBoard } from '@/components/board/kanban-board';
import { KanbanColumn } from '@/components/board/kanban-column';
import { JobCard } from '@/components/board/job-card';
import { JobForm } from '@/components/jobs/job-form';
import { JobDetail } from '@/components/jobs/job-detail';
import { EmailImport } from '@/components/jobs/email-import';
import { SearchFilter } from '@/components/search/search-filter';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useJobStore } from '@/lib/store';
import { filterJobs } from '@/lib/utils';
import { JobApplication, JobStatus, Priority, ClosedResult } from '@/lib/types';
import { BOARD_COLUMNS } from '@/lib/constants';
import { PlusIcon, MailIcon } from 'lucide-react';
import Link from 'next/link';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter
} from '@dnd-kit/core';

export default function BoardPage() {
  const { jobs, addJob, updateJob, deleteJob } = useJobStore();
  const [selectedJob, setSelectedJob] = useState<JobApplication | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isEmailImportOpen, setIsEmailImportOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<JobApplication | null>(null);

  // 筛选状态
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilters, setStatusFilters] = useState<JobStatus[]>([]);
  const [priorityFilters, setPriorityFilters] = useState<Priority[]>([]);

  // 应用筛选
  const filteredJobs = filterJobs(jobs, {
    search: searchQuery,
    status: statusFilters.length > 0 ? statusFilters : undefined,
    priority: priorityFilters.length > 0 ? priorityFilters : undefined,
  });

  const handleJobClick = (job: JobApplication) => {
    setSelectedJob(job);
    setIsDetailOpen(true);
  };

  const handleAddNew = () => {
    setEditingJob(null);
    setIsFormOpen(true);
  };

  const handleEdit = () => {
    setEditingJob(selectedJob);
    setIsDetailOpen(false);
    setIsFormOpen(true);
  };

  const handleDelete = () => {
    if (selectedJob && confirm('确定要删除这条投递记录吗？')) {
      deleteJob(selectedJob.id);
      setIsDetailOpen(false);
      setSelectedJob(null);
    }
  };

  const handleFormSubmit = (job: JobApplication) => {
    if (editingJob) {
      updateJob(job.id, job);
    } else {
      addJob(job);
    }
    setIsFormOpen(false);
    setEditingJob(null);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setStatusFilters([]);
    setPriorityFilters([]);
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">
      {/* 头部 */}
      <header className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">看板视图</h1>
              <p className="text-sm text-gray-600 mt-1">拖拽卡片快速更新投递状态</p>
            </div>
            <div className="flex gap-3">
              <Button onClick={() => setIsEmailImportOpen(true)} variant="outline">
                <MailIcon className="w-4 h-4 mr-2" />
                导入邮件
              </Button>
              <Button onClick={handleAddNew}>
                <PlusIcon className="w-4 h-4 mr-2" />
                添加投递
              </Button>
              <Link href="/">
                <Button variant="outline">返回首页</Button>
              </Link>
            </div>
          </div>

          {/* 搜索筛选 */}
          <SearchFilter
            onSearchChange={setSearchQuery}
            onStatusFilter={setStatusFilters}
            onPriorityFilter={setPriorityFilters}
            onClearFilters={handleClearFilters}
          />
        </div>
      </header>

      {/* 看板主体 */}
      <main className="flex-1 overflow-hidden">
        <div className="container mx-auto px-6 py-6 h-full">
          <div className="h-full">
            <FilteredKanbanBoard jobs={filteredJobs} onJobClick={handleJobClick} />
          </div>
        </div>
      </main>

      {/* 添加/编辑表单 */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-5xl w-[90vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingJob ? '编辑投递' : '添加投递'}</DialogTitle>
          </DialogHeader>
          <JobForm
            job={editingJob || undefined}
            onSubmit={handleFormSubmit}
            onCancel={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* 投递详情 */}
      <Sheet open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto p-0">
          <div className="p-6">
            <SheetHeader className="mb-6">
              <SheetTitle>投递详情</SheetTitle>
            </SheetHeader>
            {selectedJob && (
              <JobDetail
                job={selectedJob}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onClose={() => setIsDetailOpen(false)}
              />
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* 邮件导入 */}
      <Dialog open={isEmailImportOpen} onOpenChange={setIsEmailImportOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>导入投递确认邮件</DialogTitle>
          </DialogHeader>
          <EmailImport onComplete={() => setIsEmailImportOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}

// 筛选后的看板组件
function FilteredKanbanBoard({
  jobs,
  onJobClick
}: {
  jobs: JobApplication[];
  onJobClick: (job: JobApplication) => void;
}) {
  const { updateJob } = useJobStore();
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
    const job = jobs.find(j => j.id === jobId);
    if (!job) return;

    const updates: Partial<JobApplication> = { status };

    // 如果移动到"已投递"，设置投递日期
    if (status === 'applied' && !job.applied_date) {
      updates.applied_date = new Date();
    }

    updateJob(jobId, updates);
  };

  const handleResultChange = (jobId: string, result: ClosedResult | null) => {
    updateJob(jobId, { closed_result: result || undefined });
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
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
