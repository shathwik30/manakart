import { Header, Footer } from "@/components/layout";
import {
  Hero,
  AboutPreview,
  Reviews,
  CategoryShowcase,
  ReelsSection,
  Newsletter,
} from "@/components/home";
import { landingApi } from "@/lib/api";
async function getHomePageData() {
  try {
    const [heroData, reviewsData, reelsData] = await Promise.all([
      landingApi.getHero().catch(() => null),
      landingApi.getReviews({ featured: true, limit: 6 }).catch(() => null),
      landingApi.getReels().catch(() => null),
    ]);
    return {
      hero: heroData?.heroContent || [],
      reviews: reviewsData?.reviews || [],
      reviewStats: reviewsData?.stats || { averageRating: 0, totalReviews: 0 },
      reels: reelsData?.reels || [],
    };
  } catch {
    return {
      hero: [],
      reviews: [],
      reviewStats: { averageRating: 0, totalReviews: 0 },
      reels: [],
    };
  }
}
export default async function HomePage() {
  const { hero, reviews, reviewStats, reels } = await getHomePageData();
  return (
    <>
      <Header />
      <Hero slides={hero} />
      <CategoryShowcase />
      <ReelsSection reels={reels} />
      <AboutPreview />
      <Reviews reviews={reviews} stats={reviewStats} />
      <Newsletter />
      <Footer />
    </>
  );
}
