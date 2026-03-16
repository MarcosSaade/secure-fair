/**
 * Simple App Component Test
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

// Simple component for testing
const TestComponent = () => {
  return <div data-testid="test-component">Hello World</div>;
};

describe('Component Tests', () => {
  it('should render component correctly', () => {
    render(<TestComponent />);
    const element = screen.getByTestId('test-component');
    expect(element).toBeInTheDocument();
    expect(element).toHaveTextContent('Hello World');
  });

  it('should have correct text content', () => {
    render(<TestComponent />);
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });
});
