// University portal preference, with migration of earlier local preferences.
try {
  if (!localStorage.getItem("yarmouk:portal-theme")) {
    for (const prefix of ["riwaq:", "bridgeway:"]) {
      const value = localStorage.getItem(prefix + "portal-theme");
      if (value) {
        localStorage.setItem("yarmouk:portal-theme", value);
        break;
      }
    }
  }
  document.documentElement.dataset.theme =
    localStorage.getItem("yarmouk:portal-theme") === "dark" ? "dark" : "light";
} catch {
  document.documentElement.dataset.theme = "light";
}
