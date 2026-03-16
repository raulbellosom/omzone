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
  uploadAvatar,
  deleteAvatar,
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
      const profileUpdate = {};

      // Handle avatar file upload
      if (data.file instanceof File) {
        if (user.avatar_id) await deleteAvatar(user.avatar_id)
        const newAvatarId = await uploadAvatar(user.$id, data.file)
        profileUpdate.avatarId = newAvatarId
      }

      if (data.first_name !== undefined) profileUpdate.firstName = data.first_name;
      if (data.last_name !== undefined) profileUpdate.lastName = data.last_name;
      if (data.locale !== undefined) profileUpdate.locale = data.locale;
      if (data.avatarId !== undefined) profileUpdate.avatarId = data.avatarId;

      const promises = [];
      if (Object.keys(profileUpdate).length) {
        promises.push(updateMyUserProfile(user.$id, profileUpdate));
      }
      if (data.phone !== undefined) {
        promises.push(updateMyPhone(user.$id, data.phone || null));
      }
      await Promise.all(promises);
    },
    onSuccess: () => refreshUser(),
  });
}
