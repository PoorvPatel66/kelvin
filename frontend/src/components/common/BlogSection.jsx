import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaArrowRight } from 'react-icons/fa';
import { blogs } from '../../data/blogs.js';
import OptimizedImage from './OptimizedImage.jsx';
import Skeleton from './Skeleton.jsx';
import { fetchBlogs } from '../../services/blogService.js';
import './BlogSection.css';

const cardReveal = {
  hidden: { opacity: 0, y: 28 },
  visible: (index) => ({ opacity: 1, y: 0, transition: { delay: index * 0.08, duration: 0.55 } })
};

function BlogSection() {
  const [items, setItems] = useState(blogs);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadBlogs() {
      try {
        const data = await fetchBlogs({ limit: 3 });
        const apiBlogs = data.blogs || data.data || [];

        if (isMounted && apiBlogs.length > 0) {
          setItems(apiBlogs);
        }
      } catch (error) {
        setItems(blogs);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadBlogs();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="blog-section section" id="blog">
      <div className="container-xl">
        <motion.div className="blog-section__header" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.4 }}>
          <div>
            <span className="eyebrow">Resources</span>
            <h2>Packaging insights for food businesses</h2>
          </div>
          <p>
            Practical articles for importers, distributors, restaurants, and brands looking
            for smarter eco-friendly packaging decisions.
          </p>
        </motion.div>

        {isLoading && <Skeleton rows={4} />}

        <div className="blog-grid">
          {items.map((blog, index) => {
            const category = blog.category?.name || blog.category || 'Packaging';
            const date = blog.publishedAt || blog.createdAt || blog.date;

            return (
            <motion.article className="blog-card" custom={index} variants={cardReveal} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} key={blog.id || blog.slug}>
              <Link to={`/blog/${blog.slug}`} className="blog-card__media" aria-label={`Read ${blog.title}`}>
                {blog.thumbnail ? (
                  <OptimizedImage src={blog.thumbnail} alt={blog.title} sizes="(max-width: 640px) 100vw, 33vw" />
                ) : (
                  <div className={`blog-card__visual blog-card__visual--${index}`}>
                    <span>{category}</span>
                  </div>
                )}
              </Link>

              <div className="blog-card__content">
                <span className="blog-card__category">{category}</span>
                <h3>
                  <Link to={`/blog/${blog.slug}`}>{blog.title}</Link>
                </h3>
                <p>{blog.excerpt}</p>
                <div className="blog-card__meta">
                  <span>{date ? new Date(date).toLocaleDateString() : 'Kelvin Insights'}</span>
                  <span>{blog.readTime || '3 min read'}</span>
                </div>
                <Link to={`/blog/${blog.slug}`} className="blog-card__link">
                  Read More
                  <FaArrowRight aria-hidden="true" />
                </Link>
              </div>
            </motion.article>
          );
          })}
        </div>
      </div>
    </section>
  );
}

export default BlogSection;
