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

export async function getAdminDriverDetailApi(token: string, driverId: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/drivers/${driverId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return await res.json();
  } catch (error) {
    return { success: false, error: { code: "NETWORK_ERROR", message: "Failed to fetch driver detail" } };
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

export async function respondToCounterOfferApi(token: string, id: string, action: "ACCEPT" | "DECLINE") {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/trips/${id}/counter-response`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ action }),
    });
    return await res.json();
  } catch (error) {
    return { success: false, error: { code: "NETWORK_ERROR", message: "Failed to respond to counter offer" } };
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

export async function getDriverApplicationByIdApi(token: string, id: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/driver-applications/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return await res.json();
  } catch (error) {
    return { success: false, error: { code: "NETWORK_ERROR", message: "Failed to fetch driver application details" } };
  }
}

export async function getVehiclesApi(token: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/vehicles`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return await res.json();
  } catch (error) {
    return { success: false, error: { code: "NETWORK_ERROR", message: "Failed to fetch vehicles list" } };
  }
}

export async function createVehicleApi(token: string, vehicleData: { modelName: string; licensePlate: string; vin: string; year: number }) {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/vehicles`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(vehicleData),
    });
    return await res.json();
  } catch (error) {
    return { success: false, error: { code: "NETWORK_ERROR", message: "Failed to add vehicle" } };
  }
}

export async function updateVehicleApi(token: string, id: string, vehicleData: Partial<{ modelName: string; licensePlate: string; vin: string; year: number }>) {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/vehicles/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(vehicleData),
    });
    return await res.json();
  } catch (error) {
    return { success: false, error: { code: "NETWORK_ERROR", message: "Failed to update vehicle" } };
  }
}

export async function deleteVehicleApi(token: string, id: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/vehicles/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return await res.json();
  } catch (error) {
    return { success: false, error: { code: "NETWORK_ERROR", message: "Failed to delete vehicle" } };
  }
}

export async function approveDriverApplicationApi(token: string, id: string, vehicleId?: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/driver-applications/${id}/approve`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ vehicleId }),
    });
    return await res.json();
  } catch (error) {
    return { success: false, error: { code: "NETWORK_ERROR", message: "Failed to approve driver application" } };
  }
}

export async function sendQuoteApi(token: string, tripId: string, quotedFare: number, quoteNote?: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/trips/${tripId}/quote`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ quotedFare, quoteNote }),
    });
    return await res.json();
  } catch (error) {
    return { success: false, error: { code: "NETWORK_ERROR", message: "Failed to send quote" } };
  }
}

export async function getAdminTripDetailApi(token: string, tripId: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/trips/${tripId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return await res.json();
  } catch (error) {
    return { success: false, error: { code: "NETWORK_ERROR", message: "Failed to fetch trip detail" } };
  }
}

export async function deleteDriverApi(token: string, id: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/drivers/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return await res.json();
  } catch (error) {
    return { success: false, error: { code: "NETWORK_ERROR", message: "Failed to delete driver" } };
  }
}

export async function updateDriverScheduleApi(token: string, driverId: string, weeklySchedule: any[]) {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/drivers/${driverId}/schedule`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ weeklySchedule }),
    });
    return await res.json();
  } catch (error) {
    return { success: false, error: { code: "NETWORK_ERROR", message: "Failed to update driver schedule" } };
  }
}

export async function addOneTimeChangeApi(token: string, driverId: string, payload: { date: string; working: boolean; startTime?: string; endTime?: string; reason?: string }) {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/drivers/${driverId}/one-time-change`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    return await res.json();
  } catch (error) {
    return { success: false, error: { code: "NETWORK_ERROR", message: "Failed to set one-time schedule change" } };
  }
}

export async function getOneTimeChangesApi(token: string, driverId: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/drivers/${driverId}/one-time-changes`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return await res.json();
  } catch (error) {
    return { success: false, error: { code: "NETWORK_ERROR", message: "Failed to fetch one-time changes" } };
  }
}

export async function updateOneTimeChangeApi(token: string, driverId: string, changeId: string, payload: { date?: string; working: boolean; startTime?: string; endTime?: string; reason?: string }) {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/drivers/${driverId}/one-time-changes/${changeId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    return await res.json();
  } catch (error) {
    return { success: false, error: { code: "NETWORK_ERROR", message: "Failed to update one-time change" } };
  }
}

export async function deleteOneTimeChangeApi(token: string, driverId: string, changeId: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/drivers/${driverId}/one-time-changes/${changeId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    return await res.json();
  } catch (error) {
    return { success: false, error: { code: "NETWORK_ERROR", message: "Failed to delete one-time change" } };
  }
}

export async function getDispatchNumberApi(token: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/settings/dispatch-number`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return await res.json();
  } catch (error) {
    return { success: false, error: { code: "NETWORK_ERROR", message: "Failed to fetch dispatch number" } };
  }
}

export async function updateDispatchNumberApi(token: string, dispatchNumber: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/settings/dispatch-number`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ dispatchNumber }),
    });
    return await res.json();
  } catch (error) {
    return { success: false, error: { code: "NETWORK_ERROR", message: "Failed to update dispatch number" } };
  }
}
