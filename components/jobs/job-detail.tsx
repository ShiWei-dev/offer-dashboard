'use client';

import { JobApplication } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { STATUS_CONFIG, PRIORITY_CONFIG, CHANNEL_CONFIG } from '@/lib/constants';
import { formatDate, formatRelativeTime } from '@/lib/utils';
import {
  CalendarIcon,
  MapPinIcon,
  DollarSignIcon,
  ExternalLinkIcon,
  PencilIcon,
  Trash2Icon,
  MailIcon,
  ChevronRightIcon
} from 'lucide-react';
import Link from 'next/link';

interface JobDetailProps {
  job: JobApplication;
  onEdit: () => void;
  onDelete: () => void;
  onClose: () => void;
}

export function JobDetail({ job, onEdit, onDelete, onClose }: JobDetailProps) {
  const statusConfig = STATUS_CONFIG[job.status];
  const priorityConfig = PRIORITY_CONFIG[job.priority];

  return (
    <div className="space-y-6">
      {/* 头部 */}
      <div>
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {job.company}
            </h2>
            <p className="text-lg text-gray-700">{job.position}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onEdit}>
              <PencilIcon className="w-4 h-4 mr-1" />
              编辑
            </Button>
            <Button variant="outline" size="sm" onClick={onDelete} className="text-red-600 hover:text-red-700">
              <Trash2Icon className="w-4 h-4 mr-1" />
              删除
            </Button>
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          <Badge className={statusConfig.bgColor}>
            <span className={statusConfig.color}>
              {statusConfig.icon} {statusConfig.label}
            </span>
          </Badge>
          <Badge variant="secondary">
            {priorityConfig.icon} {priorityConfig.label}
          </Badge>
          {job.channel && (
            <Badge variant="outline">
              {CHANNEL_CONFIG[job.channel]}
            </Badge>
          )}
          {job.closed_result === 'offer' && (
            <Badge className="bg-green-600 text-white">
              ✅ 已获 Offer
            </Badge>
          )}
        </div>
      </div>

      <Separator />

      {/* 基础信息 */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">基础信息</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          {job.location && (
            <div className="flex items-center gap-2">
              <MapPinIcon className="w-4 h-4 text-gray-500" />
              <span className="text-gray-700">地点：</span>
              <span className="font-medium">{job.location}</span>
            </div>
          )}

          {job.salary_range && (
            <div className="flex items-center gap-2">
              <DollarSignIcon className="w-4 h-4 text-gray-500" />
              <span className="text-gray-700">薪资：</span>
              <span className="font-medium">{job.salary_range}</span>
            </div>
          )}

          {job.applied_date && (
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-gray-500" />
              <span className="text-gray-700">投递日期：</span>
              <span className="font-medium">{formatDate(job.applied_date)}</span>
            </div>
          )}

          {job.resume_version && (
            <div className="flex items-center gap-2">
              <span className="text-gray-700">简历版本：</span>
              <span className="font-medium">{job.resume_version}</span>
            </div>
          )}

          {job.job_url && (
            <div className="col-span-2 flex items-center gap-2">
              <ExternalLinkIcon className="w-4 h-4 text-gray-500" />
              <a
                href={job.job_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                查看职位详情
              </a>
            </div>
          )}
        </div>
      </div>

      {/* 邮件信息 */}
      {job.email_subject && (
        <>
          <Separator />
          <div className="space-y-3">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <MailIcon className="w-5 h-5" />
              邮件信息
            </h3>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2 text-sm">
              <div>
                <span className="text-gray-600">主题：</span>
                <span className="font-medium">{job.email_subject}</span>
              </div>
              {job.email_from && (
                <div>
                  <span className="text-gray-600">发件人：</span>
                  <span className="font-medium">{job.email_from}</span>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* 面试安排 */}
      {job.next_interview_date && (
        <>
          <Separator />
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">
              {job.next_event_type === 'written' ? '📝 笔试安排' : '🎯 面试安排'}
            </h3>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-orange-700">
                <CalendarIcon className="w-5 h-5" />
                <div>
                  <p className="font-medium">
                    {job.next_event_type === 'written' ? '下次笔试时间' : '下次面试时间'}
                  </p>
                  <p className="text-sm">{formatDate(job.next_interview_date, 'long')}</p>
                  <p className="text-xs text-orange-600 mt-1">
                    {formatRelativeTime(job.next_interview_date)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* 笔试记录 */}
      {job.written_tests && job.written_tests.length > 0 && (
        <>
          <Separator />
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">📝 笔试记录</h3>
            <div className="space-y-2">
              {job.written_tests.map((test) => (
                <Link key={test.id} href="/interviews">
                  <div className="border rounded-lg p-3 bg-purple-50/30 hover:bg-purple-100/50 transition-colors cursor-pointer group">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">
                          {test.type === 'online' ? '💻' : '📝'}
                        </span>
                        <div>
                          <div className="font-medium text-gray-900">
                            {test.type === 'online' ? '在线笔试' : '现场笔试'}
                          </div>
                          <div className="text-sm text-gray-600">
                            {formatDate(test.date, 'long')}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={
                          test.result === 'pass' ? 'default' :
                          test.result === 'fail' ? 'destructive' :
                          'secondary'
                        }>
                          {test.result === 'pass' ? '✅ 通过' :
                           test.result === 'fail' ? '❌ 未通过' :
                           '⏳ 待定'}
                        </Badge>
                        <ChevronRightIcon className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </>
      )}

      {/* 面试记录 */}
      {job.interviews && job.interviews.length > 0 && (
        <>
          <Separator />
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">🎯 面试记录</h3>
            <div className="space-y-2">
              {job.interviews.map((interview) => (
                <Link key={interview.id} href="/interviews">
                  <div className="border rounded-lg p-3 bg-blue-50/30 hover:bg-blue-100/50 transition-colors cursor-pointer group">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">
                          {interview.type === 'onsite' ? '🏢' :
                           interview.type === 'video' ? '📹' : '📞'}
                        </span>
                        <div>
                          <div className="font-medium text-gray-900">
                            第 {interview.round} 轮面试
                          </div>
                          <div className="text-sm text-gray-600">
                            {formatDate(interview.date, 'long')}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={
                          interview.result === 'pass' ? 'default' :
                          interview.result === 'fail' ? 'destructive' :
                          'secondary'
                        }>
                          {interview.result === 'pass' ? '✅ 通过' :
                           interview.result === 'fail' ? '❌ 未通过' :
                           '⏳ 待定'}
                        </Badge>
                        <ChevronRightIcon className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Offer 信息 */}
      {job.closed_result === 'offer' && job.offer_salary && (
        <>
          <Separator />
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Offer 信息</h3>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-green-700">
                <DollarSignIcon className="w-5 h-5" />
                <div>
                  <p className="font-medium">Offer 薪资</p>
                  <p className="text-lg font-bold">{job.offer_salary}</p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* 拒绝原因 */}
      {job.closed_result === 'rejected' && job.rejection_reason && (
        <>
          <Separator />
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">拒绝原因</h3>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-700">{job.rejection_reason}</p>
            </div>
          </div>
        </>
      )}

      {/* 标签 */}
      {job.tags && job.tags.length > 0 && (
        <>
          <Separator />
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">标签</h3>
            <div className="flex flex-wrap gap-2">
              {job.tags.map((tag, index) => (
                <Badge key={index} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </>
      )}

      {/* 备注 */}
      {job.notes && (
        <>
          <Separator />
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">备注</h3>
            <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 whitespace-pre-wrap">
              {job.notes}
            </div>
          </div>
        </>
      )}

      {/* 元数据 */}
      <Separator />
      <div className="text-xs text-gray-500 space-y-1">
        <p>创建时间：{formatDate(job.created_at, 'long')}</p>
        <p>更新时间：{formatDate(job.updated_at, 'long')}</p>
      </div>
    </div>
  );
}
