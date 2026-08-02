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

describe("template marketplace foundation", () => {
  it("initializes registry with exactly two installed listings", async () => {
    resetWbTemplateMarketplaceRegistry();
    const status = await initializeWbTemplateMarketplace();

    assert.equal(status.installedCount, 2);
    assert.equal(status.listingCount, 2);
    assert.equal(status.featuredCount, 2);
  });

  it("lists installed modern-business as an installed listing", async () => {
    resetWbTemplateMarketplaceRegistry();
    const listing = await getTemplateMarketplaceListing("modern-business");

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

    const listing = await getTemplateMarketplaceListing("modern-business");
    assert.equal(listing?.availability, "installed");
    assert.equal(listing?.source, "installed");
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

    assert.equal(catalog.total, 1);
    assert.ok(
      catalog.listings.every((listing) =>
        listing.tags.map((tag) => tag.toLowerCase()).includes("corporate"),
      ),
    );
  });

  it("searches listings by query", async () => {
    resetWbTemplateMarketplaceRegistry();
    const catalog = await searchTemplateMarketplaceCatalog({
      query: "modern business",
    });

    assert.ok(catalog.total >= 1);
    assert.ok(
      catalog.listings.some((listing) => listing.id === "modern-business"),
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

    assert.equal(featured.length, 2);
    assert.ok(featured.every((listing) => listing.featured));
    assert.equal(featured[0]?.id, "modern-business");
    assert.equal(featured[1]?.id, "ai-startup-signal");
  });

  it("builds facets for categories, tags, and sources", async () => {
    resetWbTemplateMarketplaceRegistry();
    await initializeWbTemplateMarketplace();
    const catalog = await listTemplateMarketplaceCatalog();

    assert.equal(catalog.facets.categories.length, 2);
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

    assert.equal(filtered.length, 2);
    assert.ok(sorted[0]!.name.localeCompare(sorted.at(-1)!.name) <= 0);
  });
});
