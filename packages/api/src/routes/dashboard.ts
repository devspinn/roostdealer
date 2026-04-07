import { Hono } from 'hono'
import { eq } from 'drizzle-orm'
import { dealers, units, user } from '@roostdealer/db'
import type { AppEnv } from '../app'
import { requireAuth } from '../middleware/auth'

const app = new Hono<AppEnv>()

// All dashboard routes require auth
app.use('*', requireAuth)

// GET /api/dashboard — get current user's dealer
app.get('/', async (c) => {
  const db = c.get('db')
  const currentUser = c.get('user')

  if (!currentUser.dealerId) {
    return c.json({ dealer: null })
  }

  const [dealer] = await db.select().from(dealers).where(eq(dealers.id, currentUser.dealerId))
  return c.json({ dealer: dealer ?? null })
})

// POST /api/dashboard/dealer — create dealer (onboarding)
app.post('/dealer', async (c) => {
  const db = c.get('db')
  const currentUser = c.get('user')

  if (currentUser.dealerId) {
    return c.json({ error: 'You already have a dealer' }, 400)
  }

  const body = await c.req.json()
  if (!body.name || !body.slug) {
    return c.json({ error: 'Name and slug are required' }, 400)
  }

  try {
    const [dealer] = await db.insert(dealers).values({
      name: body.name,
      slug: body.slug,
      phone: body.phone,
      email: body.email,
      address: body.address,
      city: body.city,
      state: body.state,
      zip: body.zip,
      hours: body.hours,
    }).returning()

    // Link user to dealer
    await db.update(user).set({ dealerId: dealer.id }).where(eq(user.id, currentUser.id))

    return c.json({ dealer }, 201)
  } catch (err: any) {
    if (err.message?.includes('unique') || err.code === '23505') {
      return c.json({ error: 'That slug is already taken' }, 409)
    }
    throw err
  }
})

// PUT /api/dashboard/dealer — update dealer info
app.put('/dealer', async (c) => {
  const db = c.get('db')
  const currentUser = c.get('user')

  if (!currentUser.dealerId) {
    return c.json({ error: 'No dealer linked' }, 404)
  }

  const body = await c.req.json()
  const [updated] = await db.update(dealers)
    .set({
      name: body.name,
      phone: body.phone,
      email: body.email,
      address: body.address,
      city: body.city,
      state: body.state,
      zip: body.zip,
      hours: body.hours,
      logo: body.logo,
      heroImage: body.heroImage,
      heroTitle: body.heroTitle,
      heroSubtitle: body.heroSubtitle,
    })
    .where(eq(dealers.id, currentUser.dealerId))
    .returning()

  return c.json({ dealer: updated })
})

// GET /api/dashboard/inventory — list user's dealer's units
app.get('/inventory', async (c) => {
  const db = c.get('db')
  const currentUser = c.get('user')

  if (!currentUser.dealerId) {
    return c.json({ error: 'No dealer linked' }, 404)
  }

  const result = await db.select().from(units)
    .where(eq(units.dealerId, currentUser.dealerId))
    .orderBy(units.createdAt)

  return c.json(result)
})

// POST /api/dashboard/inventory — add a unit
app.post('/inventory', async (c) => {
  const db = c.get('db')
  const currentUser = c.get('user')

  if (!currentUser.dealerId) {
    return c.json({ error: 'No dealer linked' }, 404)
  }

  const body = await c.req.json()
  const [unit] = await db.insert(units).values({
    dealerId: currentUser.dealerId,
    make: body.make,
    model: body.model,
    year: body.year,
    trim: body.trim,
    type: body.type ?? 'other',
    condition: body.condition ?? 'new',
    price: body.price,
    specs: body.specs ?? {},
    aiDescription: body.description ?? '',
    originalDescription: body.originalDescription,
    photos: body.photos ?? [],
    stockNumber: body.stockNumber,
  }).returning()

  return c.json({ unit }, 201)
})

// PUT /api/dashboard/inventory/:id — update a unit
app.put('/inventory/:id', async (c) => {
  const db = c.get('db')
  const currentUser = c.get('user')
  const id = c.req.param('id')

  if (!currentUser.dealerId) {
    return c.json({ error: 'No dealer linked' }, 404)
  }

  // Verify ownership
  const [existing] = await db.select({ dealerId: units.dealerId })
    .from(units).where(eq(units.id, id))
  if (!existing || existing.dealerId !== currentUser.dealerId) {
    return c.json({ error: 'Unit not found' }, 404)
  }

  const body = await c.req.json()
  const [updated] = await db.update(units).set({
    make: body.make,
    model: body.model,
    year: body.year,
    trim: body.trim,
    type: body.type,
    condition: body.condition,
    price: body.price,
    specs: body.specs,
    aiDescription: body.description,
    originalDescription: body.originalDescription,
    photos: body.photos,
    stockNumber: body.stockNumber,
  }).where(eq(units.id, id)).returning()

  return c.json({ unit: updated })
})

// DELETE /api/dashboard/inventory/:id — delete a unit
app.delete('/inventory/:id', async (c) => {
  const db = c.get('db')
  const currentUser = c.get('user')
  const id = c.req.param('id')

  if (!currentUser.dealerId) {
    return c.json({ error: 'No dealer linked' }, 404)
  }

  const [existing] = await db.select({ dealerId: units.dealerId })
    .from(units).where(eq(units.id, id))
  if (!existing || existing.dealerId !== currentUser.dealerId) {
    return c.json({ error: 'Unit not found' }, 404)
  }

  await db.delete(units).where(eq(units.id, id))
  return c.json({ success: true })
})

export default app
