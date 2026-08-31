"use client";

import { createElement, type ComponentProps } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Briefcase,
  Building2,
  Calendar,
  Check,
  ChevronDown,
  ChevronRight,
  Clock,
  Download,
  ExternalLink,
  FileText,
  Globe,
  Heart,
  Layers,
  LayoutGrid,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  Phone,
  Play,
  Search,
  Settings,
  Share2,
  Shield,
  Sparkles,
  Star,
  Target,
  Users,
  Zap,
} from "lucide-react";

export const LUCIDE_ICON_MAP: Record<string, LucideIcon> = {
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  ChevronDown,
  Mail,
  Phone,
  MessageCircle,
  MapPin,
  Building2,
  Briefcase,
  BarChart3,
  Target,
  Sparkles,
  Star,
  Check,
  Shield,
  Zap,
  Globe,
  Users,
  Heart,
  Share2,
  Instagram: Share2,
  Twitter: Share2,
  Linkedin: Share2,
  Facebook: Share2,
  Youtube: Play,
  Play,
  Download,
  ExternalLink,
  Menu,
  Search,
  Settings,
  Clock,
  Calendar,
  FileText,
  Layers,
  LayoutGrid,
};

export function resolveLucideIcon(name: string): LucideIcon {
  return LUCIDE_ICON_MAP[name] ?? Sparkles;
}

export function LucideIconGlyph({
  name,
  ...props
}: { name: string } & ComponentProps<LucideIcon>) {
  return createElement(resolveLucideIcon(name), props);
}
