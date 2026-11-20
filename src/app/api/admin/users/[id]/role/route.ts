import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

const VALID_ROLES = ['user', 'volunteer', 'admin'] as const;
type Role = (typeof VALID_ROLES)[number];

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Authenticate caller
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Authorise: caller must be an admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Parse and validate body
  let role: Role;
  try {
    const body = await request.json();
    role = body.role;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!VALID_ROLES.includes(role)) {
    return NextResponse.json(
      { error: `Role must be one of: ${VALID_ROLES.join(', ')}` },
      { status: 400 }
    );
  }

  // Apply update with admin client (bypasses RLS)
  const adminSupabase = createAdminClient();
  const { error: updateError } = await adminSupabase
    .from('profiles')
    .update({ role })
    .eq('id', params.id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
