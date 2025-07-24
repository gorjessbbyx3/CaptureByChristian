import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createBooking, fetchServices } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { CalendarDays, MapPin, Clock, DollarSign } from "lucide-react";

const bookingSchema = z.object({
  serviceId: z.string().min(1, "Please select a service"),
  date: z.string().min(1, "Please select a date"),
  time: z.string().min(1, "Please select a time"),
  location: z.string().min(1, "Please specify a location"),
  clientName: z.string().min(2, "Name must be at least 2 characters"),
  clientEmail: z.string().email("Please enter a valid email"),
  clientPhone: z.string().optional(),
  notes: z.string().optional(),
  addOns: z.array(z.string()).optional(),
});

type BookingFormData = z.infer<typeof bookingSchema>;

// Add-ons will be dynamically loaded from selected service

const timeSlots = [
  "6:00 AM - Morning",
  "9:00 AM - Mid-Morning", 
  "12:00 PM - Noon",
  "3:00 PM - Afternoon",
  "6:00 PM - Golden Hour",
  "7:00 PM - Sunset",
];

export function BookingForm() {
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: services, isLoading: servicesLoading } = useQuery({
    queryKey: ['/api/services'],
    queryFn: fetchServices,
  });

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      serviceId: "",
      date: "",
      time: "",
      location: "",
      clientName: "",
      clientEmail: "",
      clientPhone: "",
      notes: "",
      addOns: [],
    },
  });

  const createBookingMutation = useMutation({
    mutationFn: createBooking,
    onSuccess: () => {
      toast({
        title: "Booking Created",
        description: "Your booking has been successfully created. We'll contact you soon!",
      });
      form.reset();
      queryClient.invalidateQueries({ queryKey: ['/api/bookings'] });
    },
    onError: () => {
      toast({
        title: "Booking Failed",
        description: "There was an error creating your booking. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: BookingFormData) => {
    const selectedService = services?.find((s: any) => s.id.toString() === data.serviceId);
    if (!selectedService) return;

    const serviceAddOns = selectedService.addOns || [];
    const selectedAddOnDetails = serviceAddOns.filter((addon: any) => selectedAddOns.includes(addon.id));
    const totalAddOnPrice = selectedAddOnDetails.reduce((sum: number, addon: any) => sum + addon.price, 0);
    const totalPrice = parseFloat(selectedService.price) + totalAddOnPrice;

    // Parse time safely from format like "6:00 AM - Morning"
    let timeString = data.time;
    if (timeString.includes(" - ")) {
      timeString = timeString.split(" - ")[0].trim();
    }
    
    // Convert 12-hour to 24-hour format
    const time24 = timeString.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (time24) {
      let hours = parseInt(time24[1]);
      const minutes = time24[2];
      const period = time24[3].toUpperCase();
      
      if (period === 'PM' && hours !== 12) hours += 12;
      if (period === 'AM' && hours === 12) hours = 0;
      
      timeString = `${hours.toString().padStart(2, '0')}:${minutes}`;
    }
    
    // Create date object with error handling
    let bookingDate;
    try {
      const dateTimeString = data.date + "T" + timeString + ":00";
      console.log("Creating date from:", dateTimeString);
      bookingDate = new Date(dateTimeString);
      
      if (isNaN(bookingDate.getTime())) {
        throw new Error("Invalid date created");
      }
    } catch (error) {
      console.error("Date parsing error:", error);
      console.log("Original data:", { date: data.date, time: data.time, timeString });
      toast({
        title: "Invalid Date/Time",
        description: "Please check your date and time selection.",
        variant: "destructive",
      });
      return;
    }

    const bookingData = {
      serviceId: parseInt(data.serviceId),
      date: bookingDate.toISOString(),
      duration: selectedService.duration,
      location: data.location,
      totalPrice: totalPrice.toString(),
      notes: data.notes || null,
      addOns: selectedAddOnDetails,
      clientName: data.clientName,
      clientEmail: data.clientEmail,
      clientPhone: data.clientPhone || null,
      status: "pending",
    };

    createBookingMutation.mutate(bookingData);
  };

  const handleAddOnChange = (addOnId: string, checked: boolean) => {
    if (checked) {
      setSelectedAddOns([...selectedAddOns, addOnId]);
    } else {
      setSelectedAddOns(selectedAddOns.filter(id => id !== addOnId));
    }
  };

  const calculateTotal = () => {
    const selectedService = services?.find((s: any) => s.id.toString() === form.watch("serviceId"));
    if (!selectedService) return 0;
    
    const serviceAddOns = selectedService.addOns || [];
    const selectedAddOnDetails = serviceAddOns.filter((addon: any) => selectedAddOns.includes(addon.id));
    const totalAddOnPrice = selectedAddOnDetails.reduce((sum: number, addon: any) => sum + addon.price, 0);
    return parseFloat(selectedService.price) + totalAddOnPrice;
  };

  const getAvailableAddOns = () => {
    const selectedService = services?.find((s: any) => s.id.toString() === form.watch("serviceId"));
    return selectedService?.addOns || [];
  };

  if (servicesLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p>Loading booking form...</p>
      </div>
    );
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="font-playfair text-2xl flex items-center">
          <CalendarDays className="h-6 w-6 mr-2 text-bronze" />
          Book Your Session
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Service Selection */}
            <FormField
              control={form.control}
              name="serviceId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Service</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a photography service" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {services?.map((service: any) => (
                        <SelectItem key={service.id} value={service.id.toString()}>
                          {service.name} - ${parseInt(service.price).toLocaleString()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Date and Time */}
            <div className="grid md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preferred Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preferred Time</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select time" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {timeSlots.map((slot) => (
                          <SelectItem key={slot} value={slot}>
                            {slot}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Location */}
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    Location
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Waikiki Beach, Oahu" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Add-ons */}
            <div className="space-y-3">
              <FormLabel>Add-ons</FormLabel>
              {getAvailableAddOns().map((addOn: any) => (
                <div key={addOn.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={addOn.id}
                    checked={selectedAddOns.includes(addOn.id)}
                    onCheckedChange={(checked) => handleAddOnChange(addOn.id, !!checked)}
                  />
                  <label htmlFor={addOn.id} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    {addOn.name} (+${addOn.price})
                  </label>
                </div>
              ))}
            </div>

            {/* Client Information */}
            <div className="grid md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="clientName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="clientEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="your@email.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="clientPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="+1 (808) 555-0123" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tell me about your vision</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe your photography needs, style preferences, or any special requests..."
                      rows={4}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Total Price */}
            <div className="bg-muted p-4 rounded-lg">
              <div className="flex items-center justify-between text-lg font-bold">
                <span className="flex items-center">
                  <DollarSign className="h-5 w-5 mr-1" />
                  Total Estimated Cost:
                </span>
                <span className="text-bronze">${calculateTotal().toLocaleString()}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                * Final pricing may vary based on specific requirements. Deposit required to secure booking.
              </p>
            </div>

            <Button 
              type="submit" 
              className="w-full btn-bronze text-lg py-6"
              disabled={createBookingMutation.isPending}
            >
              {createBookingMutation.isPending ? "Creating Booking..." : "Book Session - Deposit Required"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
