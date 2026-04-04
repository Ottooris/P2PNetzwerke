import { useEffect, useRef } from 'react';

/**
 * Adds the class "revealed" to each element inside the ref container
 * when it enters the viewport. Children with data-delay get a stagger.
 */
export default function useReveal(options = {}) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const targets = el.hasAttribute('data-reveal')
      ? [el]
      : Array.from(el.querySelectorAll('[data-reveal]'));

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: options.threshold ?? 0.15, rootMargin: options.rootMargin ?? '0px' }
    );

    targets.forEach((t) => observer.observe(t));
    return () => observer.disconnect();
  }, [options.threshold, options.rootMargin]);

  return ref;
}
