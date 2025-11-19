# ClaimClarity

A tiny, demo-friendly web app that shows customers a clear, empathetic view of their insurance claim on a single screen.

## Quick start

No build step required. You can open `index.html` directly, or run a simple static server for friendlier local testing:

```bash
# From the repo root
python -m http.server 3000
# then visit http://localhost:3000
```

## Demo claims

Use these sample claim numbers and last names to explore the Claim Clarity page:

| Claim number | Last name | Claim type | Current status |
| --- | --- | --- | --- |
| CLM-1024 | Garcia | Auto | Under Review |
| CLM-2388 | Lee | Home | Estimate Prepared |
| CLM-7781 | Patel | Auto | Payment Sent |

## What the app does

1. **Claim lookup** — enter a claim number and last name to load one of the seeded claims.
2. **Claim Clarity page** — shows a summary, visual timeline, plain-language explanation of the current step, what happens next, document needs, and a lightweight question box that stores messages in memory.
3. **Friendly defaults** — form is prefilled with the first claim so you can demo instantly.

## Tweaking the copy or data

All of the text, statuses, and sample claims live in `app.js`. Update the `claims` array or `statusExplainers` map to adjust the seeded data and messaging.
