// Client-side utilities for client management
export interface Client {
  id: string
  user_id: string
  client_id: string
  name: string
  email: string
  phone: string
  company: string
  status: "Active" | "Inactive" | "Pending"
  projects: number
  last_activity: string
  created_at: string
  updated_at: string
}

export async function fetchClients(): Promise<{ success: boolean; clients?: Client[]; error?: string }> {
  try {
    const response = await fetch("/api/contacts", {
      method: "GET",
    })
    const data = await response.json()

    if (!response.ok) {
      if (response.status === 401) {
        window.location.href = "/login"
      }
      return { success: false, error: data.error || "Failed to fetch clients" }
    }

    return { success: true, clients: data.data }
  } catch (error) {
    return { success: false, error: "Network error" }
  }
}

export async function createClient(clientData: {
  name: string
  email: string
  phone: string
  company: string
  status: "Active" | "Inactive" | "Pending"
}): Promise<{ success: boolean; client?: Client; error?: string }> {
  try {
    const response = await fetch("/api/contacts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(clientData),
    })
    const data = await response.json()

    if (!response.ok) {
      if (response.status === 401) {
        window.location.href = "/login"
      }
      return { success: false, error: data.error || "Failed to create client" }
    }

    return { success: true, client: data.data }
  } catch (error) {
    return { success: false, error: "Network error" }
  }
}

export async function updateClient(
  clientId: string,
  clientData: {
    name: string
    email: string
    phone: string
    company: string
    status: "Active" | "Inactive" | "Pending"
  },
): Promise<{ success: boolean; client?: Client; error?: string }> {
  try {
    const response = await fetch("/api/contacts", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ contactId: clientId, ...clientData }),
    })
    const data = await response.json()

    if (!response.ok) {
      if (response.status === 401) {
        window.location.href = "/login"
      }
      return { success: false, error: data.error || "Failed to update client" }
    }

    return { success: true, client: data.data }
  } catch (error) {
    return { success: false, error: "Network error" }
  }
}

export async function deleteClient(clientId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`/api/contacts?contactId=${clientId}`, {
      method: "DELETE",
    })
    const data = await response.json()

    if (!response.ok) {
      if (response.status === 401) {
        window.location.href = "/login"
      }
      return { success: false, error: data.error || "Failed to delete client" }
    }

    return { success: true }
  } catch (error) {
    return { success: false, error: "Network error" }
  }
}

export async function updateClientActivity(
  clientId: string,
  activity: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch("/api/contacts", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contactId: clientId,
        last_activity: activity,
        updated_at: new Date().toISOString(),
      }),
    })
    const data = await response.json()

    if (!response.ok) {
      if (response.status === 401) {
        window.location.href = "/login"
      }
      return { success: false, error: data.error || "Failed to update client activity" }
    }

    return { success: true }
  } catch (error) {
    return { success: false, error: "Network error" }
  }
}
