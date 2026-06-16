"use client"

import React, { useEffect, useState, useCallback } from "react"
import { cn } from "@/lib/utils"

interface ScrambleTextProps {
  text: string
  duration?: number
  delay?: number
  className?: string
  scrambleSpeed?: number
  characters?: string
}

const DEFAULT_CHARACTERS = "01$#!%&?@><[]{}/\\=+*^"

export function ScrambleText({
  text,
  duration = 800,
  delay = 0,
  className,
  scrambleSpeed = 30,
  characters = DEFAULT_CHARACTERS,
}: ScrambleTextProps) {
  const [displayText, setDisplayText] = useState(text)
  const [isAnimating, setIsAnimating] = useState(false)

  const scramble = useCallback(() => {
    if (!text) return
    
    let frame = 0
    const totalFrames = Math.max(1, duration / scrambleSpeed)
    setIsAnimating(true)

    const interval = setInterval(() => {
      frame++
      const progress = frame / totalFrames

      const currentText = text
        .split("")
        .map((char, index) => {
          if (char === " " || index / text.length < progress) return char
          return characters[Math.floor(Math.random() * characters.length)]
        })
        .join("")

      setDisplayText(currentText)

      if (frame >= totalFrames) {
        setDisplayText(text)
        setIsAnimating(false)
        clearInterval(interval)
      }
    }, scrambleSpeed)

    return interval
  }, [text, duration, scrambleSpeed, characters])

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined
    const timeout = setTimeout(() => {
      interval = scramble()
    }, delay)

    return () => {
      clearTimeout(timeout)
      if (interval) clearInterval(interval)
    }
  }, [scramble, delay])

  return (
    <span 
      className={cn(
        "font-mono tracking-tighter",
        isAnimating && "text-emerald-400/80 animate-pulse",
        className
      )}
    >
      {displayText}
    </span>
  )
}
