/**
 * Blog content registry for SEO / sitemap. Only publish unique, useful articles.
 */

export type BlogPostMeta = {
  slug: string;
  title: string;
  description: string;
  path: string;
  publishedAt: string;
  updatedAt?: string;
  image?: string;
  tags?: string[];
  status: "draft" | "published";
  body: string[];
};

const BLOG_POSTS: BlogPostMeta[] = [
  {
    slug: "ai-business-platform-vs-fragmented-tools",
    title: "Why an All-in-One AI Business Platform Beats Fragmented Tools",
    description:
      "How founders save time by replacing disconnected AI chats with one authenticated workspace for websites, brand, content and business intelligence.",
    path: "/blog/ai-business-platform-vs-fragmented-tools",
    publishedAt: "2026-07-01",
    updatedAt: "2026-07-15",
    image: "/images/ai/business-suite.png",
    tags: ["ai", "productivity", "platform"],
    status: "published",
    body: [
      "Most teams start with a pile of disconnected AI chats: one tab for website copy, another for logos, another for market research. The result is context loss, inconsistent brand language, and assets that never land in a private workspace.",
      "Trend Business AI is built as one platform across Create, Design, Content and Business. You describe a brief once, generate structured outputs, save them to your authenticated dashboard, and export when you are ready to execute.",
      "That architecture matters for SEO and operations alike. Public product pages map cleanly to real tools, while private generation stays behind authentication — so marketing surfaces stay indexable without exposing customer work.",
      "If you are evaluating AI tools for a startup or agency, prefer a workspace that stores history, supports exports, and covers the full journey from idea to launch assets — not a temporary chat transcript.",
    ],
  },
];

export function getPublishedBlogPosts() {
  return BLOG_POSTS.filter((post) => post.status === "published");
}

export function getAllBlogPosts() {
  return BLOG_POSTS;
}

export function getBlogPostBySlug(slug: string) {
  return getPublishedBlogPosts().find((post) => post.slug === slug) ?? null;
}
