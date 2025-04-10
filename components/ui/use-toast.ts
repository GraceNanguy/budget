"use client"

import type React from "react"

import { useEffect, useState } from "react"

import type { ToastActionElement, ToastProps } from "@/components/ui/toast"

const TOAST_LIMIT = 5
const TOAST_REMOVE_DELAY = 1000000

type ToasterToast = ToastProps & {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
}

let count = 0

function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER
  return count.toString()
}

type ToastState = {
  toasts: ToasterToast[]
}

const toastState: ToastState = { toasts: [] }

const listeners: Array<(state: ToastState) => void> = []

function notify(listeners: Array<(state: ToastState) => void>) {
  listeners.forEach((listener) => {
    listener(toastState)
  })
}

export function toast({ ...props }: Omit<ToasterToast, "id">) {
  const id = genId()

  const update = (props: ToasterToast) => updateToast({ ...props, id })
  const dismiss = () => dismissToast(id)

  const toast: ToasterToast = {
    ...props,
    id,
  }

  toastState.toasts = [toast, ...toastState.toasts].slice(0, TOAST_LIMIT)
  notify(listeners)

  return {
    id,
    dismiss,
    update,
  }
}

function updateToast(toast: ToasterToast) {
  toastState.toasts = toastState.toasts.map((t) => (t.id === toast.id ? { ...t, ...toast } : t))
  notify(listeners)
}

function dismissToast(id: string) {
  toastState.toasts = toastState.toasts.map((t) =>
    t.id === id
      ? {
          ...t,
          open: false,
        }
      : t,
  )
  notify(listeners)
}

export function useToast() {
  const [state, setState] = useState<ToastState>(toastState)

  useEffect(() => {
    listeners.push(setState)
    return () => {
      const index = listeners.indexOf(setState)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }, [])

  return {
    ...state,
    toast,
    dismiss: dismissToast,
  }
}
