# PlanA Color Guide

## 🎨 Primary Colors

### Orange (Primary)
```
Hex: #FF6B35
RGB: rgb(255, 107, 53)
OKLCH: oklch(0.68 0.22 41)
HSL: hsl(16, 100%, 60%)
```

**Usage:**
- Primary buttons and CTAs
- Progress indicators
- Success states
- Active navigation items
- Important highlights
- Completion badges

**Examples:**
```tsx
<Button className="bg-primary">Start Project</Button>
<Progress value={75} className="bg-primary" />
<Badge className="bg-primary">Completed</Badge>
```

### Blue (Secondary)
```
Hex: #2E5EFF
RGB: rgb(46, 94, 255)
OKLCH: oklch(0.55 0.20 250)
HSL: hsl(226, 100%, 59%)
```

**Usage:**
- Secondary buttons
- Information panels
- Links and navigation
- Sidebar backgrounds
- Informational badges
- Secondary highlights

**Examples:**
```tsx
<Button className="bg-secondary">Learn More</Button>
<Card className="border-secondary">Info</Card>
<Link className="text-secondary">View Details</Link>
```

## 🎨 Color Variations

### Orange Variations

**Light Orange**
```
Hex: #FF8C5E
OKLCH: oklch(0.78 0.18 41)
```
Use for: Hover states, lighter backgrounds

**Dark Orange**
```
Hex: #E65528
OKLCH: oklch(0.58 0.24 41)
```
Use for: Active states, pressed buttons

### Blue Variations

**Light Blue**
```
Hex: #5B7FFF
OKLCH: oklch(0.65 0.18 250)
```
Use for: Hover states, lighter backgrounds

**Dark Blue**
```
Hex: #1E3FCC
OKLCH: oklch(0.45 0.22 250)
```
Use for: Active states, dark mode

## 🌓 Light Mode

```css
:root {
  /* Backgrounds */
  --background: oklch(0.99 0 0);           /* Almost white */
  --card: oklch(1 0 0);                    /* Pure white */
  
  /* Text */
  --foreground: oklch(0.15 0.02 250);      /* Almost black */
  --muted-foreground: oklch(0.50 0.05 250); /* Gray text */
  
  /* Primary (Orange) */
  --primary: oklch(0.68 0.22 41);
  --primary-foreground: oklch(1 0 0);      /* White text on orange */
  
  /* Secondary (Blue) */
  --secondary: oklch(0.55 0.20 250);
  --secondary-foreground: oklch(1 0 0);    /* White text on blue */
  
  /* Borders */
  --border: oklch(0.90 0.02 250);          /* Light gray */
  --input: oklch(0.90 0.02 250);
}
```

## 🌙 Dark Mode

```css
.dark {
  /* Backgrounds */
  --background: oklch(0.12 0.02 250);      /* Dark blue-black */
  --card: oklch(0.16 0.02 250);            /* Slightly lighter */
  
  /* Text */
  --foreground: oklch(0.98 0 0);           /* Almost white */
  --muted-foreground: oklch(0.70 0.04 250); /* Light gray */
  
  /* Primary (Orange - lighter in dark) */
  --primary: oklch(0.78 0.18 41);
  --primary-foreground: oklch(0.12 0.02 250); /* Dark text on orange */
  
  /* Secondary (Blue - lighter in dark) */
  --secondary: oklch(0.65 0.18 250);
  --secondary-foreground: oklch(0.12 0.02 250); /* Dark text on blue */
  
  /* Borders */
  --border: oklch(0.25 0.02 250);          /* Dark gray */
  --input: oklch(0.25 0.02 250);
}
```

## 📊 Semantic Colors

### Success (Use Orange)
```tsx
<Alert className="border-primary bg-primary/10">
  <CheckCircle className="text-primary" />
  <AlertTitle>Success!</AlertTitle>
  <AlertDescription>Project completed</AlertDescription>
</Alert>
```

### Info (Use Blue)
```tsx
<Alert className="border-secondary bg-secondary/10">
  <Info className="text-secondary" />
  <AlertTitle>Information</AlertTitle>
  <AlertDescription>New feature available</AlertDescription>
</Alert>
```

### Warning (Use Orange variant)
```tsx
<Alert className="border-accent bg-accent/10">
  <AlertTriangle className="text-accent" />
  <AlertTitle>Warning</AlertTitle>
  <AlertDescription>Deadline approaching</AlertDescription>
</Alert>
```

### Error (Use Destructive)
```tsx
<Alert className="border-destructive bg-destructive/10">
  <XCircle className="text-destructive" />
  <AlertTitle>Error</AlertTitle>
  <AlertDescription>Submission failed</AlertDescription>
</Alert>
```

## 🎯 Component Examples

### Buttons

```tsx
// Primary (Orange)
<Button className="bg-primary hover:bg-primary/90">
  Start Project
</Button>

// Secondary (Blue)
<Button className="bg-secondary hover:bg-secondary/90">
  View Details
</Button>

// Outline (Orange)
<Button variant="outline" className="border-primary text-primary">
  Learn More
</Button>

// Ghost (Blue)
<Button variant="ghost" className="text-secondary">
  Cancel
</Button>
```

### Cards

```tsx
// Default card
<Card className="border-border">
  <CardHeader>
    <CardTitle>Project Title</CardTitle>
  </CardHeader>
</Card>

// Highlighted card (Orange)
<Card className="border-primary bg-primary/5">
  <CardHeader>
    <CardTitle className="text-primary">Featured Project</CardTitle>
  </CardHeader>
</Card>

// Info card (Blue)
<Card className="border-secondary bg-secondary/5">
  <CardHeader>
    <CardTitle className="text-secondary">Information</CardTitle>
  </CardHeader>
</Card>
```

### Progress Bars

```tsx
// Orange progress
<Progress value={75} className="[&>div]:bg-primary" />

// Blue progress
<Progress value={50} className="[&>div]:bg-secondary" />
```

### Badges

```tsx
// Success (Orange)
<Badge className="bg-primary">Completed</Badge>

// Info (Blue)
<Badge className="bg-secondary">In Progress</Badge>

// Outline
<Badge variant="outline" className="border-primary text-primary">
  New
</Badge>
```

## 🎨 Gradient Alternatives

Since we're using solid colors only, here are alternatives to gradients:

### Instead of Gradient Backgrounds
```tsx
// ❌ Don't use
<div className="bg-gradient-to-r from-orange-500 to-blue-500">

// ✅ Use solid with accent
<div className="bg-primary border-l-4 border-secondary">
```

### Instead of Gradient Text
```tsx
// ❌ Don't use
<h1 className="bg-gradient-to-r from-orange-500 to-blue-500 bg-clip-text">

// ✅ Use solid color
<h1 className="text-primary">
```

### Instead of Gradient Borders
```tsx
// ❌ Don't use
<div className="border-gradient">

// ✅ Use dual borders
<div className="border-l-4 border-l-primary border-r-4 border-r-secondary">
```

## 📱 Accessibility

### Contrast Ratios

**Orange on White**
- Ratio: 4.5:1 ✅ (WCAG AA)
- Use for: Text, icons, buttons

**Blue on White**
- Ratio: 7.2:1 ✅ (WCAG AAA)
- Use for: Text, links, important info

**White on Orange**
- Ratio: 4.5:1 ✅ (WCAG AA)
- Use for: Button text, badges

**White on Blue**
- Ratio: 7.2:1 ✅ (WCAG AAA)
- Use for: Button text, navigation

### Color Blindness

Both orange and blue are distinguishable for most types of color blindness:
- Protanopia (red-blind) ✅
- Deuteranopia (green-blind) ✅
- Tritanopia (blue-blind) ⚠️ (use patterns/icons as backup)

Always include icons or patterns alongside colors for critical information.

## 🎨 Brand Assets

### Logo Colors
- Primary: Orange #FF6B35
- Secondary: Blue #2E5EFF
- Text: Dark #1A1A1A or White #FFFFFF

### Social Media
- Use orange for primary branding
- Use blue for informational posts
- Maintain 60-30-10 rule:
  - 60% neutral (white/dark)
  - 30% blue
  - 10% orange (accents)

## 🔧 Implementation

### Tailwind Config
```typescript
// tailwind.config.ts
theme: {
  extend: {
    colors: {
      primary: 'oklch(0.68 0.22 41)',      // Orange
      secondary: 'oklch(0.55 0.20 250)',   // Blue
    }
  }
}
```

### CSS Variables
```css
/* app/globals.css */
:root {
  --plana-orange: oklch(0.68 0.22 41);
  --plana-blue: oklch(0.55 0.20 250);
  --primary: var(--plana-orange);
  --secondary: var(--plana-blue);
}
```

### React Components
```tsx
// Use semantic names
const colors = {
  action: 'bg-primary',      // Orange for actions
  info: 'bg-secondary',      // Blue for info
  success: 'bg-primary',     // Orange for success
  link: 'text-secondary',    // Blue for links
}
```

## 📊 Usage Guidelines

### Do's ✅
- Use orange for primary actions and CTAs
- Use blue for navigation and information
- Maintain high contrast for text
- Use solid colors consistently
- Add icons to reinforce meaning

### Don'ts ❌
- Don't use gradients
- Don't mix too many colors
- Don't use low-contrast combinations
- Don't rely on color alone for meaning
- Don't use colors inconsistently

## 🎯 Quick Reference

| Element | Color | Class |
|---------|-------|-------|
| Primary Button | Orange | `bg-primary` |
| Secondary Button | Blue | `bg-secondary` |
| Link | Blue | `text-secondary` |
| Success | Orange | `text-primary` |
| Progress | Orange | `bg-primary` |
| Navigation | Blue | `bg-secondary` |
| Highlight | Orange | `border-primary` |
| Info Panel | Blue | `border-secondary` |

---

**Remember**: Orange = Action, Blue = Information

Keep it simple, keep it solid, keep it PlanA! 🚀
