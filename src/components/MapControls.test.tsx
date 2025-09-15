import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MapControls } from './MapControls';

describe('MapControls Component', () => {
  const mockOnGenerateMap = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders hexagon count input with default value', () => {
    render(<MapControls onGenerateMap={mockOnGenerateMap} isLoading={false} />);
    
    const hexagonInput = screen.getByLabelText(/Hexagon Count/i);
    expect(hexagonInput).toBeInTheDocument();
    expect(hexagonInput).toHaveValue(25);
  });

  test('renders seed input', () => {
    render(<MapControls onGenerateMap={mockOnGenerateMap} isLoading={false} />);
    
    const seedInput = screen.getByLabelText(/Seed/i);
    expect(seedInput).toBeInTheDocument();
    expect(seedInput).toHaveAttribute('placeholder', 'Leave empty for random');
  });

  test('renders generate button', () => {
    render(<MapControls onGenerateMap={mockOnGenerateMap} isLoading={false} />);
    
    const generateButton = screen.getByRole('button', { name: /Generate Map/i });
    expect(generateButton).toBeInTheDocument();
  });

  test('shows loading state when isLoading is true', () => {
    render(<MapControls onGenerateMap={mockOnGenerateMap} isLoading={true} />);
    
    const button = screen.getByRole('button');
    expect(button).toHaveTextContent('Generating...');
    expect(button).toBeDisabled();
  });

  test('disables inputs when loading', () => {
    render(<MapControls onGenerateMap={mockOnGenerateMap} isLoading={true} />);
    
    const hexagonInput = screen.getByLabelText(/Hexagon Count/i);
    const seedInput = screen.getByLabelText(/Seed/i);
    
    expect(hexagonInput).toBeDisabled();
    expect(seedInput).toBeDisabled();
  });

  test('calls onGenerateMap with correct data when form is submitted', () => {
    render(<MapControls onGenerateMap={mockOnGenerateMap} isLoading={false} />);
    
    const hexagonInput = screen.getByLabelText(/Hexagon Count/i);
    const seedInput = screen.getByLabelText(/Seed/i);
    const generateButton = screen.getByRole('button', { name: /Generate Map/i });

    fireEvent.change(hexagonInput, { target: { value: '50' } });
    fireEvent.change(seedInput, { target: { value: 'test-seed' } });
    fireEvent.click(generateButton);

    expect(mockOnGenerateMap).toHaveBeenCalledWith({
      hexagonCount: 50,
      seed: 'test-seed'
    });
  });

  test('calls onGenerateMap without seed when seed is empty', () => {
    render(<MapControls onGenerateMap={mockOnGenerateMap} isLoading={false} />);
    
    const generateButton = screen.getByRole('button', { name: /Generate Map/i });
    fireEvent.click(generateButton);

    expect(mockOnGenerateMap).toHaveBeenCalledWith({
      hexagonCount: 25
    });
  });

  test('trims whitespace from seed input', () => {
    render(<MapControls onGenerateMap={mockOnGenerateMap} isLoading={false} />);
    
    const seedInput = screen.getByLabelText(/Seed/i);
    const generateButton = screen.getByRole('button', { name: /Generate Map/i });

    fireEvent.change(seedInput, { target: { value: '  test-seed  ' } });
    fireEvent.click(generateButton);

    expect(mockOnGenerateMap).toHaveBeenCalledWith({
      hexagonCount: 25,
      seed: 'test-seed'
    });
  });

  test('handles invalid hexagon count input', () => {
    render(<MapControls onGenerateMap={mockOnGenerateMap} isLoading={false} />);
    
    const hexagonInput = screen.getByLabelText(/Hexagon Count/i);
    const generateButton = screen.getByRole('button', { name: /Generate Map/i });

    fireEvent.change(hexagonInput, { target: { value: 'invalid' } });
    fireEvent.click(generateButton);

    expect(mockOnGenerateMap).toHaveBeenCalledWith({
      hexagonCount: 25
    });
  });

  test('respects min and max constraints for hexagon count', () => {
    render(<MapControls onGenerateMap={mockOnGenerateMap} isLoading={false} />);
    
    const hexagonInput = screen.getByLabelText(/Hexagon Count/i);
    
    expect(hexagonInput).toHaveAttribute('min', '5');
    expect(hexagonInput).toHaveAttribute('max', '1000');
  });

  test('prevents form submission when loading', () => {
    render(<MapControls onGenerateMap={mockOnGenerateMap} isLoading={true} />);
    
    // Try to submit by clicking the disabled button
    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(mockOnGenerateMap).not.toHaveBeenCalled();
  });

  test('applies custom className when provided', () => {
    const { container } = render(
      <MapControls 
        onGenerateMap={mockOnGenerateMap} 
        isLoading={false} 
        className="custom-class"
      />
    );
    
    // eslint-disable-next-line testing-library/no-node-access
    expect(container.firstChild).toHaveClass('custom-class');
  });

  test('handles form submission via button click', () => {
    render(<MapControls onGenerateMap={mockOnGenerateMap} isLoading={false} />);
    
    const hexagonInput = screen.getByLabelText(/Hexagon Count/i);
    const button = screen.getByRole('button');
    
    fireEvent.change(hexagonInput, { target: { value: '75' } });
    fireEvent.click(button);

    expect(mockOnGenerateMap).toHaveBeenCalledWith({
      hexagonCount: 75
    });
  });
});