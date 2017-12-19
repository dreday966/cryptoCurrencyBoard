import React from 'react'

export const GreenBorderButton = (props) => {
  const { disabled, children, style, onClick } = props
  return (
    <button
      disabled={disabled}
      style={{
        borderRadius: '4px',
        border: 'solid 2px #1fbd87',
        height: '48px',
        backgroundColor: 'white',
        color: '#1fbd87',
        fontSize: '14px',
        cursor: 'pointer',
        verticalAlign: 'top',
        ...style,
      }}
      onClick={onClick}
    >
      {children}
    </button>
  )
}
