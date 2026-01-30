import { HeroContent, TopFits, Review, ReviewStats } from "./api";

export const mockHeroContent: HeroContent[] = [
  {
    id: "1",
    title: "Timeless Elegance",
    subtitle: "Discover our curated collection of luxury essentials",
    image: "https://images.unsplash.com/photo-1617137968427-85924c800a22?w=1600",
    ctaText: "Shop Collection",
    ctaLink: "/collections/gentlemen",
  },
  {
    id: "2",
    title: "The Art of Dressing",
    subtitle: "Where sophistication meets modern style",
    image: "https://images.unsplash.com/photo-1518577915332-c2a19f149a75?w=1600",
    ctaText: "Explore Now",
    ctaLink: "/collections/lady",
  },
];

export const mockTopFits: TopFits = {
  gentlemen: [
    {
      id: "1",
      title: "The Windsor Collection",
      slug: "the-windsor-collection",
      heroImage: "https://images.unsplash.com/photo-1617137968427-85924c800a22?w=800",
      bundlePrice: 2499900,
      individualTotal: 2899700,
      savings: 399800,
      productCount: 3,
    },
    {
      id: "2",
      title: "The Boardroom",
      slug: "the-boardroom",
      heroImage: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=800",
      bundlePrice: 2199900,
      individualTotal: 2499700,
      savings: 299800,
      productCount: 4,
    },
  ],
  lady: [
    {
      id: "3",
      title: "Evening Elegance",
      slug: "evening-elegance",
      heroImage: "https://images.unsplash.com/photo-1518577915332-c2a19f149a75?w=800",
      bundlePrice: 2199900,
      individualTotal: 2999700,
      savings: 799800,
      productCount: 3,
    },
  ],
  couple: [
    {
      id: "4",
      title: "The Power Couple",
      slug: "the-power-couple",
      heroImage: "https://images.unsplash.com/photo-1519741497674-611481863552?w=800",
      bundlePrice: 4499900,
      individualTotal: 5399400,
      savings: 899500,
      productCount: 4,
    },
  ],
};

export const mockReviews: Review[] = [
  {
    id: "1",
    userName: "Rahul M.",
    rating: 5,
    comment:
      "Absolutely stunning quality. The blazer fits perfectly and the fabric is luxurious. Worth every penny.",
    media: [],
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    userName: "Priya S.",
    rating: 5,
    comment:
      "The Evening Elegance outfit made me feel like a star. Received so many compliments!",
    media: [],
    createdAt: new Date().toISOString(),
  },
  {
    id: "3",
    userName: "Vikram R.",
    rating: 4,
    comment:
      "Great quality and fast delivery. The Oxford shoes are incredibly comfortable.",
    media: [],
    createdAt: new Date().toISOString(),
  },
];

export const mockReviewStats: ReviewStats = {
  averageRating: 4.7,
  totalReviews: 128,
};