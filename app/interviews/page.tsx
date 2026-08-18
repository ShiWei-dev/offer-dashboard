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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatDate } from '@/lib/utils';
import { CalendarIcon, BuildingIcon, BriefcaseIcon, PencilIcon, PlusIcon } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { Interview, InterviewResult, QAPair, WrittenTest } from '@/lib/types';
import { StructuredQAEditor } from '@/components/interviews/structured-qa-editor';
import { WrittenTestEditDialog } from '@/components/jobs/written-test-edit-dialog';

export default function InterviewsPage() {
  const { jobs, updateJob } = useJobStore();
  const [selectedType, setSelectedType] = useState<'all' | 'upcoming' | 'past'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingInterview, setEditingInterview] = useState<{
    interview: Interview;
    jobId: string;
    company: string;
    position: string;
  } | null>(null);
  const [editingWrittenTest, setEditingWrittenTest] = useState<{
    test: WrittenTest;
    jobId: string;
    company: string;
    position: string;
  } | null>(null);
  const [formData, setFormData] = useState({
    notes: '',
    result: 'pending' as InterviewResult,
    qa_pairs: [] as QAPair[],
  });
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set());

  // 获取所有有面试记录或笔试记录的投递
  const jobsWithRecords = jobs.filter(job =>
    (job.interviews && job.interviews.length > 0) ||
    (job.written_tests && job.written_tests.length > 0)
  );

  // 按投递分组（保持每个投递的面试和笔试记录在一起）
  const groupedByJob = jobsWithRecords.map(job => ({
    job: {
      id: job.id,
      company: job.company,
      position: job.position,
      status: job.status,
      written_tests: job.written_tests || [], // 包含笔试记录
    },
    interviews: (job.interviews || []).sort((a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    )
  }));

  // 按最新面试或笔试时间排序
  const sortedGroups = groupedByJob.sort((a, b) => {
    const aLatestInterview = a.interviews[0]?.date || new Date(0);
    const aLatestTest = a.job.written_tests[0]?.date || new Date(0);
    const aLatest = new Date(Math.max(
      new Date(aLatestInterview).getTime(),
      new Date(aLatestTest).getTime()
    ));

    const bLatestInterview = b.interviews[0]?.date || new Date(0);
    const bLatestTest = b.job.written_tests[0]?.date || new Date(0);
    const bLatest = new Date(Math.max(
      new Date(bLatestInterview).getTime(),
      new Date(bLatestTest).getTime()
    ));

    return bLatest.getTime() - aLatest.getTime();
  });

  // 展开所有面试和笔试用于统计
  const allInterviews = jobsWithRecords.flatMap(job => job.interviews || []);
  const allWrittenTests = jobsWithRecords.flatMap(job => job.written_tests || []);

  // 筛选
  const now = new Date();
  const filteredGroups = sortedGroups.filter(group => {
    const interviews = group.interviews || [];
    const writtenTests = group.job.written_tests || [];

    // 搜索过滤
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchCompany = group.job.company.toLowerCase().includes(query);
      const matchPosition = group.job.position.toLowerCase().includes(query);
      if (!matchCompany && !matchPosition) {
        return false;
      }
    }

    if (selectedType === 'upcoming') {
      // 有即将到来的面试或笔试
      return interviews.some(i => new Date(i.date) > now) ||
             writtenTests.some(t => new Date(t.date) > now);
    } else if (selectedType === 'past') {
      // 所有面试和笔试都已完成
      return interviews.every(i => new Date(i.date) <= now) &&
             writtenTests.every(t => new Date(t.date) <= now) &&
             (interviews.length > 0 || writtenTests.length > 0);
    }
    return true;
  });

  // 统计数据 - 区分面试和笔试
  const stats = {
    // 面试统计
    totalInterviews: allInterviews.length,
    upcomingInterviews: allInterviews.filter(i => new Date(i.date) > now).length,
    passedInterviews: allInterviews.filter(i => i.result === 'pass').length,
    failedInterviews: allInterviews.filter(i => i.result === 'fail').length,
    pendingInterviews: allInterviews.filter(i => i.result === 'pending').length,

    // 笔试统计
    totalWrittenTests: allWrittenTests.length,
    upcomingWrittenTests: allWrittenTests.filter(t => new Date(t.date) > now).length,
    passedWrittenTests: allWrittenTests.filter(t => t.result === 'pass').length,
    failedWrittenTests: allWrittenTests.filter(t => t.result === 'fail').length,
    pendingWrittenTests: allWrittenTests.filter(t => t.result === 'pending').length,
  };

  // 打开编辑对话框
  const handleEdit = (interview: Interview, jobId: string, company: string, position: string) => {
    setEditingInterview({ interview, jobId, company, position });
    setFormData({
      notes: interview.notes || '',
      result: interview.result || 'pending',
      qa_pairs: interview.qa_pairs || [],
    });
  };

  // 保存编辑
  const handleSave = () => {
    if (!editingInterview) return;

    const job = jobs.find(j => j.id === editingInterview.jobId);
    if (!job) return;

    const updatedInterviews = job.interviews.map(i =>
      i.id === editingInterview.interview.id
        ? { ...i, notes: formData.notes, result: formData.result, qa_pairs: formData.qa_pairs }
        : i
    );

    updateJob(editingInterview.jobId, { interviews: updatedInterviews });
    setEditingInterview(null);
  };

  // 保存笔试编辑
  const handleWrittenTestSave = (jobId: string, updatedTest: WrittenTest) => {
    const job = jobs.find(j => j.id === jobId);
    if (!job) return;

    const updatedTests = job.written_tests.map(t =>
      t.id === updatedTest.id ? updatedTest : t
    );

    updateJob(jobId, { written_tests: updatedTests });
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
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {/* 面试统计 */}
          <Card className="col-span-2 md:col-span-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-gray-700">🎯 面试统计</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{stats.totalInterviews}</div>
                  <div className="text-xs text-gray-600 mt-1">总数</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-600">{stats.upcomingInterviews}</div>
                  <div className="text-xs text-gray-600 mt-1">待参加</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">{stats.passedInterviews}</div>
                  <div className="text-xs text-gray-600 mt-1">已通过</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-center mt-3 pt-3 border-t">
                <div>
                  <div className="text-xl font-bold text-red-600">{stats.failedInterviews}</div>
                  <div className="text-xs text-gray-600 mt-1">未通过</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-gray-600">{stats.pendingInterviews}</div>
                  <div className="text-xs text-gray-600 mt-1">待定</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 笔试统计 */}
          <Card className="col-span-2 md:col-span-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-gray-700">📝 笔试统计</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{stats.totalWrittenTests}</div>
                  <div className="text-xs text-gray-600 mt-1">总数</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-600">{stats.upcomingWrittenTests}</div>
                  <div className="text-xs text-gray-600 mt-1">待参加</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">{stats.passedWrittenTests}</div>
                  <div className="text-xs text-gray-600 mt-1">已通过</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-center mt-3 pt-3 border-t">
                <div>
                  <div className="text-xl font-bold text-red-600">{stats.failedWrittenTests}</div>
                  <div className="text-xs text-gray-600 mt-1">未通过</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-gray-600">{stats.pendingWrittenTests}</div>
                  <div className="text-xs text-gray-600 mt-1">待定</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 合计统计 */}
          <Card className="col-span-2 md:col-span-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-gray-700">📊 合计</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{stats.totalInterviews + stats.totalWrittenTests}</div>
                  <div className="text-xs text-gray-600 mt-1">总数</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-600">{stats.upcomingInterviews + stats.upcomingWrittenTests}</div>
                  <div className="text-xs text-gray-600 mt-1">待参加</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">{stats.passedInterviews + stats.passedWrittenTests}</div>
                  <div className="text-xs text-gray-600 mt-1">已通过</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-center mt-3 pt-3 border-t">
                <div>
                  <div className="text-xl font-bold text-red-600">{stats.failedInterviews + stats.failedWrittenTests}</div>
                  <div className="text-xs text-gray-600 mt-1">未通过</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-gray-600">{stats.pendingInterviews + stats.pendingWrittenTests}</div>
                  <div className="text-xs text-gray-600 mt-1">待定</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 筛选按钮 */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex gap-3">
            <Button
              variant={selectedType === 'all' ? 'default' : 'outline'}
              onClick={() => setSelectedType('all')}
            >
              全部 ({stats.totalInterviews + stats.totalWrittenTests})
            </Button>
            <Button
              variant={selectedType === 'upcoming' ? 'default' : 'outline'}
              onClick={() => setSelectedType('upcoming')}
            >
              待参加 ({stats.upcomingInterviews + stats.upcomingWrittenTests})
            </Button>
            <Button
              variant={selectedType === 'past' ? 'default' : 'outline'}
              onClick={() => setSelectedType('past')}
            >
              已完成 ({(stats.totalInterviews + stats.totalWrittenTests) - (stats.upcomingInterviews + stats.upcomingWrittenTests)})
            </Button>
          </div>

          {/* 搜索框 */}
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="搜索公司或职位..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* 面试和笔试记录列表 */}
        <div className="space-y-6">
          {filteredGroups.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-gray-500">
                <CalendarIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg">暂无笔试和面试记录</p>
                <p className="text-sm mt-2">在投递详情中添加笔试或面试安排</p>
              </CardContent>
            </Card>
          ) : (
            filteredGroups.map((group) => (
              <Card key={group.job.id} className="overflow-hidden border-2 shadow-md hover:shadow-lg transition-shadow">
                {/* 投递信息头部 */}
                <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-b-2 border-gray-200 p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                        <BuildingIcon className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-xl text-gray-900">{group.job.company}</span>
                          <span className="text-gray-400">·</span>
                          <span className="text-gray-700 font-medium">{group.job.position}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-blue-50 border-blue-200">{group.interviews.length} 轮面试</Badge>
                          {group.job.written_tests && group.job.written_tests.length > 0 && (
                            <Badge variant="outline" className="bg-purple-50 border-purple-200">{group.job.written_tests.length} 次笔试</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <Link href={`/board?highlight=${group.job.id}`}>
                      <Button variant="outline" size="sm" className="shadow-sm">
                        查看投递
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* 面试记录列表 */}
                <CardContent className="p-6 space-y-4 bg-gray-50/30">
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
                                {interview.type === 'onsite' ? '🏢 现场' :
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
                            {(interview.qa_pairs && interview.qa_pairs.length > 0) || interview.notes ? (
                              <>
                                <Separator className="my-4" />
                                {/* 结构化问答 */}
                                {interview.qa_pairs && interview.qa_pairs.length > 0 && (
                                  <div className="mb-3">
                                    <h4 className="font-semibold text-sm text-gray-700 mb-2">
                                      📋 面试问答（{interview.qa_pairs.length}）
                                    </h4>
                                    <div className="space-y-2">
                                      {interview.qa_pairs.map((qa, idx) => (
                                        <div key={qa.id || idx} className="bg-gray-50 rounded-lg p-3 text-sm">
                                          <p className="font-medium text-gray-900">Q{idx + 1}: {qa.question}</p>
                                          {qa.answer && (
                                            <p className="text-gray-700 mt-1 whitespace-pre-wrap">A: {qa.answer}</p>
                                          )}
                                          {qa.reflection && (
                                            <p className="text-gray-500 mt-1 text-xs">💭 {qa.reflection}</p>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                {/* 自由文本备注 */}
                                {interview.notes && (
                                  <div>
                                    <h4 className="font-semibold text-sm text-gray-700 mb-2">
                                      📝 面试反馈 / 问题复盘
                                    </h4>
                                    <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700">
                                      <div
                                        className={`whitespace-pre-wrap ${
                                          !expandedNotes.has(interview.id) && interview.notes.split('\n').length > 5
                                            ? 'line-clamp-5'
                                            : ''
                                        }`}
                                      >
                                        {interview.notes}
                                      </div>
                                      {interview.notes.split('\n').length > 5 && (
                                        <button
                                          onClick={() => {
                                            const newExpanded = new Set(expandedNotes);
                                            if (expandedNotes.has(interview.id)) {
                                              newExpanded.delete(interview.id);
                                            } else {
                                              newExpanded.add(interview.id);
                                            }
                                            setExpandedNotes(newExpanded);
                                          }}
                                          className="text-blue-600 hover:text-blue-700 text-xs mt-2 font-medium"
                                        >
                                          {expandedNotes.has(interview.id) ? '收起 ▲' : '展开更多 ▼'}
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </>
                            ) : (
                              <>
                                <Separator className="my-4" />
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-700">
                                  💡 还未添加面试复盘，点击右侧「编辑复盘」按钮添加
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

                  {/* 笔试记录列表 */}
                  {group.job.written_tests && group.job.written_tests.length > 0 && (
                    <>
                      <Separator className="my-6" />
                      <h3 className="font-semibold text-lg text-gray-700 mb-4">📝 笔试记录</h3>
                      {group.job.written_tests.map((test) => {
                        const isPast = new Date(test.date) <= now;
                        const isToday = formatDate(test.date) === formatDate(now);

                        return (
                          <div
                            key={test.id}
                            className={`p-4 rounded-lg border ${
                              !isPast ? 'border-purple-300 bg-purple-50/50' : 'border-gray-200 bg-white'
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                {/* 笔试信息 */}
                                <div className="flex items-center gap-4 mb-3">
                                  <Badge variant={test.result === 'pass' ? 'default' : test.result === 'fail' ? 'destructive' : 'secondary'}>
                                    {test.result === 'pass' ? '✅ 通过' : test.result === 'fail' ? '❌ 未通过' : '⏳ 待定'}
                                  </Badge>
                                  {!isPast && (
                                    <Badge className="bg-orange-600 text-white">
                                      {isToday ? '今天' : '即将进行'}
                                    </Badge>
                                  )}
                                  <span className="text-gray-600 flex items-center gap-1">
                                    <CalendarIcon className="w-4 h-4" />
                                    {formatDate(test.date, 'long')}
                                  </span>
                                  {test.type && (
                                    <Badge variant="outline">
                                      {test.type === 'online' ? '💻 在线笔试' : '📝 现场笔试'}
                                    </Badge>
                                  )}
                                </div>

                                {/* 笔试详情 */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                                  {test.category && (
                                    <div>
                                      <span className="text-gray-500">类型：</span>
                                      <span className="font-medium">{test.category}</span>
                                    </div>
                                  )}
                                  {test.platform && (
                                    <div>
                                      <span className="text-gray-500">平台：</span>
                                      <span className="font-medium">{test.platform}</span>
                                    </div>
                                  )}
                                  {test.duration && (
                                    <div>
                                      <span className="text-gray-500">时长：</span>
                                      <span className="font-medium">{test.duration} 分钟</span>
                                    </div>
                                  )}
                                  {test.topics && test.topics.length > 0 && (
                                    <div>
                                      <span className="text-gray-500">题目数：</span>
                                      <span className="font-medium">{test.topics.length} 题</span>
                                    </div>
                                  )}
                                </div>

                                {/* 笔试备注 */}
                                {test.notes && (
                                  <>
                                    <Separator className="my-4" />
                                    <div>
                                      <h4 className="font-semibold text-sm text-gray-700 mb-2">
                                        📝 笔试备注
                                      </h4>
                                      <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700">
                                        <div
                                          className={`whitespace-pre-wrap ${
                                            !expandedNotes.has(test.id) && test.notes.split('\n').length > 5
                                              ? 'line-clamp-5'
                                              : ''
                                          }`}
                                        >
                                          {test.notes}
                                        </div>
                                        {test.notes.split('\n').length > 5 && (
                                          <button
                                            onClick={() => {
                                              const newExpanded = new Set(expandedNotes);
                                              if (expandedNotes.has(test.id)) {
                                                newExpanded.delete(test.id);
                                              } else {
                                                newExpanded.add(test.id);
                                              }
                                              setExpandedNotes(newExpanded);
                                            }}
                                            className="text-blue-600 hover:text-blue-700 text-xs mt-2 font-medium"
                                          >
                                            {expandedNotes.has(test.id) ? '收起 ▲' : '展开更多 ▼'}
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  </>
                                )}
                              </div>

                              {/* 操作按钮 */}
                              <div className="ml-4">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setEditingWrittenTest({
                                      test,
                                      jobId: group.job.id,
                                      company: group.job.company,
                                      position: group.job.position,
                                    });
                                  }}
                                >
                                  <PencilIcon className="w-4 h-4 mr-1" />
                                  编辑复盘
                                </Button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </>
                  )}
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
                    {editingInterview.interview.type === 'onsite' ? '🏢 现场' :
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

              {/* 编辑表单 - Tabs 组织 */}
              <Tabs defaultValue="structured" className="space-y-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="structured">📝 结构化问答</TabsTrigger>
                  <TabsTrigger value="freetext">📄 自由文本</TabsTrigger>
                </TabsList>

                {/* 结构化问答 */}
                <TabsContent value="structured" className="space-y-4 mt-4">
                  <StructuredQAEditor
                    qaPairs={formData.qa_pairs}
                    onChange={(pairs) => setFormData({ ...formData, qa_pairs: pairs })}
                  />
                </TabsContent>

                {/* 自由文本 */}
                <TabsContent value="freetext" className="space-y-4 mt-4">
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
                </TabsContent>
              </Tabs>

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

      {/* 笔试编辑对话框 */}
      {editingWrittenTest && (
        <WrittenTestEditDialog
          open={!!editingWrittenTest}
          onOpenChange={(open) => !open && setEditingWrittenTest(null)}
          test={editingWrittenTest.test}
          jobId={editingWrittenTest.jobId}
          company={editingWrittenTest.company}
          position={editingWrittenTest.position}
          onSave={handleWrittenTestSave}
        />
      )}
    </div>
  );
}
