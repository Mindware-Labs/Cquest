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
  /* El rect del canvas se cachea y solo se relee tras un scroll o un resize:
     medirlo en cada frame es una lectura de layout que puede forzar reflow si
     otra animación de la página ya ensució el árbol. */
  const rectRef = useRef<DOMRect | null>(null)

  const initCanvas = () => {
    resizeCanvas()
    drawParticles()

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
      if (!rectRef.current) {
        rectRef.current = canvasRef.current.getBoundingClientRect()
      }
      const rect = rectRef.current
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

  /* Los canales se serializan una vez y no una por círculo y frame: con 40
     partículas a 60fps eran 2.400 `join` por segundo para producir siempre la
     misma cadena. */
  const rgbChannels = hexToRgb(color).join(", ")

  const drawCircle = (circle: Circle, update = false) => {
    if (context.current) {
      const { x, y, translateX, translateY, size, alpha } = circle
      context.current.translate(translateX, translateY)
      context.current.beginPath()
      context.current.arc(x, y, size, 0, 2 * Math.PI)
      context.current.fillStyle = `rgba(${rgbChannels}, ${alpha})`
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
      const edge = [
        circle.x + circle.translateX - circle.size,
        canvasSize.current.w - circle.x - circle.translateX - circle.size,
        circle.y + circle.translateY - circle.size,
        canvasSize.current.h - circle.y - circle.translateY - circle.size,
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

      if (
        circle.x < -circle.size ||
        circle.x > canvasSize.current.w + circle.size ||
        circle.y < -circle.size ||
        circle.y > canvasSize.current.h + circle.size
      ) {
        circles.current.splice(i, 1)
        const newCircle = circleParams()
        drawCircle(newCircle)
      }
    })
  }

  /* Los efectos van DESPUÉS de las funciones que invocan, no antes. Publicar
     los refs durante el render es lo que prohíbe react-hooks/refs, y hacerlo
     en un efecto declarado más arriba dejaba las funciones en zona muerta.
     Este publica primero por orden de declaración, así que el de montaje ya
     encuentra los refs puestos. */
  useEffect(() => {
    initCanvasRef.current = initCanvas
    onMouseMoveRef.current = onMouseMove
    animateRef.current = animate
  })

  useEffect(() => {
    if (canvasRef.current) {
      context.current = canvasRef.current.getContext("2d")
    }
    initCanvasRef.current()

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)")
    let onScreen = false
    let tabVisible = document.visibilityState === "visible"

    /* La lectura del puntero se hace UNA vez por frame, dentro del rAF, en vez
       de una por evento de mousemove: un ratón entrega cientos de eventos por
       segundo y de todos ellos solo se dibuja el último. Aparcado el loop
       tampoco se paga, que es justo cuando no hay nada que dibujar. */
    const loop = () => {
      onMouseMoveRef.current()
      animateRef.current()
      rafID.current = window.requestAnimationFrame(loop)
    }

    const invalidateRect = () => {
      rectRef.current = null
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
    }

    const handleResize = () => {
      invalidateRect()
      if (resizeTimeout.current) {
        clearTimeout(resizeTimeout.current)
      }
      resizeTimeout.current = setTimeout(() => {
        initCanvasRef.current()
      }, 200)
    }

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
      onScreen = true
    }

    window.addEventListener("mousemove", handleMouseMove, { passive: true })
    window.addEventListener("resize", handleResize, { passive: true })
    window.addEventListener("scroll", invalidateRect, { passive: true })
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
      window.removeEventListener("scroll", invalidateRect)
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      reducedMotion.removeEventListener("change", handlePreferenceChange)
    }
  }, [color])

  useEffect(() => {
    initCanvasRef.current()
  }, [refresh])

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
