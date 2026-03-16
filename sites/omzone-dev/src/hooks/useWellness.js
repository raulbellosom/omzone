import { useQuery } from '@tanstack/react-query'
import {
  getWellnessProducts,
  getWellnessPackages,
  getWellnessPackageById,
  getWellnessProductById,
  getClassExtras,
} from '@/services/appwrite/catalogService'

export function useWellnessProducts(options = {}) {
  return useQuery({
    queryKey: ['wellnessProducts', options],
    queryFn: () => getWellnessProducts(options),
  })
}

export function useWellnessPackages(options = {}) {
  return useQuery({
    queryKey: ['wellnessPackages', options],
    queryFn: () => getWellnessPackages(options),
  })
}

export function useWellnessPackageById(packageId) {
  return useQuery({
    queryKey: ['wellnessPackage', packageId],
    queryFn: () => getWellnessPackageById(packageId),
    enabled: !!packageId,
  })
}

export function useWellnessProductById(productId) {
  return useQuery({
    queryKey: ['wellnessProduct', productId],
    queryFn: () => getWellnessProductById(productId),
    enabled: !!productId,
  })
}

export function useClassExtras() {
  return useQuery({
    queryKey: ['classExtras'],
    queryFn: getClassExtras,
  })
}
