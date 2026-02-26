import { AnalyticsDashboard } from '../components/Analytics/AnalyticsDashboard';
import { AnalyticsHeader } from '../components/Analytics/AnalyticsHeader';

export const AnalyticsPage = () => {
  return (
    <div style={{ 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      background: '#F5F1E8',
      overflow: 'hidden',
    }}>
      <AnalyticsHeader />
      <div style={{ 
        flex: 1, 
        overflow: 'auto',
        background: '#F5F1E8',
      }}>
        <AnalyticsDashboard />
      </div>
    </div>
  );
};
