export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

export interface LoginResponse {
  success: boolean;
  data?: {
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
      phone?: string;
      accountStatus: string;
    };
    token: string;
  };
  error?: {
    code: string;
    message: string;
  };
}

export async function loginApi(email: string, password: string): Promise<LoginResponse> {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Login API fetch error:", error);
    return {
      success: false,
      error: {
        code: "NETWORK_ERROR",
        message: "Failed to connect to authentication server",
      },
    };
  }
}

export async function getAdminDriversApi(token: string, queryParams?: { page?: number; limit?: number; approvalStatus?: string; availabilityStatus?: string; search?: string }) {
  try {
    const params = new URLSearchParams();
    if (queryParams?.page) params.append("page", String(queryParams.page));
    if (queryParams?.limit) params.append("limit", String(queryParams.limit));
    if (queryParams?.approvalStatus) params.append("approvalStatus", queryParams.approvalStatus);
    if (queryParams?.availabilityStatus) params.append("availabilityStatus", queryParams.availabilityStatus);
    if (queryParams?.search) params.append("search", queryParams.search);

    const res = await fetch(`${API_BASE_URL}/admin/drivers?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return await res.json();
  } catch (error) {
    return { success: false, error: { code: "NETWORK_ERROR", message: "Failed to fetch drivers list" } };
  }
}

export async function updateDriverStatusApi(token: string, driverId: string, statusData: { approvalStatus?: "APPROVED" | "REJECTED"; accountStatus?: "ACTIVE" | "SUSPENDED" }) {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/drivers/${driverId}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(statusData),
    });
    return await res.json();
  } catch (error) {
    return { success: false, error: { code: "NETWORK_ERROR", message: "Failed to update driver status" } };
  }
}

export async function getAdminTripsApi(token: string, page = 1, limit = 20, status?: string) {
  try {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (status) params.append("status", status);

    const res = await fetch(`${API_BASE_URL}/admin/trips?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return await res.json();
  } catch (error) {
    return { success: false, error: { code: "NETWORK_ERROR", message: "Failed to fetch trips" } };
  }
}

export async function createTripApi(token: string, tripData: { passengerId: string; pickupAddress: string; dropoffAddress: string; fare?: number }) {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/trips`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(tripData),
    });
    return await res.json();
  } catch (error) {
    return { success: false, error: { code: "NETWORK_ERROR", message: "Failed to create trip" } };
  }
}

export async function getAdminAnalyticsApi(token: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/analytics`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return await res.json();
  } catch (error) {
    return { success: false, error: { code: "NETWORK_ERROR", message: "Failed to fetch analytics" } };
  }
}

export async function getVehicleReportsApi(token: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/vehicle-reports`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return await res.json();
  } catch (error) {
    return { success: false, error: { code: "NETWORK_ERROR", message: "Failed to fetch vehicle reports" } };
  }
}

export async function assignDriverApi(token: string, tripId: string, driverId: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/trips/${tripId}/assign`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ driverId }),
    });
    return await res.json();
  } catch (error) {
    return { success: false, error: { code: "NETWORK_ERROR", message: "Failed to assign driver" } };
  }
}

export async function getDriverApplicationsApi(token: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/driver-applications`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return await res.json();
  } catch (error) {
    return { success: false, error: { code: "NETWORK_ERROR", message: "Failed to fetch driver applications" } };
  }
}
