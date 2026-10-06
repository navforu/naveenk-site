(function () {
function escapeHtml(value) {
  return String(value == null ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function joinNonEmpty(parts, separator) {
  return parts.filter(Boolean).join(separator);
}

function draftBanner(data) {
  if (!data || !data.draft) {
    return "";
  }
  return (
    '<div class="draft-banner">' +
    escapeHtml(data.draftNote || "Draft content. Replace before publishing.") +
    "</div>"
  );
}

function renderResume(data) {
  if (!data || typeof data !== "object") {
    throw new Error("resume data must be an object");
  }

  var contact = data.contact || {};
  var experience = (data.experience || [])
    .map(function (job) {
      var dates = joinNonEmpty([job.start, job.end], " – ");
      var highlights = (job.highlights || [])
        .map(function (item) {
          return "<li>" + escapeHtml(item) + "</li>";
        })
        .join("");
      return (
        '<article class="job">' +
        '<div class="job-header">' +
        "<div><h3>" +
        escapeHtml(job.title) +
        '</h3><div class="meta">' +
        escapeHtml(joinNonEmpty([job.company, job.location], " · ")) +
        "</div></div>" +
        (dates ? '<div class="meta">' + escapeHtml(dates) + "</div>" : "") +
        "</div>" +
        (highlights ? "<ul>" + highlights + "</ul>" : "") +
        "</article>"
      );
    })
    .join("");

  var education = (data.education || [])
    .map(function (school) {
      var dates = joinNonEmpty([school.start, school.end], " – ");
      return (
        '<article class="school">' +
        '<div class="school-header">' +
        "<div><h3>" +
        escapeHtml(school.degree) +
        '</h3><div class="meta">' +
        escapeHtml(school.school) +
        "</div></div>" +
        (dates ? '<div class="meta">' + escapeHtml(dates) + "</div>" : "") +
        "</div></article>"
      );
    })
    .join("");

  var skills = (data.skills || [])
    .map(function (skill) {
      return "<li>" + escapeHtml(skill) + "</li>";
    })
    .join("");

  var links = [];
  if (contact.website) {
    links.push(
      '<a href="' +
        escapeHtml(contact.website) +
        '"><span class="screen-only">' +
        escapeHtml(contact.website.replace(/^https?:\/\//, "")) +
        '</span><span class="print-only">Website: ' +
        escapeHtml(contact.website) +
        "</span></a>"
    );
  }
  if (contact.linkedin) {
    links.push(
      '<a href="' +
        escapeHtml(contact.linkedin) +
        '" data-print="' +
        escapeHtml(contact.linkedin) +
        '">LinkedIn</a>'
    );
  }
  if (contact.email) {
    links.push(
      '<a href="mailto:' +
        escapeHtml(contact.email) +
        '" data-print="' +
        escapeHtml(contact.email) +
        '">Email</a>'
    );
  }

  return (
    draftBanner(data) +
    '<article class="card">' +
    "<h1>" +
    escapeHtml(data.name) +
    "</h1>" +
    (data.headline
      ? '<p class="headline">' + escapeHtml(data.headline) + "</p>"
      : "") +
    (data.summary
      ? '<p class="summary">' + escapeHtml(data.summary) + "</p>"
      : "") +
    (links.length ? '<div class="contact">' + links.join("") + "</div>" : "") +
    (experience ? "<h2>Experience</h2>" + experience : "") +
    (education ? "<h2>Education</h2>" + education : "") +
    (skills ? '<h2>Skills</h2><ul class="skills">' + skills + "</ul>" : "") +
    "</article>"
  );
}

function projectTags(project) {
  if (!project.tags || !project.tags.length) {
    return "";
  }
  return (
    '<ul class="tags">' +
    project.tags
      .map(function (tag) {
        return "<li>" + escapeHtml(tag) + "</li>";
      })
      .join("") +
    "</ul>"
  );
}

function projectCard(project, detailHref) {
  return (
    '<article class="project">' +
    '<div class="project-header">' +
    "<h3><a href=\"" +
    escapeHtml(detailHref ? detailHref(project.slug) : project.url) +
    '">' +
    escapeHtml(project.title) +
    "</a></h3>" +
    "</div>" +
    (project.description
      ? "<p>" + escapeHtml(project.description) + "</p>"
      : "") +
    projectTags(project) +
    "</article>"
  );
}

function projectDetail(project) {
  return (
    '<article class="project-detail">' +
    "<h1>" +
    escapeHtml(project.title) +
    "</h1>" +
    (project.description
      ? '<p class="summary">' + escapeHtml(project.description) + "</p>"
      : "") +
    projectTags(project) +
    '<p><a class="visit-link" href="' +
    escapeHtml(project.url) +
    '">Visit project</a></p>' +
    "</article>"
  );
}

/**
 * options.listHref: link back to the project list.
 * options.detailHref(slug): link from the list to one project.
 */
function renderProjects(data, selectedSlug, options) {
  if (!data || typeof data !== "object") {
    throw new Error("projects data must be an object");
  }

  var opts = options || {};
  var listHref = opts.listHref || "projects.html";
  var detailHref =
    opts.detailHref ||
    function (slug) {
      return "projects.html?project=" + encodeURIComponent(slug);
    };
  var backLink =
    '<a class="back-link" href="' + escapeHtml(listHref) + '">Back to projects</a>';

  var projects = data.projects || [];
  var selected = selectedSlug
    ? projects.filter(function (project) {
        return project.slug === selectedSlug;
      })[0]
    : null;

  if (selectedSlug && !selected) {
    return (
      draftBanner(data) +
      '<article class="card"><p class="error">No project found for "' +
      escapeHtml(selectedSlug) +
      '".</p><p>' +
      backLink +
      "</p></article>"
    );
  }

  if (selected) {
    return (
      draftBanner(data) +
      '<article class="card">' +
      backLink +
      projectDetail(selected) +
      "</article>"
    );
  }

  var list = projects
    .map(function (project) {
      return projectCard(project, detailHref);
    })
    .join("");
  return (
    draftBanner(data) +
    '<article class="card">' +
    "<h1>Projects</h1>" +
    (data.intro ? '<p class="intro">' + escapeHtml(data.intro) + "</p>" : "") +
    list +
    "</article>"
  );
}

function isDraftView(pathname, search) {
  var params = new URLSearchParams(search || "");
  var path = String(pathname || "").replace(/\\/g, "/");
  return params.get("source") === "draft" || /\/content(\/|$)/.test(path);
}

function contentUrls(fileName, options) {
  var opts = options || {};
  var bust = "t=" + (opts.now != null ? opts.now : Date.now());
  if (opts.draftView) {
    return [
      "./" + fileName + "?" + bust,
      "../content/" + fileName + "?" + bust
    ];
  }
  return [
    "./content/" + fileName + "?" + bust,
    "https://raw.githubusercontent.com/navforu/naveen-resume/main/docs/content/" +
      fileName
  ];
}


  async function fetchFirst(urls) {
    var lastError = new Error("No URLs to fetch");
    for (var i = 0; i < urls.length; i += 1) {
      try {
        var response = await fetch(urls[i], { cache: "no-cache" });
        if (response.ok) {
          return response.json();
        }
        lastError = new Error("HTTP " + response.status + " for " + urls[i]);
      } catch (error) {
        lastError = error;
      }
    }
    throw lastError;
  }

  function showError(root, message) {
    root.innerHTML = '<p class="error">' + escapeHtml(message) + "</p>";
  }

  window.NaveenResume = {
    escapeHtml: escapeHtml,
    renderResume: renderResume,
    renderProjects: renderProjects,
    async renderResumePage(root) {
      try {
        var draftView = isDraftView(window.location.pathname, window.location.search);
        var data = await fetchFirst(contentUrls("resume.json", { draftView: draftView }));
        root.innerHTML = renderResume(data);
      } catch (error) {
        showError(root, "Could not load resume.json.");
        console.error(error);
      }
    },
    async renderProjectsPage(root) {
      try {
        var params = new URLSearchParams(window.location.search);
        var draftView = isDraftView(window.location.pathname, window.location.search);
        var data = await fetchFirst(contentUrls("projects.json", { draftView: draftView }));
        root.innerHTML = renderProjects(data, params.get("project"));
        document.title = params.get("project")
          ? "Draft project — Naveen Kandakumar"
          : "Draft projects — Naveen Kandakumar";
      } catch (error) {
        showError(root, "Could not load projects.json.");
        console.error(error);
      }
    }
  };
})();
