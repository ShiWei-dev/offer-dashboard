'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { FilterIcon, SearchIcon, XIcon } from 'lucide-react';
import { JobStatus, Priority } from '@/lib/types';
import { STATUS_CONFIG, PRIORITY_CONFIG } from '@/lib/constants';

interface SearchFilterProps {
  onSearchChange: (search: string) => void;
  onStatusFilter: (statuses: JobStatus[]) => void;
  onPriorityFilter: (priorities: Priority[]) => void;
  onClearFilters: () => void;
}

export function SearchFilter({
  onSearchChange,
  onStatusFilter,
  onPriorityFilter,
  onClearFilters,
}: SearchFilterProps) {
  const [search, setSearch] = useState('');
  const [selectedStatuses, setSelectedStatuses] = useState<JobStatus[]>([]);
  const [selectedPriorities, setSelectedPriorities] = useState<Priority[]>([]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    onSearchChange(value);
  };

  const handleStatusToggle = (status: JobStatus) => {
    const newStatuses = selectedStatuses.includes(status)
      ? selectedStatuses.filter((s) => s !== status)
      : [...selectedStatuses, status];

    setSelectedStatuses(newStatuses);
    onStatusFilter(newStatuses);
  };

  const handlePriorityToggle = (priority: Priority) => {
    const newPriorities = selectedPriorities.includes(priority)
      ? selectedPriorities.filter((p) => p !== priority)
      : [...selectedPriorities, priority];

    setSelectedPriorities(newPriorities);
    onPriorityFilter(newPriorities);
  };

  const handleClear = () => {
    setSearch('');
    setSelectedStatuses([]);
    setSelectedPriorities([]);
    onClearFilters();
  };

  const hasFilters = search || selectedStatuses.length > 0 || selectedPriorities.length > 0;

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        {/* 搜索框 */}
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="搜索公司、职位或地点..."
            className="pl-10"
          />
        </div>

        {/* 状态筛选 */}
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="outline" className="gap-2" />}>
            <FilterIcon className="w-4 h-4" />
            状态
            {selectedStatuses.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-xs bg-secondary rounded-full">
                {selectedStatuses.length}
              </span>
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {Object.values(STATUS_CONFIG).map((config) => (
              <DropdownMenuCheckboxItem
                key={config.value}
                checked={selectedStatuses.includes(config.value)}
                onCheckedChange={() => handleStatusToggle(config.value)}
              >
                {config.icon} {config.label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* 优先级筛选 */}
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="outline" className="gap-2" />}>
            <FilterIcon className="w-4 h-4" />
            优先级
            {selectedPriorities.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-xs bg-secondary rounded-full">
                {selectedPriorities.length}
              </span>
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {(Object.keys(PRIORITY_CONFIG) as Priority[]).map((priority) => (
              <DropdownMenuCheckboxItem
                key={priority}
                checked={selectedPriorities.includes(priority)}
                onCheckedChange={() => handlePriorityToggle(priority)}
              >
                {PRIORITY_CONFIG[priority].icon} {PRIORITY_CONFIG[priority].label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* 清除筛选 */}
        {hasFilters && (
          <Button variant="ghost" onClick={handleClear} className="gap-2">
            <XIcon className="w-4 h-4" />
            清除
          </Button>
        )}
      </div>

      {/* 当前筛选标签 */}
      {hasFilters && (
        <div className="flex flex-wrap gap-2">
          {search && (
            <Badge variant="secondary" className="gap-1">
              搜索: {search}
              <button
                onClick={() => handleSearchChange('')}
                className="ml-1 hover:text-red-600"
              >
                ×
              </button>
            </Badge>
          )}
          {selectedStatuses.map((status) => (
            <Badge key={status} variant="secondary" className="gap-1">
              {STATUS_CONFIG[status].icon} {STATUS_CONFIG[status].label}
              <button
                onClick={() => handleStatusToggle(status)}
                className="ml-1 hover:text-red-600"
              >
                ×
              </button>
            </Badge>
          ))}
          {selectedPriorities.map((priority) => (
            <Badge key={priority} variant="secondary" className="gap-1">
              {PRIORITY_CONFIG[priority].icon} {PRIORITY_CONFIG[priority].label}
              <button
                onClick={() => handlePriorityToggle(priority)}
                className="ml-1 hover:text-red-600"
              >
                ×
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
