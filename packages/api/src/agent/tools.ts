import { and, desc, eq, gte, ilike, lte, or, sql } from 'drizzle-orm'
import { dealers, units, type Database, type Dealer, type UnitType, type Condition } from '@talosdealer/db'

export type AgentContext = {
  db: Database
  dealer: Dealer
}

type JSONSchema = Record<string, unknown>

export type ToolSpec = {
  name: string
  description: string
  input_schema: JSONSchema
  handler: (input: Record<string, unknown>, ctx: AgentContext) => Promise<unknown>
}

const UNIT_TYPES = ['boat', 'motorcycle', 'atv', 'utv', 'snowmobile', 'pwc', 'trailer', 'other'] as const
const CONDITIONS = ['new', 'used'] as const

function str(v: unknown): string | undefined {
  return typeof v === 'string' && v.trim() ? v.trim() : undefined
}

function int(v: unknown): number | undefined {
  if (typeof v === 'number' && Number.isFinite(v)) return Math.floor(v)
  if (typeof v === 'string' && v.trim() && !isNaN(Number(v))) return Math.floor(Number(v))
  return undefined
}

// ----- search_inventory -----

const searchInventory: ToolSpec = {
  name: 'search_inventory',
  description:
    "Search this dealer's current inventory. Returns up to 20 matching units with id, year, make, model, type, condition, price, stockNumber. Always call this before recommending specific units.",
  input_schema: {
    type: 'object',
    properties: {
      type: { type: 'string', enum: UNIT_TYPES, description: 'Vehicle category' },
      condition: { type: 'string', enum: CONDITIONS },
      make: { type: 'string', description: 'Exact make match (case-insensitive)' },
      minPrice: { type: 'integer' },
      maxPrice: { type: 'integer' },
      keyword: {
        type: 'string',
        description: 'Free-text match against make, model, or trim. Useful when the customer names a model.',
      },
      limit: { type: 'integer', description: 'Max results (default 10, cap 20)' },
    },
    additionalProperties: false,
  },
  handler: async (input, ctx) => {
    const type = str(input.type) as UnitType | undefined
    const condition = str(input.condition) as Condition | undefined
    const make = str(input.make)
    const minPrice = int(input.minPrice)
    const maxPrice = int(input.maxPrice)
    const keyword = str(input.keyword)
    const limit = Math.min(Math.max(int(input.limit) ?? 10, 1), 20)

    const where = [eq(units.dealerId, ctx.dealer.id)]
    if (type) where.push(eq(units.type, type))
    if (condition) where.push(eq(units.condition, condition))
    if (make) where.push(ilike(units.make, make))
    if (minPrice != null) where.push(gte(units.price, minPrice))
    if (maxPrice != null) where.push(lte(units.price, maxPrice))
    if (keyword) {
      const pat = `%${keyword}%`
      where.push(
        or(
          ilike(units.make, pat),
          ilike(units.model, pat),
          ilike(units.trim, pat),
        )!,
      )
    }

    const rows = await ctx.db
      .select({
        id: units.id,
        year: units.year,
        make: units.make,
        model: units.model,
        trim: units.trim,
        type: units.type,
        condition: units.condition,
        price: units.price,
        stockNumber: units.stockNumber,
        thumbnail: sql<string | null>`${units.photos}[1]`,
      })
      .from(units)
      .where(and(...where))
      .orderBy(desc(units.year))
      .limit(limit)

    return {
      count: rows.length,
      units: rows,
    }
  },
}

// ----- get_unit_details -----

const getUnitDetails: ToolSpec = {
  name: 'get_unit_details',
  description:
    'Get full specs, description, and photo URLs for a specific unit by id. Use when the customer wants to dig into one unit. The id must be a UUID returned from search_inventory.',
  input_schema: {
    type: 'object',
    required: ['unitId'],
    properties: {
      unitId: { type: 'string', description: 'UUID of the unit' },
    },
    additionalProperties: false,
  },
  handler: async (input, ctx) => {
    const unitId = str(input.unitId)
    if (!unitId) return { error: 'unitId is required' }
    const [row] = await ctx.db
      .select()
      .from(units)
      .where(and(eq(units.id, unitId), eq(units.dealerId, ctx.dealer.id)))
    if (!row) return { error: 'Unit not found in this dealer\'s inventory' }
    return {
      id: row.id,
      year: row.year,
      make: row.make,
      model: row.model,
      trim: row.trim,
      type: row.type,
      condition: row.condition,
      price: row.price,
      stockNumber: row.stockNumber,
      specs: row.specs,
      description: row.aiDescription,
      photoCount: row.photos.length,
      thumbnail: row.photos[0] ?? null,
    }
  },
}

// ----- get_dealer_info -----

const getDealerInfo: ToolSpec = {
  name: 'get_dealer_info',
  description:
    'Get the dealership\'s hours, address, phone, email, financing page URL, and any service/parts notes. Use when the customer asks about the store itself (hours, location, service department).',
  input_schema: {
    type: 'object',
    properties: {},
    additionalProperties: false,
  },
  handler: async (_input, ctx) => {
    const d = ctx.dealer
    return {
      name: d.name,
      address: d.address,
      city: d.city,
      state: d.state,
      zip: d.zip,
      phone: d.phone,
      email: d.email,
      hours: d.hours,
      financingUrl: d.financingUrl,
      hasServiceInfo: Boolean(d.serviceContent),
      hasPartsInfo: Boolean(d.partsContent),
    }
  },
}

// Look up by name for dispatch.
export const TOOL_SPECS: ToolSpec[] = [searchInventory, getUnitDetails, getDealerInfo]

export function findTool(name: string): ToolSpec | undefined {
  return TOOL_SPECS.find((t) => t.name === name)
}

export function toolDefinitionsForClaude() {
  return TOOL_SPECS.map((t) => ({
    name: t.name,
    description: t.description,
    input_schema: t.input_schema,
  }))
}
