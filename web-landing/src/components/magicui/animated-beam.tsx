"use client"

import React, { useEffect, useId, useRef, useState } from "react"
import { motion } from "framer-motion"

export interface AnimatedBeamProps {
  className?: string
  containerRef: React.RefObject<HTMLElement>
  fromRef: React.RefObject<HTMLElement>
  toRef: React.RefObject<HTMLElement>
  curvature?: number
  reverse?: boolean
  duration?: number
  delay?: number
}

export function AnimatedBeam({
  containerRef,
  fromRef,
  toRef,
  curvature = 0,
  reverse = false,
  duration = 2,
  delay = 0,
}: AnimatedBeamProps) {
  const id = useId()
  const [pathD, setPathD] = useState("")
  const pathRef = useRef<SVGPathElement>(null)

  useEffect(() => {
    const updatePath = () => {
      if (containerRef.current && fromRef.current && toRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect()
        const fromRect = fromRef.current.getBoundingClientRect()
        const toRect = toRef.current.getBoundingClientRect()

        const fromX = fromRect.left - containerRect.left + fromRect.width / 2
        const fromY = fromRect.top - containerRect.top + fromRect.height / 2
        const toX = toRect.left - containerRect.left + toRect.width / 2
        const toY = toRect.top - containerRect.top + toRect.height / 2

        const midX = (fromX + toX) / 2
        const midY = (fromY + toY) / 2 + curvature

        const path = `M ${fromX},${fromY} Q ${midX},${midY} ${toX},${toY}`
        setPathD(path)
      }
    }

    updatePath()
    
    // Use setTimeout to ensure DOM is ready
    const timer = setTimeout(updatePath, 0)
    
    window.addEventListener("resize", updatePath)
    return () => {
      window.removeEventListener("resize", updatePath)
      clearTimeout(timer)
    }
  }, [containerRef, fromRef, toRef, curvature])

  if (!pathD) return null

  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={id} gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fff" stopOpacity="0" />
          <stop offset="50%" stopColor="#fff" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        ref={pathRef}
        d={pathD}
        stroke={`url(#${id})`}
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        strokeDasharray="4 4"
      >
        <animate
          attributeName="stroke-dashoffset"
          from="0"
          to="8"
          dur="0.5s"
          repeatCount="indefinite"
        />
      </path>
      <circle r="4" fill="#fff">
        <animateMotion
          dur={`${duration}s`}
          repeatCount="indefinite"
          path={pathD}
          begin={`${delay}s`}
        />
      </circle>
    </svg>
  )
}
