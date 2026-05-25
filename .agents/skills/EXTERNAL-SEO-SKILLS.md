# External SEO Skills

The repository mount for `.agents/skills` allows new files but blocks creating
new skill subdirectories in this environment.

Because of that, the requested upstream SEO skills were installed globally into
`~/.codex/skills` instead of repo-local subfolders:

- `seo-audit`
  Source: `https://www.skills.sh/coreyhaines31/marketingskills/seo-audit`
- `programmatic-seo`
  Source: `https://www.skills.sh/coreyhaines31/marketingskills/programmatic-seo`
- `seo`
  Source: `https://www.skills.sh/addyosmani/web-quality-skills/seo`
- `find-keywords`
  Source: `https://www.skills.sh/calm-north/seojuice-skills/find-keywords`

Requested Firecrawl SEO workflow:

- `firecrawl-seo-audit`
  Source: `https://www.skills.sh/firecrawl/firecrawl-workflows/firecrawl-seo-audit`

That Firecrawl item appears to be a workflow exposed through the Firecrawl CLI
rather than a standalone GitHub skill folder. Use the Firecrawl CLI workflow
surface for live crawling and rendered-page SEO audits when Firecrawl is
installed and authenticated.
