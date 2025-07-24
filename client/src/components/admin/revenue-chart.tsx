import React from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchBookings } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, DollarSign } from "lucide-react";

export function RevenueChart() {
  const { data: bookings, isLoading } = useQuery({
    queryKey: ['/api/bookings'],
    queryFn: fetchBookings,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Revenue Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-32 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getMonthlyRevenue = () => {
    if (!bookings) return [];

    const monthlyData: Record<string, number> = {};
    
    bookings.forEach((booking: any) => {
      const date = new Date(booking.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = 0;
      }
      
      if (booking.status === 'confirmed' || booking.status === 'completed') {
        monthlyData[monthKey] += parseFloat(booking.totalPrice);
      }
    });

    return Object.entries(monthlyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, revenue]) => ({
        month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        revenue
      }));
  };

  const getServiceBreakdown = () => {
    if (!bookings) return [];

    const serviceData: Record<string, { revenue: number; count: number }> = {};
    
    bookings.forEach((booking: any) => {
      if (booking.status === 'confirmed' || booking.status === 'completed') {
        const serviceName = booking.service?.name || 'Unknown';
        if (!serviceData[serviceName]) {
          serviceData[serviceName] = { revenue: 0, count: 0 };
        }
        serviceData[serviceName].revenue += parseFloat(booking.totalPrice);
        serviceData[serviceName].count += 1;
      }
    });

    return Object.entries(serviceData)
      .sort(([, a], [, b]) => b.revenue - a.revenue)
      .map(([service, data]) => ({
        service,
        ...data
      }));
  };

  const monthlyRevenue = getMonthlyRevenue();
  const serviceBreakdown = getServiceBreakdown();
  const totalRevenue = serviceBreakdown.reduce((sum, item) => sum + item.revenue, 0);

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Monthly Revenue
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Revenue</span>
              <span className="text-2xl font-bold text-bronze">${totalRevenue.toLocaleString()}</span>
            </div>
            
            <div className="space-y-3">
              {monthlyRevenue.map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{item.month}</span>
                    <span className="font-medium">${item.revenue.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-bronze h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${totalRevenue > 0 ? (item.revenue / totalRevenue) * 100 : 0}%` 
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <DollarSign className="h-5 w-5 mr-2" />
            Service Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {serviceBreakdown.map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{item.service}</p>
                    <p className="text-sm text-muted-foreground">{item.count} bookings</p>
                  </div>
                  <span className="font-bold">${item.revenue.toLocaleString()}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-bronze to-yellow-600 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${totalRevenue > 0 ? (item.revenue / totalRevenue) * 100 : 0}%` 
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}