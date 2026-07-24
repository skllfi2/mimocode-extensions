---
name: frontend-design
description: Use when building or reviewing frontend UI. Covers design systems, accessibility, responsive design, and visual polish.
---

# Frontend Design Guide

## Design Principles

1. **Clarity over cleverness** — users should never wonder what to do
2. **Consistent spacing** — use a scale: 4, 8, 12, 16, 24, 32, 48, 64
3. **Typography hierarchy** — max 3 font sizes per component
4. **Color with purpose** — each color means something
5. **Accessible by default** — ARIA labels, keyboard nav, contrast ratios

## Responsive Breakpoints

- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

## Accessibility Checklist

- [ ] All images have alt text
- [ ] Interactive elements are keyboard-focusable
- [ ] Color contrast >= 4.5:1 for text
- [ ] Form inputs have associated labels
- [ ] Error messages are announced to screen readers
- [ ] Focus visible on all interactive elements

## Common Patterns

### Modal
- Trap focus inside
- Close on Escape
- Close on backdrop click
- Return focus to trigger on close

### Toast
- Auto-dismiss after 5s
- Pause on hover
- Max 3 visible at once
- Stack from bottom-right
