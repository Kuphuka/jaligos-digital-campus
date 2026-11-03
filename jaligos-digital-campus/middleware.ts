import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // If there is no user, redirect to login
  if (
    !user &&
    !request.nextUrl.pathname.startsWith('/login') &&
    !request.nextUrl.pathname.startsWith('/register') &&
    request.nextUrl.pathname !== '/'
  ) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // If there is a user, check their role for specific routes
  if (user?.email) {
    const escapedEmail = user.email.toLowerCase().replace(/[\\%_]/g, "\\$&")
    const { data: idMatch } = await supabase
      .from('user_roles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle()
    const { data: emailMatch } = idMatch?.role
      ? { data: null }
      : await supabase
        .from('user_roles')
        .select('role')
        .ilike('email', escapedEmail)
        .maybeSingle()

    const role = idMatch?.role ?? emailMatch?.role

    // Protect Admin routes
    if (request.nextUrl.pathname.startsWith('/admin') && role !== 'admin') {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Protect Lecturer routes
    if (request.nextUrl.pathname.startsWith('/staff') && role !== 'lecturer' && role !== 'admin') {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Protect Student routes
    if (request.nextUrl.pathname.startsWith('/portal') && role !== 'student') {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}