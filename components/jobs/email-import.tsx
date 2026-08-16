'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { parseApplicationEmail, createJobFromEmail } from '@/lib/email-parser';
import { useJobStore } from '@/lib/store';
import { MailIcon, CheckCircle2Icon, XCircleIcon } from 'lucide-react';

interface EmailImportProps {
  onComplete: () => void;
}

export function EmailImport({ onComplete }: EmailImportProps) {
  const { addJob } = useJobStore();
  const [emailContent, setEmailContent] = useState('');
  const [subject, setSubject] = useState('');
  const [from, setFrom] = useState('');
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleImport = () => {
    if (!emailContent.trim() || !subject.trim()) {
      setResult({ success: false, message: '请填写邮件主题和内容' });
      return;
    }

    try {
      const parseResult = parseApplicationEmail(emailContent, subject, from);

      if (!parseResult) {
        setResult({ success: false, message: '无法识别为投递确认邮件，请检查内容是否包含投递相关信息' });
        return;
      }

      if (parseResult.confidence < 0.3) {
        setResult({
          success: false,
          message: `识别置信度过低 (${Math.round(parseResult.confidence * 100)}%)，请手动添加或补充更多信息`
        });
        return;
      }

      const job = createJobFromEmail(parseResult);
      addJob(job);

      setResult({
        success: true,
        message: `成功导入投递记录：${job.company} - ${job.position} (置信度: ${Math.round(parseResult.confidence * 100)}%)`
      });

      // 清空表单
      setTimeout(() => {
        setEmailContent('');
        setSubject('');
        setFrom('');
        setResult(null);
        onComplete();
      }, 2000);
    } catch (error) {
      setResult({
        success: false,
        message: `导入失败：${error instanceof Error ? error.message : '未知错误'}`
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
          <MailIcon className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h3 className="font-semibold text-lg">导入投递确认邮件</h3>
          <p className="text-sm text-gray-600">粘贴招聘平台发送的投递确认邮件，自动提取公司和职位信息</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email-subject">邮件主题 *</Label>
          <input
            id="email-subject"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="如：您的简历已投递成功 - 字节跳动前端工程师"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email-from">发件人邮箱（可选）</Label>
          <input
            id="email-from"
            type="email"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            placeholder="如：noreply@boss.com"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email-content">邮件内容 *</Label>
          <Textarea
            id="email-content"
            value={emailContent}
            onChange={(e) => setEmailContent(e.target.value)}
            placeholder="粘贴邮件正文内容..."
            rows={12}
            className="font-mono text-sm"
          />
        </div>
      </div>

      {result && (
        <Card className={`p-4 ${result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <div className="flex items-start gap-3">
            {result.success ? (
              <CheckCircle2Icon className="w-5 h-5 text-green-600 mt-0.5" />
            ) : (
              <XCircleIcon className="w-5 h-5 text-red-600 mt-0.5" />
            )}
            <p className={`text-sm ${result.success ? 'text-green-700' : 'text-red-700'}`}>
              {result.message}
            </p>
          </div>
        </Card>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-700">
        <p className="font-medium mb-2">💡 支持的邮件类型：</p>
        <ul className="list-disc list-inside space-y-1 text-xs">
          <li>Boss直聘、猎聘、拉勾、智联招聘等平台的投递确认邮件</li>
          <li>邮件中需要包含公司名、职位名等关键信息</li>
          <li>系统会自动提取投递日期、职位链接等信息</li>
        </ul>
      </div>

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={onComplete}>
          取消
        </Button>
        <Button onClick={handleImport}>
          <MailIcon className="w-4 h-4 mr-2" />
          解析并导入
        </Button>
      </div>
    </div>
  );
}
