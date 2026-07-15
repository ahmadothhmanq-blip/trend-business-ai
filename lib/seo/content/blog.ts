/**
 * Blog content registry for SEO / sitemap. Empty until editorial posts ship.
 * Add published posts here — do not invent thin placeholder articles.
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
};

const BLOG_POSTS: BlogPostMeta[] = [];

export function getPublishedBlogPosts() {
  return BLOG_POSTS.filter((post) => post.status === "published");
}

export function getAllBlogPosts() {
  return BLOG_POSTS;
}
