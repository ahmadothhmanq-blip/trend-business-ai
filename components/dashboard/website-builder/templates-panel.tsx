"use client";



import {

  WbTemplateMarketplaceCatalog,

} from "@/components/dashboard/template-marketplace/wb-template-marketplace-catalog";

import {

  type WebsiteStructureTemplateChoice,

} from "@/lib/website/builder/template-catalog";



export type { WebsiteStructureTemplateChoice };



export function TemplatesPanel(props?: {

  selectedId?: string | null;

  disabled?: boolean;

  onSelect?: (choice: WebsiteStructureTemplateChoice) => void;

}) {

  return (

    <WbTemplateMarketplaceCatalog

      compact={false}

      showHeader

      showFilters

      showFeaturedSection={false}

      selectedId={props?.selectedId}

      disabled={props?.disabled}

      onSelect={props?.onSelect}

    />

  );

}



export function TemplatesRail(props?: {

  selectedId?: string | null;

  disabled?: boolean;

  onSelect?: (choice: WebsiteStructureTemplateChoice) => void;

}) {

  return (

    <WbTemplateMarketplaceCatalog

      compact

      showFilters={false}

      showFeaturedSection={false}

      selectedId={props?.selectedId}

      disabled={props?.disabled}

      onSelect={props?.onSelect}

    />

  );

}

