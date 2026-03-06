
import { Header, Footer } from "@/components/layout";
import { Hero } from "@/components/home";
import { DealOfTheDay } from "@/components/home/DealOfTheDay";
import { ShopByCategory } from "@/components/home/ShopByCategory";
import { RecommendedProducts } from "@/components/home/RecommendedProducts";
import { landingService } from "@/lib/services/landing-service";

export const dynamic = 'force-dynamic'

async function getHomePageData() {
  try {
    const [heroData, dealsData] = await Promise.all([
      landingService.getHeroContent(),
      landingService.getActiveDeals(),
    ]);

    return {
      hero: heroData?.heroContent || [],
      deals: dealsData?.deals || [],
    };
  } catch (error) {
    console.error("Error loading home page data:", error);
    return {
      hero: [],
      deals: [],
    };
  }
}

export default async function HomePage() {
  const { hero, deals } = await getHomePageData();
  return (
    <div className="min-h-screen bg-[#f1f3f6]">
      <Header />
      <main>
        <Hero slides={hero} />
        <ShopByCategory />
        <DealOfTheDay deals={deals} />
        <RecommendedProducts />
      </main>
      <Footer />
    </div>
  );
}
