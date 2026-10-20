/* Homepage summaries are public; opportunity details and applications require login. */
UIMS.ready
  .then((U) => {
    const escape = (value) =>
      String(value ?? "").replace(
        /[&<>"']/g,
        (c) =>
          ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;",
          })[c],
      );
    const container = document.querySelector("#openings .cards");
    if (container)
      container.innerHTML = U.all("opportunities")
        .filter((o) => o.status === "Open")
        .slice(0, 3)
        .map(
          (o) =>
            `<article class="card card--job"><div class="job__top"><span class="co">${escape(
              U.db.companies[o.companyId].name
                .split(" ")
                .map((x) => x[0])
                .join(""),
            )}</span><span class="result__who"><strong>${escape(U.db.companies[o.companyId].name)}</strong><small>${escape(o.location)}, Jordan</small></span><span class="badge badge--soft">Open</span></div><h3>${escape(o.title)}</h3><p>${o.majorIds.map((id) => escape(U.db.university.majors[id].name)).join(" · ")}</p><div class="job__foot"><span>${o.seats} seats</span><a class="btn btn--primary btn--xs" href="../login/login.html">Log in for details →</a></div></article>`,
        )
        .join("");
  })
  .catch(() => {});
