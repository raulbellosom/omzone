/**
 * useCustomer — hooks de datos para el área privada del cliente.
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getMyOrders,
  getMyBookings,
  cancelBooking,
} from "@/services/appwrite/customerService";
import {
  updateMyUserProfile,
  updateMyPhone,
} from "@/services/appwrite/profileService";
import { useAuth } from "@/hooks/useAuth.jsx";

export function useMyOrders() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["myOrders", user?.$id],
    queryFn: () => getMyOrders(user.$id),
    enabled: !!user,
  });
}

export function useMyBookings() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["myBookings", user?.$id],
    queryFn: () => getMyBookings(user.$id),
    enabled: !!user,
  });
}

export function useMyMembership() {
  // No membership_plans collection — customer area shows empty state
  return useQuery({
    queryKey: ["myMembership"],
    queryFn: () => Promise.resolve(null),
    enabled: false,
  });
}

export function useCancelBooking() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: (bookingId) => cancelBooking(bookingId),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["myBookings", user?.$id] }),
  });
}

export function useUpdateProfile() {
  const { user, refreshUser } = useAuth();
  return useMutation({
    mutationFn: async (data) => {
      const promises = [];
      const nameUpdate = {};
      if (data.first_name !== undefined) nameUpdate.firstName = data.first_name;
      if (data.last_name !== undefined) nameUpdate.lastName = data.last_name;
      if (data.locale !== undefined) nameUpdate.locale = data.locale;
      if (data.avatarId !== undefined) nameUpdate.avatarId = data.avatarId;
      if (Object.keys(nameUpdate).length) {
        promises.push(updateMyUserProfile(user.$id, nameUpdate));
      }
      if (data.phone !== undefined) {
        promises.push(updateMyPhone(user.$id, data.phone || null));
      }
      await Promise.all(promises);
    },
    onSuccess: () => refreshUser(),
  });
}
