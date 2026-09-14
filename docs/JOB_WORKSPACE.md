# Admin job workflow

Start in **Today** for follow-ups, overdue delivery dates, jobs without a next action, upcoming production, client reviews and payment follow-ups. **Pipeline** is the full job board with search, client filtering and an archive toggle.

Open a job to manage:

- **Brief & details:** client, goal, priority, production and delivery dates, location, quoted value, services and internal notes.
- **Checklist:** a ten-task studio template grouped into Plan, Schedule, Create, Review and Deliver, plus custom tasks. Existing jobs can opt into the template. Tasks do not change the client-visible status automatically.
- **Delivery:** links to existing albums. Linking does not publish an album or grant client access; manage permissions in Records → Albums.
- **Money:** links to existing invoices for the same client and unassigned expenses. AUD summary totals exclude draft and cancelled invoices. Recorded margin excludes recorded GST, but includes unpaid invoices and does not include labour or unrecorded costs; it is not an accounting profit report.
- **Next action:** a saved internal follow-up and date. Use Save job details (or Save changes at the top) for brief, scope and follow-up edits. Checklists, links and stage changes save immediately.

**Records** groups clients, albums, invoices, expenses, bills of sale and analytics. **Website** manages featured brands. Existing business information remains in **Settings**.

## Archive versus delete

Archive removes the job from the default pipeline and client portal, while keeping its information. Show archived jobs to reopen one.

The trash button on a pipeline card permanently removes the job, its service lines, checklist and album associations after confirmation. The client, original inquiry, albums/media, invoices and expenses remain. Financial records become unassigned rather than being deleted. No Revolut order is cancelled, refunded or otherwise changed.

Internal notes, next actions, checklists, job-album associations and expense figures are not added to the client-facing jobs API.

## Deploy and verify

The additive migration `20260914110000_job_workspace` must be deployed before the new API is used. It follows the existing jobs and brands migrations. Render's existing production startup runs `prisma migrate deploy`. Follow the usual database backup procedure before deployment and confirm migration success in Render logs.

Local verification:

```sh
npx prisma generate
npm run build
node scripts/test-job-workspace.cjs
```

The integration runner creates a temporary SQLite database, applies migrations, starts the built app on loopback port 3101 and tests permissions, persisted details, checklists, record linking, client privacy, archiving and deletion. It disables Revolut credentials and never uses the configured application database. It removes its temporary fixtures when finished. `--preview` keeps the disposable server available for visual checks until interrupted; the printed preview credentials are local test fixtures only.
