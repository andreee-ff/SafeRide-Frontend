import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from './Login';

// Mock the hooks
const mockLogin = vi.fn();
const mockNavigate = vi.fn();

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    login: mockLogin,
    loading: false,
  }),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('Login Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders login form correctly', () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    expect(screen.getByPlaceholderText(/enter your username/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/••••••••/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('handles successful login flow', async () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    // Simulate user typing
    fireEvent.change(screen.getByPlaceholderText(/enter your username/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByPlaceholderText(/••••••••/i), { target: { value: 'password123' } });

    // Mock successful login return
    mockLogin.mockResolvedValueOnce(undefined);

    // Click submit
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    // Verify login was called with correct credentials
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('testuser', 'password123');
    });

    // Verify navigation to dashboard happened (after timeout in component)
    await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/');
    }, { timeout: 1000 });
  });

  it('displays error message on login failure', async () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByPlaceholderText(/enter your username/i), { target: { value: 'wrong' } });
    fireEvent.change(screen.getByPlaceholderText(/••••••••/i), { target: { value: 'wrong' } });

    // Mock failed login
    const errorResponse = { response: { data: { detail: 'Invalid credentials' } } };
    mockLogin.mockRejectedValueOnce(errorResponse);

    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    // Verify error message appears
    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
    
    // Should NOT navigate
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
