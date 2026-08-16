'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { PlusIcon, Trash2Icon } from 'lucide-react';

interface Question {
  id: string;
  question: string;
  answer: string;
  feedback?: string;
}

interface QAEditorProps {
  value: string; // 从 notes 字段解析
  onChange: (value: string) => void;
}

export function QAEditor({ value, onChange }: QAEditorProps) {
  const [questions, setQuestions] = useState<Question[]>(() => {
    // 尝试从 notes 解析问题
    if (!value) return [];

    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      // 如果不是 JSON，返回空数组
      return [];
    }
    return [];
  });

  const [generalNotes, setGeneralNotes] = useState('');

  const handleAddQuestion = () => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      question: '',
      answer: '',
      feedback: '',
    };
    const updated = [...questions, newQuestion];
    setQuestions(updated);
    updateParent(updated);
  };

  const handleUpdateQuestion = (id: string, field: keyof Question, value: string) => {
    const updated = questions.map(q =>
      q.id === id ? { ...q, [field]: value } : q
    );
    setQuestions(updated);
    updateParent(updated);
  };

  const handleDeleteQuestion = (id: string) => {
    const updated = questions.filter(q => q.id !== id);
    setQuestions(updated);
    updateParent(updated);
  };

  const updateParent = (qs: Question[]) => {
    // 将问题数组转为 JSON 字符串保存
    onChange(JSON.stringify(qs));
  };

  return (
    <div className="space-y-4">
      {/* 问题列表 */}
      {questions.map((q, index) => (
        <Card key={q.id} className="p-4 space-y-3 bg-gray-50">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-sm">问题 {index + 1}</h4>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleDeleteQuestion(q.id)}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2Icon className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-2">
            <Label>面试问题</Label>
            <Input
              value={q.question}
              onChange={(e) => handleUpdateQuestion(q.id, 'question', e.target.value)}
              placeholder="如：请介绍一下你的项目经验"
            />
          </div>

          <div className="space-y-2">
            <Label>你的回答</Label>
            <Textarea
              value={q.answer}
              onChange={(e) => handleUpdateQuestion(q.id, 'answer', e.target.value)}
              placeholder="记录你的回答内容..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>反思 / 面试官反馈（可选）</Label>
            <Textarea
              value={q.feedback || ''}
              onChange={(e) => handleUpdateQuestion(q.id, 'feedback', e.target.value)}
              placeholder="如：回答较好，但应该补充具体数据..."
              rows={2}
            />
          </div>
        </Card>
      ))}

      {/* 添加问题按钮 */}
      <Button
        type="button"
        variant="outline"
        onClick={handleAddQuestion}
        className="w-full"
      >
        <PlusIcon className="w-4 h-4 mr-2" />
        添加问题
      </Button>

      {/* 整体总结 */}
      <div className="space-y-2 pt-4 border-t">
        <Label>整体总结 / 改进方向</Label>
        <Textarea
          value={generalNotes}
          onChange={(e) => setGeneralNotes(e.target.value)}
          placeholder="记录整体感受、需要改进的地方...&#10;&#10;如：&#10;- 面试官友好，问题有深度&#10;- 需要加强算法练习&#10;- 准备更多项目亮点"
          rows={4}
        />
      </div>
    </div>
  );
}
