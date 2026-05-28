async function loadProfile() {
  const res = await fetch("data/profile.json");
  if (!res.ok) throw new Error("profile.json not found");
  return res.json();
}

function linkButtons(links, keys) {
  const labels = {
    github: "GitHub",
    linkedin: "LinkedIn",
    surfit: "Surfit",
    portfolio: "Portfolio",
  };
  return keys
    .filter((k) => links[k])
    .map(
      (k) =>
        `<a href="${links[k]}" target="_blank" rel="noopener">${labels[k] || k}</a>`
    )
    .join("");
}

function render(p) {
  document.getElementById("hero-title").textContent = p.title;
  document.getElementById("hero-name").textContent = `${p.name} (${p.nameEn})`;
  document.getElementById("hero-tagline").textContent = p.tagline;
  document.getElementById("hero-links").innerHTML = linkButtons(p.links, [
    "github",
    "linkedin",
    "surfit",
  ]);

  document.getElementById("about-text").textContent = p.tagline;

  document.getElementById("education").innerHTML = p.education
    .map(
      (e) =>
        `<li><strong>${e.degree}</strong> — ${e.school}<span>${e.period} · ${e.note}</span></li>`
    )
    .join("");

  document.getElementById("experience").innerHTML = p.experience
    .map(
      (e) => `
      <div class="item">
        <div class="period">${e.period}</div>
        <div class="role">${e.role}</div>
        <div class="org">${e.org}</div>
        <p>${e.highlight}</p>
      </div>`
    )
    .join("");

  document.getElementById("projects").innerHTML = p.projects
    .map(
      (pr) => `
      <article class="card">
        <h3><a href="${pr.url}" target="_blank" rel="noopener">${pr.name}</a></h3>
        <div class="metric">${pr.metric || ""}</div>
        <div class="tags">${(pr.tags || []).map((t) => `<span>${t}</span>`).join("")}</div>
      </article>`
    )
    .join("");

  document.getElementById("awards").innerHTML = p.awards
    .map((a) => `<li>${a}</li>`)
    .join("");

  document.getElementById(
    "contact-email"
  ).innerHTML = `Email: <a href="mailto:${p.email}">${p.email}</a>`;
  document.getElementById("contact-links").innerHTML = linkButtons(p.links, [
    "github",
    "linkedin",
    "surfit",
  ]);

  document.getElementById("footer-copy").textContent =
    `© ${new Date().getFullYear()} ${p.nameEn}`;
  document.getElementById("footer-updated").textContent = p.updated || "";
}

loadProfile().then(render).catch((err) => {
  console.error(err);
  document.getElementById("hero-tagline").textContent =
    "Profile data failed to load. Check data/profile.json.";
});
