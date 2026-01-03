# Text Formatting Guide for ML Outliers

This guide defines how text should be formatted throughout the project to create beautiful, engaging, and readable content.

## Typography Principles

### 1. Headings
- **Main Headings** (h1): 2.5rem, font-weight 700, color #1a202c, letter-spacing -0.02em
- **Sub Headings** (h2): 2rem, font-weight 600, color #2d3748
- **Section Titles** (h3): 1.5rem, font-weight 600, color #2d3748

### 2. Body Text
- **Regular Paragraph**: 1.25rem, line-height 1.8, color #4a5568
- **Large Paragraph** (introductions): 1.3rem, line-height 1.9, color #2d3748
- **Small Text** (hints, notes): 1rem, line-height 1.6, color #718096

### 3. Emphasis & Styling

#### Bold Text
```jsx
<strong style={{ color: '#1a202c', fontWeight: 700 }}>Important Text</strong>
```
Use for: Key concepts, important terms, answers

#### Italic Text
```jsx
<em style={{ fontStyle: 'italic', color: '#5a67d8' }}>Emphasized Text</em>
```
Use for: Clarifications, side notes, questions

#### Highlighted Text (Stand Out)
```jsx
<span style={{
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  fontWeight: 700,
  fontSize: '1.4rem'
}}>
  LOOKING APART FROM THE CROWD
</span>
```
Use for: Definitions, critical concepts, call-to-actions

#### Colored Text
- **Primary (Purple)**: #667eea - for links, CTAs
- **Success (Green)**: #10b981 - for correct answers
- **Warning (Orange)**: #f59e0b - for hints, cautions
- **Danger (Red)**: #ef4444 - for errors, incorrect
- **Info (Blue)**: #3b82f6 - for information, resources

### 4. Special Text Elements

#### Quote / Major Statement
```jsx
<div style={{
  padding: '2rem',
  background: 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)',
  borderLeft: '5px solid #667eea',
  borderRadius: '10px',
  margin: '2rem 0'
}}>
  <p style={{
    fontSize: '1.3rem',
    fontWeight: 600,
    color: '#2d3748',
    fontStyle: 'italic',
    margin: 0
  }}>
    "Calculate correlation of all features with the Target variable"
  </p>
</div>
```

#### Code Text (Inline)
```jsx
<code style={{
  background: '#1a202c',
  color: '#10b981',
  padding: '0.2rem 0.5rem',
  borderRadius: '4px',
  fontFamily: 'monospace',
  fontSize: '0.95rem'
}}>
  df.corrwith()
</code>
```

#### Numbers / Statistics
```jsx
<span style={{
  fontSize: '1.5rem',
  fontWeight: 700,
  color: '#667eea'
}}>
  42
</span>
```

## Content Blocks

### 1. Introduction Paragraphs
```jsx
<p style={{
  fontSize: '1.3rem',
  lineHeight: '1.9',
  color: '#2d3748',
  textAlign: 'center',
  maxWidth: '700px',
  margin: '0 auto 1.5rem auto'
}}>
  Before you can build something great, you need to clean out the clutter.
</p>
```

### 2. Bullet Lists (Features)
```jsx
<ul style={{ listStyle: 'none', padding: '0 0 0 1rem' }}>
  <li style={{ marginBottom: '0.75rem', fontSize: '1.1rem' }}>
    <strong>Feature Name</strong> - Description here
  </li>
</ul>
```

### 3. Resource Cards / Dropdowns
Use gradient backgrounds with icons:
```jsx
<div style={{
  background: 'linear-gradient(135deg, #e0e7ff 0%, #ddd6fe 100%)',
  padding: '1.5rem',
  borderRadius: '10px',
  border: '2px solid #a5b4fc'
}}>
  <p style={{ color: '#4c1d95', fontWeight: 600, fontSize: '1.1rem' }}>
    📚 Resource Title
  </p>
</div>
```

## Feedback Cards

### Success Card
```css
background: linear-gradient(135deg, #10b981 0%, #059669 100%);
color: white;
padding: 2.5rem;
border-radius: 16px;
box-shadow: 0 20px 50px rgba(16, 185, 129, 0.4);
```

### Error Card
```css
background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
color: white;
padding: 2.5rem;
border-radius: 16px;
box-shadow: 0 20px 50px rgba(239, 68, 68, 0.4);
```

### Info/Answer Card
```css
background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
color: white;
padding: 2.5rem;
border-radius: 16px;
box-shadow: 0 20px 50px rgba(59, 130, 246, 0.4);
```

## Animation & Interaction

### Hover Effects
```css
transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
}
```

### Fade In
```css
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

animation: fadeIn 0.5s ease-out;
```

## Examples from ML Outliers

### Good Examples ✅
```jsx
// Standout Definition
<h2 style={{
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  fontSize: '2rem',
  fontWeight: 800,
  textAlign: 'center',
  margin: '2rem 0'
}}>
  CORRELATION
</h2>

// Major Quote
<blockquote style={{
  fontSize: '1.4rem',
  fontWeight: 600,
  fontStyle: 'italic',
  color: '#2d3748',
  borderLeft: '5px solid #667eea',
  paddingLeft: '1.5rem',
  margin: '2rem 0'
}}>
  "Calculate correlation of all features with the Target variable"
</blockquote>

// Casual Feedback
<p style={{
  fontSize: '1.2rem',
  color: 'white',
  fontWeight: 500
}}>
  Think more - Can you not see some features that ain't saving you from those Zom-Zom bites? 🧟‍♂️
</p>
```

### Avoid ❌
- Plain black text everywhere
- Uniform font sizes
- No spacing or hierarchy
- Missing emphasis on key terms
- Boring, corporate language

## Color Palette

### Primary Colors
- **Purple Gradient**: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`
- **Green Gradient**: `linear-gradient(135deg, #10b981 0%, #059669 100%)`
- **Blue Gradient**: `linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)`
- **Red Gradient**: `linear-gradient(135deg, #ef4444 0%, #dc2626 100%)`
- **Orange Gradient**: `linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)`

### Text Colors
- **Primary Text**: #1a202c (darkest)
- **Secondary Text**: #2d3748 (dark)
- **Body Text**: #4a5568 (medium)
- **Light Text**: #718096 (light)
- **Accent**: #667eea (purple)

## Best Practices

1. **Use hierarchy** - Vary font sizes to guide the eye
2. **Add color** - Use gradients and colors for emphasis
3. **Create contrast** - Mix bold, italic, and regular weights
4. **Add emotion** - Use emojis and casual language where appropriate
5. **White space** - Don't crowd text, let it breathe
6. **Consistency** - Follow this guide across all problems
7. **Readability first** - Beautiful but always readable

---

**Remember**: Every piece of text is an opportunity to engage and delight the user. Make it count!
