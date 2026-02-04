import { cn } from "@/lib/utils";
import { 
  Brain, 
  Leaf, 
  Apple, 
  Dumbbell, 
  Users,
  LucideIcon,
  MessageCircle
} from "lucide-react";

export type ServiceType = "mental" | "restore" | "nutrition" | "vault" | "forge";

interface ServiceInfo {
  id: ServiceType;
  name: string;
  tagline: string;
  icon: LucideIcon;
  bgClass: string;
  iconBgClass: string;
}

const services: Record<ServiceType, ServiceInfo> = {
  mental: {
    id: "mental",
    name: "Mental Health",
    tagline: "Space to process, tools to grow",
    icon: Brain,
    bgClass: "bg-lavender-light border-lavender/20",
    iconBgClass: "bg-lavender/10 text-lavender",
  },
  restore: {
    id: "restore",
    name: "Physiotherapy / Restore",
    tagline: "Heal gently, move with intention",
    icon: Leaf,
    bgClass: "bg-sage-light border-sage/20",
    iconBgClass: "bg-sage/10 text-sage",
  },
  nutrition: {
    id: "nutrition",
    name: "Nutrition",
    tagline: "Nourish your gut, nourish your life",
    icon: Apple,
    bgClass: "bg-terracotta-light border-terracotta/20",
    iconBgClass: "bg-terracotta/10 text-terracotta",
  },
  vault: {
    id: "vault",
    name: "Private Training / Vault",
    tagline: "Your pace, your space, your growth",
    icon: Dumbbell,
    bgClass: "bg-ocean-light border-ocean/20",
    iconBgClass: "bg-ocean/10 text-ocean",
  },
  forge: {
    id: "forge",
    name: "Community / Forge",
    tagline: "Strength through belonging",
    icon: Users,
    bgClass: "bg-sunrise-light border-sunrise/20",
    iconBgClass: "bg-sunrise/10 text-sunrise",
  },
};

interface Recommendation {
  service: ServiceType;
  confidence: number;
  reason: string;
  suggestedApproach: string;
}

interface ServiceRecommendationProps {
  recommendation: Recommendation;
  className?: string;
}

export function ServiceRecommendation({ 
  recommendation, 
  className 
}: ServiceRecommendationProps) {
  const service = services[recommendation.service];
  const Icon = service.icon;

  return (
    <div
      className={cn(
        "rounded-2xl border p-5 animate-slide-up",
        service.bgClass,
        className
      )}
    >
      <div className="flex items-start gap-4">
        <div className={cn("rounded-xl p-3", service.iconBgClass)}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-serif text-lg font-medium text-foreground">
                {service.name}
              </h3>
              <p className="text-sm text-muted-foreground italic">
                {service.tagline}
              </p>
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-background/60 px-2.5 py-1">
              <div className="h-1.5 w-1.5 rounded-full bg-sage" />
              <span className="text-xs font-medium text-foreground">
                {recommendation.confidence}% fit
              </span>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">
                Why this feels right
              </p>
              <p className="text-sm text-foreground leading-relaxed">
                {recommendation.reason}
              </p>
            </div>

            <div className="rounded-lg bg-background/50 p-3">
              <div className="flex items-start gap-2">
                <MessageCircle className="h-4 w-4 text-sage mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">
                    How to introduce it
                  </p>
                  <p className="text-sm text-foreground leading-relaxed italic">
                    "{recommendation.suggestedApproach}"
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
