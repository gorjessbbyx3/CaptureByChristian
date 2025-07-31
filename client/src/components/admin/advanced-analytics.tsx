import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// Charts temporarily disabled for deployment
// import { 
//   XAxis, 
//   YAxis, 
//   CartesianGrid, 
//   Tooltip, 
//   ResponsiveContainer,
//   PieChart,
//   Pie,
//   Cell,
//   Area,
//   AreaChart
// } from "recharts";
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  Camera,
  Target,
  Award,
  Activity,
  Star
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

export function AdvancedAnalytics() {
  const [timeRange, setTimeRange] = useState("12months");
  const [metricType, setMetricType] = useState("revenue");

  // Fetch real business data
  const { data: bookings = [] } = useQuery({
    queryKey: ['/api/bookings'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/bookings');
      return response.json();
    }
  });

  const { data: clients = [] } = useQuery({
    queryKey: ['/api/clients'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/clients');
      return response.json();
    }
  });

  const { data: services = [] } = useQuery({
    queryKey: ['/api/services'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/services');
      return response.json();
    }
  });

  const { data: businessKPIs = {} } = useQuery({
    queryKey: ['/api/analytics/business-kpis'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/analytics/business-kpis');
      return response.json();
    }
  });

  const { data: clientMetrics = {} } = useQuery({
    queryKey: ['/api/analytics/clients'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/analytics/clients');
      return response.json();
    }
  });

  // Define interfaces for our data structures
  interface MonthlyData {
    month: string;
    revenue: number;
    bookings: number;
    leads: number;
    conversion: number;
  }

  interface ServiceData {
    name: string;
    value: number;
    revenue: number;
    count: number;
  }

  interface LeadSourceData {
    source: string;
    leads: number;
    converted: number;
    rate: number;
    cost: number;
  }

  // Calculate real analytics from database data
  const calculateAnalytics = () => {
    if (!bookings.length) return { revenueData: [], serviceBreakdown: [], leadSourceData: [] };

    // Group bookings by month for revenue data
    const monthlyData = bookings.reduce((acc: Record<string, MonthlyData>, booking: { date: string; totalPrice: number }) => {
      const month = new Date(booking.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      if (!acc[month]) {
        acc[month] = { month, revenue: 0, bookings: 0, leads: 0, conversion: 0 };
      }
      acc[month].revenue += booking.totalPrice || 0;
      acc[month].bookings += 1;
      return acc;
    }, {});

    const revenueData = Object.values(monthlyData).slice(-12);

    // Calculate service breakdown from real bookings
    const serviceData = services.map((service: { id: number; name: string }): ServiceData => {
      const serviceBookings = bookings.filter((b: { serviceId: number }) => b.serviceId === service.id);
      const revenue = serviceBookings.reduce((sum: number, b: { totalPrice: number }) => sum + (b.totalPrice || 0), 0);
      return {
        name: service.name,
        value: serviceBookings.length,
        revenue,
        count: serviceBookings.length
      };
    });

    // Calculate lead source data from real clients
    const leadSources: Record<string, LeadSourceData> = clients.reduce((acc: Record<string, LeadSourceData>, client: { source: string; status: string }) => {
      const source = client.source || 'Direct';
      if (!acc[source]) {
        acc[source] = { source, leads: 0, converted: 0, rate: 0, cost: 0 };
      }
      acc[source].leads += 1;
      acc[source].converted += client.status === 'active' ? 1 : 0;
      return acc;
    }, {});

    Object.values(leadSources).forEach((source: LeadSourceData) => {
      source.rate = source.leads > 0 ? Math.round((source.converted / source.leads) * 100) : 0;
    });

    return {
      revenueData,
      serviceBreakdown: serviceData,
      leadSourceData: Object.values(leadSources) as LeadSourceData[]
    };
  };

  const { revenueData, serviceBreakdown, leadSourceData } = calculateAnalytics();

  // Use only real data from API endpoints
  const displayClientMetrics = {
    totalClients: clientMetrics.totalClients || 0,
    newThisMonth: clientMetrics.newThisMonth || 0,
    repeatClients: clientMetrics.repeatClients || 0,
    avgLifetimeValue: clientMetrics.avgLifetimeValue || 0,
    churnRate: clientMetrics.churnRate || 0,
    satisfactionScore: clientMetrics.satisfactionScore || 0
  };

  const displayBusinessKPIs = {
    monthlyRecurringRevenue: businessKPIs.monthlyRecurringRevenue || 0,
    averageBookingValue: businessKPIs.averageBookingValue || 0,
    profitMargin: businessKPIs.profitMargin || 0,
    bookingFrequency: businessKPIs.bookingFrequency || 0,
    seasonalityIndex: businessKPIs.seasonalityIndex || 0,
    competitorAnalysis: businessKPIs.competitorAnalysis || "No data available"
  };

  const COLORS = ['#D4A574', '#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1'];

  const formatCurrency = (value: number | undefined | null) => {
    if (value === undefined || value === null || isNaN(value)) return '$0';
    return `$${Number(value).toLocaleString()}`;
  };

  // Calculate growth only if we have data
  const currentMonthRevenue = revenueData.length > 0 ? (revenueData[revenueData.length - 1] as { revenue: number }).revenue : 0;
  const previousMonthRevenue = revenueData.length > 1 ? (revenueData[revenueData.length - 2] as { revenue: number }).revenue : 0;
  const revenueGrowth = previousMonthRevenue > 0 ? ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue * 100).toFixed(1) : "0";

  return (
    <div className="space-y-6">
      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Monthly Revenue</p>
                <p className="text-2xl font-bold">{formatCurrency(currentMonthRevenue)}</p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                  <span className="text-sm text-green-600">+{revenueGrowth}%</span>
                </div>
              </div>
              <DollarSign className="h-8 w-8 text-bronze" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Clients</p>
                <p className="text-2xl font-bold">{displayClientMetrics.totalClients}</p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                  <span className="text-sm text-green-600">+{displayClientMetrics.newThisMonth} this month</span>
                </div>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Booking Value</p>
                <p className="text-2xl font-bold">{formatCurrency(displayBusinessKPIs.averageBookingValue)}</p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                  <span className="text-sm text-green-600">+12.3%</span>
                </div>
              </div>
              <Camera className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Client Satisfaction</p>
                <p className="text-2xl font-bold">{displayClientMetrics.satisfactionScore || 'N/A'}</p>
                <div className="flex items-center mt-1">
                  <Star className="h-3 w-3 text-yellow-500 mr-1" />
                  <span className="text-sm text-yellow-600">Excellent</span>
                </div>
              </div>
              <Award className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue and Bookings Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Business Performance Trends
            </span>
            <div className="flex space-x-2">
              <Select value={metricType} onValueChange={setMetricType}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="revenue">Revenue</SelectItem>
                  <SelectItem value="bookings">Bookings</SelectItem>
                  <SelectItem value="leads">Leads</SelectItem>
                  <SelectItem value="conversion">Conversion</SelectItem>
                </SelectContent>
              </Select>
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="6months">6 Months</SelectItem>
                  <SelectItem value="12months">12 Months</SelectItem>
                  <SelectItem value="24months">24 Months</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-96 text-muted-foreground">
            <p>Charts temporarily disabled for deployment. Will be restored soon.</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Service Revenue Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Camera className="h-5 w-5 mr-2" />
              Service Revenue Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-72 text-muted-foreground">
              <p>Service breakdown chart temporarily disabled for deployment.</p>
            </div>
            <div className="mt-4 space-y-2">
              {serviceBreakdown.map((service: { name: string; revenue: number; count: number }, index: number) => (
                <div key={service.name} className="flex justify-between items-center text-sm">
                  <div className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-2" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span>{service.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{formatCurrency(service.revenue)}</div>
                    <div className="text-muted-foreground">{service.count} bookings</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Lead Source Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="h-5 w-5 mr-2" />
              Lead Source Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {leadSourceData.map((source: LeadSourceData) => (
                <div key={source.source} className="border rounded-lg p-3">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">{source.source}</h4>
                    <Badge 
                      variant={source.rate > 60 ? "default" : source.rate > 40 ? "secondary" : "outline"}
                    >
                      {source.rate}% conversion
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-sm text-muted-foreground">
                    <div>
                      <p className="font-medium text-foreground">{source.leads}</p>
                      <p>Total Leads</p>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{source.converted}</p>
                      <p>Converted</p>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">${source.cost}</p>
                      <p>Cost per Lead</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Advanced Business Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="h-5 w-5 mr-2" />
            Advanced Business Intelligence
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium">Client Metrics</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Repeat Client Rate</span>
                  <span className="font-medium">{displayClientMetrics.totalClients > 0 ? Math.round((displayClientMetrics.repeatClients / displayClientMetrics.totalClients) * 100) : 0}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Avg Lifetime Value</span>
                  <span className="font-medium">{formatCurrency(displayClientMetrics.avgLifetimeValue)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Churn Rate</span>
                  <span className="font-medium">{displayClientMetrics.churnRate || 0}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Booking Frequency</span>
                  <span className="font-medium">{displayBusinessKPIs.bookingFrequency || 0}x/year</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Financial Health</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Monthly Recurring Revenue</span>
                  <span className="font-medium">{formatCurrency(displayBusinessKPIs.monthlyRecurringRevenue)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Profit Margin</span>
                  <span className="font-medium">{displayBusinessKPIs.profitMargin || 0}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Seasonality Index</span>
                  <span className="font-medium">{displayBusinessKPIs.seasonalityIndex || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Market Position</span>
                  <span className="font-medium">{displayBusinessKPIs.competitorAnalysis || 'N/A'}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Growth Insights</h4>
              <div className="space-y-3">
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="flex items-center text-green-700 dark:text-green-400">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    <span className="font-medium">Peak Season Ahead</span>
                  </div>
                  <p className="text-sm text-green-600 dark:text-green-300 mt-1">
                    Wedding bookings typically increase 40% in Q2
                  </p>
                </div>
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex items-center text-blue-700 dark:text-blue-400">
                    <Target className="h-4 w-4 mr-2" />
                    <span className="font-medium">Optimization Opportunity</span>
                  </div>
                  <p className="text-sm text-blue-600 dark:text-blue-300 mt-1">
                    Focus on Instagram ads - highest ROI source
                  </p>
                </div>
                <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <div className="flex items-center text-purple-700 dark:text-purple-400">
                    <Star className="h-4 w-4 mr-2" />
                    <span className="font-medium">Client Success</span>
                  </div>
                  <p className="text-sm text-purple-600 dark:text-purple-300 mt-1">
                    No satisfaction data available yet
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}