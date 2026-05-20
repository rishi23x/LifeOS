import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ClerkProvider } from '@clerk/clerk-react'
import App from './App'
import './index.css'

const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

// Custom cursor
function initCursor() {
  const dot = document.createElement('div')
  dot.className = 'cursor-dot'
  document.body.appendChild(dot)

  const ring = document.createElement('div')
  ring.className = 'cursor-ring'
  document.body.appendChild(ring)

  let mouseX = 0
  let mouseY = 0
  let ringX = 0
  let ringY = 0

  document.addEventListener('mousemove', function(e) {
    mouseX = e.clientX
    mouseY = e.clientY
    dot.style.left = mouseX + 'px'
    dot.style.top = mouseY + 'px'
  })

  // Smooth ring follow
  function animateRing() {
    ringX += (mouseX - ringX) * 0.12
    ringY += (mouseY - ringY) * 0.12
    ring.style.left = ringX + 'px'
    ring.style.top = ringY + 'px'
    requestAnimationFrame(animateRing)
  }
  animateRing()

  // Hover effects
  document.addEventListener('mouseover', function(e) {
    const target = e.target as HTMLElement
    if (
      target.tagName === 'BUTTON' ||
      target.tagName === 'A' ||
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.tagName === 'SELECT' ||
      target.closest('button') ||
      target.closest('a') ||
      target.classList.contains('cursor-pointer')
    ) {
      dot.classList.add('hovering')
      ring.classList.add('hovering')
    }
  })

  document.addEventListener('mouseout', function() {
    dot.classList.remove('hovering')
    ring.classList.remove('hovering')
  })
}

initCursor()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <ClerkProvider publishableKey={publishableKey}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </ClerkProvider>
)
