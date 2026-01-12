import { createClient } from '@/lib/supabase/server';
import { HeaderWrapper } from '@/components/layout/header-wrapper';
import { Footer } from '@/components/layout/footer';
import { CategoryCard } from '@/components/ui/category-card';

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  description: string | null;
}

export default async function CategoriesPage() {
  const supabase = await createClient();

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('name');

  return (
    <div className="min-h-screen flex flex-col bg-neutral-950">
      <HeaderWrapper />

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-white">
              Browse All Services
            </h1>
            <p className="mt-4 text-lg text-neutral-400">
              Find the right professional for any home project
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {categories?.map((category: Category) => (
              <CategoryCard
                key={category.id}
                name={category.name}
                slug={category.slug}
                icon={category.icon}
                description={category.description}
              />
            ))}
          </div>

          {(!categories || categories.length === 0) && (
            <div className="text-center py-12">
              <p className="text-neutral-400">No categories available yet.</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
