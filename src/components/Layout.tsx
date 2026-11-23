import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { useAppState } from '../context/AppContext';
import { OverviewDashboard } from './pages/OverviewDashboard';
import { MineMap } from './pages/MineMap';
import { SensorMonitoring } from './pages/SensorMonitoring';
import { ThermalPrediction } from './pages/ThermalPrediction';
import { VentilationManagement } from './pages/VentilationManagement';
import { AlertsPage } from './pages/AlertsPage';
import { WorkerSafety } from './pages/WorkerSafety';
import { AnalyticsReports } from './pages/AnalyticsReports';
import { SystemSettings } from './pages/SystemSettings';
import { ArchitecturePage } from './pages/ArchitecturePage';
import { DemoScenarios } from './DemoScenarios';

export function Layout() {
  const { state } = useAppState();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const renderPage = () => {
    switch (state.activeSection) {
      case 'overview': return <OverviewDashboard />;
      case 'map': return <MineMap />;
      case 'sensors': return <SensorMonitoring />;
      case 'thermal': return <ThermalPrediction />;
      case 'ventilation': return <VentilationManagement />;
      case 'alerts': return <AlertsPage />;
      case 'workers': return <WorkerSafety />;
      case 'analytics': return <AnalyticsReports />;
      case 'settings': return <SystemSettings />;
      case 'architecture': return <ArchitecturePage />;
      default: return <OverviewDashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-mine-bg overflow-hidden">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(c => !c)} />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopBar />
        <DemoScenarios />
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4">
          <div className="fade-in" key={state.activeSection}>
            {renderPage()}
          </div>
        </main>
      </div>
    </div>
  );
}
