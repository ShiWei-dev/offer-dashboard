'use client';

import { useJobStore } from '@/lib/store';
import { calculateStatistics } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUpIcon, SendIcon, CalendarIcon, CheckCircle2Icon } from 'lucide-react';

export function StatsCards() {
  const { jobs } = useJobStore();
  const stats = calculateStatistics(jobs);

  const cards = [
    {
      title: '总投递数',
      value: stats.total,
      icon: SendIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: '回复率',
      value: `${Math.round(stats.response_rate * 100)}%`,
      icon: TrendingUpIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: '面试邀约',
      value: stats.by_status.interviewing + stats.by_status.closed,
      icon: CalendarIcon,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
    {
      title: 'Offer 数量',
      value: stats.offer_count,
      icon: CheckCircle2Icon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {card.title}
            </CardTitle>
            <div className={`w-10 h-10 rounded-full ${card.bgColor} flex items-center justify-center`}>
              <card.icon className={`w-5 h-5 ${card.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{card.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
