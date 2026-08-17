'use client';

import { useState } from 'react';
import { WrittenTest, WrittenTestType, WrittenTestCategory, WrittenTestResult } from '@/lib/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import { WRITTEN_TEST_CATEGORY_CONFIG } from '@/lib/constants';

interface WrittenTestEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  test: WrittenTest;
  jobId: string;
  company: string;
  position: string;
  onSave: (jobId: string, updatedTest: WrittenTest) => void;
}

export function WrittenTestEditDialog({
  open,
  onOpenChange,
  test,
  jobId,
  company,
  position,
  onSave,
}: WrittenTestEditDialogProps) {
  const [formData, setFormData] = useState<WrittenTest>(test);

  const handleSave = () => {
    onSave(jobId, formData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>编辑笔试复盘</DialogTitle>
        </DialogHeader>

        {/* 投递信息 */}
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg">{company}</h3>
              <p className="text-sm text-gray-600">{position}</p>
            </div>
            <div className="text-right text-sm text-gray-500">
              <p>{formatDate(test.date, 'long')}</p>
              <p className="text-xs">笔试</p>
            </div>
          </div>
        </div>

        {/* 笔试表单 */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>笔试形式</Label>
              <Select
                value={formData.type || 'online'}
                onValueChange={(value: WrittenTestType) => setFormData({ ...formData, type: value })}
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

            <div className="space-y-2">
              <Label>笔试结果</Label>
              <Select
                value={formData.result || 'pending'}
                onValueChange={(value: WrittenTestResult) => setFormData({ ...formData, result: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pass">✅ 通过</SelectItem>
                  <SelectItem value="pending">⏳ 待定</SelectItem>
                  <SelectItem value="fail">❌ 未通过</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {formData.category && (
            <div className="space-y-2">
              <Label>笔试类型</Label>
              <Badge variant="outline" className="text-sm">
                {WRITTEN_TEST_CATEGORY_CONFIG[formData.category]?.label || formData.category}
              </Badge>
            </div>
          )}

          <div className="space-y-2">
            <Label>笔试平台</Label>
            <Input
              placeholder="如：牛客网、赛码网等（选填）"
              value={formData.platform || ''}
              onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>时长（分钟）</Label>
            <Input
              type="number"
              placeholder="120"
              value={formData.duration || ''}
              onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || undefined })}
            />
          </div>

          <div className="space-y-2">
            <Label>备注</Label>
            <Textarea
              placeholder="题目类型、难度、考察点、完成情况等..."
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={8}
            />
          </div>
        </div>

        {/* 底部按钮 */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleSave}>
            保存复盘
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
