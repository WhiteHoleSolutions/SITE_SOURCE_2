// Run after npm run build. Uses only a disposable SQLite database and localhost.
// Add --preview to keep the fixture server available for visual review.
const assert = require('node:assert/strict')
const { mkdtempSync, rmSync } = require('node:fs')
const { tmpdir } = require('node:os')
const path = require('node:path')
const { spawn, spawnSync } = require('node:child_process')
const { randomUUID } = require('node:crypto')
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const directory = mkdtempSync(path.join(tmpdir(), 'whs-workspace-test-'))
const databaseUrl = `file:${path.join(directory, 'test.db').replaceAll('\\', '/')}`
const secret = randomUUID()
const env = { ...process.env, DATABASE_URL: databaseUrl, JWT_SECRET: secret, REVOLUT_MERCHANT_SECRET_KEY: '', REVOLUT_MERCHANT_WEBHOOK_SECRET: '', REVOLUT_MERCHANT_API_URL: 'http://127.0.0.1:1' }
const prisma = new PrismaClient({ datasources: { db: { url: databaseUrl } } })
const origin = 'http://127.0.0.1:3101'
let server
let serverLog = ''
async function cleanup() {
  if (server && server.exitCode === null) {
    server.kill()
    await new Promise(resolve => server.once('exit', resolve))
  }
  await prisma.$disconnect()
  // This directory is created by this process, never supplied externally.
  rmSync(directory, { recursive: true, force: true })
}
async function main() {
  await prisma.$queryRawUnsafe('SELECT 1')
  await prisma.$disconnect()
  const migration = spawnSync(process.execPath, [require.resolve('prisma/build/index.js'), 'migrate', 'deploy'], { env, encoding: 'utf8', windowsHide: true })
  assert.equal(migration.status, 0, migration.stdout + migration.stderr)
  console.log('PASS: all migrations apply to a fresh database')
  const password = await bcrypt.hash('LocalPreview123!', 10)
  const admin = await prisma.user.create({ data: { email: 'preview@example.test', name: 'Studio preview', password, role: 'ADMIN' } })
  const client = await prisma.customer.create({ data: { user: { create: { name: 'Harbour Studio', email: 'harbour@example.test', password } } }, include: { user: true } })
  const other = await prisma.customer.create({ data: { user: { create: { name: 'Other client', email: 'other@example.test', password } } }, include: { user: true } })
  const token = user => `auth-token=${jwt.sign({ userId: user.id, email: user.email, role: user.role }, secret)}`
  const adminCookie = token(admin), clientCookie = token(client.user)
  server = spawn(process.execPath, [require.resolve('next/dist/bin/next'), 'start', '-p', '3101', '-H', '127.0.0.1'], { env, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] })
  server.stdout.on('data', data => { serverLog += data })
  server.stderr.on('data', data => { serverLog += data })
  let ready = false
  for (let attempt = 0; attempt < 60; attempt++) {
    if (server.exitCode !== null) throw new Error(serverLog)
    try { const response = await fetch(`${origin}/api/auth/me`); if (response.ok) { ready = true; break } } catch {}
    await new Promise(resolve => setTimeout(resolve, 250))
  }
  assert.ok(ready, `Preview server did not start: ${serverLog}`)
  async function request(route, method = 'GET', body, cookie = adminCookie, expected = 200) {
    const response = await fetch(origin + route, { method, headers: { 'Content-Type': 'application/json', Cookie: cookie }, body: body === undefined ? undefined : JSON.stringify(body) })
    const data = await response.json()
    assert.equal(response.status, expected, `${method} ${route}: ${JSON.stringify(data)}`)
    return data
  }
  await request('/api/jobs', 'GET', undefined, '', 401)
  await request('/api/jobs', 'POST', { title: 'Denied job' }, clientCookie, 401)
  let { job } = await request('/api/jobs', 'POST', { title: 'Spring campaign / photo & film', customerId: client.id, services: [{ serviceType: 'PHOTO_VIDEO' }], quotedAmount: 3300, clientGoal: 'Launch a cohesive campaign across web and social.' }, adminCookie, 201)
  assert.equal(job.tasks.length, 10)
  const route = `/api/jobs/${job.id}`, work = route + '/workspace'
  await request(work, 'GET', undefined, clientCookie, 401)
  await request(work, 'POST', { action: 'template' }, clientCookie, 401)
  await request(route, 'PATCH', { title: 'Denied edit' }, clientCookie, 401)
  await request(route, 'DELETE', undefined, clientCookie, 401)
  console.log('PASS: admin-only read/write/delete permissions and automatic checklist')
  const updated = await request(route, 'PATCH', { nextAction: 'Send the first edit for approval', nextActionDue: new Date().toISOString(), internalNotes: 'Private production notes', startDate: new Date().toISOString(), services: [{ serviceType: 'PHOTO_VIDEO', scope: 'Campaign stills and a 30-second film', status: 'IN_PROGRESS' }], status: 'IN_PRODUCTION' })
  assert.equal(updated.job.services[0].status, 'IN_PROGRESS')
  assert.equal((await request(route)).job.nextAction, 'Send the first edit for approval')
  await request(route, 'PATCH', { nextActionDue: 'invalid-date' }, adminCookie, 400)
  await request(work, 'POST', { action: 'toggleTask', taskId: job.tasks[0].id, completed: true })
  assert.equal((await request(route)).job.tasks.filter(task => task.completed).length, 1)
  const extra = await request(work, 'POST', { action: 'addTask', title: 'Export social crops', stage: 'COMPLETE' })
  await request(work, 'POST', { action: 'deleteTask', taskId: extra.job.tasks.find(task => task.title === 'Export social crops').id })
  assert.equal((await request(work, 'POST', { action: 'template' })).job.tasks.length, 10)
  const unrelated = await prisma.job.create({ data: { title: 'Other client website', jobNumber: 'TEST-OTHER', customerId: other.id, tasks: { create: { title: 'Protected task', stage: 'LEAD' } } }, include: { tasks: true } })
  await request(work, 'POST', { action: 'toggleTask', taskId: unrelated.tasks[0].id, completed: true })
  assert.equal((await prisma.jobTask.findUnique({ where: { id: unrelated.tasks[0].id } })).completed, false)
  console.log('PASS: saved details, date validation, checklist CRUD and cross-job isolation')
  const invoice = await prisma.invoice.create({ data: { invoiceNumber: 'TEST-INV', customerId: client.id, total: 3300, tax: 300, status: 'SENT' } })
  const wrongInvoice = await prisma.invoice.create({ data: { invoiceNumber: 'TEST-WRONG', customerId: other.id } })
  const expense = await prisma.expense.create({ data: { expenseNumber: 'TEST-EXP', description: 'Studio hire', category: 'Production', amount: 220, gstAmount: 20, expenseDate: new Date() } })
  const album = await prisma.album.create({ data: { title: 'Campaign selects', type: 'PRIVATE' } })
  const link = (kind, recordId, linked = true) => ({ action: 'link', kind, recordId, linked })
  await request(work, 'POST', link('invoice', wrongInvoice.id), adminCookie, 400)
  for (const [kind, record] of [['invoice', invoice], ['expense', expense], ['album', album]]) await request(work, 'POST', link(kind, record.id))
  await request(route, 'PATCH', { customerId: other.id }, adminCookie, 409)
  await request(`/api/jobs/${unrelated.id}/workspace`, 'POST', link('expense', expense.id), adminCookie, 400)
  assert.equal(await prisma.albumAccess.count({ where: { albumId: album.id } }), 0)
  assert.equal((await prisma.album.findUnique({ where: { id: album.id } })).type, 'PRIVATE')
  await request(work, 'POST', link('album', album.id, false))
  assert.ok(await prisma.album.findUnique({ where: { id: album.id } }))
  await request(work, 'POST', link('album', album.id))
  const clientJobs = (await request('/api/customers/jobs', 'GET', undefined, clientCookie)).jobs
  assert.equal(clientJobs.length, 1)
  for (const field of ['internalNotes', 'nextAction', 'tasks', 'expenses', 'albums']) assert.equal(field in clientJobs[0], false)
  await request(route, 'PATCH', { status: 'ARCHIVED' })
  assert.equal((await request('/api/customers/jobs', 'GET', undefined, clientCookie)).jobs.length, 0)
  await request(route, 'PATCH', { status: 'IN_PRODUCTION' })
  console.log('PASS: record linking, client matching, album privacy and client field isolation')
  const disposable = await prisma.job.create({ data: { title: 'Delete me', jobNumber: 'TEST-DELETE', services: { create: { serviceType: 'DRONE' } }, tasks: { create: { title: 'Temporary task', stage: 'LEAD' } }, albums: { create: { albumId: album.id } } } })
  const disposableInvoice = await prisma.invoice.create({ data: { invoiceNumber: 'TEST-KEEP', customerId: client.id, jobId: disposable.id } })
  const disposableExpense = await prisma.expense.create({ data: { expenseNumber: 'TEST-KEEP', description: 'Keep this receipt', category: 'Travel', amount: 30, expenseDate: new Date(), jobId: disposable.id } })
  const result = await request(`/api/jobs/${disposable.id}`, 'DELETE')
  assert.equal(result.unlinkedRecords, 2)
  assert.equal(await prisma.jobTask.count({ where: { jobId: disposable.id } }), 0)
  assert.equal(await prisma.jobService.count({ where: { jobId: disposable.id } }), 0)
  assert.equal(await prisma.jobAlbum.count({ where: { jobId: disposable.id } }), 0)
  assert.equal((await prisma.invoice.findUnique({ where: { id: disposableInvoice.id } })).jobId, null)
  assert.equal((await prisma.expense.findUnique({ where: { id: disposableExpense.id } })).jobId, null)
  assert.ok(await prisma.album.findUnique({ where: { id: album.id } }))
  assert.ok(await prisma.customer.findUnique({ where: { id: client.id } }))
  await request(`/api/jobs/${disposable.id}`, 'DELETE', undefined, adminCookie, 404)
  console.log('PASS: permanent job deletion preserves clients, albums, invoices and expenses')
  const publicAlbum = await prisma.album.create({ data: { title: 'Public test portfolio', type: 'PUBLIC', media: { create: { type: 'IMAGE', url: '/test-only-public-image.jpg' } } } })
  const publicAlbums = (await request('/api/albums/public', 'GET', undefined, '')).albums
  assert.deepEqual(publicAlbums.map(item => item.id), [publicAlbum.id])
  assert.equal(publicAlbums[0].media.length, 1)
  const home = await fetch(origin)
  assert.equal(home.status, 200)
  const html = await home.text()
  for (const text of ['Make it yours.', 'The capabilities', 'More showing.', 'Your next project']) assert.ok(html.includes(text), `Missing homepage content: ${text}`)
  await request('/api/inquiries', 'POST', { name: 'Preview Visitor', email: 'visitor@example.test', phone: '0400000000', message: 'A disposable test inquiry for the redesigned homepage.' }, '', 200)
  console.log('PASS: homepage rendering, public-only portfolio media and inquiry submission')
  if (process.argv.includes('--preview')) {
    console.log(`Preview: ${origin}/login — preview@example.test / LocalPreview123! (disposable local account)`)
    await new Promise(resolve => { process.once('SIGINT', resolve); process.once('SIGTERM', resolve) })
  }
}
main().catch(error => { console.error(error); process.exitCode = 1 }).finally(cleanup)
