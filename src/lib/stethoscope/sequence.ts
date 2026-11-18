// The chapter markers are ordinary fragment targets. The same links therefore
// use native scrolling, history, and keyboard navigation in both layouts.
export function startStudy(root: HTMLElement) {
  const shell = root.querySelector<HTMLElement>(".study-shell")!;
  const mast = document.querySelector<HTMLElement>(".mast")!;
  const stops = root.querySelector<HTMLElement>(".study-stops")!;
  const canvas = root.querySelector<HTMLCanvasElement>("[data-instrument]")!;
  const chapters = Array.from(
    root.querySelectorAll<HTMLElement>("[data-chapter]"),
  );
  const chapterIds = chapters.map((chapter) => chapter.id);
  const links = Array.from(
    root.querySelectorAll<HTMLAnchorElement>(".study-nav a"),
  );
  const next = root.querySelector<HTMLAnchorElement>(".study-next")!;
  const nextLabel = next.querySelector<HTMLElement>("[data-next-label]")!;
  const leader = root.querySelector<HTMLElement>(".study-leader")!;
  const figureNumber = root.querySelector<HTMLElement>("[data-figure-no]")!;
  const figureLabel = root.querySelector<HTMLElement>("[data-figure-label]")!;
  const motion = matchMedia(
    "(prefers-reduced-motion: no-preference) and (min-height: 651px), (prefers-reduced-motion: no-preference) and (min-width: 341px) and (min-height: 600px), (prefers-reduced-motion: no-preference) and (min-width: 721px) and (min-height: 525px)",
  );
  const last = chapters.length - 1;
  let generation = 0;
  let teardown: (() => void) | undefined;

  async function sync() {
    const version = ++generation;
    teardown?.();
    teardown = undefined;
    if (!motion.matches || !("WebGL2RenderingContext" in window)) return;

    try {
      // Reuse this context for the live scene. Blocked GPUs keep the static
      // chapters without downloading Three.js or the animation libraries.
      const context = canvas.getContext("webgl2", {
        alpha: true,
        antialias: true,
        powerPreference: "low-power",
      });
      if (!context || context.isContextLost()) return;
      const [{ gsap }, { ScrollTrigger }, { mountScene }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
        import("./scene"),
      ]);
      if (version !== generation) return;
      gsap.registerPlugin(ScrollTrigger);
      const scene = mountScene(canvas, context);
      const oldBottom = root.getBoundingClientRect().bottom;
      let active = -1;
      let timeline: gsap.core.Timeline | undefined;
      let observer: ResizeObserver | undefined;
      let resizeFrame = 0;
      const position = { progress: 0 };

      function disable(restoreReadingPosition = false) {
        const wasBelow =
          root.getBoundingClientRect().bottom <= mast.offsetHeight;
        const bottomBefore = root.getBoundingClientRect().bottom;
        timeline?.scrollTrigger?.kill();
        timeline?.kill();
        observer?.disconnect();
        cancelAnimationFrame(resizeFrame);
        canvas.removeEventListener("webglcontextlost", onContextLoss);
        scene.dispose();
        stops.replaceChildren();
        delete root.dataset.motion;
        document.documentElement.style.removeProperty("--study-mast");
        chapters.forEach((chapter, index) => {
          chapter.id = chapterIds[index];
          chapter.inert = false;
          chapter.style.removeProperty("opacity");
          chapter.style.removeProperty("transform");
          links[index].removeAttribute("aria-current");
        });
        next.hash = chapterIds[1];
        nextLabel.textContent = "Scroll to explore";
        figureNumber.textContent = "Fig. 01";
        figureLabel.textContent = chapters[0].dataset.figure!;
        if (wasBelow)
          window.scrollBy(
            0,
            root.getBoundingClientRect().bottom - bottomBefore,
          );
        else if (restoreReadingPosition && active > 0)
          chapters[active].scrollIntoView();
      }
      function onContextLoss(event: Event) {
        event.preventDefault();
        teardown?.();
        teardown = undefined;
      }
      teardown = () => disable(true);
      canvas.addEventListener("webglcontextlost", onContextLoss);

      function paint() {
        const phase = position.progress * last;
        const current = Math.round(phase);
        if (active !== current) {
          active = current;
          chapters.forEach((chapter, i) => {
            chapter.inert = i !== current;
            if (i === current) links[i].setAttribute("aria-current", "step");
            else links[i].removeAttribute("aria-current");
          });
          next.hash = chapterIds[current + 1] ?? "portfolio";
          nextLabel.textContent =
            current === last ? "Continue to portfolio" : "Scroll to explore";
          figureNumber.textContent = `Fig. ${String(current + 1).padStart(2, "0")}`;
          figureLabel.textContent = chapters[current].dataset.figure!;
        }
        chapters.forEach((chapter, i) => {
          const distance = Math.abs(phase - i);
          const opacity = Math.max(0, Math.min(1, (0.5 - distance) / 0.25));
          chapter.style.opacity = String(opacity);
          chapter.style.transform = `translateY(${(1 - opacity) * 9 * Math.sign(i - phase)}px)`;
        });
        try {
          scene.render(position.progress);
          if (window.innerWidth >= 960) {
            const rim = scene.projectDiaphragmRim();
            const t = position.progress;
            const presence = Math.max(
              0,
              Math.min(1, Math.max((0.34 - t) / 0.07, (t - 0.89) / 0.08)),
            );
            const clearance = Math.max(
              0,
              Math.min(1, (rim.x - 120) / 28, (rim.y - 40) / 20),
            );
            leader.style.transform = `translate(${rim.x - 118}px, ${rim.y - 35}px)`;
            leader.style.opacity = String(presence * clearance);
          }
        } catch {
          teardown?.();
          teardown = undefined;
        }
      }

      chapters.forEach((chapter, index) => {
        const marker = document.createElement("span");
        marker.style.top = `calc(var(--study-step) * ${index})`;
        marker.id = chapter.id;
        chapter.removeAttribute("id");
        stops.append(marker);
      });
      function measureMast() {
        const height = `${mast.offsetHeight}px`;
        root.style.setProperty("--mast-height", height);
        document.documentElement.style.setProperty("--study-mast", height);
      }
      measureMast();
      root.dataset.motion = "live";
      scene.resize();
      timeline = gsap.timeline({
        scrollTrigger: {
          trigger: root,
          start: () => `top top+=${mast.offsetHeight}`,
          end: () => `+=${root.offsetHeight - shell.offsetHeight}`,
          scrub: true,
          invalidateOnRefresh: true,
        },
      });
      timeline.to(position, {
        progress: 1,
        duration: 1,
        ease: "none",
        onUpdate: paint,
      });
      paint();
      if (!teardown) return;
      if (oldBottom <= mast.offsetHeight)
        window.scrollBy(0, root.getBoundingClientRect().bottom - oldBottom);
      else if (chapterIds.includes(location.hash.slice(1)))
        document.getElementById(location.hash.slice(1))?.scrollIntoView();

      observer = new ResizeObserver(() => {
        cancelAnimationFrame(resizeFrame);
        resizeFrame = requestAnimationFrame(() => {
          measureMast();
          scene.resize();
          ScrollTrigger.refresh();
          paint();
        });
      });
      observer.observe(canvas);
      observer.observe(mast);
    } catch {
      // A blocked context or a failed module download leaves the HTML study available.
      teardown?.();
      teardown = undefined;
    }
  }
  // Let the browser perform its normal fragment jump and history update.
  // Smooth only that navigation, leaving wheel, touch, and restoration native.
  root.addEventListener("click", (event) => {
    if (
      root.dataset.motion !== "live" ||
      !(event.target instanceof Element) ||
      !event.target.closest('a[href^="#"]')
    )
      return;
    document.documentElement.classList.add("study-fragment-navigation");
    requestAnimationFrame(() =>
      requestAnimationFrame(() =>
        document.documentElement.classList.remove("study-fragment-navigation"),
      ),
    );
  });
  motion.addEventListener("change", sync);
  window.addEventListener("pagehide", (event) => {
    if (!event.persisted) {
      ++generation;
      motion.removeEventListener("change", sync);
      teardown?.();
    }
  });
  void sync();
}
