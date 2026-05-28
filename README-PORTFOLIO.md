# gggg8657.github.io — Portfolio site

- **Live:** https://gggg8657.github.io
- **Data:** `data/profile.json` (sanitized public profile)
- **Private source:** `../career-applications/` → `public-profile.md`, `master-profile.md`

## Update

```bash
# 1) Edit career-applications/scripts/sync_public_profile.py PROFILE dict
#    or data/profile.json directly
python /home/dongjukim/Documents/workspace/career-applications/scripts/sync_public_profile.py

# 2) Commit & push this repo
git add data/profile.json index.html assets/
git commit -m "docs: update portfolio profile"
git push
```

GitHub Pages: Settings → Pages → Deploy from branch **main** / root.
