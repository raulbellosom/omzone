import { Helmet } from 'react-helmet-async'

/**
 * StructuredData — inyecta JSON-LD en el <head> para indexación rica.
 *
 * Uso:
 *   <StructuredData data={buildClassStructuredData(cls, session)} />
 */
export default function StructuredData({ data }) {
  if (!data) return null

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(data, null, 2)}
      </script>
    </Helmet>
  )
}
