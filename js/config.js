/*
 * Edit this file first. It is the only place you need to change links.
 *
 *  githubUsername  your GitHub username
 *  siteRepo        the repository that hosts this website
 *  projectRepos    repository names for the projects on the site. Use "" to hide a project's GitHub link.
 *  formspreeId     the ID from your Formspree form (https://formspree.io), e.g. "xyzabcde".
 *                  Until you set it, the contact form opens the visitor's email app instead.
 */
window.SITE_CONFIG = (function () {
  var cfg = {
    githubUsername: "efea06",
    siteRepo: "portfolio",
    projectRepos: {
      padisave: "padisave",
      multivm: "enterprise-multi-vm-network"
    },
    formspreeId: "YOUR_FORM_ID",
    email: "efeaedu@gmail.com"
  };

  // Everything below is derived from the values above.
  cfg.githubUrl = "https://github.com/" + cfg.githubUsername;
  cfg.siteUrl = "https://" + cfg.githubUsername + ".github.io/" + cfg.siteRepo + "/";
  cfg.sourceUrl = cfg.githubUrl + "/" + cfg.siteRepo;
  cfg.formEndpoint = "https://formspree.io/f/" + cfg.formspreeId;
  cfg.repoUrl = function (name) { return cfg.githubUrl + "/" + name; };
  cfg.formConfigured = !/YOUR[-_]/.test(cfg.formspreeId);
  return cfg;
})();
