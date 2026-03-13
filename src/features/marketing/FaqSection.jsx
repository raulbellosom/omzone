import { useTranslation } from 'react-i18next'
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion'

export default function FaqSection() {
  const { t } = useTranslation('landing')
  const items = t('faq.items', { returnObjects: true })

  return (
    <section
      aria-labelledby="faq-heading"
      className="bg-white py-20 md:py-28"
    >
      <div className="max-w-2xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2
            id="faq-heading"
            className="font-display text-3xl md:text-4xl text-charcoal font-semibold mb-4 text-balance"
          >
            {t('faq.title')}
          </h2>
          <p className="text-charcoal-muted">{t('faq.subtitle')}</p>
        </div>

        <Accordion type="single" collapsible className="w-full">
          {Array.isArray(items) && items.map((item, i) => (
            <AccordionItem key={i} value={`item-${i}`}>
              <AccordionTrigger className="text-left text-sm font-medium">
                {item.question}
              </AccordionTrigger>
              <AccordionContent>{item.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
