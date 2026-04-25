export const apiRequest = async (endpoint, options = {}) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  let baseUrl = process.env.NEXT_PUBLIC_API_URL || (process.env.NEXT_PUBLIC_BACKEND_URL ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api` : 'http://localhost:3001/api');
  baseUrl = baseUrl.replace(/\/$/, '');
  if (!baseUrl.endsWith('/api')) {
    baseUrl = `${baseUrl}/api`;
  }

  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  const headers = {
    ...defaultHeaders,
    ...options.headers,
  };

  if (options.isFormData) {
    delete headers['Content-Type'];
  }

  const response = await fetch(`${baseUrl}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Request failed');
  }

  return data;
};
