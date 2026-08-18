'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { PlusIcon, Trash2Icon, PencilIcon, CheckIcon, XIcon } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export interface QAPair {
  id: string;
  question: string;
  answer: string;
  reflection?: string; // 反思
}

interface StructuredQAEditorProps {
  qaPairs: QAPair[];
  onChange: (pairs: QAPair[]) => void;
}

export function StructuredQAEditor({ qaPairs, onChange }: StructuredQAEditorProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState<QAPair>({
    id: '',
    question: '',
    answer: '',
    reflection: ''
  });

  const handleAdd = () => {
    if (!formData.question.trim()) {
      alert('请输入问题');
      return;
    }

    const newPair: QAPair = {
      id: Date.now().toString(),
      question: formData.question,
      answer: formData.answer,
      reflection: formData.reflection
    };

    onChange([...qaPairs, newPair]);
    setIsAdding(false);
    resetForm();
  };

  const handleEdit = (pair: QAPair) => {
    setEditingId(pair.id);
    setFormData(pair);
  };

  const handleUpdate = () => {
    if (!formData.question.trim()) {
      alert('请输入问题');
      return;
    }

    const updated = qaPairs.map(pair =>
      pair.id === editingId ? formData : pair
    );

    onChange(updated);
    setEditingId(null);
    resetForm();
  };

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这个问题吗？')) {
      onChange(qaPairs.filter(pair => pair.id !== id));
    }
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      id: '',
      question: '',
      answer: '',
      reflection: ''
    });
  };

  return (
    <div className="space-y-4">
      {/* 问答列表 */}
      <div className="space-y-4">
        {qaPairs.map((pair, index) => (
          <Card key={pair.id || index} className="p-4">
            {editingId === pair.id ? (
              // 编辑模式
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label>问题 *</Label>
                  <Input
                    value={formData.question}
                    onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                    placeholder="输入面试问题"
                  />
                </div>

                <div className="space-y-2">
                  <Label>回答（支持 Markdown）</Label>
                  <Textarea
                    value={formData.answer}
                    onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                    placeholder="输入你的回答，支持 Markdown 格式&#10;&#10;例如：&#10;- 使用 **粗体** 强调重点&#10;- 使用代码块 ```code```&#10;- 使用列表组织内容"
                    rows={6}
                    className="font-mono text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label>反思 / 改进方向（可选）</Label>
                  <Textarea
                    value={formData.reflection || ''}
                    onChange={(e) => setFormData({ ...formData, reflection: e.target.value })}
                    placeholder="回答得如何？有什么需要改进的地方？"
                    rows={3}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={handleCancel}>
                    <XIcon className="w-4 h-4 mr-1" />
                    取消
                  </Button>
                  <Button size="sm" onClick={handleUpdate}>
                    <CheckIcon className="w-4 h-4 mr-1" />
                    保存
                  </Button>
                </div>
              </div>
            ) : (
              // 查看模式
              <div>
                <div className="flex items-start justify-between mb-3">
                  <h4 className="font-semibold text-base text-gray-900">
                    问题 {index + 1}
                  </h4>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(pair)}
                    >
                      <PencilIcon className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(pair.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2Icon className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* 问题 */}
                <div className="mb-3">
                  <p className="text-sm font-medium text-gray-700 mb-1">📝 问题：</p>
                  <p className="text-gray-900">{pair.question}</p>
                </div>

                {/* 回答 */}
                {pair.answer && (
                  <div className="mb-3">
                    <p className="text-sm font-medium text-gray-700 mb-1">💬 回答：</p>
                    <div className="prose prose-sm max-w-none bg-gray-50 rounded-lg p-3">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {pair.answer}
                      </ReactMarkdown>
                    </div>
                  </div>
                )}

                {/* 反思 */}
                {pair.reflection && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">💡 反思：</p>
                    <p className="text-sm text-gray-600 bg-yellow-50 rounded-lg p-3">
                      {pair.reflection}
                    </p>
                  </div>
                )}
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* 添加新问题 */}
      {isAdding ? (
        <Card className="p-4 bg-blue-50 border-blue-200">
          <h4 className="font-semibold mb-3">添加新问题</h4>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label>问题 *</Label>
              <Input
                value={formData.question}
                onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                placeholder="输入面试问题"
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label>回答（支持 Markdown）</Label>
              <Textarea
                value={formData.answer}
                onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                placeholder="输入你的回答，支持 Markdown 格式&#10;&#10;例如：&#10;- 使用 **粗体** 强调重点&#10;- 使用代码块 ```code```&#10;- 使用列表组织内容"
                rows={6}
                className="font-mono text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label>反思 / 改进方向（可选）</Label>
              <Textarea
                value={formData.reflection || ''}
                onChange={(e) => setFormData({ ...formData, reflection: e.target.value })}
                placeholder="回答得如何？有什么需要改进的地方？"
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleCancel}>
                <XIcon className="w-4 h-4 mr-1" />
                取消
              </Button>
              <Button onClick={handleAdd}>
                <CheckIcon className="w-4 h-4 mr-1" />
                添加
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <Button
          variant="outline"
          onClick={() => setIsAdding(true)}
          className="w-full border-dashed border-2"
        >
          <PlusIcon className="w-4 h-4 mr-2" />
          添加问题
        </Button>
      )}

      {qaPairs.length === 0 && !isAdding && (
        <div className="text-center py-8 text-gray-500 border-2 border-dashed rounded-lg">
          <p>暂无面试问题记录</p>
          <p className="text-sm mt-2">点击"添加问题"按钮开始记录面试问题</p>
        </div>
      )}
    </div>
  );
}
