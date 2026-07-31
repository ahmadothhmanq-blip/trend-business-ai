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
  it("initializes registry with installed and remote listings", async () => {
    resetWbTemplateMarketplaceRegistry();
    const status = await initializeWbTemplateMarketplace();

    assert.ok(status.installedCount >= 30);
    assert.equal(status.listingCount, status.installedCount);
    assert.ok(status.featuredCount >= 1);
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

  it("includes installed listings for pre-shipped premium templates", async () => {
    resetWbTemplateMarketplaceRegistry();
    const listing = await getTemplateMarketplaceListing("saas-starter");

    assert.ok(listing);
    assert.equal(listing?.availability, "installed");
    assert.equal(listing?.source, "installed");
    assert.ok(listing?.tags.includes("saas"));
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
    const catalog = await listTemplateMarketplaceCatalog({ category: "saas" });

    assert.ok(catalog.total >= 1);
    assert.ok(catalog.listings.every((listing) => listing.category === "saas"));
  });

  it("filters listings by tags", async () => {
    resetWbTemplateMarketplaceRegistry();
    const catalog = await listTemplateMarketplaceCatalog({
      tags: ["restaurant"],
    });

    assert.ok(catalog.total >= 1);
    assert.ok(
      catalog.listings.every((listing) =>
        listing.tags.map((tag) => tag.toLowerCase()).includes("restaurant"),
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

    assert.ok(featured.length >= 2);
    assert.ok(featured.every((listing) => listing.featured));
    assert.equal(featured[0]?.id, "modern-business");
  });

  it("builds facets for categories, tags, and sources", async () => {
    resetWbTemplateMarketplaceRegistry();
    const catalog = await listTemplateMarketplaceCatalog();

    assert.ok(catalog.facets.categories.length >= 2);
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

    assert.ok(filtered.length >= 2);
    assert.ok(sorted[0]!.name.localeCompare(sorted.at(-1)!.name) <= 0);
  });
});
