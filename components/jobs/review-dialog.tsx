'use client';

import { useState } from 'react';
import { JobApplication, Interview, WrittenTest, InterviewType, InterviewContentType, InterviewResult, WrittenTestType, WrittenTestResult, WrittenTestCategory } from '@/lib/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { INTERVIEW_CONTENT_TYPE_CONFIG, WRITTEN_TEST_CATEGORY_CONFIG } from '@/lib/constants';
import { useJobStore } from '@/lib/store';
import { nanoid } from 'nanoid';
import { formatDate } from '@/lib/utils';

interface ReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  job: JobApplication;
  eventType: 'interview' | 'written';
  eventDate?: Date;
  interviewContentType?: InterviewContentType;
  writtenTestCategory?: WrittenTestCategory;
}

export function ReviewDialog({
  open,
  onOpenChange,
  job,
  eventType,
  eventDate,
  interviewContentType,
  writtenTestCategory,
}: ReviewDialogProps) {
  const { updateJob } = useJobStore();

  // 面试表单数据
  const [interviewData, setInterviewData] = useState<Partial<Interview>>({
    date: eventDate || new Date(),
    type: 'video',
    content_type: interviewContentType,
    round: job.interviews.length + 1,
    result: 'pending',
  });

  // 笔试表单数据
  const [writtenTestData, setWrittenTestData] = useState<Partial<WrittenTest>>({
    date: eventDate || new Date(),
    type: 'online',
    category: writtenTestCategory,
    result: 'pending',
    topics: [],
  });

  // 结构化问答编辑
  const [qaInput, setQaInput] = useState({ question: '', answer: '' });

  const handleSaveInterview = () => {
    if (!interviewData.date) {
      alert('请选择面试时间');
      return;
    }

    const newInterview: Interview = {
      id: nanoid(),
      date: interviewData.date,
      type: interviewData.type as InterviewType,
      content_type: interviewData.content_type as InterviewContentType,
      round: interviewData.round || job.interviews.length + 1,
      interviewer: interviewData.interviewer,
      notes: interviewData.notes,
      result: interviewData.result as InterviewResult,
      qa_pairs: interviewData.qa_pairs,
    };

    const updatedInterviews = [...(job.interviews || []), newInterview];

    const updatedJob = {
      ...job,
      interviews: updatedInterviews,
      // 清除下次面试提醒
      next_interview_date: undefined,
      next_event_type: undefined,
      next_interview_content_type: undefined,
      updated_at: new Date(),
    };

    console.log('保存面试记录:', newInterview);
    console.log('更新后的投递:', updatedJob);

    updateJob(updatedJob);
    onOpenChange(false);
  };

  const handleSaveWrittenTest = () => {
    if (!writtenTestData.date) {
      alert('请选择笔试时间');
      return;
    }

    const newTest: WrittenTest = {
      id: nanoid(),
      date: writtenTestData.date,
      type: writtenTestData.type as WrittenTestType,
      category: writtenTestData.category as WrittenTestCategory,
      platform: writtenTestData.platform,
      duration: writtenTestData.duration,
      topics: writtenTestData.topics || [],
      notes: writtenTestData.notes,
      result: writtenTestData.result as WrittenTestResult,
    };

    const updatedTests = [...(job.written_tests || []), newTest];

    const updatedJob = {
      ...job,
      written_tests: updatedTests,
      // 清除下次笔试提醒
      ...(job.next_event_type === 'written' && {
        next_interview_date: undefined,
        next_event_type: undefined,
        next_written_test_category: undefined,
      }),
      updated_at: new Date(),
    };

    console.log('保存笔试记录:', newTest);
    console.log('更新后的投递:', updatedJob);

    updateJob(updatedJob);
    onOpenChange(false);
  };

  const handleAddQA = () => {
    if (!qaInput.question.trim()) return;

    const newQA = {
      question: qaInput.question,
      answer: qaInput.answer,
    };

    setInterviewData({
      ...interviewData,
      qa_pairs: [...(interviewData.qa_pairs || []), newQA],
    });

    setQaInput({ question: '', answer: '' });
  };

  const handleRemoveQA = (index: number) => {
    const newQAPairs = [...(interviewData.qa_pairs || [])];
    newQAPairs.splice(index, 1);
    setInterviewData({ ...interviewData, qa_pairs: newQAPairs });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>编辑面试复盘</DialogTitle>
        </DialogHeader>

        {/* 投递信息 */}
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg">{job.company}</h3>
              <p className="text-sm text-gray-600">{job.position}</p>
            </div>
            <div className="text-right text-sm text-gray-500">
              <Badge className="mb-1">
                第 {eventType === 'interview' ? job.interviews.length + 1 : ''} 轮
              </Badge>
              <p>{eventDate && formatDate(eventDate, 'long')}</p>
              <p className="text-xs">
                {eventType === 'interview' ? '面试' : '笔试'}
                {eventType === 'interview' && interviewContentType &&
                  ` • ${INTERVIEW_CONTENT_TYPE_CONFIG[interviewContentType]?.label}`
                }
                {eventType === 'written' && writtenTestCategory &&
                  ` • ${WRITTEN_TEST_CATEGORY_CONFIG[writtenTestCategory]?.label}`
                }
              </p>
            </div>
          </div>
        </div>

        {eventType === 'interview' ? (
          /* 面试复盘表单 */
          <Tabs defaultValue="questions" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="questions">📝 结构化问答</TabsTrigger>
              <TabsTrigger value="notes">💭 自由文本</TabsTrigger>
            </TabsList>

            <TabsContent value="questions" className="space-y-4">
              {/* 面试结果 */}
              <div className="space-y-2">
                <Label>面试结果</Label>
                <Select
                  value={interviewData.result || 'pending'}
                  onValueChange={(value: any) => setInterviewData({ ...interviewData, result: value })}
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

              {/* 添加问答 */}
              <div className="border rounded-lg p-4 space-y-3 bg-blue-50/30">
                <Label className="text-sm font-semibold">+ 添加问题</Label>
                <Input
                  placeholder="面试问题"
                  value={qaInput.question}
                  onChange={(e) => setQaInput({ ...qaInput, question: e.target.value })}
                />
                <Textarea
                  placeholder="你的回答（选填）"
                  value={qaInput.answer}
                  onChange={(e) => setQaInput({ ...qaInput, answer: e.target.value })}
                  rows={3}
                />
                <Button onClick={handleAddQA} size="sm" className="w-full">
                  添加问题
                </Button>
              </div>

              {/* 问答列表 */}
              {interviewData.qa_pairs && interviewData.qa_pairs.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">暂无面试问题记录</Label>
                  <p className="text-xs text-gray-500">
                    点击"添加问题"按钮记录你被问到的问题
                  </p>
                </div>
              )}

              {interviewData.qa_pairs && interviewData.qa_pairs.length > 0 && (
                <div className="space-y-3">
                  {interviewData.qa_pairs.map((qa, index) => (
                    <div key={index} className="border rounded-lg p-3 space-y-2 bg-white">
                      <div className="flex items-start justify-between">
                        <p className="font-medium text-sm flex-1">Q: {qa.question}</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveQA(index)}
                          className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                        >
                          ×
                        </Button>
                      </div>
                      {qa.answer && (
                        <p className="text-sm text-gray-600 pl-4">A: {qa.answer}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="notes" className="space-y-4">
              {/* 面试形式、面试官等 */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>面试形式</Label>
                  <Select
                    value={interviewData.type || 'video'}
                    onValueChange={(value: any) => setInterviewData({ ...interviewData, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="video">📹 视频面试</SelectItem>
                      <SelectItem value="phone">📞 电话面试</SelectItem>
                      <SelectItem value="onsite">🏢 现场面试</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>面试官</Label>
                  <Input
                    placeholder="面试官姓名（选填）"
                    value={interviewData.interviewer || ''}
                    onChange={(e) => setInterviewData({ ...interviewData, interviewer: e.target.value })}
                  />
                </div>
              </div>

              {/* 自由备注 */}
              <div className="space-y-2">
                <Label>备注</Label>
                <Textarea
                  placeholder="整体感受、氛围、其他备注..."
                  value={interviewData.notes || ''}
                  onChange={(e) => setInterviewData({ ...interviewData, notes: e.target.value })}
                  rows={6}
                />
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          /* 笔试复盘表单 */
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>笔试形式</Label>
                <Select
                  value={writtenTestData.type || 'online'}
                  onValueChange={(value: any) => setWrittenTestData({ ...writtenTestData, type: value })}
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
                  value={writtenTestData.result || 'pending'}
                  onValueChange={(value: any) => setWrittenTestData({ ...writtenTestData, result: value })}
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

            <div className="space-y-2">
              <Label>笔试平台</Label>
              <Input
                placeholder="如：牛客网、赛码网等（选填）"
                value={writtenTestData.platform || ''}
                onChange={(e) => setWrittenTestData({ ...writtenTestData, platform: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>时长（分钟）</Label>
              <Input
                type="number"
                placeholder="120"
                value={writtenTestData.duration || ''}
                onChange={(e) => setWrittenTestData({ ...writtenTestData, duration: parseInt(e.target.value) })}
              />
            </div>

            <div className="space-y-2">
              <Label>备注</Label>
              <Textarea
                placeholder="题目类型、难度、考察点等..."
                value={writtenTestData.notes || ''}
                onChange={(e) => setWrittenTestData({ ...writtenTestData, notes: e.target.value })}
                rows={6}
              />
            </div>
          </div>
        )}

        {/* 底部按钮 */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={eventType === 'interview' ? handleSaveInterview : handleSaveWrittenTest}>
            保存复盘
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
