'use client';

import { useJobStore } from '@/lib/store';
import { calculateStatistics } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { STATUS_CONFIG } from '@/lib/constants';

export function FunnelChart() {
  const { jobs } = useJobStore();
  const stats = calculateStatistics(jobs);

  const funnelData = [
    {
      label: STATUS_CONFIG.todo.label,
      value: stats.by_status.todo,
      color: 'bg-gray-400',
      percentage: stats.total > 0 ? (stats.by_status.todo / stats.total) * 100 : 0,
    },
    {
      label: STATUS_CONFIG.applied.label,
      value: stats.by_status.applied,
      color: 'bg-blue-500',
      percentage: stats.total > 0 ? (stats.by_status.applied / stats.total) * 100 : 0,
    },
    {
      label: STATUS_CONFIG.interviewing.label,
      value: stats.by_status.interviewing,
      color: 'bg-orange-500',
      percentage: stats.total > 0 ? (stats.by_status.interviewing / stats.total) * 100 : 0,
    },
    {
      label: STATUS_CONFIG.closed.label,
      value: stats.by_status.closed,
      color: 'bg-green-500',
      percentage: stats.total > 0 ? (stats.by_status.closed / stats.total) * 100 : 0,
      subtext: `其中 Offer: ${stats.offer_count}`
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>投递漏斗</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {funnelData.map((item, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-gray-700">{item.label}</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900">{item.value}</span>
                  <span className="text-gray-500">({Math.round(item.percentage)}%)</span>
                </div>
              </div>
              <div className="relative w-full h-8 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full ${item.color} transition-all duration-500 flex items-center justify-end px-3`}
                  style={{ width: `${item.percentage}%` }}
                >
                  {item.percentage > 15 && (
                    <span className="text-white text-xs font-medium">
                      {item.value}
                    </span>
                  )}
                </div>
              </div>
              {item.subtext && (
                <p className="text-xs text-gray-500 ml-2">{item.subtext}</p>
              )}
            </div>
          ))}
        </div>

        {stats.total > 0 && (
          <div className="mt-6 pt-6 border-t space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">转化率（面试/投递）</span>
              <span className="font-semibold">{Math.round(stats.interview_rate * 100)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">平均回复时间</span>
              <span className="font-semibold">
                {stats.avg_response_time > 0 ? `${Math.round(stats.avg_response_time)} 天` : '暂无数据'}
              </span>
            </div>
          </div>
        )}

        {stats.total === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>暂无投递数据</p>
            <p className="text-sm mt-2">开始添加投递记录来查看统计</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
