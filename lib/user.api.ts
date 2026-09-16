import { patch, put, type ApiResponse } from "@/lib/api";
import type { AuthUser } from "@/types/auth";

export type UpdateMyProfilePayload = {
  name: string;
  phone?: string;
  location?: string;
};

export async function updateMyProfile(
  payload: UpdateMyProfilePayload,
  token: string,
): Promise<AuthUser> {
  const result = await put<ApiResponse<{ user: AuthUser }>>(
    "/users/me",
    payload,
    token,
  );
  return result.data.user;
}

export async function changeMyPassword(
  currentPassword: string,
  newPassword: string,
  token: string,
): Promise<void> {
  await patch<ApiResponse<null>>(
    "/users/me/password",
    { currentPassword, newPassword },
    token,
  );
}
