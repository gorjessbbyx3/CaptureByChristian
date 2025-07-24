import React from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchAnalytics, fetchBookings, fetchClients } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, DollarSign, Camera, TrendingUp, Clock, AlertCircle, Sparkles, Zap, Star, Target } from "lucide-react";
import { RevenueChart } from "./revenue-chart";

export function AdminDashboard() {
  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['/api/analytics/stats'],
    queryFn: fetchAnalytics,
  });

  const { data: bookings, isLoading: bookingsLoading } = useQuery({
    queryKey: ['/api/bookings'],
    queryFn: fetchBookings,
  });

  const { data: clients } = useQuery({
    queryKey: ['/api/clients'],
    queryFn: fetchClients,
  });

  if (analyticsLoading || bookingsLoading) {
    return (
      <div className="space-y-6">
        <h1 className="font-playfair text-3xl font-bold">Dashboard</h1>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
                  <div className="h-8 bg-muted rounded w-3/4"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Calculate real metrics from booking data
  const totalRevenue = bookings?.reduce((sum: number, booking: any) => 
    booking.status === 'confirmed' || booking.status === 'completed' 
      ? sum + parseFloat(booking.totalPrice) 
      : sum, 0) || 0;

  const totalBookings = bookings?.length || 0;
  const pendingBookings = bookings?.filter((b: any) => b.status === 'pending').length || 0;
  const confirmedBookings = bookings?.filter((b: any) => b.status === 'confirmed').length || 0;
  const completedBookings = bookings?.filter((b: any) => b.status === 'completed').length || 0;

  // Calculate real growth rates (would need historical data for accurate calculations)
  const bookingGrowth = totalBookings > 0 ? Math.round((confirmedBookings / totalBookings) * 100) : 0;
  const revenueGrowth = totalRevenue > 0 ? Math.round((completedBookings / totalBookings) * 100) : 0;

  const stats = [
    {
      title: "Total Bookings",
      value: totalBookings,
      icon: Calendar,
      gradient: "from-blue-500 to-cyan-500",
      change: totalBookings > 0 ? `${bookingGrowth}% confirmed` : "No data",
      changeType: "positive" as const,
    },
    {
      title: "Pending Review", 
      value: pendingBookings,
      icon: Clock,
      gradient: "from-amber-500 to-orange-500",
      change: totalBookings > 0 ? `${Math.round((pendingBookings / totalBookings) * 100)}% pending` : "No data",
      changeType: "neutral" as const,
    },
    {
      title: "Total Revenue",
      value: `$${totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      gradient: "from-emerald-500 to-green-500",
      change: totalRevenue > 0 ? `${revenueGrowth}% completed` : "No data",
      changeType: "positive" as const,
    },
    {
      title: "Active Projects",
      value: confirmedBookings,
      icon: Camera,
      gradient: "from-purple-500 to-pink-500",
      change: totalBookings > 0 ? `${Math.round((confirmedBookings / totalBookings) * 100)}% active` : "No data",
      changeType: "positive" as const,
    },
  ];

  const recentBookings = bookings?.slice(0, 5) || [];

  const getUpcomingBookings = () => {
    if (!bookings) return [];
    const today = new Date();
    return bookings
      .filter((booking: any) => new Date(booking.date) > today && booking.status !== 'cancelled')
      .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 3);
  };

  const getPendingActions = () => {
    if (!bookings) return [];
    return bookings.filter((booking: any) => booking.status === 'pending');
  };

  const upcomingBookings = getUpcomingBookings();
  const pendingActions = getPendingActions();

  return (
    <div className="space-y-8">
      {/* Enhanced Header with Gradient */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-purple-600 to-bronze text-white p-8">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-6 lg:mb-0">
              <h1 className="font-playfair text-4xl lg:text-5xl font-bold mb-2">
                Business Dashboard
              </h1>
              <p className="text-white/80 text-lg font-medium">
                Your photography business at a glance
              </p>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                <div className="text-2xl lg:text-3xl font-bold">{clients?.length || 0}</div>
                <div className="text-white/80 text-sm font-medium">Active Clients</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                <div className="text-2xl lg:text-3xl font-bold">${(totalRevenue / 1000).toFixed(0)}K</div>
                <div className="text-white/80 text-sm font-medium">Revenue</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                <div className="text-2xl lg:text-3xl font-bold">{analytics?.totalBookings || 0}</div>
                <div className="text-white/80 text-sm font-medium">Total Shoots</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                <div className="text-2xl lg:text-3xl font-bold">N/A</div>
                <div className="text-white/80 text-sm font-medium">Satisfaction</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Stats Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.gradient} shadow-lg`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <div className={`flex items-center text-sm font-medium ${
                  stat.changeType === 'positive' ? 'text-emerald-600' : 
                  stat.changeType === 'negative' ? 'text-red-600' : 'text-amber-600'
                }`}>
                  <TrendingUp className="h-4 w-4 mr-1" />
                  {stat.change}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">{stat.title}</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  {stat.value}
                </p>
              </div>
              <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.gradient}`}></div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Revenue Analytics */}
      <RevenueChart />

      {/* Enhanced Activity & Alerts Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-lg overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
            <CardTitle className="flex items-center text-lg">
              <div className="p-2 bg-blue-100 rounded-lg mr-3">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              Upcoming Sessions
              <Badge variant="secondary" className="ml-auto bg-blue-100 text-blue-700">
                {upcomingBookings.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-1">
              {upcomingBookings.length > 0 ? (
                upcomingBookings.map((booking: any, index: number) => (
                  <div key={booking.id} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors border-b last:border-b-0">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center">
                        <Camera className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{booking.client?.name}</p>
                        <p className="text-sm text-gray-600">{booking.service?.name}</p>
                        <p className="text-xs text-gray-500 flex items-center mt-1">
                          <Target className="h-3 w-3 mr-1" />
                          {booking.location}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={`mb-2 ${
                        booking.status === 'confirmed' 
                          ? 'bg-emerald-100 text-emerald-700 border-emerald-200' 
                          : 'bg-amber-100 text-amber-700 border-amber-200'
                      }`}>
                        {booking.status}
                      </Badge>
                      <p className="text-sm font-semibold text-gray-900">
                        {new Date(booking.date).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(booking.date).toLocaleTimeString('en-US', { 
                          hour: 'numeric', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-medium">No upcoming sessions</p>
                  <p className="text-sm text-gray-400 mt-1">Your schedule is clear!</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 border-b">
            <CardTitle className="flex items-center text-lg">
              <div className="p-2 bg-amber-100 rounded-lg mr-3">
                <AlertCircle className="h-5 w-5 text-amber-600" />
              </div>
              Action Required
              <Badge 
                variant={pendingActions.length > 0 ? "destructive" : "secondary"} 
                className="ml-auto"
              >
                {pendingActions.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-1">
              {pendingActions.length > 0 ? (
                pendingActions.slice(0, 4).map((booking: any) => (
                  <div key={booking.id} className="flex items-center justify-between p-4 hover:bg-amber-50 transition-colors border-b last:border-b-0">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-amber-100 to-orange-100 rounded-lg flex items-center justify-center">
                        <Zap className="h-5 w-5 text-amber-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{booking.client?.name}</p>
                        <p className="text-sm text-gray-600">{booking.service?.name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className="bg-amber-100 text-amber-700 border-amber-200 mb-2">
                        Pending Review
                      </Badge>
                      <p className="text-sm font-semibold text-gray-900">
                        ${parseFloat(booking.totalPrice).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Star className="h-8 w-8 text-emerald-500" />
                  </div>
                  <p className="text-emerald-600 font-semibold">All caught up! 🎉</p>
                  <p className="text-sm text-gray-500 mt-1">No pending actions</p>
                </div>
              )}
            </div>
            {pendingActions.length > 0 && (
              <div className="p-4 bg-gray-50 border-t">
                <Button variant="outline" className="w-full hover:bg-amber-50 border-amber-200 text-amber-700">
                  Review All Pending Bookings
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}