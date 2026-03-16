import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default function ReusableModal({
  open,
  onOpenChange,
  title,
  description,
  children,
  headerVisible = true,
  footerVisible = true,
  footerIcon: FooterIcon,
  footerTitle,
  footerSubtitle,
  showFooterCloseButton = false,
  closeLabel = 'Cerrar',
  footerActions,
  contentClassName,
  bodyClassName,
  headerClassName,
  footerClassName,
}) {
  function handleClose() {
    onOpenChange?.(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          'max-w-xl p-0 max-h-[90vh] overflow-hidden',
          'flex flex-col',
          contentClassName
        )}
      >
        {headerVisible && (
          <DialogHeader className={cn('mb-0 border-b border-sand px-6 py-4 pr-12', headerClassName)}>
            {title ? <DialogTitle>{title}</DialogTitle> : null}
            {description ? <DialogDescription>{description}</DialogDescription> : null}
          </DialogHeader>
        )}

        <div className={cn('flex-1 overflow-y-auto px-6 py-4', bodyClassName)}>
          {children}
        </div>

        {footerVisible && (
          <div className={cn('shrink-0 border-t border-sand px-6 py-3', footerClassName)}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              {(FooterIcon || footerTitle || footerSubtitle || showFooterCloseButton) ? (
                <div className="flex min-w-0 items-center gap-3">
                  {FooterIcon ? (
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-warm-gray text-charcoal-muted">
                      <FooterIcon className="h-4 w-4" />
                    </div>
                  ) : null}
                  <div className="min-w-0">
                    {footerTitle ? <p className="truncate text-sm font-medium text-charcoal">{footerTitle}</p> : null}
                    {footerSubtitle ? <p className="truncate text-xs text-charcoal-muted">{footerSubtitle}</p> : null}
                  </div>
                  {showFooterCloseButton ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="ml-1"
                      onClick={handleClose}
                    >
                      {closeLabel}
                    </Button>
                  ) : null}
                </div>
              ) : (
                <div />
              )}

              <div className="flex items-center justify-end gap-2">
                {footerActions}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
