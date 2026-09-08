'use client'

import { type AuthState, signup } from '@/app/auth/actions'
import Link from 'next/link'
import { useActionState } from 'react'

export function SignupForm() {
  const [state, formAction, pending] = useActionState<AuthState, FormData>(
    signup,
    {}
  )

  if (state.ok) {
    return (
      <>
        <h1 className="text-2xl font-bold">Cuenta creada</h1>
        <p className="mt-4 text-zinc-600">{state.message}</p>
        <Link href="/login" className="mt-4 inline-block underline">
          Ir a iniciar sesión
        </Link>
      </>
    )
  }

  return (
    <>
      <h1 className="text-2xl font-bold">Crear cuenta</h1>
      <p className="mt-1 text-sm text-zinc-600">
        ¿Ya tenés cuenta?{" "}
        <Link href="/login" className="underline">
          Iniciá sesión
        </Link>
      </p>

      <form action={formAction} className="mt-6 flex flex-col gap-4">
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Email</span>
          <input
            type="email"
            name="email"
            required
            className="rounded-md border border-zinc-300 px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Contraseña</span>
          <input
            type="password"
            name="password"
            required
            minLength={6}
            className="rounded-md border border-zinc-300 px-3 py-2"
          />
        </label>
        {state.error ? (
          <p className="text-sm text-red-600">{state.error}</p>
        ) : null}
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-zinc-900 px-4 py-2 text-white hover:bg-zinc-700 disabled:opacity-50"
        >
          {pending ? 'Creando…' : 'Registrarme'}
        </button>
      </form>
    </>
  )
}
