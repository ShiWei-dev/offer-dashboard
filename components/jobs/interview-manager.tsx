'use client';

import { useState, useEffect } from 'react';
import { Interview, InterviewType, InterviewContentType, InterviewResult } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import { INTERVIEW_CONTENT_TYPE_CONFIG } from '@/lib/constants';
import { nanoid } from 'nanoid';
import { PlusIcon, Trash2Icon, CalendarIcon } from 'lucide-react';

interface InterviewManagerProps {
  interviews: Interview[];
  onChange: (interviews: Interview[]) => void;
  reviewData?: any;  // 从"立即复盘"传入的预填充数据
}

export function InterviewManager({ interviews, onChange, reviewData }: InterviewManagerProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // 初始表单数据
  const getInitialFormData = () => {
    const baseData = {
      date: new Date(),
      type: 'video' as InterviewType,
      round: interviews.length + 1,
      result: 'pending' as InterviewResult,
    };

    // 如果有 reviewData，使用其中的数据预填充
    if (reviewData) {
      return {
        ...baseData,
        date: reviewData.date ? new Date(reviewData.date) : baseData.date,
        content_type: reviewData.contentType,
      };
    }

    return baseData;
  };

  const [formData, setFormData] = useState<Partial<Interview>>(getInitialFormData());

  // 如果有 reviewData，自动展开添加表单
  useEffect(() => {
    if (reviewData) {
      setIsAdding(true);
    }
  }, [reviewData]);

  const handleAdd = () => {
    if (!formData.date) {
      alert('请选择面试时间');
      return;
    }

    const newInterview: Interview = {
      id: nanoid(),
      date: formData.date,
      type: formData.type as InterviewType,
      content_type: formData.content_type as InterviewContentType,
      round: formData.round || interviews.length + 1,
      interviewer: formData.interviewer,
      notes: formData.notes,
      result: formData.result as InterviewResult,
    };

    onChange([...interviews, newInterview]);
    setIsAdding(false);
    setFormData({
      date: new Date(),
      type: 'video',
      round: interviews.length + 2,
      result: 'pending',
    });
  };

  const handleUpdate = () => {
    if (!editingId) return;

    const updated = interviews.map(interview =>
      interview.id === editingId
        ? { ...interview, ...formData }
        : interview
    );

    onChange(updated);
    setEditingId(null);
    setFormData({
      date: new Date(),
      type: 'video',
      round: interviews.length + 1,
      result: 'pending',
    });
  };

  const handleEdit = (interview: Interview) => {
    setEditingId(interview.id);
    setFormData(interview);
    setIsAdding(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这条面试记录吗？')) {
      onChange(interviews.filter(i => i.id !== id));
    }
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({
      date: new Date(),
      type: 'video',
      round: interviews.length + 1,
      result: 'pending',
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">面试记录</h3>
        {!isAdding && (
          <Button type="button" onClick={() => setIsAdding(true)} variant="outline" size="sm">
            <PlusIcon className="w-4 h-4 mr-1" />
            添加面试
          </Button>
        )}
      </div>

      {/* 面试记录列表 */}
      <div className="space-y-3">
        {interviews.map((interview) => (
          <Card key={interview.id} className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-semibold">第 {interview.round} 轮面试</span>
                  <Badge variant={
                    interview.result === 'pass' ? 'default' :
                    interview.result === 'fail' ? 'destructive' :
                    'secondary'
                  }>
                    {interview.result === 'pass' ? '✅ 通过' :
                     interview.result === 'fail' ? '❌ 未通过' :
                     '⏳ 待定'}
                  </Badge>
                  <Badge variant="outline">
                    {interview.type === 'onsite' ? '🏢 现场' :
                     interview.type === 'video' ? '📹 视频' : '📞 电话'}
                  </Badge>
                  {interview.content_type && (
                    <Badge variant="outline" className="bg-blue-50">
                      {INTERVIEW_CONTENT_TYPE_CONFIG[interview.content_type].icon}{' '}
                      {INTERVIEW_CONTENT_TYPE_CONFIG[interview.content_type].label}
                    </Badge>
                  )}
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4" />
                    <span>{formatDate(interview.date, 'long')}</span>
                  </div>
                  {interview.interviewer && (
                    <p>面试官：{interview.interviewer}</p>
                  )}
                  {interview.notes && (
                    <p className="mt-2 text-gray-700">{interview.notes}</p>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(interview)}
                >
                  编辑
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(interview.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2Icon className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* 添加/编辑表单 */}
      {isAdding && (
        <Card className="p-4 bg-blue-50 border-blue-200">
          <h4 className="font-semibold mb-4">
            {editingId ? '编辑面试记录' : '添加面试记录'}
          </h4>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>面试时间 *</Label>
                <Input
                  type="datetime-local"
                  value={formData.date ?
                    new Date(formData.date.getTime() - formData.date.getTimezoneOffset() * 60000)
                      .toISOString().slice(0, 16) : ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    date: e.target.value ? new Date(e.target.value) : undefined
                  })}
                />
              </div>

              <div className="space-y-2">
                <Label>面试轮次</Label>
                <Input
                  type="number"
                  min="1"
                  value={formData.round}
                  onChange={(e) => setFormData({ ...formData, round: parseInt(e.target.value) })}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>面试形式</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value as InterviewType })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="video">📹 视频面试</SelectItem>
                    <SelectItem value="onsite">🏢 现场面试</SelectItem>
                    <SelectItem value="phone">📞 电话面试</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>面试类型</Label>
                <Select
                  value={formData.content_type || 'technical'}
                  onValueChange={(value) => setFormData({ ...formData, content_type: value as InterviewContentType })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technical">💻 技术面</SelectItem>
                    <SelectItem value="hr">💼 HR面</SelectItem>
                    <SelectItem value="manager">👔 主管面</SelectItem>
                    <SelectItem value="ceo">🎯 高管面</SelectItem>
                    <SelectItem value="other">📋 其他</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>面试结果</Label>
                <Select
                  value={formData.result}
                  onValueChange={(value) => setFormData({ ...formData, result: value as InterviewResult })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">⏳ 待定</SelectItem>
                    <SelectItem value="pass">✅ 通过</SelectItem>
                    <SelectItem value="fail">❌ 未通过</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>面试官（可选）</Label>
              <Input
                value={formData.interviewer || ''}
                onChange={(e) => setFormData({ ...formData, interviewer: e.target.value })}
                placeholder="如：张三、技术总监"
              />
            </div>

            <div className="space-y-2">
              <Label>面试反馈 / 问题复盘</Label>
              <Textarea
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="记录面试中的问题、回答情况、需要改进的地方..."
                rows={4}
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={handleCancel}>
                取消
              </Button>
              <Button type="button" onClick={editingId ? handleUpdate : handleAdd}>
                {editingId ? '保存' : '添加'}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {interviews.length === 0 && !isAdding && (
        <div className="text-center py-8 text-gray-500 border-2 border-dashed rounded-lg">
          <p>暂无面试记录</p>
          <p className="text-sm mt-2">点击"添加面试"按钮记录面试信息</p>
        </div>
      )}
    </div>
  );
}
