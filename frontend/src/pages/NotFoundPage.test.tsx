import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import NotFoundPage from './NotFoundPage';

it('renders NotFound message', () => {
  render(
    <MemoryRouter>
      <NotFoundPage />
    </MemoryRouter>
  );
  expect(screen.getByText(/Page Not Found/i)).toBeInTheDocument();
});
