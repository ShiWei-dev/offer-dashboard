'use client';

import Link from 'next/link';
import { StatsCards } from '@/components/dashboard/stats-cards';
import { FunnelChart } from '@/components/dashboard/funnel-chart';
import { UpcomingInterviews } from '@/components/dashboard/upcoming-interviews';
import { Button } from '@/components/ui/button';
import { PlusIcon, LayoutDashboardIcon, MailIcon, CalendarIcon } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* 头部 */}
      <header className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                JobTracker
              </h1>
              <p className="text-gray-600 mt-1">求职投递管理系统</p>
            </div>

            {/* 导航按钮 */}
            <div className="flex gap-4">
              <Link href="/board">
                <div className="flex items-center gap-2 px-5 py-3 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all cursor-pointer">
                  <LayoutDashboardIcon className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-gray-900">看板视图</span>
                </div>
              </Link>

              <Link href="/interviews">
                <div className="flex items-center gap-2 px-5 py-3 rounded-lg border border-gray-200 hover:border-purple-500 hover:bg-purple-50 transition-all cursor-pointer">
                  <CalendarIcon className="w-5 h-5 text-purple-600" />
                  <span className="font-medium text-gray-900">面试记录</span>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* 主内容 */}
      <main className="container mx-auto px-6 py-8 space-y-8">
        {/* 欢迎区域 */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white shadow-xl">
          <h2 className="text-2xl font-bold mb-2">欢迎回来！</h2>
          <p className="text-blue-100 mb-6">开始追踪你的求职进展，让找工作更有条理</p>
          <div className="flex gap-3">
            <Link href="/board">
              <Button className="bg-white text-blue-600 hover:bg-blue-50">
                <PlusIcon className="w-4 h-4 mr-2" />
                添加投递
              </Button>
            </Link>
            <Link href="/board">
              <Button variant="secondary" className="bg-white/20 text-white border border-white/30 hover:bg-white/30">
                <MailIcon className="w-4 h-4 mr-2" />
                导入邮件
              </Button>
            </Link>
          </div>
        </div>

        {/* 统计卡片 */}
        <StatsCards />

        {/* 详细数据 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <FunnelChart />
          <UpcomingInterviews />
        </div>

        {/* 快速操作提示 */}
        <div className="bg-white rounded-lg p-6 border shadow-sm">
          <h3 className="font-semibold text-lg mb-4">快速开始</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/board" className="p-4 border rounded-lg hover:shadow-md transition-all hover:border-blue-500">
              <div className="text-2xl mb-2">📝</div>
              <h4 className="font-semibold mb-1">添加投递</h4>
              <p className="text-sm text-gray-600">手动添加或编辑投递记录</p>
            </Link>
            <Link href="/board" className="p-4 border rounded-lg hover:shadow-md transition-all hover:border-purple-500">
              <div className="text-2xl mb-2">📧</div>
              <h4 className="font-semibold mb-1">导入邮件</h4>
              <p className="text-sm text-gray-600">从投递确认邮件自动创建记录</p>
            </Link>
            <Link href="/board" className="p-4 border rounded-lg hover:shadow-md transition-all hover:border-green-500">
              <div className="text-2xl mb-2">📊</div>
              <h4 className="font-semibold mb-1">查看看板</h4>
              <p className="text-sm text-gray-600">拖拽式管理投递状态</p>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
