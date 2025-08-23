import { useState } from "react";
import type { ReactNode } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Mail, Send, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().optional(),
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
  priority: z.enum(["normal", "high", "urgent"]),
});

type ContactFormData = z.infer<typeof contactSchema>;

interface ContactFormProps {
  trigger?: ReactNode;
}

export function ContactForm({ trigger }: ContactFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
      priority: "normal",
    },
  });

  const submitContactMutation = useMutation({
    mutationFn: async (data: ContactFormData) => {
      // First, get AI categorization for the contact
      let aiCategory = "general_inquiry";
      let suggestedResponse = "";

      try {
        const aiResponse = await apiRequest(
          "POST",
          "/api/ai/categorize-contact",
          {
            subject: data.subject,
            message: data.message,
          },
        );

        const aiData = await aiResponse.json();
        aiCategory = aiData.category || "general_inquiry";
        suggestedResponse = aiData.suggestedResponse || "";
      } catch (error) {
        console.log("AI categorization failed, using default");
      }

      const response = await apiRequest("POST", "/api/contact", {
        ...data,
        source: "website",
        ipAddress: "127.0.0.1", // Will be set by server
        userAgent: navigator.userAgent,
        aiCategory,
        suggestedResponse,
      });

      return response.json();
    },
    onSuccess: () => {
      setIsSubmitted(true);
      toast({
        title: "Message sent successfully!",
        description: "We'll get back to you within 24 hours.",
      });
      form.reset();
      setTimeout(() => {
        setIsOpen(false);
        setIsSubmitted(false);
      }, 3000);
    },
    onError: () => {
      toast({
        title: "Failed to send message",
        description: "Please try again or call us directly.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ContactFormData) => {
    submitContactMutation.mutate(data);
  };

  const defaultTrigger = (
    <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
      <Mail className="mr-2 h-5 w-5" />
      Contact Us
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Get In Touch</DialogTitle>
          <DialogDescription>
            Ready to capture your special moments? Send us a message and we'll
            respond within 24 hours.
          </DialogDescription>
        </DialogHeader>

        {isSubmitted ? (
          <div className="text-center py-8">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Message Sent!</h3>
            <p className="text-muted-foreground">
              Thank you for reaching out. We'll get back to you soon!
            </p>
          </div>
        ) : (
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  {...form.register("name")}
                  placeholder="Your full name"
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  {...form.register("email")}
                  placeholder="your@email.com"
                />
                {form.formState.errors.email && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.email.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  {...form.register("phone")}
                  placeholder="(808) 555-0123"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={form.watch("priority")}
                  onValueChange={(value) =>
                    form.setValue(
                      "priority",
                      value as "normal" | "high" | "urgent",
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Subject *</Label>
              <Input
                id="subject"
                {...form.register("subject")}
                placeholder="Wedding photography inquiry"
              />
              {form.formState.errors.subject && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.subject.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message *</Label>
              <Textarea
                id="message"
                {...form.register("message")}
                placeholder="Tell us about your photography needs, event details, preferred dates, and any specific requirements..."
                rows={4}
              />
              {form.formState.errors.message && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.message.message}
                </p>
              )}
            </div>

            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitContactMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {submitContactMutation.isPending ? (
                  "Sending..."
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send Message
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
