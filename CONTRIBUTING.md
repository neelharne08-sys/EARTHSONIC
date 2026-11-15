# Team Vertex: genuine four-member contribution plan

All registered team members must contribute real work from their own personal GitHub accounts. Do not fabricate timestamps, make dummy/empty commits, impersonate a teammate, or use bot/AI co-author names.

## Owner and roles

1. Shubhanshu Bambal — Research/team lead: improve `docs/SCIENCE.md`, add source URLs and objective acceptance criteria. Commit: `docs: verify NASA EIC science sources`.
2. Sahil Thute — Audio/data lead: test and improve `js/analysis.js` and `js/audio.js`, verify browser audio and mapped signals. Commit: `feat: refine live sonification mapping`.
3. Member 3 — Frontend: improve `styles.css` and `index.html`, refine mobile controls, add better data-source indicators. Commit: `feat: improve responsive EarthPulse interface`.
4. Member 4 — Presentation/QA: run real testing and record actual results in `docs/PITCH.md`, prepare presentation and improve source disclosures. Commit: `docs: add tested demo steps and pitch`.

## Recommended Git workflow

Repository owner invites all three teammates: Settings → Collaborators / Add people.

Each contributor:

```powershell
git clone https://github.com/SAH-21/nasa_spaceapps.git
cd nasa_spaceapps
git config user.name "Your Real Name"
git config user.email "YOUR_VERIFIED_GITHUB_EMAIL"
git checkout -b feature/YOURNAME-TASK
```

After making and testing their **own genuine** change:

```powershell
git status
git add PATH_TO_YOUR_CHANGED_FILE
git commit -m "Describe your real change"
git push -u origin feature/YOURNAME-TASK
```

Open GitHub → Pull requests → New pull request. The team lead reviews it, then merges into `main`. If the venue requires hourly pushes to `main`, aim to merge a tested contribution within each checkpoint. Confirm the exact rule with organizers.

After merging, all contributors run:

```powershell
git checkout main
git pull origin main
```

## Check authentic contribution history

```powershell
git shortlog -sne --all
git log --all --format="%h %an <%ae> %s" -n 25
```

On GitHub, view repository → Insights → Contributors. GitHub's statistics may take time to update; `git log` and merged pull requests give faster verification. Commit email must be associated with each contributor's GitHub account for attribution.

## Local event rules

The latest organizer message sets the first mandatory checkpoint at 4 PM November 14 and says the submission form comes November 15. The earlier handbook requires hourly genuine pushes, contribution from every member, and a final 2 PM November 15 freeze. Follow the current organizer instructions, maintain detailed history, and check the official NASA submission separately.
