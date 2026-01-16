export const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
).replace(/\/$/, '');

type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

interface FetchOptions extends RequestInit {
  token?: string;
}

export async function fetchClient<T>(
  endpoint: string,
  method: RequestMethod = 'GET',
  body?: any,
  options: FetchOptions = {},
): Promise<T> {
  const { token, headers, ...customOptions } = options;

  // Clean endpoint: ensure it starts with a single slash
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  const headersInit: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...headers,
  } as HeadersInit;

  const config: RequestInit = {
    method,
    headers: headersInit,
    ...customOptions,
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  try {
    const fullUrl = `${API_URL}${cleanEndpoint}`;
    const response = await fetch(fullUrl, config);

    // Handle 401 Unauthorized globally if needed (e.g. redirect to login)
    if (response.status === 401) {
      console.warn('Unauthorized access - redirecting to login possible');
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.detail || `API Error: ${response.statusText}`);
    }

    // Return null for 204 No Content
    if (response.status === 204) {
      return null as T;
    }

    return await response.json();
  } catch (error) {
    console.error('API Request Failed:', error);
    throw error;
  }
}
