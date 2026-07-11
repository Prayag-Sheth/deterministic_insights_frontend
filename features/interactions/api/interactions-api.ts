import { apiClient } from "@/lib/axios";
import type { PaginatedResponse } from "@/types/api";
import type {
  InteractionCreateBody,
  InteractionDetail,
  InteractionListItem,
  InteractionListParams,
  InteractionUpdateBody,
} from "@/types/interaction";

export async function listInteractions(
  params: InteractionListParams = {},
): Promise<PaginatedResponse<InteractionListItem>> {
  const { data } = await apiClient.get<PaginatedResponse<InteractionListItem>>(
    "/interactions/",
    { params },
  );
  return data;
}

export async function getInteraction(id: string): Promise<InteractionDetail> {
  const { data } = await apiClient.get<InteractionDetail>(
    `/interactions/${id}`,
  );
  return data;
}

export async function createInteraction(
  body: InteractionCreateBody,
): Promise<InteractionDetail> {
  const { data } = await apiClient.post<InteractionDetail>(
    "/interactions/",
    body,
  );
  return data;
}

export async function updateInteraction(
  id: string,
  body: InteractionUpdateBody,
): Promise<InteractionDetail> {
  const { data } = await apiClient.patch<InteractionDetail>(
    `/interactions/${id}`,
    body,
  );
  return data;
}

export async function deleteInteraction(id: string): Promise<void> {
  await apiClient.delete(`/interactions/${id}`);
}
