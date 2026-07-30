(function () {
  "use strict";

  const registry = window.PortalWireframes;
  const slides = [...document.querySelectorAll(".slide")];
  const previous = document.querySelector("[data-previous]");
  const next = document.querySelector("[data-next]");
  const count = document.querySelector("[data-count]");
  const progress = document.querySelector("[data-progress]");
  const overview = document.querySelector("[data-overview]");
  const overviewToggle = document.querySelector("[data-overview-toggle]");
  let current = 0;

  document.querySelectorAll("[data-screen]").forEach((container) => {
    container.innerHTML = registry.renderScreen(container.dataset.screen);
  });

  slides.forEach((slide, index) => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "overview-card";
    card.innerHTML = `
      <strong>${index + 1}. ${slide.dataset.title}</strong>
      <span>${slide.dataset.phase}</span>`;
    card.addEventListener("click", () => {
      show(index);
      setOverview(false);
    });
    overview.append(card);
  });

  function show(index) {
    current = Math.max(0, Math.min(slides.length - 1, index));
    slides.forEach((slide, slideIndex) => {
      slide.setAttribute("aria-hidden", String(slideIndex !== current));
    });
    count.textContent = `${current + 1} / ${slides.length}`;
    progress.style.width = `${((current + 1) / slides.length) * 100}%`;
    previous.disabled = current === 0;
    next.disabled = current === slides.length - 1;
    document.title = `${slides[current].dataset.title} · Client Portal Storyboard`;
    history.replaceState(null, "", `#slide-${current + 1}`);
  }

  function setOverview(open) {
    overview.dataset.open = String(open);
    overviewToggle.setAttribute("aria-expanded", String(open));
  }

  previous.addEventListener("click", () => show(current - 1));
  next.addEventListener("click", () => show(current + 1));
  overviewToggle.addEventListener("click", () =>
    setOverview(overview.dataset.open !== "true"),
  );

  document.addEventListener("keydown", (event) => {
    if (event.key === "ArrowRight" || event.key === "PageDown") {
      show(current + 1);
    } else if (event.key === "ArrowLeft" || event.key === "PageUp") {
      show(current - 1);
    } else if (event.key.toLowerCase() === "o") {
      setOverview(overview.dataset.open !== "true");
    } else if (event.key === "Escape") {
      setOverview(false);
    }
  });

  const requested = Number(location.hash.replace("#slide-", "")) - 1;
  show(Number.isInteger(requested) && requested >= 0 ? requested : 0);
})();
