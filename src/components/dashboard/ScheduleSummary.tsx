// ============================================================================
// 대시보드 일정 요약 컴포넌트
// ============================================================================

import React from "react";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  User, 
  Tag, 
  AlertCircle,
  ChevronRight 
} from "lucide-react";
import { Card, CardContent } from "@/components/ui";
import { Schedule } from "@/types/schedule";

interface ScheduleSummaryProps {
  title: string;
  schedules: Schedule[];
  loading: boolean;
  emptyMessage: string;
  onViewAll?: () => void;
}

const ScheduleSummary: React.FC<ScheduleSummaryProps> = ({
  title,
  schedules,
  loading,
  emptyMessage,
  onViewAll,
}) => {
  // 카테고리별 색상 및 아이콘
  const categoryInfo = {
    property_viewing: { 
      label: "매물 보기", 
      color: "bg-blue-500", 
      icon: <MapPin className="w-3 h-3" /> 
    },
    contract_signing: { 
      label: "계약 체결", 
      color: "bg-green-500", 
      icon: <Tag className="w-3 h-3" /> 
    },
    maintenance: { 
      label: "유지보수", 
      color: "bg-yellow-500", 
      icon: <AlertCircle className="w-3 h-3" /> 
    },
    client_meeting: { 
      label: "고객 미팅", 
      color: "bg-purple-500", 
      icon: <User className="w-3 h-3" /> 
    },
    team_meeting: { 
      label: "팀 회의", 
      color: "bg-indigo-500", 
      icon: <User className="w-3 h-3" /> 
    },
    personal: { 
      label: "개인 일정", 
      color: "bg-pink-500", 
      icon: <CalendarIcon className="w-3 h-3" /> 
    },
    other: { 
      label: "기타", 
      color: "bg-gray-500", 
      icon: <Tag className="w-3 h-3" /> 
    },
  };

  const formatTime = (dateString: string, allDay: boolean) => {
    const date = new Date(dateString);
    if (allDay) {
      return "종일";
    }
    return date.toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return "오늘";
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "내일";
    } else {
      return date.toLocaleDateString("ko-KR", {
        month: "short",
        day: "numeric",
      });
    }
  };

  const truncateTitle = (title: string, maxLength: number = 25) => {
    return title.length > maxLength ? `${title.slice(0, maxLength)}...` : title;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">{title}</h3>
            {onViewAll && (
              <button className="text-sm text-blue-600 hover:text-blue-800 flex items-center">
                더보기
                <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            )}
          </div>
          
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-3 animate-pulse">
                <div className="w-3 h-3 rounded-full bg-gray-200" />
                <div className="flex-1 space-y-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
                <div className="h-3 bg-gray-200 rounded w-12" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">{title}</h3>
          {onViewAll && (
            <button
              onClick={onViewAll}
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center transition-colors"
            >
              더보기
              <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          )}
        </div>
        
        {schedules.length === 0 ? (
          <div className="text-center py-8">
            <CalendarIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-gray-500 text-sm">{emptyMessage}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {schedules.map((schedule) => {
              const categoryData = categoryInfo[schedule.category];
              
              return (
                <div
                  key={schedule.id}
                  className="flex items-center justify-between p-2 sm:p-3 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-gray-200 group"
                  title={`${schedule.title} - ${categoryData.label}`}
                >
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    {/* 카테고리 색상 표시 */}
                    <div className={`w-3 h-3 rounded-full ${categoryData.color} flex-shrink-0`} />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {truncateTitle(schedule.title)}
                        </h4>
                        {schedule.priority === 'urgent' && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-red-100 text-red-600">
                            긴급
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-1 sm:space-x-2 mt-1">
                        <span className="text-xs text-gray-500">
                          {categoryData.label}
                        </span>
                        {schedule.location && (
                          <>
                            <span className="text-gray-300 hidden sm:inline">•</span>
                            <span className="text-xs text-gray-400 truncate max-w-16 sm:max-w-24">
                              {schedule.location}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* 시간 정보 */}
                  <div className="flex flex-col items-end text-right flex-shrink-0 ml-2 sm:ml-3">
                    <div className="flex items-center text-xs text-gray-600">
                      <Clock className="w-3 h-3 mr-1" />
                      <span className="hidden sm:inline">{formatTime(schedule.start_date, schedule.all_day)}</span>
                      <span className="sm:hidden">{schedule.all_day ? "종일" : formatTime(schedule.start_date, schedule.all_day).slice(0, 5)}</span>
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      {formatDate(schedule.start_date)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export { ScheduleSummary };