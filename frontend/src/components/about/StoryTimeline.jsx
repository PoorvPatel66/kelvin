import styles from './StoryTimeline.module.css';

function StoryTimeline() {
  return (
    <section className={styles.journeyImageSection} aria-label="Kelvin Eco Products Journey">
      <img
        src="/images/home/journy.png"
        alt="Kelvin Eco Products journey timeline from 2021 vision to current global growth."
        className={styles.journeyFullImage}
        loading="lazy"
        decoding="async"
      />
    </section>
  );
}

export default StoryTimeline;
