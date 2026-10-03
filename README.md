# naveenk-site

The published website for [naveenk.dev](https://naveenk.dev): Naveen Kandakumar's resume and project pages.

**Don't edit the site files here.** Everything in this repo except this README and `.gitignore` is generated and replaced automatically on every publish.

## How it works

The site lives in two repositories:

| Repo | Visibility | What it holds |
| --- | --- | --- |
| `navforu/naveen-resume` | Private | Draft content, the page generator, tests, and CI |
| `navforu/naveenk-site` (this repo) | Public | Only the built HTML, CSS, and JSON that GitHub Pages serves |

GitHub Pages on the free plan only serves public repositories. Splitting the repos keeps drafts and source private, and only the finished site is public.

### Publishing flow

1. Content is edited as JSON in the private repo. Drafts stay in a `content/` folder that is never published.
2. When a draft is ready, a sync script copies it into the publish folder and pre-renders static HTML pages.
3. A push to `main` in the private repo starts GitHub Actions, which:
   - runs the test suite and validates the content,
   - builds the pages,
   - and, only if both succeed, copies the build output into this repo and pushes a commit named `Publish site from naveen-resume@<commit>`.
4. That push triggers GitHub Pages (**Deploy from a branch**: `main` / root), which updates naveenk.dev within a few minutes.

CI pushes here using an SSH deploy key with write access to this repo only. The private half is stored as an Actions secret in the private repo.

## What's in here

| Path | Purpose |
| --- | --- |
| `index.html` | Resume page (`/`) |
| `projects/index.html` | Projects list (`/projects/`) |
| `projects/<slug>/index.html` | One page per project (`/projects/<slug>/`) |
| `css/styles.css` | Screen and print styles. The resume's **Save as PDF** button uses the print styles. |
| `favicon.svg` | Site icon |
| `content/*.json` | The published resume and project data the pages were built from |
| `js/render.js` | Renderer used by the private repo's local draft preview. The live pages don't load it. |
| `CNAME` | Keeps the custom domain `naveenk.dev` attached to GitHub Pages |
| `.nojekyll` | Tells GitHub Pages to serve files as-is, without a Jekyll build |

The pages are plain static HTML with no client-side framework, so they load fast and link previews (Open Graph tags) work.

## Domain

- `naveenk.dev` points to GitHub Pages (A records `185.199.108-111.153`).
- `www.naveenk.dev` is a CNAME to `navforu.github.io` and redirects to `naveenk.dev`.
- HTTPS is enforced, using a certificate managed by GitHub.

## Making a change

Make changes in the private `naveen-resume` repo, not here. If this repo is ever out of date, re-run the latest CI workflow in `naveen-resume`. If Pages didn't rebuild, start a build with:

```powershell
gh api -X POST repos/navforu/naveenk-site/pages/builds
```
