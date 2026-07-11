import { apiClient } from "@/lib/axios";
import type { PaginatedResponse } from "@/types/api";
import type { AuthUser } from "@/types/auth";
import type { UserListParams } from "@/types/user";

export async function listUsers(
  params: UserListParams = {},
): Promise<PaginatedResponse<AuthUser>> {
  const { data } = await apiClient.get<PaginatedResponse<AuthUser>>("/users/", {
    params,
  });
  return data;
}
