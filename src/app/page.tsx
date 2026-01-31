
import { Header, Footer } from "@/components/layout";
import {
  Hero,
  AboutPreview,
  Reviews,
  CategoryShowcase,
  ReelsSection,
  Newsletter,
} from "@/components/home";
import { landingService } from "@/lib/services/landing-service";

async function getHomePageData() {
  try {
    const [heroData, reviewsData, reelsData] = await Promise.all([
      landingService.getHeroContent(),
      landingService.getReviews({ featured: true, limit: 6 }),
      landingService.getReels(20),
    ]);

    return {
      hero: heroData?.heroContent || [],
      reviews: reviewsData?.reviews || [],
      reviewStats: reviewsData?.stats || { averageRating: 0, totalReviews: 0 },
      reels: reelsData?.reels || [],
    };
  } catch (error) {
    console.error("Error loading home page data:", error);
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
