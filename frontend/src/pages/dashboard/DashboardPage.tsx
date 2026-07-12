import React, { useState } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Badge } from '../../components/common/Badge';
import { 
  Package, 
  CalendarDays, 
  Wrench, 
  CheckCircle, 
  Plus, 
  TrendingUp, 
  ExternalLink 
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Mock data for the dashboard stats
  const stats = [
    {
      title: 'Total Assets',
      value: '1,248',
      change: '+4.5% from last month',
      isPositive: true,
      icon: <Package className="text-primary" size={24} />,
      bgIcon: 'bg-primary/10',
    },
    {
      title: 'Active Bookings',
      value: '84',
      change: '+12% from last week',
      isPositive: true,
      icon: <CalendarDays className="text-secondary" size={24} />,
      bgIcon: 'bg-secondary/10',
    },
    {
      title: 'Pending Maintenance',
      value: '12',
      change: '-2 since yesterday',
      isPositive: true, // fewer maintenance items is positive
      icon: <Wrench className="text-warning" size={24} />,
      bgIcon: 'bg-warning/10',
    },
    {
      title: 'Audit Score',
      value: '98.2%',
      change: 'Compliant',
      isPositive: true,
      icon: <CheckCircle className="text-success" size={24} />,
      bgIcon: 'bg-success/10',
    },
  ];

  // Mock data for recent activities
  const recentAssets = [
    { id: 'AST-1049', name: 'Dell XPS 15 Laptop', category: 'Hardware', status: 'Allocated', user: 'Jane Cooper' },
    { id: 'AST-1050', name: 'iPad Pro 12.9"', category: 'Hardware', status: 'Available', user: '—' },
    { id: 'AST-1051', name: 'Conference Room B', category: 'Resource', status: 'Reserved', user: 'Marketing Team' },
    { id: 'AST-1052', name: 'Acoustic Sound Pod', category: 'Furniture', status: 'In Repair', user: '—' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Dashboard" 
        subtitle="System summary and resource activity overview."
        breadcrumbs={[
          { label: 'Home', path: '/dashboard' },
          { label: 'Dashboard' }
        ]}
        action={
          <Button 
            variant="primary" 
            size="sm" 
            className="shadow-md shadow-primary/15"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus size={16} className="mr-1" />
            Quick Action
          </Button>
        }
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <Card key={idx} className="hover:translate-y-[-2px] transition-transform duration-200">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <span className="text-xs md:text-sm font-semibold text-base-content/50 uppercase tracking-wider">{stat.title}</span>
                <div className="text-2xl md:text-3xl font-extrabold text-base-content">{stat.value}</div>
              </div>
              <div className={`p-3 rounded-xl ${stat.bgIcon}`}>
                {stat.icon}
              </div>
            </div>
            <div className="flex items-center gap-1.5 mt-4 text-xs font-semibold text-base-content/65">
              <TrendingUp size={14} className="text-success shrink-0" />
              <span>{stat.change}</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Content Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Table list card */}
        <Card 
          title="Recent Resource Allocations" 
          extra={
            <button className="text-xs text-primary font-bold flex items-center hover:underline gap-1">
              View All <ExternalLink size={12} />
            </button>
          }
          className="lg:col-span-2"
        >
          <div className="overflow-x-auto">
            <table className="table w-full text-sm">
              <thead>
                <tr className="border-b border-base-300 text-base-content/50 font-bold">
                  <th>Asset ID</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Assignee</th>
                </tr>
              </thead>
              <tbody>
                {recentAssets.map((asset) => (
                  <tr key={asset.id} className="border-b border-base-300 hover:bg-base-200/30 transition-colors">
                    <td className="font-semibold text-primary">{asset.id}</td>
                    <td className="font-medium">{asset.name}</td>
                    <td className="text-base-content/60">{asset.category}</td>
                    <td>
                      <Badge 
                        variant={
                          asset.status === 'Available' ? 'success' : 
                          asset.status === 'Allocated' ? 'info' : 
                          asset.status === 'Reserved' ? 'primary' : 'warning'
                        }
                        size="sm"
                      >
                        {asset.status}
                      </Badge>
                    </td>
                    <td className="text-base-content/75 font-medium">{asset.user}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Info card */}
        <Card title="Quick Resources">
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-base-200/50 border border-base-300">
              <h4 className="font-bold text-sm text-base-content mb-1">Documentation & Guide</h4>
              <p className="text-xs text-base-content/60 leading-relaxed mb-3">
                Review setup patterns and directory definitions in the documentation to start configuring resources.
              </p>
              <Button variant="outline" size="xs">Read Manual</Button>
            </div>
            
            <div className="p-4 rounded-xl bg-base-200/50 border border-base-300">
              <h4 className="font-bold text-sm text-base-content mb-1">System Health</h4>
              <p className="text-xs text-base-content/60 leading-relaxed mb-2">
                All cloud servers running normally.
              </p>
              <div className="flex items-center gap-1.5 text-xs text-success font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-success animate-ping"></span>
                <span>Active Connection</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Interactive Modal demonstration */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Quick Action Panel"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button variant="primary" size="sm" onClick={() => setIsModalOpen(false)}>Submit Action</Button>
          </>
        }
      >
        <p className="text-sm text-base-content/70 leading-relaxed">
          This modal is a demonstration of the reusable, production-ready dialog component. It binds focus, blocks scroll parameters, handles backdrop blur, and provides responsive buttons.
        </p>
        <div className="mt-4 p-4 rounded-lg bg-base-200 border border-base-300">
          <span className="text-xs font-semibold text-base-content/50 uppercase block mb-1">Environment status</span>
          <span className="text-sm font-bold text-primary font-mono">{import.meta.env.VITE_API_BASE_URL}</span>
        </div>
      </Modal>
    </div>
  );
};
