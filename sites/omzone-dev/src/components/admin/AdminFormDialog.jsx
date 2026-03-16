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
import { useId } from 'react'
import { Button } from '@/components/ui/button'
import ReusableModal from '@/components/shared/ReusableModal'

export default function AdminFormDialog({
  open,
  onOpenChange,
  title,
  description,
  onSubmit,
  isSubmitting = false,
  submitLabel,
  headerVisible = true,
  footerVisible = true,
  footerIcon,
  footerTitle,
  footerSubtitle,
  showFooterCloseButton = false,
  closeLabel,
  contentClassName,
  bodyClassName,
  children,
}) {
  const { t } = useTranslation('common')
  const formId = useId()

  function handleSubmit(e) {
    e.preventDefault()
    onSubmit(e)
  }

  return (
    <ReusableModal
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      headerVisible={headerVisible}
      footerVisible={footerVisible}
      footerIcon={footerIcon}
      footerTitle={footerTitle}
      footerSubtitle={footerSubtitle}
      showFooterCloseButton={showFooterCloseButton}
      closeLabel={closeLabel ?? t('actions.close', 'Cerrar')}
      contentClassName={contentClassName}
      bodyClassName={bodyClassName}
      footerActions={(
        <>
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
            form={formId}
            size="sm"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? t('actions.saving', 'Guardando…')
              : (submitLabel ?? t('actions.save', 'Guardar'))}
          </Button>
        </>
      )}
    >
      <form id={formId} onSubmit={handleSubmit} className="space-y-4">
        {children}
      </form>
    </ReusableModal>
  )
}
