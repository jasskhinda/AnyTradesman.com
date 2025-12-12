import Link from 'next/link';
import {
  Wrench,
  Zap,
  Thermometer,
  Home,
  Paintbrush,
  Hammer,
  TreeDeciduous,
  Sparkles,
  Bug,
  Settings,
  Layers,
  HardHat,
  Fence,
  DoorOpen,
  KeyRound,
  Truck,
  PenTool,
  Square,
  LayoutGrid,
  Blocks,
} from 'lucide-react';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  wrench: Wrench,
  zap: Zap,
  thermometer: Thermometer,
  home: Home,
  paintbrush: Paintbrush,
  hammer: Hammer,
  trees: TreeDeciduous,
  sparkles: Sparkles,
  bug: Bug,
  settings: Settings,
  layers: Layers,
  construction: HardHat,
  fence: Fence,
  'door-open': DoorOpen,
  key: KeyRound,
  truck: Truck,
  tool: PenTool,
  square: Square,
  layout: LayoutGrid,
  'brick-wall': Blocks,
};

interface CategoryCardProps {
  name: string;
  slug: string;
  icon: string | null;
  description?: string | null;
}

export function CategoryCard({ name, slug, icon, description }: CategoryCardProps) {
  const IconComponent = icon && iconMap[icon] ? iconMap[icon] : Wrench;

  return (
    <Link
      href={`/search?category=${slug}`}
      className="group flex flex-col items-center p-6 bg-white/95 backdrop-blur-sm rounded-xl border border-neutral-200 hover:border-red-500 hover:bg-white transition-all shadow-sm"
    >
      <div className="w-14 h-14 rounded-full bg-red-500/20 flex items-center justify-center mb-4 group-hover:bg-red-500/30 transition-colors">
        <IconComponent className="w-7 h-7 text-red-500" />
      </div>
      <h3 className="text-lg font-semibold text-neutral-900 text-center">{name}</h3>
      {description && (
        <p className="mt-2 text-sm text-neutral-600 text-center line-clamp-2">{description}</p>
      )}
    </Link>
  );
}
