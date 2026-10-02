# Removing the leaked Spotify token from git history

## Status (2026-10-02)

History was rewritten and force-pushed on 2026-10-02:

- `git filter-repo --sensitive-data-removal --invert-paths --path server/.cache` removed
  the token.
- A message callback also stripped a `Co-Authored-By` trailer from `01b48e8`.
- gitleaks reports no leaks across the full history, and `.gitleaksignore` is deleted.
- Every commit hash changed. Old → new: `92e6245` → `38856a5` (first changed commit),
  `4a0b100` → `fe1815b`, `01b48e8` → `8045d4a`, `fc5038b` → `679340f`.

**Old PR refs and cached views:** the original repository was then deleted and
recreated on 2026-10-02, and the cleaned history pushed fresh. The new repo has only
`refs/heads/main`. The old PR refs (#1, #2) and cached views went with the deleted
repo, so no GitHub Support ticket is needed.

Old clones still contain the token. Re-clone rather than pulling.

The steps below record how it was done.

## What leaked

`server/.cache` (spotipy's token cache) was committed in `92e6245` (initial commit) and
modified in `4a0b100`. It held a Spotify `access_token` and `refresh_token`. The file
was deleted in `01b48e8`, but both versions are still in history, and the repository
is public.

Done already: the app's access was revoked and the Client Secret rotated, so the token
is no longer usable. The steps below remove it from history. They follow GitHub's
guide, [Removing sensitive data from a repository](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository).

State when this was written: 0 forks; 2 closed PRs (#1, #2) whose history contains the file.

## Before you start

- Rewriting changes every commit hash from `92e6245` onward. Closed PR diffs will stop
  rendering. This cannot be undone once pushed.
- Push any local work first. The rewrite runs on a fresh clone, so unpushed commits
  would be left behind:

  ```bash
  git -C /path/to/your/working/clone push origin main
  ```

- Install `git-filter-repo` 2.47 or newer. The `--sensitive-data-removal` flag needs it.

  ```bash
  brew install git-filter-repo      # or: pip install --upgrade git-filter-repo
  git filter-repo --version
  ```

- If `main` has branch protection that blocks force-pushes, turn it off temporarily.

## Rewrite

```bash
git clone https://github.com/Dakuaisu/Sound-Sculptor.git ss-cleanup
cd ss-cleanup

git filter-repo --sensitive-data-removal --invert-paths --path server/.cache
```

Copy the `NOTE: First Changed Commit(s)` line from the output. GitHub Support asks for it.

## Verify before pushing

```bash
git log --all --oneline -- server/.cache          # must print nothing
grep '^refs/pull/.*/head$' .git/filter-repo/changed-refs   # PRs affected (expect #1, #2)

docker run --rm -v "$PWD":/repo ghcr.io/gitleaks/gitleaks:v8.30.1 \
  git /repo --no-banner --redact               # expect "no leaks found"
```

The gitleaks run above deliberately skips `.gitleaksignore`, so it proves the findings
are actually gone.

## Push

```bash
git remote -v                                   # if origin is missing:
# git remote add origin https://github.com/Dakuaisu/Sound-Sculptor.git
git push --force --mirror origin
```

Pushes to `refs/pull/*` will be rejected, because GitHub makes them read-only. That is
expected. Any other rejected ref means branch protection is still on.

## After pushing

1. Open a ticket at https://support.github.com. Include:
   - `Dakuaisu/Sound-Sculptor`
   - the number of affected PRs (2)
   - the "First Changed Commit(s)"

   Support can dereference the old PR refs, garbage-collect the server, and clear cached
   views. Until then, the old commits stay reachable through PR refs and by SHA.
2. Delete `.gitleaksignore`. Its fingerprints point at commits that no longer exist.
   Commit and push.
3. Re-enable branch protection.
4. Throw away every old clone, including the one you worked in, and re-clone. Running
   `git pull` then `git push` from an old clone would bring the token back.
