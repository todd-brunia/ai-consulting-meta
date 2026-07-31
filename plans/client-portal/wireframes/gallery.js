(function () {
  "use strict";

  const registry = window.PortalWireframes;
  const gallery = document.querySelector("[data-gallery]");
  const summary = document.querySelector("[data-results-summary]");
  const roleFilter = document.querySelector("#role-filter");
  const phaseFilter = document.querySelector("#phase-filter");
  const stateFilter = document.querySelector("#state-filter");
  const viewportButtons = document.querySelectorAll("[data-viewport-button]");

  function phaseLabel(phase) {
    const labels = {
      implemented: "Implemented",
      "phase-1": "Phase 1",
      "phase-2": "Phase 2",
      "phase-3": "Phase 3",
      "phase-4": "Phase 4",
      "phase-5": "Phase 5",
      "phase-6": "Phase 6",
    };
    return labels[phase] ?? phase;
  }

  function roleLabel(role) {
    return role === "both" ? "Client + staff" : role;
  }

  function card(screen) {
    const article = document.createElement("article");
    article.className = "wireframe-card";
    article.dataset.role = screen.role;
    article.dataset.phase = screen.phase;
    article.dataset.state = screen.state;
    article.innerHTML = `
      <header class="wireframe-card__header">
        <div>
          <p class="eyebrow">${phaseLabel(screen.phase)}</p>
          <h2>${screen.title}</h2>
          <p>${screen.description}</p>
        </div>
        <div class="tag-row" aria-label="Wireframe attributes">
          <span class="tag tag--${registry.statusClass(screen)}">${screen.status}</span>
          <span class="tag">${roleLabel(screen.role)}</span>
          <span class="tag">${screen.state}</span>
        </div>
      </header>
      <div class="wireframe-card__stage">${registry.renderScreen(screen.id)}</div>
      <footer class="wireframe-card__notes">
        <div><strong>Boundary</strong>${screen.boundary}</div>
        <div><strong>Intentionally deferred</strong>${screen.defer}</div>
      </footer>`;
    return article;
  }

  function matches(screen) {
    const role = roleFilter.value;
    const phase = phaseFilter.value;
    const state = stateFilter.value;
    const roleMatches =
      role === "all" || screen.role === role || screen.role === "both";
    return (
      roleMatches &&
      (phase === "all" || screen.phase === phase) &&
      (state === "all" || screen.state === state)
    );
  }

  function applyFilters() {
    let visible = 0;
    registry.screens.forEach((screen, index) => {
      const show = matches(screen);
      gallery.children[index].hidden = !show;
      if (show) visible += 1;
    });
    summary.textContent = `${visible} of ${registry.screens.length} wireframes shown.`;
  }

  registry.screens.forEach((screen) => gallery.append(card(screen)));
  [roleFilter, phaseFilter, stateFilter].forEach((filter) =>
    filter.addEventListener("change", applyFilters),
  );

  viewportButtons.forEach((button) => {
    button.addEventListener("click", () => {
      gallery.dataset.viewport = button.dataset.viewportButton;
      viewportButtons.forEach((candidate) =>
        candidate.setAttribute(
          "aria-pressed",
          String(candidate === button),
        ),
      );
    });
  });

  applyFilters();
})();
