# Curiohole Deployment Notes

## Recommended Path

Use Cloudflare as the long-term base:

1. Add `curiohole.com` to Cloudflare.
2. Change nameservers in Namecheap to the two nameservers Cloudflare provides.
3. Wait until Cloudflare shows the domain as Active.
4. Create a Cloudflare Pages project.
5. Upload the `dist` folder or connect a GitHub repository.
6. Bind `curiohole.com` and `www.curiohole.com` as custom domains.
7. After the site is live, submit `https://curiohole.com/sitemap.xml` to Google Search Console.

## Current Site Structure

- `/` - Curiohole game collection homepage
- `/ball-sort-puzzle/` - playable Ball Sort Puzzle game
- `/ball-sort-puzzle-solver.html` - solver intent page
- `/how-to-play-ball-sort-puzzle.html` - how-to intent page

## Deploy Folder

Deploy this folder:

```text
dist
```

Do not deploy `tmp` or `tools`.
