"use client";

import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconColor: string;
  variation?: number;
  variationLabel?: string;
  className?: string;
}

export function MetricCard({
  title,
  value,
  icon: Icon,
  iconColor,
  variation,
  variationLabel,
  className,
}: MetricCardProps) {
  const hasVariation = variation !== undefined;
  const isPositive = hasVariation && variation >= 0;
  const VariationIcon = isPositive ? TrendingUp : TrendingDown;

  return (
    <Card className={cn("border-0 shadow-sm", className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold text-foreground">{value}</p>
            {hasVariation && (
              <div className="flex items-center gap-1 text-xs">
                <VariationIcon
                  className={cn(
                    "h-3 w-3",
                    isPositive ? "text-green-600" : "text-red-600"
                  )}
                />
                <span
                  className={cn(
                    isPositive ? "text-green-600" : "text-red-600"
                  )}
                >
                  {isPositive ? "+" : ""}
                  {Math.abs(variation).toFixed(1)}%
                </span>
                {variationLabel && (
                  <span className="text-muted-foreground">
                    {" "}
                    {variationLabel}
                  </span>
                )}
              </div>
            )}
          </div>
          <div
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-lg",
              iconColor
            )}
          >
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

