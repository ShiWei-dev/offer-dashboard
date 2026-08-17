'use client';

import { useState } from 'react';
import { useJobStore } from '@/lib/store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DownloadIcon, UploadIcon, TrashIcon, InfoIcon, DatabaseIcon } from 'lucide-react';
import Link from 'next/link';

export default function SettingsPage() {
  const { jobs, importJobs, clearAllJobs } = useJobStore();
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // 导出数据为 JSON
  const handleExport = () => {
    try {
      const dataStr = JSON.stringify({ jobs, version: '1.0', exportDate: new Date().toISOString() }, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `offer-dashboard-backup-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
      setMessage({ type: 'success', text: '数据导出成功！' });
    } catch (error) {
      setMessage({ type: 'error', text: '导出失败，请重试' });
    }
  };

  // 导入数据
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);

        if (!data.jobs || !Array.isArray(data.jobs)) {
          throw new Error('无效的数据格式');
        }

        // 转换日期字符串为 Date 对象
        const jobsWithDates = data.jobs.map((job: any) => ({
          ...job,
          created_at: new Date(job.created_at),
          updated_at: new Date(job.updated_at),
          applied_date: job.applied_date ? new Date(job.applied_date) : undefined,
          next_interview_date: job.next_interview_date ? new Date(job.next_interview_date) : undefined,
          interviews: job.interviews?.map((i: any) => ({
            ...i,
            date: new Date(i.date)
          })) || [],
          written_tests: job.written_tests?.map((t: any) => ({
            ...t,
            date: new Date(t.date)
          })) || []
        }));

        importJobs(jobsWithDates);
        setMessage({ type: 'success', text: `成功导入 ${jobsWithDates.length} 条记录！` });
      } catch (error) {
        setMessage({ type: 'error', text: '导入失败，请检查文件格式' });
      }
    };
    reader.readAsText(file);
  };

  // 清空所有数据
  const handleClearAll = () => {
    if (confirm('⚠️ 确定要清空所有数据吗？此操作不可恢复！')) {
      clearAllJobs();
      setMessage({ type: 'success', text: '所有数据已清空' });
    }
  };

  // 获取存储大小
  const getStorageSize = () => {
    const data = localStorage.getItem('job-tracker-storage');
    if (!data) return '0 KB';
    const bytes = new Blob([data]).size;
    return (bytes / 1024).toFixed(2) + ' KB';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* 头部 */}
      <header className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">数据管理</h1>
              <p className="text-gray-600 mt-1">导入、导出和管理你的投递数据</p>
            </div>
            <Link href="/">
              <Button variant="outline">返回首页</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 space-y-6">
        {/* 消息提示 */}
        {message && (
          <Alert className={message.type === 'success' ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}>
            <AlertDescription className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
              {message.text}
            </AlertDescription>
          </Alert>
        )}

        {/* 数据概览 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DatabaseIcon className="w-5 h-5" />
              数据概览
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-3xl font-bold text-blue-600">{jobs.length}</div>
                <div className="text-sm text-gray-600 mt-1">投递记录</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-3xl font-bold text-green-600">
                  {jobs.reduce((sum, job) => sum + job.interviews.length, 0)}
                </div>
                <div className="text-sm text-gray-600 mt-1">面试记录</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-3xl font-bold text-purple-600">
                  {jobs.reduce((sum, job) => sum + (job.written_tests?.length || 0), 0)}
                </div>
                <div className="text-sm text-gray-600 mt-1">笔试记录</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-3xl font-bold text-orange-600">{getStorageSize()}</div>
                <div className="text-sm text-gray-600 mt-1">存储大小</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 存储位置说明 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <InfoIcon className="w-5 h-5" />
              数据存储位置
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <Badge variant="outline">localStorage</Badge>
              <div className="flex-1">
                <p className="text-sm text-gray-700">
                  数据保存在浏览器的 localStorage 中，key 为 <code className="bg-gray-100 px-2 py-0.5 rounded text-xs">job-tracker-storage</code>
                </p>
              </div>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-semibold text-yellow-800 mb-2">⚠️ 数据安全提示</h4>
              <ul className="text-sm text-yellow-700 space-y-1 list-disc list-inside">
                <li>清除浏览器缓存会导致数据丢失</li>
                <li>换浏览器或换电脑无法同步数据</li>
                <li>重装系统会丢失所有数据</li>
                <li><strong>建议定期导出备份</strong></li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* 导出数据 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DownloadIcon className="w-5 h-5" />
              导出数据
            </CardTitle>
            <CardDescription>
              将所有投递数据导出为 JSON 文件，用于备份或迁移
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleExport} className="w-full md:w-auto">
              <DownloadIcon className="w-4 h-4 mr-2" />
              导出为 JSON
            </Button>
          </CardContent>
        </Card>

        {/* 导入数据 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UploadIcon className="w-5 h-5" />
              导入数据
            </CardTitle>
            <CardDescription>
              从之前导出的 JSON 文件恢复数据（会覆盖当前数据）
            </CardDescription>
          </CardHeader>
          <CardContent>
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
              id="import-file"
            />
            <label htmlFor="import-file" className="cursor-pointer">
              <Button type="button" className="w-full md:w-auto">
                <UploadIcon className="w-4 h-4 mr-2" />
                选择 JSON 文件导入
              </Button>
            </label>
          </CardContent>
        </Card>

        {/* 危险操作 */}
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <TrashIcon className="w-5 h-5" />
              危险操作
            </CardTitle>
            <CardDescription>
              此操作不可恢复，请谨慎操作
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="destructive" onClick={handleClearAll} className="w-full md:w-auto">
              <TrashIcon className="w-4 h-4 mr-2" />
              清空所有数据
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
