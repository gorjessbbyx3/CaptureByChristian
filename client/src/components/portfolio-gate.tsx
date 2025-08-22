import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, Star, Award } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const leadSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  message: z.string().optional(),
});

type LeadFormData = z.infer<typeof leadSchema>;

interface PortfolioGateProps {
  onAccessGranted: () => void;
}

export function PortfolioGate({ onAccessGranted }: PortfolioGateProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<LeadFormData>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      name: "",
      email: "",
      message: "",
    },
  });

  const submitLead = useMutation({
    mutationFn: async (data: LeadFormData) => {
      const response = await apiRequest("POST", "/api/contact", {
        name: data.name,
        email: data.email,
        subject: "Portfolio Access Request",
        message: data.message || "Requested access to portfolio gallery",
        source: "portfolio_access",
        priority: "normal",
      });

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contact-messages"] });
      toast({
        title: "Access Granted",
        description:
          "Thank you! You now have access to our complete portfolio.",
      });
      onAccessGranted();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit information. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: LeadFormData) => {
    submitLead.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-white to-cream/80 dark:from-background dark:via-background dark:to-background/80 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto bg-gradient-to-br from-bronze to-teal rounded-full p-4 w-16 h-16 flex items-center justify-center">
            <Camera className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-playfair">
            Access Our Complete Portfolio
          </CardTitle>
          <p className="text-muted-foreground">
            To view our full collection of work, please share your contact
            information. This helps us provide you with personalized
            recommendations and exclusive updates.
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Preview Benefits */}
          <div className="space-y-3">
            <div className="flex items-center text-sm text-muted-foreground">
              <Star className="h-4 w-4 mr-2 text-bronze" />
              View our complete gallery with filtering options
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <Award className="h-4 w-4 mr-2 text-bronze" />
              See high-resolution images and detailed work
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <Camera className="h-4 w-4 mr-2 text-bronze" />
              Get personalized photography recommendations
            </div>
          </div>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                placeholder="Enter your full name"
                {...form.register("name")}
                className={
                  form.formState.errors.name ? "border-destructive" : ""
                }
              />
              {form.formState.errors.name && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email address"
                {...form.register("email")}
                className={
                  form.formState.errors.email ? "border-destructive" : ""
                }
              />
              {form.formState.errors.email && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">
                What type of photography interests you? (Optional)
              </Label>
              <Input
                id="message"
                placeholder="e.g., Wedding, Portrait, Aerial photography"
                {...form.register("message")}
              />
            </div>

            <Button
              type="submit"
              className="w-full btn-bronze"
              disabled={submitLead.isPending}
            >
              {submitLead.isPending ? "Submitting..." : "Access Portfolio"}
            </Button>
          </form>

          <p className="text-xs text-muted-foreground text-center">
            We respect your privacy. Your information will only be used to
            provide you with photography services and updates. You can
            unsubscribe at any time.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
