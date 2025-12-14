import React from 'react';
import Button, { ButtonProps } from '@mui/material/Button';

export interface FlipButtonProps extends Omit<ButtonProps, 'startIcon' | 'endIcon'> {
  front: React.ReactNode;
  back?: React.ReactNode;
  flipAxis?: 'X' | 'Y';
  flipOn?: 'hover' | 'click';
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
}

const FlipButton: React.FC<FlipButtonProps> = ({ front, back, flipAxis = 'Y', flipOn = 'hover', children, startIcon, endIcon, className, ...rest }) => {
  const axis = (flipAxis || 'Y').toUpperCase() === 'X' ? 'X' : 'Y';
  const mode = flipOn === 'click' ? 'click' : 'hover';
  const contentFront = (
    <span className="flip-content">
      {startIcon ? <span className="flip-icon flip-icon-start">{startIcon}</span> : null}
      <span>{front ?? children}</span>
      {endIcon ? <span className="flip-icon flip-icon-end">{endIcon}</span> : null}
    </span>
  );
  const contentBack = (
    <span className="flip-content">
      {startIcon ? <span className="flip-icon flip-icon-start">{startIcon}</span> : null}
      <span>{back ?? front ?? children}</span>
      {endIcon ? <span className="flip-icon flip-icon-end">{endIcon}</span> : null}
    </span>
  );
  return (
    <Button {...rest} className={`flip-btn ${className || ''}`.trim()} data-axis={axis} data-flip={mode}>
      <span className="flip-inner" aria-hidden={false} role="presentation">
        <span className="flip-front">{contentFront}</span>
        <span className="flip-back">{contentBack}</span>
      </span>
    </Button>
  );
};

export default FlipButton;
