import React from 'react'

const ZriveLogo = () => {
  return (
    
  <div className="flex flex-col items-center">
    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#0F0F0F]">
      <svg
        width="34"
        height="34"
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Shield outline */}
        <path
          d="M20 14C20 11.7909 21.7909 10 24 10H76C78.2091 10 80 11.7909 80 14V52C80 74 65 86 50 92C35 86 20 74 20 52V14Z"
          stroke="#A07F3A"
          strokeWidth="3.5"
        />
        {/* Z */}
        <path
          d="M32 34H52L32 62H52"
          stroke="#A07F3A"
          strokeWidth="6.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* R */}
        <path
          d="M50 62V34H61C66 34 69 37 69 42C69 47 66 50 61 50H50M61 50L69 62"
          stroke="#A07F3A"
          strokeWidth="6.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  </div>
  )
}

export default ZriveLogo