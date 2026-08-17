'use client';

import { useJobStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate, formatRelativeTime } from '@/lib/utils';
import { INTERVIEW_CONTENT_TYPE_CONFIG, WRITTEN_TEST_CATEGORY_CONFIG } from '@/lib/constants';
import { InterviewContentType, WrittenTestCategory } from '@/lib/types';
import { CalendarIcon, ClockIcon } from 'lucide-react';

interface UpcomingEvent {
  id: string;
  company: string;
  position: string;
  date: Date;
  type: 'written' | 'interview';
  round?: number;
  totalInterviews?: number;
  interviewContentType?: InterviewContentType;
  writtenTestCategory?: WrittenTestCategory;
}

export function UpcomingInterviews() {
  const { jobs } = useJobStore();

  // 收集所有即将到来的笔试和面试
  const upcomingEvents: UpcomingEvent[] = [];

  jobs.forEach(job => {
    // 添加"下次面试/笔试"安排
    if (job.next_interview_date) {
      upcomingEvents.push({
        id: `${job.id}-next`,
        company: job.company,
        position: job.position,
        date: job.next_interview_date,
        type: job.next_event_type || 'interview',
        totalInterviews: job.interviews.length,
        interviewContentType: job.next_interview_content_type,
        writtenTestCategory: job.next_written_test_category,
      });
    }

    // 添加未来的笔试记录
    if (job.written_tests) {
      const futureTests = job.written_tests.filter(test =>
        test.date > new Date()
      );
      futureTests.forEach(test => {
        upcomingEvents.push({
          id: `${job.id}-written-${test.id}`,
          company: job.company,
          position: job.position,
          date: test.date,
          type: 'written',
        });
      });
    }
  });

  // 按日期排序，只显示最近5个
  const sortedEvents = upcomingEvents
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarIcon className="w-5 h-5" />
          近期笔试/面试安排
        </CardTitle>
      </CardHeader>
      <CardContent>
        {sortedEvents.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <CalendarIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>暂无笔试/面试安排</p>
            <p className="text-sm mt-2">在投递详情中添加笔试或面试时间</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedEvents.map((event) => {
              const isPast = event.date < new Date();
              const isToday = formatDate(event.date) === formatDate(new Date());
              const isTomorrow = formatDate(event.date) === formatDate(new Date(Date.now() + 86400000));

              return (
                <div
                  key={event.id}
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
                        <h4 className="font-semibold text-gray-900">{event.company}</h4>
                        <Badge variant="outline" className="text-xs">
                          {event.type === 'written' ? (
                            <>
                              📝 笔试
                              {event.writtenTestCategory && (
                                <span className="ml-1">
                                  - {WRITTEN_TEST_CATEGORY_CONFIG[event.writtenTestCategory].label}
                                </span>
                              )}
                            </>
                          ) : (
                            <>
                              🎯 面试
                              {event.interviewContentType && (
                                <span className="ml-1">
                                  - {INTERVIEW_CONTENT_TYPE_CONFIG[event.interviewContentType].label}
                                </span>
                              )}
                            </>
                          )}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{event.position}</p>
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
                      <span>{formatDate(event.date, 'long')}</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-600">
                      <ClockIcon className="w-4 h-4" />
                      <span>{formatRelativeTime(event.date)}</span>
                    </div>
                  </div>

                  {event.type === 'interview' && event.totalInterviews !== undefined && event.totalInterviews > 0 && (
                    <div className="mt-2 text-xs text-gray-500">
                      第 {event.totalInterviews + 1} 轮面试
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
