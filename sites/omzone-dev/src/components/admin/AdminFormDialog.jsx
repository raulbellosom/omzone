/**
 * AdminFormDialog — wrapper genérico de Dialog para formularios CRUD admin.
 *
 * Uso:
 *   <AdminFormDialog
 *     open={open}
 *     onOpenChange={setOpen}
 *     title="Nueva Clase"
 *     onSubmit={handleSubmit}
 *     isSubmitting={isPending}
 *   >
 *     <div>...campos del formulario...</div>
 *   </AdminFormDialog>
 */
import { useTranslation } from 'react-i18next'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

export default function AdminFormDialog({
  open,
  onOpenChange,
  title,
  onSubmit,
  isSubmitting = false,
  submitLabel,
  children,
}) {
  const { t } = useTranslation('common')

  function handleSubmit(e) {
    e.preventDefault()
    onSubmit(e)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {children}

          <div className="flex justify-end gap-2 pt-2 border-t border-sand">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              {t('actions.cancel', 'Cancelar')}
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? t('actions.saving', 'Guardando…')
                : (submitLabel ?? t('actions.save', 'Guardar'))}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
