import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Trophy,
  Target,
  Users,
  TrendingUp,
  Award,
  Star,
  Zap,
  Gift,
  Calendar,
  DollarSign,
  MessageSquare,
  Crown,
  Flame,
  Medal,
} from "lucide-react";

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  progress: number;
  maxProgress: number;
  unlocked: boolean;
  category: "leads" | "bookings" | "revenue" | "engagement";
  points: number;
  color: string;
}

interface ProgressLevel {
  level: number;
  title: string;
  minPoints: number;
  maxPoints: number;
  benefits: string[];
  color: string;
}

export function GamifiedProgress() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Fetch real business data for calculations
  const { data: bookings = [] } = useQuery({
    queryKey: ["/api/bookings"],
  });

  const { data: clients = [] } = useQuery({
    queryKey: ["/api/clients"],
  });

  const { data: contactMessages = [] } = useQuery({
    queryKey: ["/api/contact-messages"],
  });

  const { data: invoiceStats } = useQuery({
    queryKey: ["/api/analytics/invoice-stats"],
  });

  // Calculate real metrics
  const confirmedBookings = Array.isArray(bookings)
    ? bookings.filter((b: { status: string }) => b.status === "confirmed")
        .length || 0
    : 0;
  const totalRevenue =
    (invoiceStats as { totalRevenue: number })?.totalRevenue || 0;
  const conversionRate =
    Array.isArray(clients) && clients.length > 0
      ? (confirmedBookings / clients.length) * 100
      : 0;
  const portfolioRequests = Array.isArray(contactMessages)
    ? contactMessages.filter(
        (m: { source: string }) => m.source === "portfolio_access",
      ).length || 0
    : 0;

  // Define progress levels
  const progressLevels: ProgressLevel[] = [
    {
      level: 1,
      title: "Beginner Photographer",
      minPoints: 0,
      maxPoints: 500,
      benefits: ["Basic analytics", "Client portal access"],
      color: "text-gray-600",
    },
    {
      level: 2,
      title: "Rising Star",
      minPoints: 500,
      maxPoints: 1500,
      benefits: ["Advanced analytics", "Priority support", "Custom branding"],
      color: "text-blue-600",
    },
    {
      level: 3,
      title: "Professional Photographer",
      minPoints: 1500,
      maxPoints: 3500,
      benefits: ["AI insights", "Automated workflows", "Premium features"],
      color: "text-purple-600",
    },
    {
      level: 4,
      title: "Elite Master",
      minPoints: 3500,
      maxPoints: 7500,
      benefits: ["Exclusive tools", "Business consulting", "Beta features"],
      color: "text-orange-600",
    },
    {
      level: 5,
      title: "Photography Legend",
      minPoints: 7500,
      maxPoints: Infinity,
      benefits: ["Hall of fame", "Mentorship program", "Unlimited everything"],
      color: "text-gold-600",
    },
  ];

  // Calculate achievements based on real data
  const achievements: Achievement[] = [
    // Lead Conversion Achievements
    {
      id: "first_lead",
      title: "First Impression",
      description: "Received your first portfolio access request",
      icon: Users,
      progress: Math.min(portfolioRequests, 1),
      maxProgress: 1,
      unlocked: portfolioRequests >= 1,
      category: "leads",
      points: 50,
      color: "text-blue-500",
    },
    {
      id: "lead_magnet",
      title: "Lead Magnet",
      description: "Generate 10 portfolio access requests",
      icon: Target,
      progress: Math.min(portfolioRequests, 10),
      maxProgress: 10,
      unlocked: portfolioRequests >= 10,
      category: "leads",
      points: 200,
      color: "text-green-500",
    },
    {
      id: "conversion_master",
      title: "Conversion Master",
      description: "Achieve 50% lead to booking conversion rate",
      icon: TrendingUp,
      progress: Math.min(conversionRate, 50),
      maxProgress: 50,
      unlocked: conversionRate >= 50,
      category: "leads",
      points: 300,
      color: "text-purple-500",
    },

    // Booking Achievements
    {
      id: "first_booking",
      title: "Welcome Aboard",
      description: "Confirm your first booking",
      icon: Calendar,
      progress: Math.min(confirmedBookings, 1),
      maxProgress: 1,
      unlocked: confirmedBookings >= 1,
      category: "bookings",
      points: 100,
      color: "text-orange-500",
    },
    {
      id: "booking_streak",
      title: "Booking Streak",
      description: "Secure 5 confirmed bookings",
      icon: Flame,
      progress: Math.min(confirmedBookings, 5),
      maxProgress: 5,
      unlocked: confirmedBookings >= 5,
      category: "bookings",
      points: 250,
      color: "text-red-500",
    },
    {
      id: "double_digits",
      title: "Double Digits",
      description: "Reach 10 confirmed bookings",
      icon: Trophy,
      progress: Math.min(confirmedBookings, 10),
      maxProgress: 10,
      unlocked: confirmedBookings >= 10,
      category: "bookings",
      points: 500,
      color: "text-yellow-500",
    },

    // Revenue Achievements
    {
      id: "first_dollar",
      title: "First Dollar",
      description: "Generate your first revenue",
      icon: DollarSign,
      progress: totalRevenue > 0 ? 1 : 0,
      maxProgress: 1,
      unlocked: totalRevenue > 0,
      category: "revenue",
      points: 75,
      color: "text-green-600",
    },
    {
      id: "milestone_1k",
      title: "Thousand Club",
      description: "Reach $1,000 in total revenue",
      icon: Medal,
      progress: Math.min(totalRevenue, 1000),
      maxProgress: 1000,
      unlocked: totalRevenue >= 1000,
      category: "revenue",
      points: 400,
      color: "text-emerald-600",
    },
    {
      id: "revenue_king",
      title: "Revenue King",
      description: "Generate $5,000 in total revenue",
      icon: Crown,
      progress: Math.min(totalRevenue, 7000),
      maxProgress: 7000,
      unlocked: totalRevenue >= 7000,
      category: "revenue",
      points: 750,
      color: "text-gold-600",
    },

    // Engagement Achievements
    {
      id: "social_butterfly",
      title: "Social Butterfly",
      description: "Receive 5 contact messages",
      icon: MessageSquare,
      progress: Math.min(
        Array.isArray(contactMessages) ? contactMessages.length || 0 : 0,
        5,
      ),
      maxProgress: 5,
      unlocked:
        (Array.isArray(contactMessages) ? contactMessages.length || 0 : 0) >= 5,
      category: "engagement",
      points: 150,
      color: "text-pink-500",
    },
    {
      id: "client_favorite",
      title: "Client Favorite",
      description: "Build a client base of 20+ contacts",
      icon: Star,
      progress: Math.min(Array.isArray(clients) ? clients.length || 0 : 0, 20),
      maxProgress: 20,
      unlocked: (Array.isArray(clients) ? clients.length || 0 : 0) >= 20,
      category: "engagement",
      points: 600,
      color: "text-indigo-500",
    },
  ];

  // Calculate total points and current level
  const totalPoints = achievements
    .filter((a) => a.unlocked)
    .reduce((sum, a) => sum + a.points, 0);
  const currentLevel =
    progressLevels.find(
      (level) =>
        totalPoints >= level.minPoints && totalPoints < level.maxPoints,
    ) || progressLevels[progressLevels.length - 1];

  const nextLevel = progressLevels.find(
    (level) => level.minPoints > totalPoints,
  );
  const levelProgress = nextLevel
    ? ((totalPoints - currentLevel.minPoints) /
        (nextLevel.minPoints - currentLevel.minPoints)) *
      100
    : 100;

  // Filter achievements by category
  const filteredAchievements =
    selectedCategory === "all"
      ? achievements
      : achievements.filter((a) => a.category === selectedCategory);

  const categories = [
    { id: "all", label: "All", icon: Trophy },
    { id: "leads", label: "Leads", icon: Users },
    { id: "bookings", label: "Bookings", icon: Calendar },
    { id: "revenue", label: "Revenue", icon: DollarSign },
    { id: "engagement", label: "Engagement", icon: MessageSquare },
  ];

  return (
    <div className="space-y-6">
      {/* Level Progress Header */}
      <Card className="border-2 border-gradient-to-r from-purple-500 to-pink-500">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-full p-4">
              <Crown className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl mb-2">
            Level {currentLevel.level}: {currentLevel.title}
          </CardTitle>
          <p className="text-muted-foreground mb-4">
            {totalPoints} points •{" "}
            {achievements.filter((a) => a.unlocked).length} achievements
            unlocked
          </p>

          {nextLevel && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress to {nextLevel.title}</span>
                <span>{Math.round(levelProgress)}%</span>
              </div>
              <Progress value={levelProgress} className="h-3" />
              <p className="text-xs text-muted-foreground">
                {nextLevel.minPoints - totalPoints} points until next level
              </p>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2 flex items-center">
                <Gift className="h-4 w-4 mr-2 text-purple-500" />
                Current Benefits
              </h4>
              <ul className="space-y-1">
                {currentLevel.benefits.map((benefit, index) => (
                  <li key={index} className="text-sm flex items-center">
                    <Zap className="h-3 w-3 mr-2 text-green-500" />
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
            {nextLevel && (
              <div>
                <h4 className="font-semibold mb-2 flex items-center">
                  <Target className="h-4 w-4 mr-2 text-orange-500" />
                  Next Level Rewards
                </h4>
                <ul className="space-y-1">
                  {nextLevel.benefits.map((benefit, index) => (
                    <li
                      key={index}
                      className="text-sm flex items-center text-muted-foreground"
                    >
                      <Star className="h-3 w-3 mr-2 text-yellow-500" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => {
          const IconComponent = category.icon;
          return (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
              className="flex items-center space-x-2"
            >
              <IconComponent className="h-4 w-4" />
              <span>{category.label}</span>
            </Button>
          );
        })}
      </div>

      {/* Achievements Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAchievements.map((achievement) => {
          const IconComponent = achievement.icon;
          const progressPercentage =
            (achievement.progress / achievement.maxProgress) * 100;

          return (
            <Card
              key={achievement.id}
              className={`border-2 transition-all duration-300 ${
                achievement.unlocked
                  ? "border-green-500 bg-green-50 dark:bg-green-950/20"
                  : "border-gray-200 dark:border-gray-700"
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div
                    className={`rounded-full p-2 ${
                      achievement.unlocked
                        ? "bg-green-500"
                        : "bg-gray-300 dark:bg-gray-600"
                    }`}
                  >
                    <IconComponent
                      className={`h-5 w-5 ${
                        achievement.unlocked ? "text-white" : "text-gray-500"
                      }`}
                    />
                  </div>
                  <div className="text-right">
                    <Badge
                      variant={achievement.unlocked ? "default" : "secondary"}
                    >
                      {achievement.points} pts
                    </Badge>
                  </div>
                </div>

                <h3
                  className={`font-semibold mb-1 ${
                    achievement.unlocked
                      ? "text-green-700 dark:text-green-300"
                      : ""
                  }`}
                >
                  {achievement.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  {achievement.description}
                </p>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span>Progress</span>
                    <span>
                      {achievement.progress} / {achievement.maxProgress}
                    </span>
                  </div>
                  <Progress
                    value={progressPercentage}
                    className={`h-2 ${
                      achievement.unlocked
                        ? "bg-green-200 dark:bg-green-900"
                        : ""
                    }`}
                  />
                </div>

                {achievement.unlocked && (
                  <div className="mt-3 flex items-center text-xs text-green-600 dark:text-green-400">
                    <Award className="h-3 w-3 mr-1" />
                    Unlocked!
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="h-8 w-8 mx-auto mb-2 text-blue-500" />
            <div className="text-2xl font-bold">
              {Array.isArray(clients) ? clients.length || 0 : 0}
            </div>
            <div className="text-sm text-muted-foreground">Total Clients</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Calendar className="h-8 w-8 mx-auto mb-2 text-green-500" />
            <div className="text-2xl font-bold">{confirmedBookings}</div>
            <div className="text-sm text-muted-foreground">
              Confirmed Bookings
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <DollarSign className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
            <div className="text-2xl font-bold">
              ${totalRevenue.toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">Total Revenue</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Trophy className="h-8 w-8 mx-auto mb-2 text-purple-500" />
            <div className="text-2xl font-bold">{totalPoints}</div>
            <div className="text-sm text-muted-foreground">Total Points</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
