'use client';

import { useState } from 'react';
import { JobApplication, JobStatus, Priority, Channel, Interview, WrittenTest, InterviewContentType, WrittenTestCategory } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { STATUS_CONFIG, CHANNEL_CONFIG, DEFAULT_RESUME_VERSIONS } from '@/lib/constants';
import { InterviewManager } from './interview-manager';
import { WrittenTestManager } from './written-test-manager';
import { nanoid } from 'nanoid';

interface JobFormProps {
  job?: JobApplication;
  onSubmit: (job: JobApplication) => void;
  onCancel: () => void;
}

export function JobForm({ job, onSubmit, onCancel }: JobFormProps) {
  const isEdit = !!job;

  const [formData, setFormData] = useState<Partial<JobApplication>>({
    company: job?.company || '',
    position: job?.position || '',
    location: job?.location || '',
    salary_range: job?.salary_range || '',
    job_url: job?.job_url || '',
    status: job?.status || 'todo',
    priority: job?.priority || 'medium',
    channel: job?.channel || undefined,
    resume_version: job?.resume_version || '',
    applied_date: job?.applied_date,
    next_interview_date: job?.next_interview_date,
    next_event_type: job?.next_event_type,
    notes: job?.notes || '',
    tags: job?.tags || [],
    closed_result: job?.closed_result,
    offer_salary: job?.offer_salary || '',
    rejection_reason: job?.rejection_reason || '',
    interviews: job?.interviews || [],
    written_tests: job?.written_tests || [],
  });

  const [tagInput, setTagInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.company || !formData.position) {
      alert('请填写公司名和职位名');
      return;
    }

    const now = new Date();

    const jobData: JobApplication = {
      id: job?.id || nanoid(),
      company: formData.company,
      position: formData.position,
      location: formData.location || '',
      salary_range: formData.salary_range,
      job_url: formData.job_url,
      status: formData.status as JobStatus,
      priority: formData.priority as Priority,
      channel: formData.channel as Channel,
      resume_version: formData.resume_version,
      applied_date: formData.applied_date,
      next_interview_date: formData.next_interview_date,
      next_event_type: formData.next_event_type,
      interviews: formData.interviews || [],
      written_tests: formData.written_tests || [],
      closed_result: formData.closed_result,
      offer_salary: formData.offer_salary,
      rejection_reason: formData.rejection_reason,
      notes: formData.notes,
      tags: formData.tags,
      created_at: job?.created_at || now,
      updated_at: now,
    };

    onSubmit(jobData);
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...(formData.tags || []), tagInput.trim()]
      });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags?.filter(t => t !== tag)
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 基础信息 */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">基础信息</h3>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="company">公司名称 *</Label>
            <Input
              id="company"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              placeholder="如：字节跳动"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="position">职位名称 *</Label>
            <Input
              id="position"
              value={formData.position}
              onChange={(e) => setFormData({ ...formData, position: e.target.value })}
              placeholder="如：前端工程师"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="location">工作地点</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="如：北京"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="salary">薪资范围</Label>
            <Input
              id="salary"
              value={formData.salary_range}
              onChange={(e) => setFormData({ ...formData, salary_range: e.target.value })}
              placeholder="如：20-30K"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="job_url">职位链接</Label>
          <Input
            id="job_url"
            type="url"
            value={formData.job_url}
            onChange={(e) => setFormData({ ...formData, job_url: e.target.value })}
            placeholder="https://..."
          />
        </div>
      </div>

      {/* 投递信息 */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">投递信息</h3>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="status">状态</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData({ ...formData, status: value as JobStatus })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.values(STATUS_CONFIG).map((config) => (
                  <SelectItem key={config.value} value={config.value}>
                    {config.icon} {config.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">优先级</Label>
            <Select
              value={formData.priority}
              onValueChange={(value) => setFormData({ ...formData, priority: value as Priority })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="high">🔥 高优先级</SelectItem>
                <SelectItem value="medium">⭐ 中优先级</SelectItem>
                <SelectItem value="low">💤 低优先级</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="channel">投递渠道</Label>
            <Select
              value={formData.channel}
              onValueChange={(value) => setFormData({ ...formData, channel: value as Channel })}
            >
              <SelectTrigger>
                <SelectValue placeholder="选择渠道" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(CHANNEL_CONFIG).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="applied_date">投递日期</Label>
            <Input
              id="applied_date"
              type="date"
              value={formData.applied_date ? formData.applied_date.toISOString().split('T')[0] : ''}
              onChange={(e) => setFormData({
                ...formData,
                applied_date: e.target.value ? new Date(e.target.value) : undefined
              })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="resume_version">简历版本</Label>
            <Select
              value={formData.resume_version}
              onValueChange={(value) => setFormData({ ...formData, resume_version: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="选择简历版本" />
              </SelectTrigger>
              <SelectContent>
                {DEFAULT_RESUME_VERSIONS.map((version) => (
                  <SelectItem key={version} value={version}>
                    {version}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="next_interview">下次笔试/面试时间</Label>
          <div className="grid grid-cols-2 gap-2">
            <Input
              id="next_interview"
              type="datetime-local"
              value={formData.next_interview_date ?
                new Date(formData.next_interview_date.getTime() - formData.next_interview_date.getTimezoneOffset() * 60000)
                  .toISOString().slice(0, 16) : ''}
              onChange={(e) => setFormData({
                ...formData,
                next_interview_date: e.target.value ? new Date(e.target.value) : undefined
              })}
            />
            <Select
              value={formData.next_event_type || ''}
              onValueChange={(value: any) => setFormData({ ...formData, next_event_type: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="类型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="interview">🎯 面试</SelectItem>
                <SelectItem value="written">📝 笔试</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 面试类型选择 */}
          {formData.next_event_type === 'interview' && (
            <Select
              value={formData.next_interview_content_type || ''}
              onValueChange={(value: any) => setFormData({ ...formData, next_interview_content_type: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="选择面试类型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="technical">💻 技术面</SelectItem>
                <SelectItem value="hr">💼 HR面</SelectItem>
                <SelectItem value="manager">👔 主管面</SelectItem>
                <SelectItem value="ceo">🎯 高管面</SelectItem>
                <SelectItem value="other">📋 其他</SelectItem>
              </SelectContent>
            </Select>
          )}

          {/* 笔试类型选择 */}
          {formData.next_event_type === 'written' && (
            <Select
              value={formData.next_written_test_category || ''}
              onValueChange={(value: any) => setFormData({ ...formData, next_written_test_category: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="选择笔试类型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="algorithm">💻 算法题</SelectItem>
                <SelectItem value="aptitude">📊 行测</SelectItem>
                <SelectItem value="personality">🧠 性格测评</SelectItem>
                <SelectItem value="technical">📝 专业题</SelectItem>
                <SelectItem value="mixed">📋 综合测试</SelectItem>
                <SelectItem value="other">❓ 其他</SelectItem>
              </SelectContent>
            </Select>
          )}

          <p className="text-xs text-gray-500">用于提醒即将到来的笔试或面试</p>
        </div>
      </div>

      {/* 完结状态（仅当状态为已完结时显示） */}
      {formData.status === 'closed' && (
        <div className="space-y-4 p-4 bg-gray-50 rounded-lg border">
          <h3 className="font-semibold text-lg">完结信息</h3>

          <div className="space-y-2">
            <Label htmlFor="closed_result">完结结果 *</Label>
            <Select
              value={formData.closed_result || ''}
              onValueChange={(value) => setFormData({ ...formData, closed_result: value as any })}
            >
              <SelectTrigger>
                <SelectValue placeholder="选择完结结果" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="offer">✅ 获得 Offer</SelectItem>
                <SelectItem value="rejected">❌ 被拒绝</SelectItem>
                <SelectItem value="withdrew">🚪 主动放弃</SelectItem>
                <SelectItem value="ghosted">👻 被忽视（无回复）</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Offer 薪资 */}
          {formData.closed_result === 'offer' && (
            <div className="space-y-2">
              <Label htmlFor="offer_salary">Offer 薪资</Label>
              <Input
                id="offer_salary"
                value={formData.offer_salary}
                onChange={(e) => setFormData({ ...formData, offer_salary: e.target.value })}
                placeholder="如：28K × 14薪"
              />
            </div>
          )}

          {/* 拒绝原因 */}
          {formData.closed_result === 'rejected' && (
            <div className="space-y-2">
              <Label htmlFor="rejection_reason">拒绝原因</Label>
              <Textarea
                id="rejection_reason"
                value={formData.rejection_reason}
                onChange={(e) => setFormData({ ...formData, rejection_reason: e.target.value })}
                placeholder="如：技术栈不匹配、薪资要求过高..."
                rows={3}
              />
            </div>
          )}
        </div>
      )}

      {/* 笔试记录管理 */}
      <WrittenTestManager
        writtenTests={formData.written_tests || []}
        onChange={(tests) => setFormData({ ...formData, written_tests: tests })}
      />

      {/* 面试记录管理 */}
      <InterviewManager
        interviews={formData.interviews || []}
        onChange={(interviews) => setFormData({ ...formData, interviews })}
      />

      {/* 标签 */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">标签</h3>
        <div className="flex gap-2">
          <Input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            placeholder="添加标签"
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
          />
          <Button type="button" onClick={handleAddTag} variant="outline">
            添加
          </Button>
        </div>
        {formData.tags && formData.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {formData.tags.map((tag) => (
              <div
                key={tag}
                className="bg-gray-100 px-3 py-1 rounded-full text-sm flex items-center gap-2"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="text-gray-500 hover:text-red-600"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 备注 */}
      <div className="space-y-2">
        <Label htmlFor="notes">备注</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="记录面试准备、薪资谈判、注意事项等..."
          rows={4}
        />
      </div>

      {/* 操作按钮 */}
      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          取消
        </Button>
        <Button type="submit">
          {isEdit ? '保存' : '添加'}
        </Button>
      </div>
    </form>
  );
}
