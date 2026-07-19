import styled, { css } from 'styled-components';

export const StyledWrapper = styled.div<{ $variant: string; $size: string; $disabled?: boolean }>`
  display: inline-block;

  button, a {
    font-size: ${({ $size }) => ($size === 'sm' ? '14px' : $size === 'lg' ? '20px' : '17px')};
    padding: ${({ $size }) => ($size === 'sm' ? '0.25em 1em' : $size === 'lg' ? '0.75em 2.5em' : '0.5em 2em')};
    border-radius: 4px;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    text-decoration: none;
    border: none;
    font-family: inherit;

    ${({ $disabled }) => $disabled && css`
      opacity: 0.5;
      cursor: not-allowed;
      pointer-events: none;
    `}

    /* Variants */
    ${({ $variant }) => {
      switch ($variant) {
        case 'secondary':
          return css`
            background: #e2e8f0;
            color: #1e293b;
            border: 2px solid transparent;
            box-shadow: 2px 2px 4px rgba(0,0,0,0.1);
            
            &:hover {
              background: #cbd5e1;
            }
          `;
        case 'outline':
          return css`
            background: transparent;
            color: var(--color-primary);
            border: 2px solid var(--color-primary);
            
            &:hover {
              background: var(--color-primary);
              color: white;
            }
          `;
        case 'white':
          return css`
            background: white;
            color: var(--color-primary);
            border: 2px solid transparent;
            box-shadow: 2px 2px 4px rgba(0,0,0,0.2);
            
            &:hover {
              background: #f8fafc;
              color: var(--color-primary-dark);
            }
          `;
        case 'ghost':
          return css`
            background: transparent;
            color: #475569;
            border: 2px solid transparent;
            
            &:hover {
              background: #f1f5f9;
            }
          `;
        case 'primary':
        default:
          return css`
            border: transparent;
            box-shadow: 2px 2px 4px rgba(0,0,0,0.4);
            background: var(--color-primary);
            color: white;
            
            &:hover {
              background: var(--color-primary-dark);
              background: linear-gradient(90deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
            }
          `;
      }
    }}
  }

  button:active, a:active {
    transform: translate(0em, 0.2em);
  }

  .spinner {
    margin-right: 8px;
    animation: spin 1s linear infinite;
    border-radius: 50%;
    height: 16px;
    width: 16px;
    border: 2px solid currentColor;
    border-top-color: transparent;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;
