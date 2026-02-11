"use client"

import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { cn } from "@/lib/utils"

export function MorphingText({
  texts,
  className,
}: {
  texts: string[]
  className?: string
}) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % texts.length)
    }, 2500)

    return () => clearInterval(interval)
  }, [texts.length])

  return (
    <div className={cn("relative inline-block", className)}>
      <AnimatePresence mode="wait">
        <motion.div
          key={texts[index]}
          initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -20, filter: "blur(8px)" }}
          transition={{
            duration: 0.5,
            ease: "easeInOut",
          }}
          className="inline-block"
        >
          {texts[index]}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
