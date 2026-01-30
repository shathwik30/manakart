# 🚀 Luxury Design System - Quick Start Guide

## Quick Reference for Developers

### 📦 Import Patterns

```tsx
// Animation Components
import {
  ScrollReveal,
  ScrollRevealStagger,
  ScrollRevealItem,
  PageTransition,
  StaggerContainer,
  StaggerItem,
  LuxuryLoader,
} from "@/components/ui";

// Animation Hooks
import {
  useScrollReveal,
  useMagneticEffect,
  useParallax,
  useCountAnimation,
} from "@/hooks/useLuxuryAnimations";

// Framer Motion
import { motion, AnimatePresence } from "framer-motion";
```

---

## 🎯 Common Patterns

### 1. **Product/Item Grid with Scroll Reveal**
```tsx
<ScrollRevealStagger className="grid grid-cols-1 md:grid-cols-3 gap-8">
  {items.map((item, index) => (
    <ScrollRevealItem key={item.id}>
      <motion.div
        whileHover={{ y: -8 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Your card content */}
      </motion.div>
    </ScrollRevealItem>
  ))}
</ScrollRevealStagger>
```

### 2. **Magnetic Button**
```tsx
<Button
  variant="gold"
  magnetic
  rightIcon={<ArrowRight />}
  className="hover-glow"
>
  Shop Now
</Button>
```

### 3. **Section with Scroll Reveal**
```tsx
<ScrollReveal direction="up" delay={0.2} threshold={0.1}>
  <div className="text-center">
    <h2 className="font-display text-4xl mb-4">Heading</h2>
    <p className="text-charcoal-600">Description</p>
  </div>
</ScrollReveal>
```

### 4. **Interactive Card**
```tsx
function LuxuryCard() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ y: -12, scale: 1.02 }}
      className="luxury-card p-8 rounded-2xl"
    >
      <motion.div
        animate={{ opacity: isHovered ? 1 : 0 }}
        className="absolute inset-0 bg-gradient-to-br from-gold-400/10"
      />
      {/* Content */}
    </motion.div>
  );
}
```

### 5. **Staggered Text Animation**
```tsx
<StaggerContainer delay={0.3}>
  <StaggerItem>
    <h1 className="font-display text-6xl">Title</h1>
  </StaggerItem>
  <StaggerItem>
    <p className="text-xl text-charcoal-600">Subtitle</p>
  </StaggerItem>
  <StaggerItem>
    <Button variant="primary">Call to Action</Button>
  </StaggerItem>
</StaggerContainer>
```

### 6. **Page Wrapper (for page transitions)**
```tsx
export default function MyPage() {
  return (
    <PageTransition>
      <main className="min-h-screen">
        {/* Your page content */}
      </main>
    </PageTransition>
  );
}
```

### 7. **Hover Image Zoom**
```tsx
<div className="relative aspect-square rounded-2xl overflow-hidden">
  <motion.div
    className="relative w-full h-full"
    whileHover={{ scale: 1.08 }}
    transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
  >
    <Image src={imageSrc} alt={alt} fill className="object-cover" />
  </motion.div>
</div>
```

### 8. **Icon Button with Animation**
```tsx
<motion.button
  whileHover={{ scale: 1.1, y: -2 }}
  whileTap={{ scale: 0.95 }}
  className="p-3 rounded-full hover:bg-gold-50 transition-colors"
>
  <Heart className="w-5 h-5" />
</motion.button>
```

### 9. **Badge with Count Animation**
```tsx
<AnimatePresence>
  {count > 0 && (
    <motion.span
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      exit={{ scale: 0 }}
      className="absolute -top-2 -right-2 w-6 h-6 bg-gold-500 rounded-full flex items-center justify-center"
    >
      <motion.span
        key={count}
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-xs text-white font-medium"
      >
        {count}
      </motion.span>
    </motion.span>
  )}
</AnimatePresence>
```

### 10. **Loading State**
```tsx
{isLoading ? (
  <LuxuryLoader size="md" className="my-12" />
) : (
  <YourContent />
)}
```

---

## 🎨 Utility Classes Quick Reference

### Hover Effects
```tsx
className="hover-glow"           // Gold shadow on hover
className="hover-shimmer"        // Shimmer sweep effect
className="img-zoom"             // Image zoom on parent hover
```

### Backgrounds
```tsx
className="backdrop-luxury"      // Frosted glass effect
className="frosted-glass"        // Alternative glass effect
className="glass"                // Simple glass effect
```

### Borders & Gradients
```tsx
className="border-gradient-gold" // Gold gradient border
className="text-gradient-gold"   // Gold gradient text
```

### Cards
```tsx
className="luxury-card"          // Auto hover lift + glow
className="card"                 // Basic card
className="card-elevated"        // Card with shadow
```

### Scrollbar
```tsx
className="scrollbar-luxury"     // Gold custom scrollbar
className="no-scrollbar"         // Hide scrollbar
```

### Scroll Reveal (CSS-based)
```tsx
className="reveal-on-scroll"     // Add 'is-visible' with JS
```

---

## 🎭 Animation Timing Cheat Sheet

```tsx
// Use the luxury easing for all animations
const easing = [0.22, 1, 0.36, 1];

// Standard durations
<motion.div
  transition={{ duration: 0.3 }}      // Quick
  transition={{ duration: 0.5 }}      // Standard
  transition={{ duration: 0.7 }}      // Slow
  transition={{ duration: 1.0 }}      // Very slow
/>

// With easing
<motion.div
  transition={{
    duration: 0.6,
    ease: [0.22, 1, 0.36, 1]
  }}
/>
```

---

## 💡 Pro Tips

### 1. Stagger Delays
For sequential animations, use incremental delays:
```tsx
items.map((item, index) => (
  <motion.div
    key={item.id}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{
      delay: index * 0.1,      // 100ms between each
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1]
    }}
  >
    {/* Content */}
  </motion.div>
))
```

### 2. Hover State Tracking
```tsx
const [isHovered, setIsHovered] = useState(false);

<motion.div
  onHoverStart={() => setIsHovered(true)}
  onHoverEnd={() => setIsHovered(false)}
>
  {/* Use isHovered for conditional animations */}
</motion.div>
```

### 3. Layout Animations
For smooth size/position changes:
```tsx
<motion.div layout layoutId="unique-id">
  {/* Content that changes size/position */}
</motion.div>
```

### 4. Exit Animations
Always use AnimatePresence for exit animations:
```tsx
<AnimatePresence>
  {isVisible && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Content */}
    </motion.div>
  )}
</AnimatePresence>
```

### 5. Performance
```tsx
// Use will-change for frequently animated elements
<motion.div
  className="will-change-transform"
  whileHover={{ y: -8 }}
>
  {/* Content */}
</motion.div>
```

---

## 🎨 Color Usage Guidelines

```tsx
// Primary CTA - Use gold
<Button variant="gold">Primary Action</Button>

// Secondary actions - Use charcoal
<Button variant="primary">Secondary Action</Button>

// Tertiary - Use ghost
<Button variant="ghost">Tertiary Action</Button>

// Destructive - Use danger
<Button variant="danger">Delete</Button>

// Links and nav - Use secondary
<Button variant="secondary">Learn More</Button>
```

---

## 📱 Responsive Animations

```tsx
// Disable complex animations on mobile
const isMobile = useMediaQuery('(max-width: 768px)');

<motion.div
  whileHover={isMobile ? {} : { y: -8 }}
>
  {/* Content */}
</motion.div>

// Or use reduced motion
const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
```

---

## 🚫 Common Mistakes to Avoid

### ❌ Don't Do This
```tsx
// Too many animations at once
<motion.div
  animate={{
    x: [0, 100, 0],
    y: [0, -100, 0],
    rotate: [0, 360, 0],
    scale: [1, 1.5, 1]
  }}
/>

// Jarring transitions
transition={{ duration: 0.1 }}  // Too fast!
transition={{ duration: 3.0 }}  // Too slow!

// No easing
transition={{ duration: 0.5 }}  // Missing ease curve
```

### ✅ Do This Instead
```tsx
// Single, purposeful animation
<motion.div
  whileHover={{ y: -8 }}
  transition={{
    duration: 0.4,
    ease: [0.22, 1, 0.36, 1]
  }}
/>

// Always use luxury easing
const transition = {
  duration: 0.6,
  ease: [0.22, 1, 0.36, 1]
};
```

---

## 📚 Component API Reference

### ScrollReveal
```tsx
<ScrollReveal
  direction="up"          // up | down | left | right | scale
  delay={0}              // Delay in seconds
  threshold={0.1}        // Visibility threshold (0-1)
  className=""           // Additional classes
>
  {children}
</ScrollReveal>
```

### PageTransition
```tsx
<PageTransition
  className=""           // Additional classes
>
  {children}
</PageTransition>
```

### LuxuryLoader
```tsx
<LuxuryLoader
  size="md"             // sm | md | lg
  fullScreen={false}    // Full screen overlay
  className=""          // Additional classes
/>
```

### Button (Enhanced)
```tsx
<Button
  variant="primary"     // primary | secondary | ghost | gold | danger
  size="md"            // sm | md | lg | xl
  magnetic={false}     // Enable magnetic effect
  isLoading={false}    // Show loading spinner
  leftIcon={<Icon />}  // Left icon
  rightIcon={<Icon />} // Right icon
  fullWidth={false}    // Full width button
/>
```

---

**Happy Coding! ✨**

Remember: Less is more. Every animation should have a purpose.
