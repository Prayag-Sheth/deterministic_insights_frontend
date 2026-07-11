export type CustomerStatus = "active" | "inactive";

export interface Customer {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string | null;
  status: CustomerStatus;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export interface CustomerCreateBody {
  name: string;
  company: string;
  email: string;
  phone?: string | null;
  status?: CustomerStatus;
}

export interface CustomerUpdateBody {
  name?: string;
  company?: string;
  email?: string;
  phone?: string | null;
  status?: CustomerStatus;
}

export interface CustomerOwnerUpdateBody {
  owner_id: string;
}

export interface CustomerListParams {
  page?: number;
  page_size?: number;
  status?: CustomerStatus;
  owner_id?: string;
  search?: string;
}
