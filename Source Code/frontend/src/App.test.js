import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// FIX 10: Original test used 'learn react' which never exists in this app.
// Replaced with meaningful tests that verify actual DocSpot content and routes.

// Helper to render with required providers
const renderWithProviders = (ui) => {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={['/']}>
        {ui}
      </MemoryRouter>
    </AuthProvider>
  );
};

// --- Home page tests ---
import Home from './pages/Home';

test('Home page renders hero headline', () => {
  renderWithProviders(<Home />);
  expect(screen.getByText(/Your Health, Our Priority/i)).toBeInTheDocument();
});

test('Home page renders Find a Doctor button', () => {
  renderWithProviders(<Home />);
  expect(screen.getByText(/Find a Doctor/i)).toBeInTheDocument();
});

// --- Login page tests ---
import Login from './pages/Login';

test('Login page renders Sign In heading', () => {
  renderWithProviders(<Login />);
  expect(screen.getByText(/Welcome Back/i)).toBeInTheDocument();
});

test('Login page renders email input', () => {
  renderWithProviders(<Login />);
  expect(screen.getByPlaceholderText(/Enter your email/i)).toBeInTheDocument();
});

// --- Register page tests ---
import Register from './pages/Register';

test('Register page renders Create Account heading', () => {
  renderWithProviders(<Register />);
  expect(screen.getByText(/Create Account/i)).toBeInTheDocument();
});

test('Register page renders Full Name input', () => {
  renderWithProviders(<Register />);
  expect(screen.getByPlaceholderText(/Full Name/i)).toBeInTheDocument();
});

// --- Terms page tests ---
import Terms from './pages/Terms';

test('Terms page renders Terms of Service heading', () => {
  renderWithProviders(<Terms />);
  expect(screen.getByText(/Terms of Service/i)).toBeInTheDocument();
});

// --- Privacy page tests ---
import Privacy from './pages/Privacy';

test('Privacy page renders Privacy Policy heading', () => {
  renderWithProviders(<Privacy />);
  expect(screen.getByText(/Privacy Policy/i)).toBeInTheDocument();
});

// --- ForgotPassword page tests ---
import ForgotPassword from './pages/ForgotPassword';

test('ForgotPassword page renders heading', () => {
  renderWithProviders(<ForgotPassword />);
  expect(screen.getByText(/Forgot Password/i)).toBeInTheDocument();
});

test('ForgotPassword page renders email input', () => {
  renderWithProviders(<ForgotPassword />);
  expect(screen.getByPlaceholderText(/Enter your email/i)).toBeInTheDocument();
});