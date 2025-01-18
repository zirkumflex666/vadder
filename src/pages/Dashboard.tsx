import React from 'react';
import { 
  Users, 
  Briefcase, 
  Calendar as CalendarIcon,
  AlertCircle,
  TrendingUp
} from 'lucide-react';

const Dashboard = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      
      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Aktive Aufträge"
          value="24"
          icon={Briefcase}
          trend="+12%"
        />
        <StatCard
          title="Mitarbeiter im Einsatz"
          value="8"
          icon={Users}
          trend="+2"
        />
        <StatCard
          title="Termine diese Woche"
          value="32"
          icon={CalendarIcon}
          trend="+5"
        />
        <StatCard
          title="Offene Rechnungen"
          value="€12.450"
          icon={AlertCircle}
          trend="-8%"
          trendDirection="down"
        />
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Aktuelle Aktivitäten</h2>
        <div className="space-y-4">
          {/* Activity items would be mapped here */}
          <ActivityItem
            title="Neuer Auftrag eingegangen"
            description="Sanitärinstallation - Familie Müller"
            time="Vor 2 Stunden"
          />
          <ActivityItem
            title="Auftrag abgeschlossen"
            description="Heizungswartung - Firma Schmidt GmbH"
            time="Vor 4 Stunden"
          />
          <ActivityItem
            title="Terminänderung"
            description="Rohrreparatur - Hr. Weber"
            time="Vor 5 Stunden"
          />
        </div>
      </div>
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ElementType;
  trend: string;
  trendDirection?: 'up' | 'down';
}

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  icon: Icon,
  trend,
  trendDirection = 'up'
}) => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900">{value}</p>
        </div>
        <Icon className="h-8 w-8 text-blue-600" />
      </div>
      <div className="mt-4 flex items-center">
        <TrendingUp 
          className={`h-4 w-4 ${
            trendDirection === 'up' ? 'text-green-500' : 'text-red-500'
          }`} 
        />
        <span className={`ml-2 text-sm ${
          trendDirection === 'up' ? 'text-green-500' : 'text-red-500'
        }`}>
          {trend}
        </span>
      </div>
    </div>
  );
};

interface ActivityItemProps {
  title: string;
  description: string;
  time: string;
}

const ActivityItem: React.FC<ActivityItemProps> = ({ title, description, time }) => {
  return (
    <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
      <div className="flex-1">
        <h3 className="text-sm font-medium text-gray-900">{title}</h3>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
      <span className="text-sm text-gray-400">{time}</span>
    </div>
  );
};

export default Dashboard;