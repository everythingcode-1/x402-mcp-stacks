"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

export function Terminal({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("bg-black rounded-lg p-6 font-mono text-sm shadow-2xl", className)}>
      <div className="flex gap-2 mb-4">
        <div className="w-3 h-3 rounded-full bg-red-500" />
        <div className="w-3 h-3 rounded-full bg-yellow-500" />
        <div className="w-3 h-3 rounded-full bg-green-500" />
      </div>
      <div className="space-y-1 text-left">{children}</div>
    </div>
  )
}

export function TypingAnimation({ 
  children, 
  className,
  duration = 50,
  delay = 0
}: { 
  children: React.ReactNode
  className?: string
  duration?: number
  delay?: number
}) {
  const [displayedText, setDisplayedText] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const text = typeof children === "string" ? children : String(children)

  useEffect(() => {
    const startDelay = setTimeout(() => {
      setIsTyping(true)
      let i = 0
      const typingInterval = setInterval(() => {
        if (i < text.length) {
          setDisplayedText(text.substring(0, i + 1))
          i++
        } else {
          clearInterval(typingInterval)
          setIsTyping(false)
        }
      }, duration)

      return () => clearInterval(typingInterval)
    }, delay)

    return () => clearTimeout(startDelay)
  }, [text, duration, delay])

  return (
    <div className={cn("text-white font-mono", className)}>
      {displayedText}
      {isTyping && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
          className="inline-block w-2 h-4 bg-white ml-1"
        />
      )}
    </div>
  )
}

export function AnimatedSpan({ 
  children, 
  className,
  delay = 0
}: { 
  children: React.ReactNode
  className?: string
  delay?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2, delay: delay / 1000 }}
      className={cn("text-white font-mono", className)}
    >
      {children}
    </motion.div>
  )
}
