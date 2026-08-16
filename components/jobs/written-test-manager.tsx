'use client';

import { useState } from 'react';
import { WrittenTest, WrittenTestType, WrittenTestResult } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import { nanoid } from 'nanoid';
import { PlusIcon, Trash2Icon, CalendarIcon } from 'lucide-react';

interface WrittenTestManagerProps {
  writtenTests: WrittenTest[];
  onChange: (tests: WrittenTest[]) => void;
}

export function WrittenTestManager({ writtenTests, onChange }: WrittenTestManagerProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<WrittenTest>>({
    date: new Date(),
    type: 'online',
    result: 'pending',
    topics: [],
  });

  const [topicInput, setTopicInput] = useState('');

  const handleAdd = () => {
    if (!formData.date) {
      alert('请选择笔试时间');
      return;
    }

    const newTest: WrittenTest = {
      id: nanoid(),
      date: formData.date,
      type: formData.type as WrittenTestType,
      duration: formData.duration,
      platform: formData.platform,
      topics: formData.topics || [],
      notes: formData.notes,
      result: formData.result as WrittenTestResult,
    };

    onChange([...writtenTests, newTest]);
    setIsAdding(false);
    resetForm();
  };

  const handleUpdate = () => {
    if (!editingId) return;

    const updated = writtenTests.map(test =>
      test.id === editingId
        ? { ...test, ...formData }
        : test
    );

    onChange(updated);
    setEditingId(null);
    resetForm();
  };

  const handleEdit = (test: WrittenTest) => {
    setEditingId(test.id);
    setFormData(test);
    setIsAdding(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这条笔试记录吗？')) {
      onChange(writtenTests.filter(t => t.id !== id));
    }
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      date: new Date(),
      type: 'online',
      result: 'pending',
      topics: [],
    });
    setTopicInput('');
  };

  const handleAddTopic = () => {
    if (topicInput.trim() && !formData.topics?.includes(topicInput.trim())) {
      setFormData({
        ...formData,
        topics: [...(formData.topics || []), topicInput.trim()]
      });
      setTopicInput('');
    }
  };

  const handleRemoveTopic = (topic: string) => {
    setFormData({
      ...formData,
      topics: formData.topics?.filter(t => t !== topic)
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">笔试记录</h3>
        {!isAdding && (
          <Button type="button" onClick={() => setIsAdding(true)} variant="outline" size="sm">
            <PlusIcon className="w-4 h-4 mr-1" />
            添加笔试
          </Button>
        )}
      </div>

      {/* 笔试记录列表 */}
      <div className="space-y-3">
        {writtenTests.map((test) => (
          <Card key={test.id} className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant={
                    test.result === 'pass' ? 'default' :
                    test.result === 'fail' ? 'destructive' :
                    'secondary'
                  }>
                    {test.result === 'pass' ? '✅ 通过' :
                     test.result === 'fail' ? '❌ 未通过' :
                     '⏳ 待定'}
                  </Badge>
                  <Badge variant="outline">
                    {test.type === 'online' ? '💻 在线笔试' : '📝 现场笔试'}
                  </Badge>
                  {test.duration && (
                    <span className="text-xs text-gray-600">{test.duration} 分钟</span>
                  )}
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4" />
                    <span>{formatDate(test.date, 'long')}</span>
                  </div>
                  {test.platform && (
                    <p>平台：{test.platform}</p>
                  )}
                  {test.topics && test.topics.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {test.topics.map((topic, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {topic}
                        </Badge>
                      ))}
                    </div>
                  )}
                  {test.notes && (
                    <p className="mt-2 text-gray-700 whitespace-pre-wrap">{test.notes}</p>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(test)}
                >
                  编辑
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(test.id)}
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
        <Card className="p-4 bg-purple-50 border-purple-200">
          <h4 className="font-semibold mb-4">
            {editingId ? '编辑笔试记录' : '添加笔试记录'}
          </h4>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>笔试时间 *</Label>
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
                <Label>笔试形式</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value as WrittenTestType })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="online">💻 在线笔试</SelectItem>
                    <SelectItem value="onsite">📝 现场笔试</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>时长（分钟）</Label>
                <Input
                  type="number"
                  min="1"
                  value={formData.duration || ''}
                  onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || undefined })}
                  placeholder="如：120"
                />
              </div>

              <div className="space-y-2">
                <Label>笔试平台（可选）</Label>
                <Input
                  value={formData.platform || ''}
                  onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                  placeholder="如：牛客网、赛码网"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>笔试结果</Label>
              <Select
                value={formData.result}
                onValueChange={(value) => setFormData({ ...formData, result: value as WrittenTestResult })}
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

            <div className="space-y-2">
              <Label>题目类型</Label>
              <div className="flex gap-2">
                <Input
                  value={topicInput}
                  onChange={(e) => setTopicInput(e.target.value)}
                  placeholder="如：算法、SQL、系统设计"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTopic())}
                />
                <Button type="button" onClick={handleAddTopic} variant="outline">
                  添加
                </Button>
              </div>
              {formData.topics && formData.topics.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.topics.map((topic) => (
                    <div
                      key={topic}
                      className="bg-gray-100 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                    >
                      {topic}
                      <button
                        type="button"
                        onClick={() => handleRemoveTopic(topic)}
                        className="text-gray-500 hover:text-red-600"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>题目记录 / 复盘</Label>
              <Textarea
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="记录笔试题目、解题思路、遇到的问题...&#10;&#10;例如：&#10;题目1：链表反转&#10;思路：双指针&#10;完成情况：✅ 通过所有测试用例&#10;&#10;题目2：SQL查询&#10;难度：中等&#10;完成情况：部分通过"
                rows={6}
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

      {writtenTests.length === 0 && !isAdding && (
        <div className="text-center py-8 text-gray-500 border-2 border-dashed rounded-lg">
          <p>暂无笔试记录</p>
          <p className="text-sm mt-2">点击"添加笔试"按钮记录笔试信息</p>
        </div>
      )}
    </div>
  );
}
