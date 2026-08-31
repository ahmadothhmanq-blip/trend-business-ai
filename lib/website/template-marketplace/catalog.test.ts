import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { WEBSITE_STRUCTURE_TEMPLATES } from "@/lib/website/builder/unified-template-registry";
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

const INSTALLED_PACKAGE_COUNT = 20;

describe("template marketplace foundation", () => {
  it("publishes every installed template package as a marketplace listing", async () => {
    resetWbTemplateMarketplaceRegistry();
    const status = await initializeWbTemplateMarketplace();

    // Listings come from the installed template engine, not the structure catalog.
    assert.equal(WEBSITE_STRUCTURE_TEMPLATES.length, 0);
    assert.equal(status.listingCount, INSTALLED_PACKAGE_COUNT);
    assert.equal(status.installedCount, INSTALLED_PACKAGE_COUNT);
    assert.equal(status.unavailableCount, 0);
    assert.equal(status.remoteCount, 0);
  });

  it("exposes installed packages and hides superseded or legacy ids", async () => {
    resetWbTemplateMarketplaceRegistry();
    await initializeWbTemplateMarketplace();

    const signal = await getTemplateMarketplaceListing("ai-startup-signal");
    assert.equal(signal?.availability, "installed");
    assert.equal(signal?.name, "Aura Signal");

    const corporate = await getTemplateMarketplaceListing("corporate-business");
    assert.equal(corporate?.availability, "installed");

    assert.equal(await getTemplateMarketplaceListing("modern-business"), null);
    assert.equal(await getTemplateMarketplaceListing("ti-luxury-noir"), null);
  });

  it("returns a complete catalog with usable media for each listing", async () => {
    resetWbTemplateMarketplaceRegistry();
    const catalog = await listTemplateMarketplaceCatalog();
    assert.equal(catalog.total, INSTALLED_PACKAGE_COUNT);
    assert.equal(catalog.listings.length, INSTALLED_PACKAGE_COUNT);

    for (const listing of catalog.listings) {
      assert.ok(listing.name.length > 0, `${listing.id} has no name`);
      assert.ok(listing.description.length > 0, `${listing.id} has no description`);
      assert.ok(
        listing.thumbnail.includes(listing.id),
        `${listing.id} has no thumbnail url`,
      );
      assert.ok(
        listing.preview.includes(listing.id),
        `${listing.id} has no preview url`,
      );
      assert.ok(listing.regionCount > 0, `${listing.id} has no regions`);
      assert.ok(listing.pageCount > 0, `${listing.id} has no pages`);
    }

    const search = await searchTemplateMarketplaceCatalog({ query: "signal" });
    assert.ok(search.total >= 1);

    const featured = await listFeaturedTemplateMarketplaceListings(10);
    assert.equal(featured.length, 0);
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

    assert.equal(filtered.length, 0);
    assert.equal(listings.length, 0);
    assert.equal(sorted.length, 0);
  });
});
