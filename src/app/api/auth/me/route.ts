import { NextResponse } from 'next/server';
import { getSession, isEmailAllowed } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getSession();

  if (!session || !isEmailAllowed(session.email)) {
    return NextResponse.json(
      { authenticated: false, user: null, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  return NextResponse.json({
    authenticated: true,
    user: {
      email: session.email,
      name: session.name,
      picture: session.picture,
      sub: session.sub,
    },
  });
}
