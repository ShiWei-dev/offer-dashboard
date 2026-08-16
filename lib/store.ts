import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { JobApplication, FilterOptions } from './types';

interface JobStore {
  // 数据
  jobs: JobApplication[];

  // 筛选
  filters: FilterOptions;

  // Actions
  addJob: (job: JobApplication) => void;
  updateJob: (id: string, updates: Partial<JobApplication>) => void;
  deleteJob: (id: string) => void;
  setFilters: (filters: FilterOptions) => void;
  clearFilters: () => void;

  // 批量操作
  importJobs: (jobs: JobApplication[]) => void;
  clearAllJobs: () => void;
}

export const useJobStore = create<JobStore>()(
  persist(
    (set, get) => ({
      jobs: [],
      filters: {},

      addJob: (job) => set((state) => ({
        jobs: [...state.jobs, job]
      })),

      updateJob: (id, updates) => set((state) => ({
        jobs: state.jobs.map((job) =>
          job.id === id
            ? { ...job, ...updates, updated_at: new Date() }
            : job
        )
      })),

      deleteJob: (id) => set((state) => ({
        jobs: state.jobs.filter((job) => job.id !== id)
      })),

      setFilters: (filters) => set({ filters }),

      clearFilters: () => set({ filters: {} }),

      importJobs: (jobs) => set({ jobs }),

      clearAllJobs: () => set({ jobs: [] })
    }),
    {
      name: 'job-tracker-storage',
      // 序列化 Date 对象
      partialize: (state) => ({
        jobs: state.jobs.map(job => ({
          ...job,
          created_at: job.created_at.toISOString(),
          updated_at: job.updated_at.toISOString(),
          applied_date: job.applied_date?.toISOString(),
          next_interview_date: job.next_interview_date?.toISOString(),
          interviews: job.interviews.map(interview => ({
            ...interview,
            date: interview.date.toISOString()
          })),
          written_tests: (job.written_tests || []).map(test => ({
            ...test,
            date: test.date.toISOString()
          }))
        }))
      }),
      // 反序列化 Date 对象
      merge: (persistedState: any, currentState) => {
        const jobs = persistedState?.jobs?.map((job: any) => ({
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
        })) || [];

        return {
          ...currentState,
          jobs
        };
      }
    }
  )
);
