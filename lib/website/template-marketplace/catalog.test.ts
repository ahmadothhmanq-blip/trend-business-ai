import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  filterTemplateMarketplaceListings,
  getTemplateMarketplaceListing,
  initializeWbTemplateMarketplace,
  listFeaturedTemplateMarketplaceListings,
  listRemoteMarketplaceListings,
  listTemplateMarketplaceCatalog,
  resetWbTemplateMarketplaceRegistry,
  searchTemplateMarketplaceCatalog,
  sortTemplateMarketplaceListings,
} from "@/lib/website/template-marketplace/index.server";

const FLAGSHIP_IDS = ["saas-enterprise", "corporate-business", "restaurant-premium"] as const;

describe("template marketplace foundation", () => {
  it("initializes registry with all nine installed listings", async () => {
    resetWbTemplateMarketplaceRegistry();
    const status = await initializeWbTemplateMarketplace();

    assert.equal(status.installedCount, 9);
    assert.equal(status.listingCount, 9);
    assert.ok(status.featuredCount >= 7);
  });

  it("lists installed corporate-business as an installed listing", async () => {
    resetWbTemplateMarketplaceRegistry();
    const listing = await getTemplateMarketplaceListing("corporate-business");

    assert.ok(listing);
    assert.equal(listing?.availability, "installed");
    assert.equal(listing?.source, "installed");
    assert.equal(listing?.category, "corporate");
    assert.ok(listing?.tags.includes("corporate"));
  });

  it("lists installed ai-startup-signal as an installed listing", async () => {
    resetWbTemplateMarketplaceRegistry();
    const listing = await getTemplateMarketplaceListing("ai-startup-signal");

    assert.ok(listing);
    assert.equal(listing?.availability, "installed");
    assert.equal(listing?.source, "installed");
    assert.ok(listing?.tags.includes("ai"));
  });

  it("prefers installed listings over remote seeds with the same id", async () => {
    resetWbTemplateMarketplaceRegistry();
    await initializeWbTemplateMarketplace();

    for (const id of FLAGSHIP_IDS) {
      const listing = await getTemplateMarketplaceListing(id);
      assert.equal(listing?.availability, "installed");
      assert.equal(listing?.source, "installed");
    }
  });

  it("filters listings by category", async () => {
    resetWbTemplateMarketplaceRegistry();
    const catalog = await listTemplateMarketplaceCatalog({ category: "ai-startup" });

    assert.equal(catalog.total, 1);
    assert.ok(catalog.listings.every((listing) => listing.category === "ai-startup"));
  });

  it("filters listings by tags", async () => {
    resetWbTemplateMarketplaceRegistry();
    const catalog = await listTemplateMarketplaceCatalog({
      tags: ["corporate"],
    });

    assert.equal(catalog.total, 2);
    assert.ok(
      catalog.listings.some((listing) => listing.id === "corporate-business"),
    );
    assert.ok(
      catalog.listings.every((listing) =>
        listing.tags.map((tag) => tag.toLowerCase()).includes("corporate"),
      ),
    );
  });

  it("searches listings by query", async () => {
    resetWbTemplateMarketplaceRegistry();
    const catalog = await searchTemplateMarketplaceCatalog({
      query: "corporate business",
    });

    assert.ok(catalog.total >= 1);
    assert.ok(
      catalog.listings.some((listing) => listing.id === "corporate-business"),
    );
  });

  it("sorts listings by name ascending", async () => {
    resetWbTemplateMarketplaceRegistry();
    const catalog = await listTemplateMarketplaceCatalog(
      {},
      { field: "name", direction: "asc" },
    );

    const names = catalog.listings.map((listing) => listing.name);
    const sorted = [...names].sort((a, b) => a.localeCompare(b));
    assert.deepEqual(names, sorted);
  });

  it("returns featured listings in featured order", async () => {
    resetWbTemplateMarketplaceRegistry();
    const featured = await listFeaturedTemplateMarketplaceListings(10);

    assert.ok(featured.length >= 7);
    assert.ok(featured.every((listing) => listing.featured));
    assert.equal(featured[0]?.id, "corporate-business");
    assert.equal(featured[1]?.id, "saas-enterprise");
    assert.equal(featured[2]?.id, "restaurant-premium");
    assert.ok(featured.some((listing) => listing.id === "ai-startup-signal"));
    assert.ok(featured.some((listing) => listing.id === "real-estate-prestige"));
    assert.ok(featured.some((listing) => listing.id === "medical-premium"));
    assert.ok(featured.some((listing) => listing.id === "creative-portfolio"));
  });

  it("builds facets for categories, tags, and sources", async () => {
    resetWbTemplateMarketplaceRegistry();
    await initializeWbTemplateMarketplace();
    const catalog = await listTemplateMarketplaceCatalog();

    const uniqueCategories = new Set(
      catalog.listings.map((listing) => listing.category),
    );
    assert.equal(catalog.facets.categories.length, uniqueCategories.size);
    assert.ok(catalog.facets.tags.length >= 3);
    assert.ok(catalog.facets.sources.some((source) => source.id === "installed"));
  });

  it("supports pure search helpers without async initialization", () => {
    const listings = listRemoteMarketplaceListings();
    const filtered = filterTemplateMarketplaceListings(listings, {
      featured: true,
    });
    const sorted = sortTemplateMarketplaceListings(filtered, {
      field: "name",
      direction: "asc",
    });

    assert.equal(filtered.length, 7);
    assert.ok(sorted[0]!.name.localeCompare(sorted.at(-1)!.name) <= 0);
    assert.ok(filtered.some((listing) => listing.id === "corporate-business"));
    assert.ok(filtered.some((listing) => listing.id === "restaurant-premium"));
  });
});
