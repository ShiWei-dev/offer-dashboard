'use client';

import { useJobStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate, formatRelativeTime } from '@/lib/utils';
import { CalendarIcon, ClockIcon } from 'lucide-react';

export function UpcomingInterviews() {
  const { jobs } = useJobStore();

  // 获取有面试安排的投递
  const upcomingInterviews = jobs
    .filter(job => job.next_interview_date)
    .sort((a, b) => {
      if (!a.next_interview_date || !b.next_interview_date) return 0;
      return a.next_interview_date.getTime() - b.next_interview_date.getTime();
    })
    .slice(0, 5); // 只显示最近5个

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarIcon className="w-5 h-5" />
          近期笔试/面试安排
        </CardTitle>
      </CardHeader>
      <CardContent>
        {upcomingInterviews.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <CalendarIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>暂无面试安排</p>
            <p className="text-sm mt-2">在投递详情中添加面试时间</p>
          </div>
        ) : (
          <div className="space-y-4">
            {upcomingInterviews.map((job) => {
              const isPast = job.next_interview_date && job.next_interview_date < new Date();
              const isToday = job.next_interview_date &&
                formatDate(job.next_interview_date) === formatDate(new Date());
              const isTomorrow = job.next_interview_date &&
                formatDate(job.next_interview_date) === formatDate(new Date(Date.now() + 86400000));

              return (
                <div
                  key={job.id}
                  className={`p-4 rounded-lg border transition-all ${
                    isPast
                      ? 'bg-gray-50 border-gray-200'
                      : isToday
                      ? 'bg-red-50 border-red-300 shadow-sm'
                      : isTomorrow
                      ? 'bg-orange-50 border-orange-300'
                      : 'bg-white border-gray-200 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-gray-900">{job.company}</h4>
                        <Badge variant="outline" className="text-xs">
                          {job.next_event_type === 'written' ? '📝 笔试' : '🎯 面试'}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{job.position}</p>
                    </div>
                    {isToday && (
                      <Badge className="bg-red-600 text-white">今天</Badge>
                    )}
                    {isTomorrow && (
                      <Badge className="bg-orange-600 text-white">明天</Badge>
                    )}
                    {isPast && (
                      <Badge variant="outline" className="text-gray-500">已过期</Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1 text-gray-700">
                      <CalendarIcon className="w-4 h-4" />
                      <span>{formatDate(job.next_interview_date, 'long')}</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-600">
                      <ClockIcon className="w-4 h-4" />
                      <span>{formatRelativeTime(job.next_interview_date)}</span>
                    </div>
                  </div>

                  {job.interviews.length > 0 && (
                    <div className="mt-2 text-xs text-gray-500">
                      第 {job.interviews.length + 1} 轮面试
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
