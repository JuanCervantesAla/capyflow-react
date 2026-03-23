import { Text, Stack, Group, Box } from '@mantine/core';
import { 
  IconSparkles, 
  IconClock, 
  IconActivity, 
  IconTrendingUp,
  IconTarget,
  IconRobot,
  IconBrain,
  IconChartBar
} from '@tabler/icons-react';
import { useAnalyticsSummary } from '../../hooks/useAnalytics';
import { 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ResponsiveContainer 
} from 'recharts';

export const AnalyticsDashboard = () => {
  const { data: summary, isLoading, error } = useAnalyticsSummary();

  if (isLoading) {
    return (
      <Stack align="center" justify="center" style={{ height: '400px' }}>
        <Text c="#6B6B6B" size="14px" fw={500} style={{ letterSpacing: '0.5px' }}>
          LOADING ANALYTICS...
        </Text>
      </Stack>
    );
  }

  if (error) {
    return (
      <Stack align="center" justify="center" style={{ height: '400px' }}>
        <Text c="#C9873D" size="14px" fw={700} style={{ letterSpacing: '0.5px' }}>
          FAILED TO LOAD ANALYTICS
        </Text>
        <Text c="#6B6B6B" size="12px">
          {error instanceof Error ? error.message : 'Unknown error'}
        </Text>
      </Stack>
    );
  }

  if (!summary) return null;

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  // Data for charts
  const comparisonData = [
    {
      name: 'AI Generated',
      'Creation Time': Math.round(summary.avgCreationTimeAI / 60), // in minutes
      'Complexity': summary.avgComplexityAI,
      'Count': summary.aiGeneratedFlows,
    },
    {
      name: 'Manual',
      'Creation Time': Math.round(summary.avgCreationTimeManual / 60),
      'Complexity': summary.avgComplexityManual,
      'Count': summary.manualFlows,
    },
  ];

  const pieData = [
    { name: 'AI Generated', value: summary.aiGeneratedFlows, color: '#C9873D' },
    { name: 'Manual', value: summary.manualFlows, color: '#5A4A3A' },
  ];

  const successData = [
    { name: 'Success', value: summary.successfulExecutions, color: '#2E7D32' },
    { name: 'Failed', value: summary.totalExecutions - summary.successfulExecutions, color: '#D32F2F' },
  ];

  // Components
  const MetricCard = ({ icon: Icon, label, value, subtitle, color = "#C9873D", trend }: any) => (
    <Box
      style={{
        background: '#FFF8F0',
        border: '3px solid #0A0A08',
        padding: '14px',
        height: '100%',
        transition: 'all 0.2s',
      }}
      onMouseEnter={(e: any) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '4px 4px 0 #0A0A08';
      }}
      onMouseLeave={(e: any) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <Stack gap={8} h="100%">
        <Group justify="space-between">
          <Group gap={6}>
            <Icon size={16} color={color} stroke={2.5} />
            <Text 
              size="9px" 
              c="#5A4A3A" 
              fw={700} 
              style={{ letterSpacing: '1px', textTransform: 'uppercase' }}
            >
              {label}
            </Text>
          </Group>
          {trend && (
            <Text size="10px" c={trend > 0 ? '#2E7D32' : '#D32F2F'} fw={700}>
              {trend > 0 ? '↗' : '↘'}{Math.abs(trend)}%
            </Text>
          )}
        </Group>
        <Text 
          fw={900} 
          c="#0A0A08"
          className="analytics-value"
          style={{ lineHeight: 1, fontFamily: 'system-ui, sans-serif' }}
        >
          {value}
        </Text>
        {subtitle && (
          <Text size="10px" c="#7A7060" fw={500} mt="auto">
            {subtitle}
          </Text>
        )}
      </Stack>
    </Box>
  );

  const ChartCard = ({ title, children, icon: Icon }: any) => (
    <Box
      style={{
        background: '#FFF8F0',
        border: '3px solid #0A0A08',
        padding: '16px',
        height: '100%',
      }}
    >
      <Stack gap={12} h="100%">
        <Group gap={6}>
          {Icon && <Icon size={16} color="#C9873D" stroke={2.5} />}
          <Text 
            size="10px" 
            c="#5A4A3A" 
            fw={700} 
            style={{ letterSpacing: '1px', textTransform: 'uppercase' }}
          >
            {title}
          </Text>
        </Group>
        {children}
      </Stack>
    </Box>
  );

  return (
    <Box p={20}>
      <style>{`
        .analytics-grid {
          display: grid;
          grid-template-columns: repeat(12, 1fr);
          gap: 12px;
        }
        .analytics-grid .col-3 { grid-column: span 3; }
        .analytics-grid .col-4 { grid-column: span 4; }
        .analytics-grid .col-6 { grid-column: span 6; }
        .analytics-grid .col-8 { grid-column: span 8; }
        .analytics-grid .chart-tall { height: 240px; }
        .analytics-grid .chart-medium { height: 220px; }
        .analytics-title { font-size: 24px; }
        .analytics-value { font-size: 28px; }

        /* Tablet: 768px - 1024px */
        @media (max-width: 1024px) {
          .analytics-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
          }
          .analytics-grid .col-3,
          .analytics-grid .col-4,
          .analytics-grid .col-6,
          .analytics-grid .col-8 {
            grid-column: span 1;
          }
          .analytics-grid .chart-tall,
          .analytics-grid .chart-medium {
            height: 260px;
          }
          .analytics-grid .chart-wide {
            grid-column: span 2;
          }
          .analytics-grid .thesis-card {
            grid-column: span 2;
            height: auto !important;
            min-height: 220px;
          }
        }

        /* Mobile: < 640px */
        @media (max-width: 640px) {
          .analytics-grid {
            grid-template-columns: 1fr;
            gap: 10px;
          }
          .analytics-grid .col-3,
          .analytics-grid .col-4,
          .analytics-grid .col-6,
          .analytics-grid .col-8,
          .analytics-grid .chart-wide,
          .analytics-grid .thesis-card {
            grid-column: span 1;
          }
          .analytics-grid .chart-tall,
          .analytics-grid .chart-medium {
            height: 240px;
          }
          .analytics-title { font-size: 20px; }
          .analytics-value { font-size: 24px; }
        }
      `}</style>

      <Stack gap={16}>
        {/* Header */}
        <Box mb={4}>
          <Text 
            fw={900} 
            c="#0A0A08"
            className="analytics-title"
            style={{
              letterSpacing: '0.5px',
              fontFamily: 'system-ui, sans-serif',
              marginBottom: 2,
            }}
          >
            WORKFLOW ANALYTICS
          </Text>
          <Text size="12px" c="#5A4A3A" fw={500}>
            Performance metrics · Thesis validation · AI Impact
          </Text>
        </Box>

        {/* Bento Grid Layout */}
        <div className="analytics-grid">
          {/* Row 1 - Key Metrics */}
          <div className="col-3">
            <MetricCard
              icon={IconSparkles}
              label="Total Workflows"
              value={summary.totalFlows}
              subtitle={`${summary.aiGeneratedFlows} AI · ${summary.manualFlows} Manual`}
              color="#C9873D"
              trend={12.5}
            />
          </div>

          <div className="col-3">
            <MetricCard
              icon={IconClock}
              label="Time Saved"
              value={`${summary.timeSavedPercentage.toFixed(1)}%`}
              subtitle="AI vs Manual creation"
              color="#2E7D32"
              trend={summary.timeSavedPercentage - 50}
            />
          </div>

          <div className="col-3">
            <MetricCard
              icon={IconRobot}
              label="AI Interactions"
              value={summary.totalAIInteractions}
              subtitle={`${summary.successfulAIInteractions} successful`}
              color="#3B82F6"
            />
          </div>

          <div className="col-3">
            <MetricCard
              icon={IconActivity}
              label="Success Rate"
              value={`${summary.successRate.toFixed(1)}%`}
              subtitle={`${summary.successfulExecutions}/${summary.totalExecutions} executions`}
              color={summary.successRate >= 75 ? '#2E7D32' : '#B05000'}
              trend={summary.successRate >= 75 ? 4.5 : -2.3}
            />
          </div>

          {/* Row 2 - Charts */}
          <div className="col-8 chart-tall chart-wide">
            <ChartCard title="Creation Time & Complexity Comparison" icon={IconChartBar}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparisonData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E0DDD4" />
                  <XAxis 
                    dataKey="name" 
                    stroke="#5A4A3A" 
                    style={{ fontSize: '10px', fontWeight: 600 }}
                  />
                  <YAxis 
                    stroke="#5A4A3A" 
                    style={{ fontSize: '9px' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      background: '#FFF8F0', 
                      border: '2px solid #0A0A08',
                      borderRadius: 0,
                      fontSize: '10px'
                    }}
                  />
                  <Legend 
                    wrapperStyle={{ fontSize: '10px', fontWeight: 600 }}
                  />
                  <Bar dataKey="Creation Time" fill="#C9873D" stroke="#0A0A08" strokeWidth={2} />
                  <Bar dataKey="Complexity" fill="#5A4A3A" stroke="#0A0A08" strokeWidth={2} />
                  <Bar dataKey="Count" fill="#3B82F6" stroke="#0A0A08" strokeWidth={2} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          <div className="col-4 chart-tall">
            <ChartCard title="Workflow Distribution" icon={IconSparkles}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={65}
                    paddingAngle={4}
                    dataKey="value"
                    stroke="#0A0A08"
                    strokeWidth={3}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      background: '#FFF8F0', 
                      border: '2px solid #0A0A08',
                      borderRadius: 0,
                      fontSize: '10px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <Stack gap={4} mt={-30}>
                {pieData.map((item) => (
                  <Group key={item.name} gap={6}>
                    <Box style={{ width: 10, height: 10, background: item.color, border: '2px solid #0A0A08' }} />
                    <Text size="10px" c="#5A4A3A" fw={600}>{item.name}: {item.value}</Text>
                  </Group>
                ))}
              </Stack>
            </ChartCard>
          </div>

          {/* Row 3 - Execution Stats & Thesis Validation */}
          <div className="col-4 chart-medium">
            <ChartCard title="Execution Success Rate" icon={IconActivity}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={successData}
                    cx="50%"
                    cy="50%"
                    innerRadius={35}
                    outerRadius={60}
                    paddingAngle={4}
                    dataKey="value"
                    stroke="#0A0A08"
                    strokeWidth={3}
                  >
                    {successData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      background: '#FFF8F0', 
                      border: '2px solid #0A0A08',
                      borderRadius: 0,
                      fontSize: '10px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <Stack gap={4} mt={-30}>
                {successData.map((item) => (
                  <Group key={item.name} gap={6}>
                    <Box style={{ width: 10, height: 10, background: item.color, border: '2px solid #0A0A08' }} />
                    <Text size="10px" c="#5A4A3A" fw={600}>{item.name}: {item.value}</Text>
                  </Group>
                ))}
              </Stack>
            </ChartCard>
          </div>

          <div className="col-8 chart-medium thesis-card">
            <Box
              style={{
                background: '#FFF8F0',
                border: '3px solid #0A0A08',
                padding: '16px',
                height: '100%',
              }}
            >
              <Stack gap={12} h="100%">
                <Group gap={6}>
                  <IconTarget size={16} color="#C9873D" stroke={2.5} />
                  <Text 
                    size="10px" 
                    c="#5A4A3A" 
                    fw={700} 
                    style={{ letterSpacing: '1px', textTransform: 'uppercase' }}
                  >
                    Thesis Validation Metrics
                  </Text>
                </Group>

                {/* Progress Bar 1 */}
                <Stack gap={4}>
                  <Group justify="space-between" wrap="wrap" gap={4}>
                    <Text size="10px" c="#5A4A3A" fw={600}>TIME REDUCTION TARGET</Text>
                    <Group gap={6}>
                      <Text size="11px" c={summary.timeSavedPercentage >= 60 ? '#2E7D32' : '#C9873D'} fw={700}>
                        {summary.timeSavedPercentage.toFixed(1)}%
                      </Text>
                      <Box
                        style={{
                          padding: '2px 8px',
                          background: summary.timeSavedPercentage >= 60 ? '#E8F5E9' : '#FFF3E0',
                          border: `2px solid ${summary.timeSavedPercentage >= 60 ? '#2E7D32' : '#C9873D'}`,
                          fontSize: '9px',
                          fontWeight: 700,
                          color: summary.timeSavedPercentage >= 60 ? '#2E7D32' : '#B05000',
                        }}
                      >
                        {summary.timeSavedPercentage >= 60 ? '✓ MET' : 'TRACKING'}
                      </Box>
                    </Group>
                  </Group>
                  <Box style={{ position: 'relative', height: 10, background: '#E5E5E5', border: '2px solid #0A0A08' }}>
                    <Box
                      style={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        height: '100%',
                        width: `${Math.min((summary.timeSavedPercentage / 60) * 100, 100)}%`,
                        background: summary.timeSavedPercentage >= 60 ? '#2E7D32' : '#C9873D',
                      }}
                    />
                  </Box>
                  <Text size="9px" c="#7A7060">Target: 60% | Current: {summary.timeSavedPercentage.toFixed(1)}%</Text>
                </Stack>

                {/* Progress Bar 2 */}
                <Stack gap={4}>
                  <Group justify="space-between" wrap="wrap" gap={4}>
                    <Text size="10px" c="#5A4A3A" fw={600}>PRECISION TARGET</Text>
                    <Group gap={6}>
                      <Text size="11px" c={summary.successRate >= 75 ? '#2E7D32' : '#3B82F6'} fw={700}>
                        {summary.successRate.toFixed(1)}%
                      </Text>
                      <Box
                        style={{
                          padding: '2px 8px',
                          background: summary.successRate >= 75 ? '#E8F5E9' : '#E3F2FD',
                          border: `2px solid ${summary.successRate >= 75 ? '#2E7D32' : '#3B82F6'}`,
                          fontSize: '9px',
                          fontWeight: 700,
                          color: summary.successRate >= 75 ? '#2E7D32' : '#1976D2',
                        }}
                      >
                        {summary.successRate >= 75 ? '✓ MET' : 'TRACKING'}
                      </Box>
                    </Group>
                  </Group>
                  <Box style={{ position: 'relative', height: 10, background: '#E5E5E5', border: '2px solid #0A0A08' }}>
                    <Box
                      style={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        height: '100%',
                        width: `${Math.min((summary.successRate / 75) * 100, 100)}%`,
                        background: summary.successRate >= 75 ? '#2E7D32' : '#3B82F6',
                      }}
                    />
                  </Box>
                  <Text size="9px" c="#7A7060">Target: 75% | Current: {summary.successRate.toFixed(1)}%</Text>
                </Stack>

                {/* Validation Badge */}
                {summary.timeSavedPercentage >= 60 && summary.successRate >= 75 && (
                  <Box
                    style={{
                      padding: '12px',
                      background: '#E8F5E9',
                      border: '3px solid #2E7D32',
                      marginTop: 'auto',
                    }}
                  >
                    <Text size="12px" fw={900} c="#2E7D32" style={{ letterSpacing: '0.5px' }}>
                      ✓ THESIS VALIDATED
                    </Text>
                    <Text size="10px" c="#5A4A3A" mt={2}>
                      AI reduces time ≥60% with precision ≥75%
                    </Text>
                  </Box>
                )}
              </Stack>
            </Box>
          </div>

          {/* Row 4 - Performance Highlights */}
          <div className="col-6">
            <Box
              style={{
                background: '#C9873D',
                border: '3px solid #0A0A08',
                padding: '16px',
              }}
            >
              <Stack gap={8}>
                <Group gap={6}>
                  <IconBrain size={16} color="#FFF8F0" stroke={2.5} />
                  <Text 
                    size="10px" 
                    c="#FFF8F0" 
                    fw={700} 
                    style={{ letterSpacing: '1px', textTransform: 'uppercase' }}
                  >
                    AI Performance
                  </Text>
                </Group>
                <Text fw={900} c="#FFF8F0" className="analytics-value" style={{ lineHeight: 1 }}>
                  {formatTime(Math.round(summary.avgCreationTimeAI))}
                </Text>
                <Text size="11px" c="#FFF8F0" fw={500}>
                  Avg time · Complexity {summary.avgComplexityAI.toFixed(1)}
                </Text>
              </Stack>
            </Box>
          </div>

          <div className="col-6">
            <Box
              style={{
                background: '#5A4A3A',
                border: '3px solid #0A0A08',
                padding: '16px',
              }}
            >
              <Stack gap={8}>
                <Group gap={6}>
                  <IconTrendingUp size={16} color="#FFF8F0" stroke={2.5} />
                  <Text 
                    size="10px" 
                    c="#FFF8F0" 
                    fw={700} 
                    style={{ letterSpacing: '1px', textTransform: 'uppercase' }}
                  >
                    Efficiency Gain
                  </Text>
                </Group>
                <Text fw={900} c="#FFF8F0" className="analytics-value" style={{ lineHeight: 1 }}>
                  {summary.avgCreationTimeManual > 0 && summary.avgCreationTimeAI > 0
                    ? ((summary.avgCreationTimeManual - summary.avgCreationTimeAI) / summary.avgCreationTimeManual * 100).toFixed(1)
                    : '0'}%
                </Text>
                <Text size="11px" c="#FFF8F0" fw={500}>
                  Faster with AI · {formatTime(Math.round(summary.avgCreationTimeManual))} manual
                </Text>
              </Stack>
            </Box>
          </div>
        </div>
      </Stack>
    </Box>
  );
};
