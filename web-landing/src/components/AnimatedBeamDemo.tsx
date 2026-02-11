"use client"

import React, { forwardRef, useRef } from "react"
import { cn } from "@/lib/utils"
import { AnimatedBeam } from "@/components/magicui/animated-beam"
import { Shield, Server, Wallet, CheckCircle2 } from "lucide-react"

const Circle = forwardRef<
  HTMLDivElement,
  { className?: string; children?: React.ReactNode }
>(({ className, children }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "z-10 flex size-12 items-center justify-center rounded-full border-2 border-white/20 bg-white/5 p-3 shadow-lg",
        className
      )}
    >
      {children}
    </div>
  )
})

Circle.displayName = "Circle"

export function AnimatedBeamDemo() {
  const containerRef = useRef<HTMLDivElement>(null)
  const apiRef = useRef<HTMLDivElement>(null)
  const sdkRef = useRef<HTMLDivElement>(null)
  const blockchainRef = useRef<HTMLDivElement>(null)
  const userRef = useRef<HTMLDivElement>(null)

  return (
    <div
      className="relative flex h-[400px] w-full items-center justify-center overflow-hidden p-10"
      ref={containerRef}
    >
      <div className="flex size-full max-w-3xl flex-row items-center justify-between gap-10">
        {/* Left: User/Client */}
        <div className="flex flex-col items-center gap-2">
          <Circle ref={userRef} className="size-16 bg-white/10 border-white/20">
            <Wallet className="h-8 w-8 text-white" />
          </Circle>
          <span className="text-xs font-medium text-white">Client</span>
        </div>

        {/* Center: SDK (larger) */}
        <div className="flex flex-col items-center gap-2">
          <Circle ref={sdkRef} className="size-20 bg-white/20 border-white/30">
            <Shield className="h-10 w-10 text-white" />
          </Circle>
          <span className="text-sm font-bold text-white">x402 Guard SDK</span>
        </div>

        {/* Right Side: API & Blockchain */}
        <div className="flex flex-col gap-8">
          <div className="flex flex-col items-center gap-2">
            <Circle ref={apiRef} className="size-16 bg-success/20 border-success/30">
              <Server className="h-8 w-8 text-success" />
            </Circle>
            <span className="text-xs font-medium text-white">Your API</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Circle ref={blockchainRef} className="size-16 bg-warning/20 border-warning/30">
              <CheckCircle2 className="h-8 w-8 text-warning" />
            </Circle>
            <span className="text-xs font-medium text-white">Stacks Chain</span>
          </div>
        </div>
      </div>

      {/* Animated Beams */}
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={userRef}
        toRef={sdkRef}
        curvature={0}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={sdkRef}
        toRef={apiRef}
        curvature={-30}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={sdkRef}
        toRef={blockchainRef}
        curvature={30}
      />
    </div>
  )
}
