import { useQuery } from '@tanstack/react-query'
import {
  getClasses,
  getClassBySlug,
  getSessionsByClass,
  getSessionById,
  getInstructors,
  getClassTypes,
  getAllSessions,
} from '@/services/appwrite/catalogService'

export function useClasses(options = {}) {
  return useQuery({
    queryKey: ['classes', options],
    queryFn: () => getClasses(options),
  })
}

export function useClassBySlug(slug) {
  return useQuery({
    queryKey: ['class', slug],
    queryFn: () => getClassBySlug(slug),
    enabled: !!slug,
  })
}

export function useSessionById(sessionId) {
  return useQuery({
    queryKey: ['session', sessionId],
    queryFn: () => getSessionById(sessionId),
    enabled: !!sessionId,
  })
}

export function useSessionsByClass(classId) {
  return useQuery({
    queryKey: ['sessions', classId],
    queryFn: () => getSessionsByClass(classId),
    enabled: !!classId,
  })
}

export function useInstructors() {
  return useQuery({
    queryKey: ['instructors'],
    queryFn: getInstructors,
  })
}

export function useClassTypes() {
  return useQuery({
    queryKey: ['classTypes'],
    queryFn: getClassTypes,
  })
}

export function useAllSessions() {
  return useQuery({
    queryKey: ['allSessions'],
    queryFn: getAllSessions,
  })
}
