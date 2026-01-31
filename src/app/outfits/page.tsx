import { Header, Footer } from "@/components/layout";
import { CollectionGrid } from "@/components/collections/CollectionGrid";
import { outfitsApi } from "@/lib/api";
export const metadata = {
  title: "All Outfits | Browse Complete Looks",
  description: "Browse our curated collection of complete outfits for gentlemen, ladies, and couples",
};
interface SearchParams {
  type?: string;
  page?: string;
}
interface PageProps {
  searchParams: Promise<SearchParams>;
}
export default async function OutfitsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const type = params.type;
  const page = parseInt(params.page || "1");
  const limit = 12;
  let allOutfits: any[] = [];
  let totalCount: number = 0;
  try {
    const data = await outfitsApi.getAll({ type });
    allOutfits = data.outfits || [];
    totalCount = allOutfits.length;
  } catch (error) {
    console.error("Failed to fetch outfits:", error);
  }
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const outfits = allOutfits.slice(startIndex, endIndex);
  const getTitle = () => {
    if (type === "GENTLEMEN") return "Gentlemen's Outfits";
    if (type === "LADY") return "Ladies' Outfits";
    if (type === "COUPLE") return "Couples' Outfits";
    return "All Outfits";
  };
  const getDescription = () => {
    if (type === "GENTLEMEN") return "Complete looks curated for the modern gentleman";
    if (type === "LADY") return "Elegant ensembles for the sophisticated lady";
    if (type === "COUPLE") return "Matching outfits for the perfect couple";
    return "Browse our complete collection of curated outfits";
  };
  return (
    <>
      <Header />
      <main className="pt-32 pb-20 bg-cream-100">
        <div className="container-luxury">
          {}
          <div className="mb-12">
            <h1 className="font-display text-4xl md:text-5xl text-charcoal-900 mb-4">
              {getTitle()}
            </h1>
            <p className="text-charcoal-600 text-lg max-w-2xl">
              {getDescription()}
            </p>
          </div>
          {}
          <div className="mb-8 flex flex-wrap gap-4">
            <a
              href="/outfits"
              className={`px-4 py-2 rounded-lg transition-colors ${
                !type
                  ? "bg-charcoal-900 text-cream-100"
                  : "bg-white text-charcoal-700 hover:bg-charcoal-100"
              }`}
            >
              All Outfits
            </a>
            <a
              href="/outfits?type=GENTLEMEN"
              className={`px-4 py-2 rounded-lg transition-colors ${
                type === "GENTLEMEN"
                  ? "bg-charcoal-900 text-cream-100"
                  : "bg-white text-charcoal-700 hover:bg-charcoal-100"
              }`}
            >
              Gentlemen
            </a>
            <a
              href="/outfits?type=LADY"
              className={`px-4 py-2 rounded-lg transition-colors ${
                type === "LADY"
                  ? "bg-charcoal-900 text-cream-100"
                  : "bg-white text-charcoal-700 hover:bg-charcoal-100"
              }`}
            >
              Ladies
            </a>
            <a
              href="/outfits?type=COUPLE"
              className={`px-4 py-2 rounded-lg transition-colors ${
                type === "COUPLE"
                  ? "bg-charcoal-900 text-cream-100"
                  : "bg-white text-charcoal-700 hover:bg-charcoal-100"
              }`}
            >
              Couples
            </a>
          </div>
          {}
          {outfits.length > 0 ? (
            <>
              <CollectionGrid outfits={outfits} collectionType="main" />
              {}
              {totalCount > limit && (
                <div className="mt-12 flex justify-center gap-2">
                  {page > 1 && (
                    <a
                      href={`/outfits?${type ? `type=${type}&` : ""}page=${page - 1}`}
                      className="px-4 py-2 bg-white border border-charcoal-200 rounded-lg hover:bg-charcoal-50 transition-colors"
                    >
                      Previous
                    </a>
                  )}
                  <span className="px-4 py-2 bg-charcoal-900 text-cream-100 rounded-lg">
                    Page {page}
                  </span>
                  {outfits.length === limit && (
                    <a
                      href={`/outfits?${type ? `type=${type}&` : ""}page=${page + 1}`}
                      className="px-4 py-2 bg-white border border-charcoal-200 rounded-lg hover:bg-charcoal-50 transition-colors"
                    >
                      Next
                    </a>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20">
              <p className="text-charcoal-500 text-lg">No outfits found</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
