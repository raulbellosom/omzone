/**
 * useCustomer — hooks de datos para el área privada del cliente.
 * Todos usan TanStack Query v5 + mocks centralizados.
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCustomerOrders,
  getCustomerBookings,
  getCustomerActiveMembership,
  cancelBookingMock,
} from "@/services/mocks/commerceService.mock";
import {
  updateMyUserProfile,
  updateMyPhone,
} from "@/services/appwrite/profileService";
import { useAuth } from "@/hooks/useAuth.jsx";

export function useMyOrders() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["myOrders", user?.$id],
    queryFn: () => getCustomerOrders(user?.$id),
    enabled: !!user,
  });
}

export function useMyBookings() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["myBookings", user?.$id],
    queryFn: () => getCustomerBookings(user?.$id),
    enabled: !!user,
  });
}

export function useMyMembership() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["myMembership", user?.$id],
    queryFn: () => getCustomerActiveMembership(user?.$id),
    enabled: !!user,
  });
}

export function useCancelBooking() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: (bookingId) => cancelBookingMock(bookingId),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["myBookings", user?.$id] }),
  });
}

export function useUpdateProfile() {
  const { user, refreshUser } = useAuth();
  return useMutation({
    mutationFn: async (data) => {
      const promises = [];
      // Map snake_case form fields → camelCase profile fields
      const nameUpdate = {};
      if (data.first_name !== undefined) nameUpdate.firstName = data.first_name;
      if (data.last_name !== undefined) nameUpdate.lastName = data.last_name;
      if (data.locale !== undefined) nameUpdate.locale = data.locale;
      if (data.avatarId !== undefined) nameUpdate.avatarId = data.avatarId;
      if (Object.keys(nameUpdate).length) {
        promises.push(updateMyUserProfile(user.$id, nameUpdate));
      }
      // Phone lives in Auth — update via sync function, not profile document
      if (data.phone !== undefined) {
        promises.push(updateMyPhone(user.$id, data.phone || null));
      }
      await Promise.all(promises);
    },
    onSuccess: () => refreshUser(),
  });
}
