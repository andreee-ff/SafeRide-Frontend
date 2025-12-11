import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Register from './Register';

// Mock Hooks
const mockRegister = vi.fn();
const mockNavigate = vi.fn();

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    register: mockRegister,
  }),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('Register Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders registration form elements', () => {
    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );

    expect(screen.getByPlaceholderText(/choose a username/i)).toBeInTheDocument();
    // Two password fields (Password + Confirm)
    const passwordInputs = screen.getAllByPlaceholderText(/••••••••/i);
    expect(passwordInputs).toHaveLength(2);
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
  });

  it('validates password mismatch', async () => {
    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByPlaceholderText(/choose a username/i), { target: { value: 'newuser' } });
    const [pwd1, pwd2] = screen.getAllByPlaceholderText(/••••••••/i);
    fireEvent.change(pwd1, { target: { value: 'password123' } });
    fireEvent.change(pwd2, { target: { value: 'mismatch' } });

    fireEvent.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
        expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    });
    
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it('submits successfully when valid', async () => {
    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByPlaceholderText(/choose a username/i), { target: { value: 'newuser' } });
    const [pwd1, pwd2] = screen.getAllByPlaceholderText(/••••••••/i);
    fireEvent.change(pwd1, { target: { value: 'password123' } });
    fireEvent.change(pwd2, { target: { value: 'password123' } });

    mockRegister.mockResolvedValueOnce(undefined);

    fireEvent.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
        expect(mockRegister).toHaveBeenCalledWith('newuser', 'password123');
    });
    
    // Check navigation (it has a timeout in component, so we wait)
    await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/');
    }, { timeout: 1000 });
  });
});
