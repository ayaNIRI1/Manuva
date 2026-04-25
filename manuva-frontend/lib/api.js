export const apiRequest = async (endpoint, options = {}) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  const headers = { ...defaultHeaders, ...options.headers };

  if (options.isFormData) {
    delete headers['Content-Type'];
  }

const response = await fetch(`${baseUrl.replace(/\/$/, '')}/${endpoint.replace(/^\//, '')}`, {    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.error || 'Request failed');
    error.details = data.details;
    error.code = data.code;
    throw error;
  }

  return data;
};
