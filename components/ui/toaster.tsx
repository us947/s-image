"use client"

import { useToast } from "@/hooks/use-toast"
import { Toast, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from "@/components/ui/toast"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(({ id, title, description, action, ...props }) => (
        <Toast
          key={id}
          {...props}
          className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-cyan-500"
        >
          <div className="grid gap-1">
            {title && <ToastTitle className="text-cyan-500">{title}</ToastTitle>}
            {description && <ToastDescription className="text-cyan-400">{description}</ToastDescription>}
          </div>
          {action}
          <ToastClose />
        </Toast>
      ))}
      <ToastViewport className="fixed top-0 left-1/2 -translate-x-1/2 z-[100] flex max-h-screen w-full flex-col p-4 md:max-w-[420px]" />
    </ToastProvider>
  )
}
