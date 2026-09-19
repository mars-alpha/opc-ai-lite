
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.14 });

document.querySelectorAll('[data-reveal]').forEach((el) => {
  el.classList.add('reveal');
  observer.observe(el);
});

const parallaxNodes = document.querySelectorAll('[data-parallax]');
const onScroll = () => {
  const y = window.scrollY;
  parallaxNodes.forEach((node) => {
    const depth = Number(node.dataset.parallax || 12);
    node.style.transform = `translateY(${y / depth}px)`;
  });
};
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();
