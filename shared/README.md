# shared/content

Plain ES module data shared by the frontend and backend. It has no dependencies.

- The **backend seed** writes this content into MongoDB, where admins edit it.
- The **frontend** bundles it as a fallback so every public page can be prerendered for search engines
  and still renders if the API is unreachable. After the page loads, live API data replaces it.

Edit here for the initial launch. After launch, edit content in the admin dashboard and redeploy
the frontend (or set `VERCEL_DEPLOY_HOOK_URL` so publishing triggers a rebuild automatically).
