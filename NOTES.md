# Project notes: Sanity CMS for concrete.media

_Status as of 2026-10-05. This file holds the current status only; update it in place._

## Status

The CMS integration is **complete and in customer review**. Nothing has been released to the live site yet.

- Work branch: `feature/sanity-cms` (draft PR gavrielc/concrete-site#22, not merged)
- Demo site (rebuilds automatically on publish): https://feature-sanity-cms--lucky-dodol-392453.netlify.app
- Studio: https://concrete-media.sanity.studio (Sanity project `o458gxs0`, dataset `production`)
- Live site https://concrete.media still runs `main` and is unchanged.

## What was done

**Content in Sanity.** Every piece of changing content is edited in the Studio, and the site reads it at build time (`src/lib/cms.mjs`, see CLAUDE.md):

- Coverage: articles and podcasts (680 items migrated), with publications as a separate type (159 merged into 134).
- Clients (88), testimonials (6), team members (7) and open positions (2), all with drag-and-drop ordering and show/hide.
- The Homepage document: banner, section texts and images, 6 client logos and 4 coverage cards (chosen and ordered there), and SEO.
- Page text documents for Coverage, Clients, Team, Join Us (including the banner and "stand apart" cards) and Contact (email and offices/maps), each with SEO fields.

**Studio.** Concrete Media branding with Lucide icons. The menu has one folder per site page, in site-menu order. Also built:

- A Home dashboard with live stats, quick-add links and a "Needs attention" list.
- A Help tab with the editor guide (`studio/help/`; `npm run guide` builds a printable copy).
- "Fill in details from this link" on coverage, backed by `netlify/functions/link-info`. It reads article metadata or does an Apple Podcasts lookup.
- A duplicate-link warning, and a "View on website" document action.

**Site fixes (on the branch).** These fixes come from the review report given to the customer:

- 100vw horizontal overflow, and mobile overflow on Contact and Join Us.
- The testimonials carousel dot count, plus alt texts and the map title.
- The podcast label icon.
- Clean meta descriptions, and a Contact description.
- Podcast artwork moved into Sanity and served at display size.
- 45 unused images (89 MB) removed from `public/`.

**Operations**

- Weekly content backup: `.github/workflows/sanity-backup.yml` with `scripts/backup-sanity.mjs`, so no secrets are needed because the dataset is public. Artifacts are kept for 90 days.
- One-time migration scripts in `studio/migration/` (already run; kept for reference).

## Decisions

- **Sanity** as the CMS. Its content model is in `studio/schemaTypes/`.
- **Astro stays at 3.6.5** for now. Upgrading to Astro 5 is recommended later.
- **Static builds with full rebuilds** on publish (about a minute). On-demand/ISR rendering was considered and not needed for this site.
- **No CMS-driven content in code.** The menu, footer, logo SVG and button link targets remain in code.
- **The live site is never changed until the customer approves.** All work and testing stays on the branch or the demo site.
- **Row lists, not card galleries,** for clients and testimonials. A drag-and-drop card gallery was tried and removed because it was unreliable inside the Studio.
- **Homepage coverage cards are an ordered list in the Homepage document.** This replaces the per-article "Show on homepage" toggle.
- **Google Analytics stats in the Studio:** the customer declined them.

## What's left

**Customer**

- [ ] Review the Studio and the demo site, and send corrections or approval.
- [ ] Content items from the review report:
  - Complete or delete the 2 untitled podcasts.
  - Add artwork to one podcast.
  - Review the Contact SEO description.
  - Shorten the SEO titles.
  - Delete the duplicate ENR article.
- [ ] Confirm the Sanity plan moves to Free after the Growth trial, with no charge.

**Launch checklist (only after customer approval)**

1. In Sanity → API → Webhooks:
   - Delete "Rebuild NEW site preview (temporary, until launch)".
   - Enable "Rebuild website on Netlify".
   - Set the enabled webhook's filter to `_type in ["coverage", "publication", "client", "teamMember", "jobPosition", "testimonial", "homepage", "page"]`.
2. Set `SITE_URL` in `studio/siteUrl.js` to `https://concrete.media/`, then run `npm run deploy` in `studio/`.
3. Mark PR #22 ready for review. The repo owner approves and merges it to `main`, and Netlify publishes it.
4. After the deploy, check every page on concrete.media and test publishing a change from the Studio.
5. Optionally, turn Netlify branch deploys back to "production branch only" and delete the temporary build hook.
6. Confirm that the weekly backup workflow is listed in GitHub Actions. It only runs from the default branch.
