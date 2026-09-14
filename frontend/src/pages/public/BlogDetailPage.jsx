import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import { getBlogBySlug } from '../../data/blogs.js';
import Skeleton from '../../components/common/Skeleton.jsx';
import Breadcrumbs from '../../components/seo/Breadcrumbs.jsx';
import SEO from '../../components/seo/SEO.jsx';
import { fetchBlogBySlug } from '../../services/blogService.js';
import { blogSchema, breadcrumbSchema } from '../../seo/schema.js';
import './BlogDetailPage.css';

function BlogDetailPage() {
  const { slug } = useParams();
  const [blog, setBlog] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadBlog() {
      try {
        const apiBlog = await fetchBlogBySlug(slug);

        if (isMounted) {
          setBlog(apiBlog || getBlogBySlug(slug));
        }
      } catch (error) {
        if (isMounted) {
          setBlog(getBlogBySlug(slug));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadBlog();

    return () => {
      isMounted = false;
    };
  }, [slug]);

  if (isLoading) {
    return (
      <main className="blog-detail section">
        <SEO title="Blog Not Found" noindex />
        <div className="container-sm">
          <Skeleton rows={4} />
        </div>
      </main>
    );
  }

  if (!blog) {
    return (
      <main className="blog-detail section">
        <div className="container-sm">
          <Link to="/" className="blog-detail__back">
            <FaArrowLeft aria-hidden="true" />
            Back to Home
          </Link>
          <h1>Blog not found</h1>
          <p>The article you are looking for is not available.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="blog-detail">
      <SEO
        title={blog.seoTitle || blog.title}
        description={blog.seoDescription || blog.excerpt}
        image={blog.ogImage || blog.coverImage || blog.thumbnail}
        type="article"
        canonicalPath={blog.canonicalUrl || `/blog/${blog.slug}`}
        keywords={blog.seoKeywords || []}
        robots={blog.metaRobots}
        jsonLd={[
          blogSchema(blog),
          breadcrumbSchema([
            { name: 'Home', url: '/' },
            { name: 'Blog', url: '/blog' },
            { name: blog.title, url: `/blog/${blog.slug}` }
          ])
        ]}
      />
      <article>
        <header className="blog-detail__hero">
          <div className="container-sm">
            <Breadcrumbs
              items={[
                { name: 'Home', url: '/' },
                { name: 'Blog', url: '/blog' },
                { name: blog.title, url: `/blog/${blog.slug}` }
              ]}
            />
            <Link to="/blog" className="blog-detail__back">
              <FaArrowLeft aria-hidden="true" />
              Back to Blog
            </Link>
            <span className="blog-detail__category">{blog.category?.name || blog.category || 'Packaging'}</span>
            <h1>{blog.title}</h1>
            <p>{blog.excerpt}</p>
            <div className="blog-detail__meta">
              <span>{blog.publishedAt || blog.createdAt ? new Date(blog.publishedAt || blog.createdAt).toLocaleDateString() : blog.date}</span>
              <span>{blog.readTime || '3 min read'}</span>
            </div>
          </div>
        </header>

        <div className="blog-detail__body section">
          <div className="container-sm">
            {Array.isArray(blog.content) ? (
              blog.content.map((paragraph) => <p key={paragraph}>{paragraph}</p>)
            ) : (
              <div className="blog-detail__markdown">
                {String(blog.content || '').split('\n').map((paragraph) => (
                  <p key={paragraph}>{paragraph.replace(/^#+\s*/, '')}</p>
                ))}
              </div>
            )}

            <div className="blog-detail__cta">
              <h2>Need packaging for your business?</h2>
              <p>
                Send your product requirement and quantity to receive a tailored quotation
                from Kelvin Eco Products.
              </p>
              <Link to="/request-quote" className="btn btn-primary">
                Request Quote
              </Link>
            </div>
          </div>
        </div>
      </article>
    </main>
  );
}

export default BlogDetailPage;
