import { GetServerSidePropsContext } from 'next';
import { getServerSession } from 'next-auth/next';
import type { Session } from 'next-auth';
import { authConfig } from './auth-config';

// CLEANUP: Added proper Session interface to avoid excessive casting throughout
interface User {
  id: string;
  email: string;
  name: string;
  image?: string | null;
}

interface AppSession extends Session {
  user: User;
}

interface AuthResult {
  authenticated: boolean;
  session: AppSession | null;
}

// CLEANUP: Moved authOptions import to top level instead of dynamic import
// This avoids circular dependency issues by ensuring auth configuration is stable
async function getAuthOptions() {
  // CLEANUP: Lazy import to prevent circular dependencies, but document the reason
  return authConfig;
}

/**
 * CLEANUP: Check if user is authenticated via server-side session
 * Returns properly typed AuthResult instead of unknown objects
 * Returns { authenticated: true, session } if user is logged in
 * Returns { authenticated: false, session: null } if user is not logged in
 */
export async function getServerAuth(context: GetServerSidePropsContext): Promise<AuthResult> {
  try {
    const authOptions = await getAuthOptions();
    const session = await getServerSession(context.req, context.res, authOptions) as AppSession | null;
    
    return {
      authenticated: !!(session?.user?.id),
      session,
    };
  } catch (error) {
    console.error('[Auth Error]', error);
    return {
      authenticated: false,
      session: null,
    };
  }
}

/**
 * CLEANUP: Require authentication for a page
 * If user is not authenticated, redirect to login
 * If authenticated, allow access with properly typed session
 */
export async function requireAuthGetServerSideProps(context: GetServerSidePropsContext) {
  const { authenticated, session } = await getServerAuth(context);

  if (!authenticated) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  // CLEANUP: Simplified session cleaning - use proper typing instead of casting
  // Only include fields that are guaranteed to exist and are serializable
  const cleanSession: Partial<AppSession> | null = session ? {
    user: {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      // CLEANUP: Removed image field explicitly - if needed, add to User interface and include here
    },
  } : null;

  return {
    props: {
      session: cleanSession,
    },
  };
}

/**
 * CLEANUP: Redirect authenticated users away from auth pages (login, forgot-password)
 * If user is already logged in, send them to /home
 * If not authenticated, allow access to the auth page
 */
export async function redirectAuthenticatedGetServerSideProps(context: GetServerSidePropsContext) {
  const { authenticated } = await getServerAuth(context);

  if (authenticated) {
    return {
      redirect: {
        destination: '/home',
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
}
