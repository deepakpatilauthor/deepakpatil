# Deepak Patil Portfolio - HTML/CSS/JS Version

This is a pure HTML, CSS, and JavaScript version of the Deepak Patil portfolio website, converted from the original Next.js version. The design and functionality remain exactly the same, but now uses standard web technologies without any framework dependencies.

## Features

- **Responsive Design**: Fully responsive across all device sizes
- **Modern UI**: Clean, Apple-inspired design with smooth animations
- **Interactive Navigation**: Mobile-friendly navigation with hamburger menu
- **Contact Form**: Functional contact form with validation
- **Blog System**: Category filtering and newsletter subscription
- **Performance Optimized**: Fast loading with optimized CSS and JavaScript
- **Accessibility**: Proper ARIA labels and keyboard navigation support

## File Structure

```
deepak-portfolio-html/
├── index.html          # Homepage
├── about.html          # About page
├── work.html           # Work/Portfolio page
├── blog.html           # Blog page
├── contact.html        # Contact page
├── Photo.jpg           # Profile photo
├── styles/
│   └── main.css        # All CSS styles (converted from Tailwind)
├── js/
│   └── main.js         # All JavaScript functionality
└── README.md           # This file
```

## Pages

1. **Homepage (index.html)**: Hero section with featured work preview
2. **About (about.html)**: Personal information, experience, skills, and education
3. **Work (work.html)**: Portfolio projects with process section
4. **Blog (blog.html)**: Blog posts with category filtering and newsletter
5. **Contact (contact.html)**: Contact form and information

## Technologies Used

- **HTML5**: Semantic markup
- **CSS3**: Custom CSS with CSS Grid, Flexbox, and animations
- **Vanilla JavaScript**: No frameworks or libraries
- **Google Fonts**: Inter, Manrope, and Josefin Sans fonts

## Features Implemented

### Navigation
- Fixed header with scroll effects
- Mobile hamburger menu
- Active page highlighting
- Smooth scrolling

### Animations
- Fade-in animations on scroll
- Hover effects on cards and buttons
- Smooth transitions throughout
- Mobile-optimized animations

### Forms
- Contact form with validation
- Newsletter subscription
- Email validation
- Form submission handling

### Interactive Elements
- Blog category filtering
- Mobile menu toggle
- Scroll to top functionality
- Project card hover effects

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance

- No external dependencies (except Google Fonts)
- Optimized CSS with minimal redundancy
- Efficient JavaScript with event delegation
- Responsive images
- Fast loading times

## Getting Started

1. Open `index.html` in your web browser
2. All pages are linked and functional
3. No build process required
4. Works with any web server or locally

## Customization

### Colors
Edit the CSS variables in `styles/main.css`:
```css
:root {
  --color-primary: #000000;
  --color-secondary: #1c1c1e;
  --color-background: #ffffff;
  /* ... */
}
```

### Content
- Update personal information in HTML files
- Replace `Photo.jpg` with your own photo
- Modify project information in `work.html`
- Update blog posts in `blog.html`

### Styling
- All styles are in `styles/main.css`
- Responsive breakpoints are clearly marked
- Easy to modify colors, fonts, and spacing

## Deployment

This website can be deployed to any static hosting service:
- GitHub Pages
- Netlify
- Vercel
- AWS S3
- Any web server

Simply upload all files to your hosting provider.

## Differences from Next.js Version

- No server-side rendering
- No React components (pure HTML)
- No Tailwind CSS (custom CSS)
- No build process required
- No Node.js dependencies
- Direct file access (no routing)

## License

© 2025 Deepak Patil. All rights reserved.
