'use client';

import { useJobStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatDate } from '@/lib/utils';
import { CalendarIcon, BuildingIcon, BriefcaseIcon, PencilIcon, PlusIcon } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { Interview, InterviewResult } from '@/lib/types';

export default function InterviewsPage() {
  const { jobs, updateJob } = useJobStore();
  const [selectedType, setSelectedType] = useState<'all' | 'upcoming' | 'past'>('all');
  const [editingInterview, setEditingInterview] = useState<{
    interview: Interview;
    jobId: string;
    company: string;
    position: string;
  } | null>(null);
  const [formData, setFormData] = useState({
    notes: '',
    result: 'pending' as InterviewResult,
  });

  // 获取所有有面试记录的投递
  const jobsWithInterviews = jobs.filter(job => job.interviews && job.interviews.length > 0);

  // 按投递分组（保持每个投递的面试记录在一起）
  const groupedByJob = jobsWithInterviews.map(job => ({
    job: {
      id: job.id,
      company: job.company,
      position: job.position,
      status: job.status,
    },
    interviews: job.interviews.sort((a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    )
  }));

  // 按最新面试时间排序
  const sortedGroups = groupedByJob.sort((a, b) => {
    const aLatest = a.interviews[0]?.date || new Date(0);
    const bLatest = b.interviews[0]?.date || new Date(0);
    return new Date(bLatest).getTime() - new Date(aLatest).getTime();
  });

  // 展开所有面试用于统计
  const allInterviews = jobsWithInterviews.flatMap(job => job.interviews);

  // 筛选
  const now = new Date();
  const filteredGroups = sortedGroups.filter(group => {
    if (selectedType === 'upcoming') {
      // 有即将到来的面试
      return group.interviews.some(i => new Date(i.date) > now);
    } else if (selectedType === 'past') {
      // 所有面试都已完成
      return group.interviews.every(i => new Date(i.date) <= now);
    }
    return true;
  });

  // 统计数据
  const stats = {
    total: allInterviews.length,
    upcoming: allInterviews.filter(i => new Date(i.date) > now).length,
    passed: allInterviews.filter(i => i.result === 'pass').length,
    failed: allInterviews.filter(i => i.result === 'fail').length,
    pending: allInterviews.filter(i => i.result === 'pending').length,
  };

  // 打开编辑对话框
  const handleEdit = (interview: Interview, jobId: string, company: string, position: string) => {
    setEditingInterview({ interview, jobId, company, position });
    setFormData({
      notes: interview.notes || '',
      result: interview.result || 'pending',
    });
  };

  // 保存编辑
  const handleSave = () => {
    if (!editingInterview) return;

    const job = jobs.find(j => j.id === editingInterview.jobId);
    if (!job) return;

    const updatedInterviews = job.interviews.map(i =>
      i.id === editingInterview.interview.id
        ? { ...i, notes: formData.notes, result: formData.result }
        : i
    );

    updateJob(editingInterview.jobId, { interviews: updatedInterviews });
    setEditingInterview(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* 头部 */}
      <header className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">面试记录</h1>
              <p className="text-gray-600 mt-1">汇总所有笔试和面试的记录与复盘</p>
            </div>
            <Link href="/">
              <Button variant="outline">返回首页</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 space-y-8">
        {/* 统计卡片 */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
                <div className="text-sm text-gray-600 mt-1">总面试数</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600">{stats.upcoming}</div>
                <div className="text-sm text-gray-600 mt-1">待参加</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{stats.passed}</div>
                <div className="text-sm text-gray-600 mt-1">已通过</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600">{stats.failed}</div>
                <div className="text-sm text-gray-600 mt-1">未通过</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-600">{stats.pending}</div>
                <div className="text-sm text-gray-600 mt-1">待定</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 筛选按钮 */}
        <div className="flex gap-3">
          <Button
            variant={selectedType === 'all' ? 'default' : 'outline'}
            onClick={() => setSelectedType('all')}
          >
            全部 ({stats.total})
          </Button>
          <Button
            variant={selectedType === 'upcoming' ? 'default' : 'outline'}
            onClick={() => setSelectedType('upcoming')}
          >
            待参加 ({stats.upcoming})
          </Button>
          <Button
            variant={selectedType === 'past' ? 'default' : 'outline'}
            onClick={() => setSelectedType('past')}
          >
            已完成 ({stats.total - stats.upcoming})
          </Button>
        </div>

        {/* 面试记录列表 */}
        <div className="space-y-6">
          {filteredGroups.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-gray-500">
                <CalendarIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg">暂无面试记录</p>
                <p className="text-sm mt-2">在投递详情中添加面试安排</p>
              </CardContent>
            </Card>
          ) : (
            filteredGroups.map((group) => (
              <Card key={group.job.id} className="overflow-hidden">
                {/* 投递信息头部 */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-b p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <BuildingIcon className="w-5 h-5 text-gray-600" />
                      <span className="font-bold text-lg">{group.job.company}</span>
                      <BriefcaseIcon className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-700">{group.job.position}</span>
                      <Badge variant="outline">{group.interviews.length} 轮</Badge>
                    </div>
                    <Link href={`/board?highlight=${group.job.id}`}>
                      <Button variant="ghost" size="sm">
                        查看投递
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* 面试记录列表 */}
                <CardContent className="p-4 space-y-4">
                  {group.interviews.map((interview) => {
                    const isPast = new Date(interview.date) <= now;
                    const isToday = formatDate(interview.date) === formatDate(now);

                    return (
                      <div
                        key={interview.id}
                        className={`p-4 rounded-lg border ${
                          !isPast ? 'border-orange-300 bg-orange-50/50' : 'border-gray-200 bg-white'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            {/* 面试信息 */}
                            <div className="flex items-center gap-4 mb-3">
                              <Badge variant={
                                interview.result === 'pass' ? 'default' :
                                interview.result === 'fail' ? 'destructive' :
                                'secondary'
                              }>
                                第 {interview.round} 轮
                              </Badge>

                              <Badge variant="outline">
                                {interview.type === 'written' ? '📝 笔试' :
                                 interview.type === 'onsite' ? '🏢 现场' :
                                 interview.type === 'video' ? '📹 视频' : '📞 电话'}
                              </Badge>

                              {!isPast && (
                                <Badge className="bg-orange-600 text-white">
                                  {isToday ? '今天' : '即将到来'}
                                </Badge>
                              )}

                              {interview.result === 'pass' && (
                                <Badge className="bg-green-600 text-white">✅ 通过</Badge>
                              )}
                              {interview.result === 'fail' && (
                                <Badge className="bg-red-600 text-white">❌ 未通过</Badge>
                              )}
                              {interview.result === 'pending' && (
                                <Badge variant="secondary">⏳ 待定</Badge>
                              )}
                            </div>

                            {/* 时间和面试官 */}
                            <div className="flex items-center gap-6 text-sm text-gray-600 mb-4">
                              <div className="flex items-center gap-2">
                                <CalendarIcon className="w-4 h-4" />
                                <span>{formatDate(interview.date, 'long')}</span>
                              </div>
                              {interview.interviewer && (
                                <div>
                                  <span className="text-gray-500">面试官：</span>
                                  <span className="font-medium">{interview.interviewer}</span>
                                </div>
                              )}
                            </div>

                            {/* 面试反馈/复盘 */}
                            {interview.notes ? (
                              <>
                                <Separator className="my-4" />
                                <div>
                                  <h4 className="font-semibold text-sm text-gray-700 mb-2">
                                    📝 面试反馈 / 问题复盘
                                  </h4>
                                  <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 whitespace-pre-wrap">
                                    {interview.notes}
                                  </div>
                                </div>
                              </>
                            ) : (
                              <>
                                <Separator className="my-4" />
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-700">
                                  💡 还未添加面试复盘，点击右侧"编辑复盘"按钮添加
                                </div>
                              </>
                            )}
                          </div>

                          {/* 操作按钮 */}
                          <div className="ml-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(interview, group.job.id, group.job.company, group.job.position)}
                            >
                              <PencilIcon className="w-4 h-4 mr-1" />
                              编辑复盘
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>

      {/* 编辑复盘对话框 */}
      <Dialog open={!!editingInterview} onOpenChange={() => setEditingInterview(null)}>
        <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">编辑面试复盘</DialogTitle>
          </DialogHeader>

          {editingInterview && (
            <div className="space-y-6 mt-4">
              {/* 面试信息展示 */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-5">
                <div className="flex items-center gap-4 mb-2">
                  <span className="font-bold text-xl">{editingInterview.company}</span>
                  <span className="text-lg text-gray-700">{editingInterview.position}</span>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <Badge>第 {editingInterview.interview.round} 轮</Badge>
                  <span>•</span>
                  <span>{formatDate(editingInterview.interview.date, 'long')}</span>
                  <span>•</span>
                  <span>
                    {editingInterview.interview.type === 'written' ? '📝 笔试' :
                     editingInterview.interview.type === 'onsite' ? '🏢 现场' :
                     editingInterview.interview.type === 'video' ? '📹 视频' : '📞 电话'}
                  </span>
                </div>
              </div>

              {/* 面试结果 */}
              <div className="space-y-2">
                <Label className="text-base font-semibold">面试结果</Label>
                <Select
                  value={formData.result}
                  onValueChange={(value) => setFormData({ ...formData, result: value as InterviewResult })}
                >
                  <SelectTrigger className="h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">⏳ 待定</SelectItem>
                    <SelectItem value="pass">✅ 通过</SelectItem>
                    <SelectItem value="fail">❌ 未通过</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {/* 面试复盘 - 大文本框 */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">面试复盘 / 问题记录</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="记录面试中的问题、回答情况、面试官反馈、需要改进的地方...&#10;&#10;建议格式：&#10;&#10;问题1：XXX&#10;回答：XXX&#10;反思：XXX&#10;&#10;问题2：XXX&#10;回答：XXX&#10;面试官反馈：XXX&#10;&#10;整体感受：&#10;- XXX&#10;- XXX&#10;&#10;改进方向：&#10;- XXX&#10;- XXX"
                  rows={20}
                  className="font-mono text-sm resize-y min-h-[400px]"
                />
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
                  <p className="font-semibold mb-1">💡 复盘建议</p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>记录每个问题和你的回答</li>
                    <li>标注面试官的反馈和追问</li>
                    <li>反思哪些回答得好，哪些需要改进</li>
                    <li>记录整体感受和下次改进方向</li>
                  </ul>
                </div>
              </div>

              {/* 操作按钮 */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setEditingInterview(null)} className="px-6">
                  取消
                </Button>
                <Button onClick={handleSave} className="px-6">
                  保存复盘
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
