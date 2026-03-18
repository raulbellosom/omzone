import { useMutation } from "@tanstack/react-query";
import { submitContact } from "@/services/appwrite/publicService";

export function useSubmitContact() {
  return useMutation({
    mutationFn: (data) => submitContact(data),
  });
}
