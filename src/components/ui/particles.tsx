"use client"

import React, { useEffect, useRef, type ComponentPropsWithoutRef } from "react"

import { cn } from "@/lib/utils"

interface ParticlesProps extends ComponentPropsWithoutRef<"div"> {
  className?: string
  quantity?: number
  staticity?: number
  ease?: number
  size?: number
  refresh?: boolean
  color?: string
  vx?: number
  vy?: number
}

function hexToRgb(hex: string): number[] {
  hex = hex.replace("#", "")

  if (hex.length === 3) {
    hex = hex
      .split("")
      .map((char) => char + char)
      .join("")
  }

  const hexInt = parseInt(hex, 16)
  const red = (hexInt >> 16) & 255
  const green = (hexInt >> 8) & 255
  const blue = hexInt & 255
  return [red, green, blue]
}

type Circle = {
  x: number
  y: number
  translateX: number
  translateY: number
  size: number
  alpha: number
  targetAlpha: number
  dx: number
  dy: number
  magnetism: number
}

export const Particles: React.FC<ParticlesProps> = ({
  className = "",
  quantity = 100,
  staticity = 50,
  ease = 50,
  size = 0.4,
  refresh = false,
  color = "#ffffff",
  vx = 0,
  vy = 0,
  ...props
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const canvasContainerRef = useRef<HTMLDivElement>(null)
  const context = useRef<CanvasRenderingContext2D | null>(null)
  const circles = useRef<Circle[]>([])
  const mousePosition = useRef<{ x: number; y: number }>({ x: 0, y: 0 })
  const mouse = useRef<{ x: number; y: number }>({ x: 0, y: 0 })
  const canvasSize = useRef<{ w: number; h: number }>({ w: 0, h: 0 })
  const dpr = typeof window !== "undefined" ? window.devicePixelRatio : 1
  const rafID = useRef<number | null>(null)
  const resizeTimeout = useRef<NodeJS.Timeout | null>(null)
  const initCanvasRef = useRef<() => void>(() => {})
  const onMouseMoveRef = useRef<() => void>(() => {})
  const animateRef = useRef<() => void>(() => {})

  /* ── Frame budget ─────────────────────────────────────────────────────
     The loop used to be unconditional: a hundred-odd particles re-drawn
     every frame for the whole life of the page, including while the field
     was scrolled far out of view or the tab was in the background. It now
     parks unless the canvas is actually on screen AND the tab is visible,
     and never starts at all under reduced motion. Parking only cancels the
     rAF — the circles keep their positions on the ref, so resuming picks up
     exactly where it left off with no visible jump. */
  useEffect(() => {
    if (canvasRef.current) {
      context.current = canvasRef.current.getContext("2d")
    }
    initCanvasRef.current()

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)")
    let onScreen = false
    let tabVisible = document.visibilityState === "visible"

    const loop = () => {
      animateRef.current()
      rafID.current = window.requestAnimationFrame(loop)
    }

    const park = () => {
      if (rafID.current != null) {
        window.cancelAnimationFrame(rafID.current)
        rafID.current = null
      }
    }

    const sync = () => {
      if (reducedMotion.matches) {
        park()
        return
      }
      if (onScreen && tabVisible) {
        if (rafID.current == null) rafID.current = window.requestAnimationFrame(loop)
      } else {
        park()
      }
    }

    const handleMouseMove = (event: MouseEvent) => {
      mousePosition.current.x = event.clientX
      mousePosition.current.y = event.clientY
      onMouseMoveRef.current()
    }

    const handleResize = () => {
      if (resizeTimeout.current) {
        clearTimeout(resizeTimeout.current)
      }
      resizeTimeout.current = setTimeout(() => {
        initCanvasRef.current()
      }, 200)
    }

    // Toggling the preference re-inits, because `initCanvas` is what decides
    // between the animated field's alpha-0 first frame and the settled one.
    const handlePreferenceChange = () => {
      initCanvasRef.current()
      sync()
    }

    const handleVisibilityChange = () => {
      tabVisible = document.visibilityState === "visible"
      sync()
    }

    const observer =
      typeof IntersectionObserver !== "undefined"
        ? new IntersectionObserver(
            ([entry]) => {
              onScreen = entry.isIntersecting
              sync()
            },
            { threshold: 0 },
          )
        : null

    if (observer && canvasContainerRef.current) {
      observer.observe(canvasContainerRef.current)
    } else {
      // No observer support: fall back to the old always-on behaviour.
      onScreen = true
    }

    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("resize", handleResize)
    document.addEventListener("visibilitychange", handleVisibilityChange)
    reducedMotion.addEventListener("change", handlePreferenceChange)
    sync()

    return () => {
      park()
      if (resizeTimeout.current) {
        clearTimeout(resizeTimeout.current)
      }
      observer?.disconnect()
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("resize", handleResize)
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      reducedMotion.removeEventListener("change", handlePreferenceChange)
    }
  }, [color])

  useEffect(() => {
    initCanvasRef.current()
  }, [refresh])

  const initCanvas = () => {
    resizeCanvas()
    drawParticles()
    /* Every particle starts at alpha 0 and is faded up by the loop, so under
       reduced motion — where the loop never runs — the layer would simply
       stay blank. Paint the field's settled state instead: one frame, every
       particle already at its target alpha. */
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      clearContext()
      circles.current.forEach((circle: Circle) => {
        circle.alpha = circle.targetAlpha
        drawCircle(circle, true)
      })
    }
  }

  const onMouseMove = () => {
    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect()
      const { w, h } = canvasSize.current
      const x = mousePosition.current.x - rect.left - w / 2
      const y = mousePosition.current.y - rect.top - h / 2
      const inside = x < w / 2 && x > -w / 2 && y < h / 2 && y > -h / 2
      if (inside) {
        mouse.current.x = x
        mouse.current.y = y
      }
    }
  }

  const resizeCanvas = () => {
    if (canvasContainerRef.current && canvasRef.current && context.current) {
      canvasSize.current.w = canvasContainerRef.current.offsetWidth
      canvasSize.current.h = canvasContainerRef.current.offsetHeight

      canvasRef.current.width = canvasSize.current.w * dpr
      canvasRef.current.height = canvasSize.current.h * dpr
      canvasRef.current.style.width = `${canvasSize.current.w}px`
      canvasRef.current.style.height = `${canvasSize.current.h}px`
      context.current.scale(dpr, dpr)

      // Clear existing particles and create new ones with exact quantity
      circles.current = []
      for (let i = 0; i < quantity; i++) {
        const circle = circleParams()
        drawCircle(circle)
      }
    }
  }

  const circleParams = (): Circle => {
    const x = Math.floor(Math.random() * canvasSize.current.w)
    const y = Math.floor(Math.random() * canvasSize.current.h)
    const translateX = 0
    const translateY = 0
    const pSize = Math.floor(Math.random() * 2) + size
    const alpha = 0
    const targetAlpha = parseFloat((Math.random() * 0.6 + 0.1).toFixed(1))
    const dx = (Math.random() - 0.5) * 0.1
    const dy = (Math.random() - 0.5) * 0.1
    const magnetism = 0.1 + Math.random() * 4
    return {
      x,
      y,
      translateX,
      translateY,
      size: pSize,
      alpha,
      targetAlpha,
      dx,
      dy,
      magnetism,
    }
  }

  const rgb = hexToRgb(color)

  const drawCircle = (circle: Circle, update = false) => {
    if (context.current) {
      const { x, y, translateX, translateY, size, alpha } = circle
      context.current.translate(translateX, translateY)
      context.current.beginPath()
      context.current.arc(x, y, size, 0, 2 * Math.PI)
      context.current.fillStyle = `rgba(${rgb.join(", ")}, ${alpha})`
      context.current.fill()
      context.current.setTransform(dpr, 0, 0, dpr, 0, 0)

      if (!update) {
        circles.current.push(circle)
      }
    }
  }

  const clearContext = () => {
    if (context.current) {
      context.current.clearRect(
        0,
        0,
        canvasSize.current.w,
        canvasSize.current.h
      )
    }
  }

  const drawParticles = () => {
    clearContext()
    const particleCount = quantity
    for (let i = 0; i < particleCount; i++) {
      const circle = circleParams()
      drawCircle(circle)
    }
  }

  const remapValue = (
    value: number,
    start1: number,
    end1: number,
    start2: number,
    end2: number
  ): number => {
    const remapped =
      ((value - start1) * (end2 - start2)) / (end1 - start1) + start2
    return remapped > 0 ? remapped : 0
  }

  const animate = () => {
    clearContext()
    circles.current.forEach((circle: Circle, i: number) => {
      // Handle the alpha value
      const edge = [
        circle.x + circle.translateX - circle.size, // distance from left edge
        canvasSize.current.w - circle.x - circle.translateX - circle.size, // distance from right edge
        circle.y + circle.translateY - circle.size, // distance from top edge
        canvasSize.current.h - circle.y - circle.translateY - circle.size, // distance from bottom edge
      ]
      const closestEdge = edge.reduce((a, b) => Math.min(a, b))
      const remapClosestEdge = parseFloat(
        remapValue(closestEdge, 0, 20, 0, 1).toFixed(2)
      )
      if (remapClosestEdge > 1) {
        circle.alpha += 0.02
        if (circle.alpha > circle.targetAlpha) {
          circle.alpha = circle.targetAlpha
        }
      } else {
        circle.alpha = circle.targetAlpha * remapClosestEdge
      }
      circle.x += circle.dx + vx
      circle.y += circle.dy + vy
      circle.translateX +=
        (mouse.current.x / (staticity / circle.magnetism) - circle.translateX) /
        ease
      circle.translateY +=
        (mouse.current.y / (staticity / circle.magnetism) - circle.translateY) /
        ease

      drawCircle(circle, true)

      // circle gets out of the canvas
      if (
        circle.x < -circle.size ||
        circle.x > canvasSize.current.w + circle.size ||
        circle.y < -circle.size ||
        circle.y > canvasSize.current.h + circle.size
      ) {
        // remove the circle from the array
        circles.current.splice(i, 1)
        // create a new circle
        const newCircle = circleParams()
        drawCircle(newCircle)
      }
    })
  }

  initCanvasRef.current = initCanvas
  onMouseMoveRef.current = onMouseMove
  animateRef.current = animate

  return (
    <div
      className={cn("pointer-events-none", className)}
      ref={canvasContainerRef}
      aria-hidden="true"
      {...props}
    >
      <canvas ref={canvasRef} className="size-full" />
    </div>
  )
}
