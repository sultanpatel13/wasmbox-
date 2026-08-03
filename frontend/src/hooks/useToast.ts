import { toast, Toaster, type ToastT } from "sonner";

export function useToast() {
  return {
    success: (message: string, options?: ToastT) => toast.success(message, options),
    error: (message: string, options?: ToastT) => toast.error(message, options),
    warning: (message: string, options?: ToastT) => toast.warning(message, options),
    info: (message: string, options?: ToastT) => toast.info(message, options),
    dismiss: (id?: string | number) => toast.dismiss(id),
  };
}

export { Toaster };