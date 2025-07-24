import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchBookings, updateBooking } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Clock, 
  MapPin, 
  User, 
  Phone, 
  Mail,
  Grid3X3,
  Calendar,
  CalendarDays
} from "lucide-react";

type ViewMode = 'month' | 'week' | 'day';

export function AdminCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newAppointment, setNewAppointment] = useState({
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    serviceId: '',
    date: '',
    time: '',
    location: '',
    notes: '',
    totalPrice: '',
    duration: 120
  });
  const queryClient = useQueryClient();

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['/api/bookings'],
    queryFn: fetchBookings,
  });

  const { data: services = [] } = useQuery({
    queryKey: ['/api/services'],
    queryFn: () => fetch('/api/services').then(res => res.json()),
  });

  const { data: clients = [] } = useQuery({
    queryKey: ['/api/clients'],
    queryFn: () => fetch('/api/clients').then(res => res.json()),
  });

  const updateBookingMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => updateBooking(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bookings'] });
      queryClient.invalidateQueries({ queryKey: ['/api/analytics/stats'] });
      setSelectedBooking(null);
    },
  });

  const createBookingMutation = useMutation({
    mutationFn: async (bookingData: any) => {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create appointment');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/bookings'] });
      queryClient.invalidateQueries({ queryKey: ['/api/analytics/stats'] });
      setShowCreateDialog(false);
      resetNewAppointment();
      console.log('✅ Appointment created successfully:', data);
    },
    onError: (error: any) => {
      console.error('❌ Failed to create appointment:', error);
      alert(`Failed to create appointment: ${error.message}`);
    }
  });

  const navigate = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (viewMode === 'month') {
        newDate.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1));
      } else if (viewMode === 'week') {
        newDate.setDate(prev.getDate() + (direction === 'next' ? 7 : -7));
      } else {
        newDate.setDate(prev.getDate() + (direction === 'next' ? 1 : -1));
      }
      return newDate;
    });
  };

  const getMonthDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    const currentDay = new Date(startDate);

    for (let i = 0; i < 42; i++) {
      days.push(new Date(currentDay));
      currentDay.setDate(currentDay.getDate() + 1);
    }

    return days;
  };

  const getWeekDays = () => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());

    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const getBookingsForDate = (date: Date) => {
    if (!bookings || !Array.isArray(bookings)) return [];

    return bookings.filter((booking: any) => {
      if (!booking || !booking.date) return false;
      try {
        const bookingDate = new Date(booking.date);
        // Ensure both dates are valid
        if (isNaN(bookingDate.getTime()) || isNaN(date.getTime())) return false;
        return bookingDate.toDateString() === date.toDateString();
      } catch (error) {
        console.error('Error parsing booking date:', booking.date, error);
        return false;
      }
    });
  };

  const handleStatusChange = (bookingId: number, newStatus: string) => {
    updateBookingMutation.mutate({
      id: bookingId,
      data: { status: newStatus }
    });
  };

  const resetNewAppointment = () => {
    setNewAppointment({
      clientName: '',
      clientEmail: '',
      clientPhone: '',
      serviceId: '',
      date: '',
      time: '',
      location: '',
      notes: '',
      totalPrice: '',
      duration: 120
    });
  };

  const handleCreateAppointment = () => {
    if (!newAppointment.clientName || !newAppointment.clientEmail || !newAppointment.serviceId || 
        !newAppointment.date || !newAppointment.time) {
      alert('Please fill in all required fields');
      return;
    }

    const selectedService = services.find((s: any) => s.id === parseInt(newAppointment.serviceId));
    if (!selectedService) {
      alert('Please select a valid service');
      return;
    }

    // Combine date and time
    const appointmentDateTime = new Date(`${newAppointment.date}T${newAppointment.time}`);

    const bookingData = {
      clientName: newAppointment.clientName,
      clientEmail: newAppointment.clientEmail,
      clientPhone: newAppointment.clientPhone || '',
      serviceId: parseInt(newAppointment.serviceId),
      date: appointmentDateTime.toISOString(),
      location: newAppointment.location || 'TBD',
      totalPrice: newAppointment.totalPrice || selectedService.price,
      notes: newAppointment.notes || '',
      duration: newAppointment.duration,
      status: 'confirmed'
    };

    createBookingMutation.mutate(bookingData);
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    // Pre-fill the date in new appointment form
    const dateStr = date.toISOString().split('T')[0];
    setNewAppointment(prev => ({ ...prev, date: dateStr }));
  };

  const handleQuickCreate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    setNewAppointment(prev => ({ ...prev, date: dateStr, time: '10:00' }));
    setShowCreateDialog(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDateHeader = () => {
    if (viewMode === 'month') {
      return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    } else if (viewMode === 'week') {
      const startOfWeek = new Date(currentDate);
      startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);

      if (startOfWeek.getMonth() === endOfWeek.getMonth()) {
        return `${startOfWeek.toLocaleDateString('en-US', { month: 'long' })} ${startOfWeek.getDate()}-${endOfWeek.getDate()}, ${startOfWeek.getFullYear()}`;
      } else {
        return `${startOfWeek.toLocaleDateString('en-US', { month: 'short' })} ${startOfWeek.getDate()} - ${endOfWeek.toLocaleDateString('en-US', { month: 'short' })} ${endOfWeek.getDate()}, ${startOfWeek.getFullYear()}`;
      }
    } else {
      return currentDate.toLocaleDateString('en-US', { 
        weekday: 'long', 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric' 
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Calendar</h2>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-muted rounded w-1/3"></div>
              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: 35 }).map((_, i) => (
                  <div key={i} className="h-20 bg-muted rounded"></div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const renderMonthView = () => {
    const days = getMonthDays();
    const today = new Date();

    return (
      <div className="grid grid-cols-7 gap-1">
        {/* Day headers */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="p-2 text-center font-semibold text-sm text-muted-foreground">
            {day}
          </div>
        ))}

        {/* Calendar days */}
        {days.map((day, index) => {
          const dayBookings = getBookingsForDate(day);
          const isCurrentMonth = day.getMonth() === currentDate.getMonth();
          const isToday = day.toDateString() === today.toDateString();

          return (
            <div
              key={index}
              className={`min-h-[100px] p-1 border border-border cursor-pointer hover:bg-muted/50 transition-colors ${
                !isCurrentMonth ? 'text-muted-foreground bg-muted/20' : 'bg-background'
              } ${isToday ? 'bg-blue-50 dark:bg-blue-950' : ''}`}
              onClick={() => handleDateClick(day)}
            >
              <div className={`text-sm mb-1 ${isToday ? 'font-bold text-blue-600' : ''}`}>
                {day.getDate()}
              </div>
              <div className="space-y-1">
                {dayBookings.slice(0, 2).map((booking: any) => (
                  <div
                    key={booking.id}
                    className={`text-xs p-1 rounded border cursor-pointer hover:opacity-80 transition-opacity ${getStatusColor(booking.status)}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedBooking(booking);
                    }}
                    title={`${booking.client?.name || 'Unknown Client'} - ${booking.service?.name || 'Service'}`}
                  >
                    <div className="font-medium truncate">
                      {formatTime(booking.date)}
                    </div>
                    <div className="truncate">
                      {booking.client?.name || 'Unknown Client'}
                    </div>
                  </div>
                ))}
                {dayBookings.length > 2 && (
                  <div 
                    className="text-xs text-muted-foreground cursor-pointer hover:text-foreground"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedDate(day);
                    }}
                  >
                    +{dayBookings.length - 2} more
                  </div>
                )}
                {dayBookings.length === 0 && isCurrentMonth && (
                  <div 
                    className="text-xs text-blue-600 hover:text-blue-800 cursor-pointer flex items-center mt-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleQuickCreate(day);
                    }}
                    title="Add appointment"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderWeekView = () => {
    const days = getWeekDays();
    const hours = Array.from({ length: 24 }, (_, i) => i);

    return (
      <div className="flex flex-col">
        {/* Week header */}
        <div className="grid grid-cols-8 border-b">
          <div className="p-2"></div>
          {days.map((day, index) => {
            const dayBookings = getBookingsForDate(day);
            const isToday = day.toDateString() === new Date().toDateString();

            return (
              <div key={index} className={`p-2 text-center border-l ${isToday ? 'bg-blue-50 dark:bg-blue-950' : ''}`}>
                <div className="text-sm text-muted-foreground">
                  {day.toLocaleDateString('en-US', { weekday: 'short' })}
                </div>
                <div className={`text-lg font-semibold ${isToday ? 'text-blue-600' : ''}`}>
                  {day.getDate()}
                </div>
              </div>
            );
          })}
        </div>

        {/* Time slots */}
        <div className="flex-1 grid grid-cols-8 max-h-[500px] overflow-y-auto">
          {/* Time labels */}
          <div className="border-r">
            {[9, 10, 11, 12, 13, 14, 15, 16, 17, 18].map(hour => (
              <div key={hour} className="h-16 border-b p-2 text-sm text-muted-foreground">
                {hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
              </div>
            ))}
          </div>

          {/* Day columns */}
          {days.map((day, dayIndex) => {
            const dayBookings = getBookingsForDate(day);

            return (
              <div key={dayIndex} className="border-l">
                {[9, 10, 11, 12, 13, 14, 15, 16, 17, 18].map(hour => (
                  <div key={hour} className="h-16 border-b p-1">
                    {dayBookings.map((booking: any) => {
                      try {
                        const bookingDate = new Date(booking.date);
                        const bookingHour = bookingDate.getHours();
                        if (bookingHour === hour) {
                          return (
                            <div
                              key={booking.id}
                              className={`text-xs p-1 rounded cursor-pointer hover:opacity-80 transition-opacity ${getStatusColor(booking.status)}`}
                              onClick={() => setSelectedBooking(booking)}
                              title={`${booking.client?.name || 'Unknown'} - ${booking.service?.name || 'Service'}`}
                            >
                              <div className="font-medium">
                                {booking.client?.name || 'Unknown'}
                              </div>
                              <div className="text-muted-foreground">
                                {booking.service?.name || 'Service'}
                              </div>
                            </div>
                          );
                        }
                      } catch (error) {
                        console.error('Error processing booking in week view:', booking, error);
                      }
                      return null;
                    })}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderDayView = () => {
    const dayBookings = getBookingsForDate(currentDate);
    const hours = [9, 10, 11, 12, 13, 14, 15, 16, 17, 18];

    return (
      <div className="space-y-4">
        {/* Day overview */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {currentDate.toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'long', 
                day: 'numeric' 
              })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              {dayBookings.length} bookings scheduled
            </div>
          </CardContent>
        </Card>

        {/* Time slots */}
        <Card>
          <CardContent className="p-0">
            {hours.map(hour => (
              <div key={hour} className="flex border-b">
                <div className="w-20 p-4 border-r text-sm text-muted-foreground">
                  {hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
                </div>
                <div className="flex-1 p-4">
                  {dayBookings.map((booking: any) => {
                    try {
                      const bookingDate = new Date(booking.date);
                      const bookingHour = bookingDate.getHours();
                      if (bookingHour === hour) {
                        return (
                          <div
                            key={booking.id}
                            className={`p-3 rounded-lg border cursor-pointer hover:opacity-90 transition-opacity ${getStatusColor(booking.status)}`}
                            onClick={() => setSelectedBooking(booking)}
                          >
                            <div className="font-medium">{booking.client?.name || 'Unknown Client'}</div>
                            <div className="text-sm">{booking.service?.name || 'Service'}</div>
                            <div className="text-xs text-muted-foreground">
                              {formatTime(booking.date)} • {booking.duration || 2} hours
                            </div>
                            {booking.location && (
                              <div className="text-xs text-muted-foreground flex items-center mt-1">
                                <MapPin className="h-3 w-3 mr-1" />
                                {booking.location}
                              </div>
                            )}
                          </div>
                        );
                      }
                    } catch (error) {
                      console.error('Error processing booking in day view:', booking, error);
                    }
                    return null;
                  })}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold">Calendar</h2>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('prev')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('next')}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <h3 className="text-lg font-semibold">{formatDateHeader()}</h3>
        </div>

        <div className="flex items-center space-x-2">
          {/* Create Appointment Button */}
          <Button
            onClick={() => setShowCreateDialog(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Appointment
          </Button>

          {/* View Toggle */}
          <div className="flex border rounded-lg">
            <Button
              variant={viewMode === 'month' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('month')}
              className="rounded-r-none"
            >
              <Grid3X3 className="h-4 w-4 mr-1" />
              Month
            </Button>
            <Button
              variant={viewMode === 'week' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('week')}
              className="rounded-none"
            >
              <CalendarDays className="h-4 w-4 mr-1" />
              Week
            </Button>
            <Button
              variant={viewMode === 'day' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('day')}
              className="rounded-l-none"
            >
              <Calendar className="h-4 w-4 mr-1" />
              Day
            </Button>
          </div>

          <Button
            onClick={() => {
              setCurrentDate(new Date());
              console.log('Calendar Debug - Current bookings:', bookings);
            }}
            variant="outline"
            size="sm"
          >
            Today
          </Button>

          {/* Debug info - remove in production */}
          {process.env.NODE_ENV === 'development' && bookings && (
            <div className="text-xs text-muted-foreground">
              {bookings.length} bookings loaded
            </div>
          )}
        </div>
      </div>

      {/* Status Legend */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-muted-foreground">Appointment Status Legend:</h4>
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded border bg-green-100 border-green-200"></div>
                <span className="text-sm text-green-800">Confirmed</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded border bg-yellow-100 border-yellow-200"></div>
                <span className="text-sm text-yellow-800">Pending</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded border bg-blue-100 border-blue-200"></div>
                <span className="text-sm text-blue-800">Completed</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded border bg-red-100 border-red-200"></div>
                <span className="text-sm text-red-800">Cancelled</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calendar Content */}
      <Card>
        <CardContent className="p-6">
          {viewMode === 'month' && renderMonthView()}
          {viewMode === 'week' && renderWeekView()}
          {viewMode === 'day' && renderDayView()}
        </CardContent>
      </Card>

      {/* Create Appointment Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Appointment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="clientName">Client Name *</Label>
                <Input
                  id="clientName"
                  value={newAppointment.clientName}
                  onChange={(e) => setNewAppointment(prev => ({ ...prev, clientName: e.target.value }))}
                  placeholder="Enter client name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clientEmail">Client Email *</Label>
                <Input
                  id="clientEmail"
                  type="email"
                  value={newAppointment.clientEmail}
                  onChange={(e) => setNewAppointment(prev => ({ ...prev, clientEmail: e.target.value }))}
                  placeholder="client@example.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="clientPhone">Client Phone</Label>
                <Input
                  id="clientPhone"
                  value={newAppointment.clientPhone}
                  onChange={(e) => setNewAppointment(prev => ({ ...prev, clientPhone: e.target.value }))}
                  placeholder="(808) 555-0123"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="serviceSelect">Service *</Label>
                <Select
                  value={newAppointment.serviceId}
                  onValueChange={(value) => {
                    const service = services.find((s: any) => s.id === parseInt(value));
                    setNewAppointment(prev => ({ 
                      ...prev, 
                      serviceId: value,
                      totalPrice: service?.price || '',
                      duration: service?.duration || 120
                    }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a service" />
                  </SelectTrigger>
                  <SelectContent>
                    {services.map((service: any) => (
                      <SelectItem key={service.id} value={service.id.toString()}>
                        {service.name} - ${service.price}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="appointmentDate">Date *</Label>
                <Input
                  id="appointmentDate"
                  type="date"
                  value={newAppointment.date}
                  onChange={(e) => setNewAppointment(prev => ({ ...prev, date: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="appointmentTime">Time *</Label>
                <Input
                  id="appointmentTime"
                  type="time"
                  value={newAppointment.time}
                  onChange={(e) => setNewAppointment(prev => ({ ...prev, time: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={newAppointment.location}
                  onChange={(e) => setNewAppointment(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="Honolulu, Hawaii"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="totalPrice">Total Price</Label>
                <Input
                  id="totalPrice"
                  value={newAppointment.totalPrice}
                  onChange={(e) => setNewAppointment(prev => ({ ...prev, totalPrice: e.target.value }))}
                  placeholder="Service price will auto-fill"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={newAppointment.notes}
                onChange={(e) => setNewAppointment(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Any special requests or notes..."
                rows={3}
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowCreateDialog(false);
                  resetNewAppointment();
                }}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleCreateAppointment}
                disabled={createBookingMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {createBookingMutation.isPending ? 'Creating...' : 'Create Appointment'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Selected Date Dialog */}
      <Dialog open={!!selectedDate} onOpenChange={() => setSelectedDate(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              Bookings for {selectedDate?.toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'long', 
                day: 'numeric',
                year: 'numeric'
              })}
            </DialogTitle>
          </DialogHeader>
          {selectedDate && (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {getBookingsForDate(selectedDate).length > 0 ? (
                getBookingsForDate(selectedDate).map((booking: any) => (
                  <div
                    key={booking.id}
                    className={`p-3 rounded-lg border cursor-pointer hover:opacity-80 transition-opacity ${getStatusColor(booking.status)}`}
                    onClick={() => {
                      setSelectedDate(null);
                      setSelectedBooking(booking);
                    }}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium">{booking.client?.name || 'Unknown Client'}</div>
                        <div className="text-sm text-muted-foreground">{booking.service?.name || 'Service'}</div>
                        <div className="text-xs text-muted-foreground">
                          {formatTime(booking.date)} • {booking.duration || 2} hours
                        </div>
                      </div>
                      <Badge variant="outline" className={getStatusColor(booking.status)}>
                        {booking.status}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No bookings scheduled for this date</p>
                  <Button
                    onClick={() => {
                      setSelectedDate(null);
                      handleQuickCreate(selectedDate);
                    }}
                    variant="outline"
                    className="mt-4"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Appointment
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Booking Details Dialog */}
      <Dialog open={!!selectedBooking} onOpenChange={() => setSelectedBooking(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <User className="h-4 w-4 mr-2" />
                    {selectedBooking.client?.name || 'Unknown Client'}
                  </div>
                  <div className="flex items-center text-sm">
                    <Mail className="h-4 w-4 mr-2" />
                    {selectedBooking.client?.email || 'No email'}
                  </div>
                  <div className="flex items-center text-sm">
                    <Phone className="h-4 w-4 mr-2" />
                    {selectedBooking.client?.phone || 'No phone'}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    {selectedBooking.date ? new Date(selectedBooking.date).toLocaleDateString() : 'No date'}
                  </div>
                  <div className="flex items-center text-sm">
                    <Clock className="h-4 w-4 mr-2" />
                    {selectedBooking.date ? formatTime(selectedBooking.date) : 'No time'}
                  </div>
                  <div className="flex items-center text-sm">
                    <MapPin className="h-4 w-4 mr-2" />
                    {selectedBooking.location || 'Location TBD'}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Service</h4>
                <p className="text-sm">{selectedBooking.service?.name || 'Service details unavailable'}</p>
                <p className="text-xs text-muted-foreground">
                  {selectedBooking.service?.description || 'No description available'}
                </p>
                {selectedBooking.totalPrice && (
                  <p className="text-sm font-medium mt-2">
                    Total: ${selectedBooking.totalPrice}
                  </p>
                )}
              </div>

              <div>
                <h4 className="font-medium mb-2">Status</h4>
                <Select
                  value={selectedBooking.status}
                  onValueChange={(value) => handleStatusChange(selectedBooking.id, value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {selectedBooking.notes && (
                <div>
                  <h4 className="font-medium mb-2">Notes</h4>
                  <p className="text-sm text-muted-foreground">{selectedBooking.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}