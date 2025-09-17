import { useQuery } from "@tanstack/react-query";
import { Key, Shield, AlertTriangle, Tags } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface Stats {
  total: number;
  strong: number;
  weak: number;
  categories: number;
}

export function StatsCards() {
  const { data: stats, isLoading } = useQuery<Stats>({
    queryKey: ["/api/passwords/stats"],
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded w-24"></div>
                  <div className="h-8 bg-muted rounded w-16"></div>
                </div>
                <div className="w-12 h-12 bg-muted rounded-lg"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Passwords",
      value: stats?.total || 0,
      icon: Key,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Strong Passwords",
      value: stats?.strong || 0,
      icon: Shield,
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      title: "Weak Passwords",
      value: stats?.weak || 0,
      icon: AlertTriangle,
      color: "text-destructive",
      bgColor: "bg-destructive/10",
    },
    {
      title: "Categories",
      value: stats?.categories || 0,
      icon: Tags,
      color: "text-muted-foreground",
      bgColor: "bg-secondary",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.title} className="hover:shadow-md transition-all" data-testid={`stat-card-${card.title.toLowerCase().replace(' ', '-')}`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">{card.title}</p>
                  <p className="text-2xl font-semibold mt-1" data-testid={`stat-value-${card.title.toLowerCase().replace(' ', '-')}`}>
                    {card.value}
                  </p>
                </div>
                <div className={`w-12 h-12 ${card.bgColor} rounded-lg flex items-center justify-center`}>
                  <Icon className={`${card.color} w-6 h-6`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
