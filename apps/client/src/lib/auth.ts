import api from './api';

// NOTE: This is a temporary solution for development.
// In a real application, you would manage the token from a login page/session.
export const getAuthToken = async () => {
  try {
    // Check if a token is already in session/local storage to avoid re-logging in
    // This is a placeholder for a real auth state management
    const res = await api.post('/auth/login', {
      email: 'user@test.com', // Using a default user for now
      password: 'password123',
    });
    return res.data.access_token;
  } catch (error) {
    console.error('Failed to log in', error);
    return null;
  }
};
