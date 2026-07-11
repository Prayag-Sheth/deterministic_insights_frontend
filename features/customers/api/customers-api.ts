import { apiClient } from "@/lib/axios";
import type { PaginatedResponse } from "@/types/api";
import type {
  Customer,
  CustomerCreateBody,
  CustomerListParams,
  CustomerOwnerUpdateBody,
  CustomerUpdateBody,
} from "@/types/customer";

export async function listCustomers(
  params: CustomerListParams = {},
): Promise<PaginatedResponse<Customer>> {
  const { data } = await apiClient.get<PaginatedResponse<Customer>>(
    "/customers/",
    { params },
  );
  return data;
}

export async function getCustomer(id: string): Promise<Customer> {
  const { data } = await apiClient.get<Customer>(`/customers/${id}`);
  return data;
}

export async function createCustomer(
  body: CustomerCreateBody,
): Promise<Customer> {
  const { data } = await apiClient.post<Customer>("/customers/", body);
  return data;
}

export async function updateCustomer(
  id: string,
  body: CustomerUpdateBody,
): Promise<Customer> {
  const { data } = await apiClient.patch<Customer>(`/customers/${id}`, body);
  return data;
}

export async function deleteCustomer(id: string): Promise<void> {
  await apiClient.delete(`/customers/${id}`);
}

export async function reassignCustomerOwner(
  id: string,
  body: CustomerOwnerUpdateBody,
): Promise<Customer> {
  const { data } = await apiClient.patch<Customer>(
    `/customers/${id}/owner`,
    body,
  );
  return data;
}
