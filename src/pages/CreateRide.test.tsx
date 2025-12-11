import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import CreateRide from './CreateRide';
import { ridesApi } from '../api/client';

// Mock dependencies
vi.mock('../api/client', () => ({
  ridesApi: {
    createRide: vi.fn(),
  },
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('CreateRide Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders form elements correctly', () => {
        const { container } = render(
            <BrowserRouter>
                <CreateRide />
            </BrowserRouter>
        );

        // Use placeholders where available
        expect(screen.getByPlaceholderText(/e.g., Sunday Morning/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/Add any details/i)).toBeInTheDocument();
        
        // Use direct selector for date input as it lacks a placeholder or accessible label
        expect(container.querySelector('input[type="datetime-local"]')).toBeInTheDocument();
        
        expect(screen.getByRole('button', { name: /create ride/i })).toBeInTheDocument();
    });

    it('submits form with correct data', async () => {
        const { container } = render(
            <BrowserRouter>
                <CreateRide />
            </BrowserRouter>
        );

        // Fill Title
        fireEvent.change(screen.getByPlaceholderText(/e.g., Sunday Morning/i), {
            target: { value: 'Test Ride' }
        });

        // Fill Description
        fireEvent.change(screen.getByPlaceholderText(/Add any details/i), {
            target: { value: 'Test Description' }
        });

        // Fill Date
        const dateInput = container.querySelector('input[type="datetime-local"]');
        if (dateInput) {
            fireEvent.change(dateInput, { target: { value: '2024-12-25T10:00' } });
        }

        // Mock API success
        const mockCreatedRide = { id: 123, title: 'Test Ride' }; 
        (ridesApi.createRide as any).mockResolvedValueOnce(mockCreatedRide);

        // Submit
        fireEvent.click(screen.getByRole('button', { name: /create ride/i }));

        // Verify API call
        await waitFor(() => {
            expect(ridesApi.createRide).toHaveBeenCalledWith({
                title: 'Test Ride',
                description: 'Test Description',
                start_time: expect.stringMatching(/2024-12-25/) // Partial match to avoid timezone brittleness
            });
        });

        // Verify Redirect
        await waitFor(() => {
             expect(mockNavigate).toHaveBeenCalledWith('/rides/123');
        });
    });

    it('shows error message on failure', async () => {
         const { container } = render(
            <BrowserRouter>
                <CreateRide />
            </BrowserRouter>
        );

        // Fill minimal required fields to attempt submission
        fireEvent.change(screen.getByPlaceholderText(/e.g., Sunday Morning/i), {
            target: { value: 'Fail Ride' }
        });
        const dateInput = container.querySelector('input[type="datetime-local"]');
        if (dateInput) {
             fireEvent.change(dateInput, { target: { value: '2024-12-25T10:00' } });
        }

        // Mock API Failure
        const errorResponse = { response: { data: { detail: 'Server Error' } } };
        (ridesApi.createRide as any).mockRejectedValueOnce(errorResponse);

        // Submit
        fireEvent.click(screen.getByRole('button', { name: /create ride/i }));

        // Verify Error
        await waitFor(() => {
            expect(screen.getByText('Server Error')).toBeInTheDocument();
        });
        
        // Ensure we didn't navigate away
        expect(mockNavigate).not.toHaveBeenCalled();
    });
});
