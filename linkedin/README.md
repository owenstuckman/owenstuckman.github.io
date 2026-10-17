# LinkedIn drop folder

Upload your LinkedIn **Positions.csv** here and the work-history timeline updates on its own.

1. On LinkedIn: **Settings → Data privacy → Get a copy of your data → Pick and choose → Positions**. The email with the download arrives in about 10 minutes.
2. Unzip it, then upload **only `Positions.csv`** to this folder. On GitHub: open this folder → **Add file → Upload files** (this works from your phone). Commit to `main`.
3. The **Import LinkedIn** action rewrites `src/jsons/experience.json`, deletes the CSV, commits, and the site redeploys. That takes about two minutes.

**Don't upload `Profile.csv` or the rest of the export.** This repo is public: anything committed stays in its history even after it's deleted, and those files can include your email, address, and birth date. `Positions.csv` only holds what your LinkedIn profile already shows.

Which projects light up for each job is set in [`src/jsons/experience-links.json`](../src/jsons/experience-links.json), matched by company and start date, so imports never lose those links. After an import, the action log lists any jobs with no projects linked yet.

To run it locally instead: `npm run import:linkedin -- path/to/Positions.csv`.
