# Public launch checklist (terminal-playlist)

This app is already multi-user by design (per-browser OAuth cookies). Opening it to everyone is mostly **Spotify dashboard + hosting**, not an app rewrite.

Live URL: https://terminal-player.vercel.app  
Privacy policy: https://terminal-player.vercel.app/privacy  
Static fallback (no JS): https://terminal-player.vercel.app/privacy.html

---

## Requirements for every visitor

| Requirement | Why |
|---------------|-----|
| **Spotify Premium** | Web Playback SDK only streams full tracks for Premium accounts |
| **Sign in with Spotify** | Same `/login` flow; sessions are stored in httpOnly cookies |
| **Own/collaborative playlists** | Feb 2026 API only returns full track lists for playlists the user owns or collaborates on |

---

## Applying as an individual

Spotify’s **Extended Quota Mode** (unlimited users) is primarily aimed at organizations. As an individual you have three realistic paths:

### Path A — Extended quota (best for “anyone can use it”)

1. Open [Spotify Developer Dashboard](https://developer.spotify.com/dashboard) → your app.
2. Submit **Extended Quota** / partner application with:
   - Live app URL: `https://terminal-player.vercel.app`
   - Privacy policy: `https://terminal-player.vercel.app/privacy`
   - Redirect URI: `https://terminal-player.vercel.app/api/auth/callback`
   - Short description: beat-reactive terminal player using Web Playback SDK + Web API (read playlists, control playback).
   - Screenshot of `/player` after login.
3. In the form, state clearly: **non-commercial personal project**, no data sold, tokens only in session cookies, no server-side user database.
4. If rejected for “individual” policy: consider a sole proprietorship / small org entity for a future application, or use Path B while waiting.

### Path B — Development mode (up to 5 users, no approval)

1. Dashboard → app → **Users and Access** (allowlist).
2. Add each tester’s **Spotify account email** (max 5 total including you).
3. Each user visits `/api/auth/start?reauth=1` after being added.
4. App owner must keep **Spotify Premium** active.

### Path C — Custom domain (optional, after approval)

1. Add domain in Vercel → point DNS.
2. Add redirect URI: `https://<your-domain>/api/auth/callback`
3. Set Vercel env: `NEXT_PUBLIC_BASE_URL=https://<your-domain>`

---

## Spotify dashboard settings

**Redirect URIs** (must match exactly):

```
https://terminal-player.vercel.app/api/auth/callback
http://localhost:3000/api/auth/callback
```

**Scopes** (already in code — do not remove):

- `streaming`
- `user-read-playback-state`, `user-modify-playback-state`
- `user-read-currently-playing`
- `user-read-email`, `user-read-private`
- `playlist-read-private`, `playlist-read-collaborative`

---

## Vercel environment variables

| Variable | Production value |
|----------|------------------|
| `SPOTIFY_CLIENT_ID` | From Spotify dashboard |
| `SPOTIFY_CLIENT_SECRET` | From Spotify dashboard |
| `NEXTAUTH_SECRET` | Long random string (rotate if leaked) |
| `NEXT_PUBLIC_BASE_URL` | `https://terminal-player.vercel.app` |

Redeploy after any env change.

---

## What was changed in the repo for public launch

- `/privacy` — policy page for Spotify review
- User-facing errors no longer mention “allowlist” (public-friendly copy)
- Login notes: Premium required + link to privacy

No changes to matrix, player UI, keyboard shortcuts, or playback logic.

---

## After extended quota is approved

1. Remove testers from allowlist (optional; no longer required).
2. Announce URL; anyone with Premium can sign in.
3. Monitor Vercel logs for `403` on playlist/items endpoints.
4. Optional: add rate limiting on `/api/spotify/*` and `/api/auth/*`.

---

## Troubleshooting for new users

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| `(0)` tracks, empty queue | Dev mode, not on allowlist | Add email to allowlist or wait for extended quota |
| `403` on playlists | Old token or dev restriction | `/api/auth/start?reauth=1` |
| No audio | Not Premium or playback on another device | Premium + transfer to this browser tab |
| Login loop | Wrong redirect URI | Match dashboard URI to `NEXT_PUBLIC_BASE_URL` |

---

## Contact / updates

Update the contact line on `/privacy` before submitting to Spotify if you want a direct email listed.
