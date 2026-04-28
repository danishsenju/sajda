'use client'

import type { ButtonHTMLAttributes, ReactNode } from 'react'
import styles from './GlassButton.module.css'

export type GlassVariant = 'primary' | 'ghost'

type Props = {
  children: ReactNode
  onClick?: ButtonHTMLAttributes<HTMLButtonElement>['onClick']
  className?: string
  variant?: GlassVariant
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onClick' | 'className' | 'children'>

export function GlassButton({
  children,
  onClick,
  className = '',
  variant = 'ghost',
  ...rest
}: Props) {
  return (
    <button
      {...rest}
      onClick={onClick}
      className={glassClass(variant, className)}
    >
      {children}
    </button>
  )
}

/** Returns the CSS module class string — use this to apply glass styles to
 *  non-button elements (e.g. <a> tags) without wrapping in a <button>. */
export function glassClass(variant: GlassVariant = 'ghost', extra = ''): string {
  return [
    styles.btn,
    variant === 'primary' ? styles.primary : styles.ghost,
    extra,
  ]
    .filter(Boolean)
    .join(' ')
}
