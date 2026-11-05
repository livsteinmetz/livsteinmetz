// One moving thing on the page: the painting at the center of the wall.
const video = document.querySelector('[data-hero-video]');
const button = document.querySelector('[data-pause]');
if (video && button) {
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const set = (playing) => {
    if (playing) video.play().catch(() => {});
    else video.pause();
    button.textContent = playing ? 'Pause' : 'Play';
  };
  set(!still);
  button.addEventListener('click', () => set(video.paused));
}
