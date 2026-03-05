import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY  // service role for server-side
)

export async function GET(request) {
  // Verify this is called from Vercel Cron (not public)
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { error } = await supabase.from('votes').delete().neq('id', 0)
  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json({ ok: true, message: `Votes reset at ${new Date().toISOString()}` })
}
