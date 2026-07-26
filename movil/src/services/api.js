const API_BASE_URL = "http://localhost:8000"; // misma IP que usas en Expo, puerto de FastAPI

async function request(path, { method = "GET", body, token } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  let data = null;
  try {
    data = await response.json();
  } catch {
    // respuestas sin body (204, etc.)
  }

  if (!response.ok) {
    const message = data?.detail || `Error ${response.status}`;
    throw new Error(message);
  }

  return data;
}

export const api = {
  login: (email, password) =>
    request("/auth/login", { method: "POST", body: { email, password } }),
  get: (path, token) => request(path, { token }),
  post: (path, body, token) => request(path, { method: "POST", body, token }),
  patch: (path, body, token) => request(path, { method: "PATCH", body, token }),
  del: (path, token) => request(path, { method: "DELETE", token }),
};