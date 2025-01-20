import { getPostsForSitemap } from "@/actions/post/get";
import { MAIN_USERNAME } from "@/lib/db";
import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const sitemap: MetadataRoute.Sitemap = [
    {
      url: `${process.env.BASE_URL}`,
      changeFrequency: "monthly",
      priority: 1,
      images: [
        "https://res.cloudinary.com/dvafoy3bz/image/upload/v1737010262/portfolio-2/ogl1u28yvjcuazduz1at.jpg",
      ],
    },
  ];

  const posts = await getPostsForSitemap(MAIN_USERNAME);
  const sitemapPosts: MetadataRoute.Sitemap = [...posts].map((post) => ({
    url: `${process.env.BASE_URL}/portfolios/${post.slug}`,
    changeFrequency: "always",
    images: [
      "https://res.cloudinary.com/dvafoy3bz/image/upload/v1737010262/portfolio-2/ogl1u28yvjcuazduz1at.jpg",
      post.thumbnail_image.img_url,
    ],
    priority: 0.8,
  }));

  if (sitemapPosts.length > 0) {
    sitemap.push(...sitemapPosts);
  }

  return sitemap;
}
