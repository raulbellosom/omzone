import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/ui/badge'

const VARIANT_MAP = {
  beginner: 'success',
  intermediate: 'warning',
  advanced: 'danger',
  all_levels: 'default',
}

export default function DifficultyBadge({ difficulty, className }) {
  const { t } = useTranslation('common')
  if (!difficulty) return null
  return (
    <Badge variant={VARIANT_MAP[difficulty] ?? 'default'} className={className}>
      {t(`difficulty.${difficulty}`)}
    </Badge>
  )
}
