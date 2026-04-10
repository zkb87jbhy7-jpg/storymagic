'use client'

import type { InteractiveElement } from './InteractiveBookReader'
import { TappableObject } from './TappableObject'

interface InteractiveElementsProps {
  elements: InteractiveElement[]
}

/**
 * Container for all tappable items on a page.
 * Maps interactive_elements array to TappableObject components.
 */
export function InteractiveElements({ elements }: InteractiveElementsProps) {
  if (!elements || elements.length === 0) return null

  return (
    <div className="pointer-events-none absolute inset-0" aria-label="Interactive elements">
      {elements.map((element) => (
        <TappableObject key={element.id} element={element} />
      ))}
    </div>
  )
}
