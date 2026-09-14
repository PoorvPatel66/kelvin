import { useEffect, useMemo, useState } from 'react';
import {
  LuCalendarDays,
  LuClock3,
  LuLeaf,
  LuTag
} from 'react-icons/lu';
import SEO from '../../components/seo/SEO.jsx';
import { blogCategories, blogs } from '../../data/blogs.js';
import { usePublishedPage } from '../../hooks/usePublishedPage.js';
import { fetchBlogs } from '../../services/blogService.js';
import { getCmsSection, getCmsSeo } from '../../utils/cmsPage.js';
import './BlogListPage.css';

const blogHeroImage = '/images/home/company.png';

function estimateReadTime(content) {
  const text = Array.isArray(content) ? content.join(' ') : String(content || '');
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.ceil(words / 220))} min read`;
}

function normalizeCmsBlog(blog) {
  return {
    ...blog,
    category: blog.category?.name || 'Packaging Insights',
    date: blog.publishedAt || blog.createdAt,
    readTime: blog.readTime || estimateReadTime(blog.content),
    thumbnail: blog.thumbnail || blogHeroImage
  };
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

function BlogMeta({ blog }) {
  return (
    <div className="blog-meta">
      <span>
        <LuCalendarDays aria-hidden="true" />
        {formatDate(blog.date)}
      </span>
      <span>
        <LuTag aria-hidden="true" />
        {blog.category}
      </span>
      <span>
        <LuClock3 aria-hidden="true" />
        {blog.readTime}
      </span>
    </div>
  );
}

function BlogListPage() {
  const cmsPage = usePublishedPage('blog');
  const hero = getCmsSection(cmsPage, 'hero', {
    eyebrow: 'Kelvin Eco Products Blog',
    heading: 'Packaging insights for growing food businesses.',
    description: 'Practical articles on eco-friendly packaging, paper cups, custom printing, export supply, and better packaging choices for B2B buyers.'
  });
  const seo = getCmsSeo(cmsPage, {
    title: 'Blog',
    description: 'Read practical packaging insights from Kelvin Eco Products for restaurants, distributors, importers, and food brands.',
    canonicalPath: '/blog'
  });
  const [activeCategory, setActiveCategory] = useState('All Articles');
  const [blogItems, setBlogItems] = useState(blogs);

  useEffect(() => {
    let isCurrent = true;

    fetchBlogs({ page: 1, limit: 100 })
      .then((response) => {
        if (isCurrent && Array.isArray(response?.blogs)) {
          setBlogItems(response.blogs.map(normalizeCmsBlog));
        }
      })
      .catch(() => {
        // Existing editorial content remains available if the API is temporarily offline.
      });

    return () => {
      isCurrent = false;
    };
  }, []);

  const allCategories = useMemo(() => {
    const cmsCategories = blogItems.map((blog) => blog.category).filter(Boolean);
    return ['All Articles', ...new Set([...blogCategories, ...cmsCategories])];
  }, [blogItems]);

  const filteredBlogs = useMemo(() => {
    return blogItems.filter((blog) => {
      return activeCategory === 'All Articles' || blog.category === activeCategory;
    });
  }, [activeCategory, blogItems]);

  const featuredBlog = filteredBlogs[0];
  const articleList = featuredBlog ? filteredBlogs.slice(1) : [];
  const hasFilters = activeCategory !== 'All Articles';

  return (
    <main className="blog-page">
      <SEO
        {...seo}
      />

      <section className="blog-hero" aria-labelledby="blog-title">
        <div className="container-xl blog-hero__inner">
          <div className="blog-hero__photo">
            <img
              src={blogHeroImage}
              alt="Kelvin Eco Products manufacturing facility"
              loading="eager"
            />
          </div>

          <div className="blog-hero__copy">
            <span className="eyebrow">
              <LuLeaf aria-hidden="true" />
              {hero.eyebrow}
            </span>
            <h1 id="blog-title">{hero.heading}</h1>
            <p>{hero.description}</p>

            <div className="blog-hero__stats" aria-label="Blog summary">
              <span>{blogItems.length} expert articles</span>
              <span>{new Set(blogItems.map((blog) => blog.category).filter(Boolean)).size} packaging topics</span>
              <span>B2B buyer guidance</span>
            </div>
          </div>
        </div>
      </section>

      <section className="blog-content section" aria-label="Blog articles">
        <div className="container-xl">
          <div className="blog-categories" aria-label="Blog categories">
            {allCategories.map((category) => (
              <button
                type="button"
                className={activeCategory === category ? 'is-active' : ''}
                onClick={() => setActiveCategory(category)}
                key={category}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="blog-results-head">
            <div>
              <span className="eyebrow">Latest Articles</span>
              <h2>{activeCategory === 'All Articles' ? 'Featured Blog Articles' : activeCategory}</h2>
            </div>
            {hasFilters ? (
              <button
                type="button"
                className="blog-filter-reset"
                onClick={() => {
                  setActiveCategory('All Articles');
                }}
              >
                Reset filters
              </button>
            ) : (
              <p>{filteredBlogs.length} article{filteredBlogs.length === 1 ? '' : 's'} available</p>
            )}
          </div>

          {filteredBlogs.length > 0 ? (
            <>
              <article className="blog-feature">
                <div className="blog-feature__media">
                  <img src={featuredBlog.thumbnail} alt={featuredBlog.title} loading="eager" />
                </div>
                <div className="blog-feature__content">
                  <span className="blog-card__category">Featured</span>
                  <h3>{featuredBlog.title}</h3>
                  <BlogMeta blog={featuredBlog} />
                  <p>{featuredBlog.excerpt}</p>
                </div>
              </article>

              {articleList.length > 0 ? (
                <div className="blog-grid">
                  {articleList.map((blog) => (
                    <article className="blog-card" key={blog.slug}>
                      <div className="blog-card__media">
                        <img src={blog.thumbnail} alt={blog.title} loading="lazy" />
                      </div>
                      <div className="blog-card__body">
                        <span className="blog-card__category">{blog.category}</span>
                        <h3>{blog.title}</h3>
                        <BlogMeta blog={blog} />
                        <p>{blog.excerpt}</p>
                      </div>
                    </article>
                  ))}
                </div>
              ) : null}
            </>
          ) : (
            <div className="blog-empty">
              <h2>No articles found</h2>
              <p>Try a different search term or select another category.</p>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  setActiveCategory('All Articles');
                }}
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

export default BlogListPage;
