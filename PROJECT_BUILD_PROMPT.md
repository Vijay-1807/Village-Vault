# 🏘️ VillageVault - Complete Project Build Prompt

## Project Overview

**VillageVault** is a comprehensive, mobile-first digital platform designed to bridge communication gaps between rural Indian communities and local governance. The system enables real-time communication, emergency reporting, alert broadcasting, and AI-powered assistance for village administration and residents.

---

## 🎯 Core Mission

Create a beautiful, intuitive, and accessible communication platform that:
- Connects Sarpanch (village heads) with villagers seamlessly
- Provides instant emergency response capabilities
- Offers multilingual support (English, Hindi, Telugu) for inclusive access
- Integrates AI-powered assistance for common queries
- Works reliably even in low-connectivity areas
- Maintains professional, modern UI/UX standards

---

## 🛠️ Technical Stack Requirements

### Frontend
- **Framework**: React 18 with TypeScript (TSX)
- **Build Tool**: Vite 5.x
- **Styling**: Tailwind CSS 3.3+ with custom design system
- **Routing**: React Router DOM 6.x
- **State Management**: React Context API
- **Real-time**: Socket.IO Client 4.x
- **Forms**: React Hook Form 7.x
- **Notifications**: React Hot Toast 2.x
- **Icons**: Lucide React 0.29+
- **Internationalization**: i18next & react-i18next
- **HTTP Client**: Axios 1.6+
- **Firebase**: Firebase SDK 12.x for storage
- **Voice**: React Audio Voice Recorder (optional)
- **Speech**: React Speech Recognition (optional)

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js 4.x
- **Database**: PostgreSQL 13+ with Prisma ORM 5.x
- **Authentication**: JWT (JSON Web Tokens)
- **Real-time**: Socket.IO 4.x
- **File Upload**: Multer
- **Validation**: Joi 17.x
- **Security**: Helmet, CORS, Express Rate Limit
- **Cloud Services**: Firebase Admin SDK, Twilio for SMS
- **Scheduling**: Node-cron

### AI Integration
- **Service**: OpenRouter API (multiple model support)
- **Fallback System**: Automatic model switching with graceful degradation
- **Models**: Support for 11+ free AI models with tiered reliability
- **Rate Limiting**: Smart delay system to prevent 429 errors

---

## 🎨 UI/UX Design Requirements

### Design System

#### Color Palette
**Primary Brand Colors:**
- Primary Orange: `#F97316` (Orange 500)
- Primary Red: `#EF4444` (Red 500)
- Gradient: `from-orange-500 to-red-500`
- Hover Gradient: `from-orange-600 to-red-600`

**Semantic Colors:**
- Success/Green: `#10B981` (Green 500)
- Warning/Yellow: `#F59E0B` (Yellow 500)
- Error/Red: `#EF4444` (Red 500)
- Info/Blue: `#3B82F6` (Blue 500)
- Emergency: `#DC2626` (Red 600)

**Neutral Colors:**
- Background: `#F9FAFB` (Gray 50)
- Surface: `#FFFFFF` (White)
- Text Primary: `#111827` (Gray 900)
- Text Secondary: `#6B7280` (Gray 500)
- Border: `#E5E7EB` (Gray 200)

**AI Chat Colors:**
- AI Purple: `#A855F7` (Purple 500)
- AI Pink: `#EC4899` (Pink 500)
- Gradient: `from-purple-500 to-pink-500`

#### Typography
- **Primary Font**: Inter (Google Fonts) - weights 300, 400, 500, 600, 700, 800
- **Display Font**: Playfair Display (for headings) - weights 400, 500, 600, 700
- **Sizes**: 
  - H1: `text-2xl font-bold` (24px)
  - H2: `text-xl font-semibold` (20px)
  - H3: `text-lg font-medium` (18px)
  - Body: `text-base` (16px)
  - Small: `text-sm` (14px)
  - XS: `text-xs` (12px)

#### Spacing & Layout
- **Container**: Max-width responsive with padding
- **Card Padding**: `p-6` (24px)
- **Section Spacing**: `space-y-6` (24px vertical)
- **Grid Gap**: `gap-6` for stats, `gap-4` for quick actions
- **Border Radius**: `rounded-xl` (12px) for cards, `rounded-lg` (8px) for buttons
- **Shadow**: `shadow-lg` for cards, `shadow-xl` on hover

#### Components

**Buttons:**
```css
.btn-primary {
  /* Gradient background orange to red */
  /* Rounded-xl, shadow-lg, hover effects */
  /* Transform hover:-translate-y-0.5 */
  /* Focus ring orange-500/30 */
}

.btn-secondary {
  /* White background with border */
  /* Similar hover/transform effects */
}

.btn-danger {
  /* Red gradient */
}
```

**Cards:**
```css
.village-card {
  /* White background, rounded-xl, shadow-sm, border-gray-200 */
  /* Hover: shadow-xl transition */
}

.village-user-card, .village-alert-card, etc. {
  /* Color-coded backgrounds (blue-100, yellow-100, etc.) */
}
```

**Inputs:**
```css
.input-field {
  /* White/90 background, backdrop-blur-sm */
  /* Border orange-200, rounded-xl */
  /* Focus ring orange-500/20 */
  /* Smooth transitions */
}
```

### Mobile-First Design
- **Breakpoints**: 
  - Mobile: < 640px (default)
  - Tablet: `md:` 640px+
  - Desktop: `lg:` 1024px+
  - Large: `xl:` 1280px+

- **Responsive Grid**: 
  - Mobile: `grid-cols-1`
  - Tablet: `grid-cols-2`
  - Desktop: `grid-cols-4` for stats

### Animations & Transitions
- **Duration**: `duration-300` (300ms) for all transitions
- **Hover Effects**: 
  - Cards: `hover:shadow-xl`
  - Buttons: `hover:-translate-y-0.5`
  - Colors: Smooth background color transitions
- **Loading**: Smooth spinner animations
- **Scroll**: Smooth scroll behavior

### Accessibility
- **WCAG 2.1 AA Compliance**
- **Keyboard Navigation**: Full keyboard support
- **Focus States**: Visible focus rings (`focus:ring-4`)
- **Color Contrast**: Minimum 4.5:1 for text
- **Screen Reader**: Semantic HTML, ARIA labels
- **Font Size**: Minimum 16px for body text
- **Touch Targets**: Minimum 44x44px for mobile

---

## 📱 Core Features & User Flows

### 1. Authentication System

#### Registration Flow
**UI Requirements:**
- Clean, centered form with village-themed imagery
- Gradient background (orange to red)
- Card-based form with white background
- Step indicator (if multi-step)
- Phone number input with country code
- PIN code search with autocomplete
- Village name dropdown/autocomplete
- Role selection (Sarpanch/Villager) - radio buttons or toggle
- Real-time validation with error messages
- Loading states during submission
- Success feedback with toast notifications

**User Flow:**
1. User enters phone number
2. Selects role (Sarpanch/Villager)
3. Enters PIN code → searches for village
4. Selects village name from dropdown
5. Enters name
6. Submits → OTP sent via SMS

#### OTP Verification Flow
**UI Requirements:**
- Clean OTP input screen
- 6-digit input boxes (individual or single input)
- Auto-focus and auto-submit on complete
- Resend OTP button (with countdown timer)
- Loading spinner during verification
- Success animation on verification

**User Flow:**
1. User enters OTP
2. Auto-verifies on completion
3. Shows success state
4. Redirects to dashboard

#### Login Flow
**UI Requirements:**
- Simple phone number input
- "Send OTP" button
- Link to registration
- Remember device option (future)

### 2. Dashboard

#### Layout
**UI Requirements:**
- Welcome section with user name and role-specific greeting
- Refresh button (top-right) with loading state
- Stats grid: 4 cards (Users, Alerts, SOS, Messages)
- Each stat card:
  - Icon in colored background circle
  - Large number (text-2xl font-semibold)
  - Label below
  - Color-coded (blue, yellow, red, green)
- Recent Alerts section:
  - List of last 5 alerts
  - Each alert card:
    - Title, message preview, priority badge, timestamp
    - Priority color coding
    - "View All" link to alerts page
- Quick Actions section:
  - 3 action cards (Create Alert, Send Message, Report Emergency)
  - Hover effects with color transitions
  - Icons matching actions
- Weather Widget (optional sidebar/embedded)

**Visual Hierarchy:**
1. Welcome message (most prominent)
2. Stats overview (quick glance)
3. Recent activity (contextual)
4. Quick actions (discoverability)

**Loading States:**
- Skeleton loaders for stats
- Placeholder cards for alerts
- Spinner overlay during refresh

**Empty States:**
- Friendly illustration or icon
- Helpful message
- Action button to create first item

### 3. Alerts Management

#### For Sarpanch (Create/Manage)
**UI Requirements:**
- Create Alert Modal/Page:
  - Title input
  - Message textarea (with character count)
  - Priority selector (Low, Medium, High, Emergency) - Radio buttons or dropdown
  - Channel selection (checkboxes): In-App, SMS, Missed Call
  - Schedule options:
    - Immediate checkbox
    - Date/Time picker for scheduled
    - Recurring options (Daily, Weekly, Monthly)
  - Preview section
  - Submit button with loading state
- Alert List View:
  - Filter by priority, date, status
  - Search bar
  - Sort options
  - Each alert card:
    - Title and message preview
    - Priority badge with color
    - Channels used (icons)
    - Delivery stats (X/Y delivered)
    - Created date/time
    - Actions: Edit, Delete, Resend
  - Pagination or infinite scroll
  - Bulk actions (select multiple)

**Priority Visual Coding:**
- Emergency: Red badge `bg-red-100 text-red-800`
- High: Orange badge `bg-orange-100 text-orange-800`
- Medium: Yellow badge `bg-yellow-100 text-yellow-800`
- Low: Blue badge `bg-blue-100 text-blue-800`

#### For Villagers (View Only)
**UI Requirements:**
- Alert feed/list view
- Filter by priority
- Mark as read/unread
- Alert detail view (full message)
- Delivery status indicator
- Date/time display

### 4. Messaging System

**UI Requirements:**
- Chat interface similar to WhatsApp/Messenger:
  - Message list/threads on left (desktop) or separate page (mobile)
  - Chat window on right (desktop) or full screen (mobile)
- Message bubbles:
  - Sent: Blue background, right-aligned
  - Received: Gray background, left-aligned
  - Timestamp below each message
  - Read receipts (checkmarks)
- Message input:
  - Textarea with auto-resize
  - Image upload button
  - Voice message button (optional)
  - Send button (enabled only with content)
  - Placeholder text
- Image preview:
  - Modal/lightbox view
  - Full-screen on mobile
- Conversation list:
  - Avatar or initials
  - Name, last message preview
  - Unread count badge
  - Timestamp of last message
  - Active indicator (if online)

**Real-time Updates:**
- New message indicator
- Typing indicator
- Online/offline status
- Read receipt updates

**Loading States:**
- Skeleton for message list
- Loading bubble for sending
- Retry button on failed messages

### 5. SOS Emergency Reports

**UI Requirements:**
- Emergency Report Form:
  - Large, prominent design
  - Description textarea (required)
  - Location input with geolocation button
  - Priority selector (Emergency only for villagers)
  - "Submit Emergency" button (red, prominent)
  - Confirmation dialog before submission
- SOS Reports List (for Sarpanch):
  - Emergency priority cards (red background)
  - Status badges (Pending, Acknowledged, Resolved)
  - Reporter name, location, description
  - Timestamp
  - Action buttons:
    - Acknowledge (changes to yellow)
    - Resolve (changes to green)
    - Contact (opens messaging)
  - Filter by status, priority, date
  - Sort by priority/date

**Visual Emphasis:**
- Red color scheme for emergency
- Large, bold text
- Urgent indicators (blinking/pulsing for active emergencies)
- Map integration (future)

### 6. Profile Management

**UI Requirements:**
- Profile Card:
  - Avatar circle (initials or image)
  - Name (editable with edit button)
  - Phone number (read-only)
  - Role badge (Sarpanch/Villager)
  - Village name
  - PIN code
- Edit Mode:
  - Inline editing for name
  - Save/Cancel buttons
  - Loading state
- Account Information Section:
  - Account status badge
  - Member since date
  - Last login timestamp
- Danger Zone:
  - Red-bordered section
  - Logout button
  - Warning text

**Visual Design:**
- Clean, organized sections
- Clear labels and values
- Subtle borders between sections
- Consistent spacing

### 7. Village Information

**UI Requirements:**
- Village Overview:
  - Village name and PIN code
  - State, District information
  - Sarpanch name (if available)
  - Total members count
- Village Members List:
  - Search/filter functionality
  - Role badges
  - Contact button (opens messaging)
  - Member since date
- Statistics (if Sarpanch):
  - Total alerts sent
  - Total SOS reports
  - Active members
  - Engagement metrics

**Visual Design:**
- Card-based layout
- Member cards with avatar/initials
- Responsive grid (1 col mobile, 2-3 cols desktop)

### 8. AI Chat Assistant

**UI Requirements:**
- Chat Interface:
  - Full-page or embedded widget
  - Header with AI branding:
    - Bot icon (gradient purple-pink circle)
    - Model name/status
    - Settings button (model switcher)
  - Message area:
    - User messages: Blue bubbles, right-aligned
    - AI messages: Gray bubbles, left-aligned with bot icon
    - Timestamps
    - Markdown support for formatting
    - Code blocks (if applicable)
  - Input area:
    - Text input with placeholder
    - Send button (gradient purple-pink)
    - Quick action buttons (Emergency Help, Weather, Health, Farming)
  - Model Switcher Modal:
    - Grid of available models
    - Tier indicators (🏆 Best, 🥈 Good, 🥉 Special, 🔧 Backup)
    - Current model highlighted
    - Model details (provider, description)
    - Color-coded by tier
- Loading States:
  - Typing indicator (animated dots)
  - "AI is thinking..." message
  - Model switch confirmation

**AI Features:**
- Auto-fallback to backup models on failure
- Rate limiting with smart delays
- Fallback responses when AI unavailable
- Context-aware responses (village-specific)

**Visual Design:**
- Purple-pink gradient theme
- Modern chat interface
- Smooth animations
- Professional AI branding

---

## 🔄 User Experience Flows

### Sarpanch User Journey
1. **Registration** → Enter details → Verify OTP
2. **Dashboard** → View stats → Quick actions
3. **Create Alert** → Compose → Select channels → Schedule → Send
4. **View SOS Reports** → Filter by priority → Acknowledge/Resolve
5. **Messages** → View conversations → Respond to villagers
6. **Village Stats** → Monitor engagement → Make decisions

### Villager User Journey
1. **Registration** → Enter details → Verify OTP
2. **Dashboard** → View alerts → Quick actions
3. **Read Alerts** → Filter by priority → View details
4. **Send Message** → Compose → Attach image (optional) → Send
5. **Report Emergency** → Fill SOS form → Submit → Track status
6. **AI Chat** → Ask questions → Get instant help

---

## 📐 Layout & Navigation

### Main Layout Structure

**Header:**
- Logo/Brand name (left)
- Language selector (center/right)
- User menu: Avatar → Dropdown (Profile, Logout)
- Offline indicator (if offline)

**Sidebar (Desktop):**
- Navigation links with icons
- Active state highlighting
- Badge counts for alerts/SOS
- Collapsible sections

**Mobile Navigation:**
- Bottom navigation bar (iOS style) or hamburger menu
- Quick access to main sections
- Floating action button for primary action

**Content Area:**
- Max-width container (responsive)
- Padding: `p-6` (mobile), `p-8` (desktop)
- White cards on gray background
- Consistent spacing

### Routing
- Public: `/login`, `/register`, `/verify-otp`
- Protected: `/dashboard`, `/alerts`, `/messages`, `/sos`, `/profile`, `/village`, `/ai-chat`
- Redirects: Unauthenticated → `/login`, Authenticated → `/dashboard`

---

## 🌐 Multilingual Support

### Languages
- **English** (en) - Default
- **Hindi** (hi) - हिन्दी
- **Telugu** (te) - తెలుగు

### UI Requirements
- Language selector in header (dropdown or toggle)
- All UI text translated (including buttons, labels, messages)
- RTL support for future languages
- Date/time formatting per locale
- Number formatting per locale

### Translation Keys Structure
```
{
  "common": {
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete",
    ...
  },
  "auth": {
    "login": "Login",
    "register": "Register",
    ...
  },
  "dashboard": {
    "welcome": "Welcome",
    "totalUsers": "Total Users",
    ...
  },
  ...
}
```

---

## ⚡ Real-time Features

### Socket.IO Integration
**UI Requirements:**
- Connection status indicator
- Reconnection animations
- Live notification badges
- Real-time message updates
- Instant alert delivery
- Live SOS status updates

**User Experience:**
- Seamless updates without page refresh
- Notification toasts for new alerts/messages
- Badge counts update automatically
- Visual indicators for real-time activity

---

## 🔔 Notifications & Feedback

### Toast Notifications
**Types:**
- Success: Green, checkmark icon
- Error: Red, X icon
- Warning: Yellow, warning icon
- Info: Blue, info icon

**Position:** Top-right (desktop), Bottom-center (mobile)

### Loading States
- **Spinner**: Circular animation
- **Skeleton**: Placeholder cards with shimmer
- **Progress Bar**: For file uploads
- **Button Loading**: Spinner inside button, disabled state

### Empty States
- Friendly illustration or icon
- Clear message
- Action button to create/add content
- Helpful tips or suggestions

### Error States
- Clear error message
- Retry button
- Support contact information
- Graceful degradation

---

## 📱 PWA & Offline Support

### Progressive Web App
- **Manifest**: App name, icons, theme colors
- **Service Worker**: Cache strategies
- **Install Prompt**: "Add to Home Screen"
- **Offline Page**: Custom offline experience

### Offline Indicator
- Banner at top when offline
- Queued actions display
- Sync when online again
- Clear offline/online status

---

## 🎯 Performance Requirements

### Load Times
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3s
- Lighthouse Score: > 90

### Optimizations
- Code splitting (route-based)
- Image optimization (lazy loading, WebP)
- Bundle size optimization
- Caching strategies
- Debounced search inputs
- Pagination/infinite scroll for lists

---

## 🔒 Security & Privacy

### UI Requirements
- Secure connection indicator (HTTPS)
- Password strength indicators (if applicable)
- OTP input masking
- Privacy policy link (footer)
- Terms of service link (footer)
- Data deletion options (profile)

### Authentication UI
- Clear session timeout warnings
- Secure logout confirmation
- Token refresh handling (silent)

---

## 🧪 Testing Considerations

### UI Testing
- Responsive design (mobile, tablet, desktop)
- Cross-browser compatibility (Chrome, Firefox, Safari, Edge)
- Dark mode support (optional)
- Accessibility testing (screen readers, keyboard navigation)
- Touch gesture testing (swipe, pinch, etc.)

---

## 📦 Component Architecture

### Reusable Components
- `Button` (Primary, Secondary, Danger variants)
- `Input` (Text, Textarea, Select, Checkbox, Radio)
- `Card` (Default, Alert, Stats variants)
- `Modal` (Alert, Confirm, Form)
- `Toast` (Success, Error, Warning, Info)
- `LoadingSpinner`
- `Badge` (Priority, Status variants)
- `Avatar` (Initials, Image)
- `Dropdown` (Menu, Select)
- `Tabs`
- `Pagination`
- `EmptyState`
- `ErrorBoundary`

### Page Components
- `Dashboard`
- `Alerts` (List, Create, Detail)
- `Messages` (List, Chat, Thread)
- `SOS` (List, Create, Detail)
- `Profile`
- `VillageInfo`
- `AIChat`

### Layout Components
- `Layout` (Main wrapper)
- `Header` (Navigation, user menu)
- `Sidebar` (Desktop navigation)
- `Footer` (Optional)

---

## 🎨 Design Assets

### Icons
- Use Lucide React icons consistently
- Icon sizes: `h-4 w-4` (small), `h-5 w-5` (medium), `h-6 w-6` (large)
- Color: Match context (semantic colors)

### Images
- Logo: Use provided logo assets
- Placeholders: Use consistent placeholder style
- Avatars: Circular with initials fallback
- Upload preview: Thumbnail with remove button

### Animations
- Smooth transitions (300ms)
- Hover effects (transform, shadow)
- Loading spinners (smooth rotation)
- Success animations (checkmark, confetti optional)
- Page transitions (fade, slide optional)

---

## 📝 Content Guidelines

### Tone
- Friendly and approachable
- Clear and concise
- Respectful and professional
- Culturally sensitive

### Language
- Simple, jargon-free
- Action-oriented button text
- Helpful error messages
- Contextual tooltips/hints

### Microcopy
- Button labels: "Create Alert", "Send Message", "Report Emergency"
- Placeholders: "Enter your message...", "Search alerts..."
- Empty states: "No alerts yet", "Start a conversation"
- Success: "Alert sent successfully!", "Message delivered"

---

## 🚀 Implementation Priority

### Phase 1: Core MVP
1. Authentication (Registration, Login, OTP)
2. Dashboard (Stats, Recent Alerts)
3. Alerts (Create, View)
4. Messages (Basic chat)
5. SOS (Report, View)

### Phase 2: Enhanced Features
1. AI Chat integration
2. Advanced filtering/search
3. Scheduling alerts
4. File uploads (images)
5. Voice messages (optional)

### Phase 3: Polish & Optimization
1. Advanced animations
2. Offline support enhancement
3. Performance optimization
4. Accessibility improvements
5. Advanced analytics

---

## ✅ Quality Checklist

### UI/UX
- [ ] Consistent color scheme throughout
- [ ] All buttons have hover/focus states
- [ ] Loading states for all async actions
- [ ] Error states with retry options
- [ ] Empty states with helpful messages
- [ ] Responsive on all screen sizes
- [ ] Smooth animations and transitions
- [ ] Clear visual hierarchy
- [ ] Accessible color contrast
- [ ] Keyboard navigation works

### Functionality
- [ ] All forms validated
- [ ] Real-time updates work
- [ ] Offline mode functional
- [ ] Notifications appear correctly
- [ ] Multilingual switching works
- [ ] AI chat responds appropriately
- [ ] File uploads work
- [ ] All CRUD operations functional

### Performance
- [ ] Fast initial load
- [ ] Smooth scrolling
- [ ] Images optimized
- [ ] Code split appropriately
- [ ] Bundle size optimized

---

## 🎓 Final Notes

**Design Philosophy:**
- **Clarity over cleverness**: Simple, clear interface
- **Consistency**: Same patterns throughout
- **Feedback**: Always show what's happening
- **Forgiveness**: Easy to undo mistakes
- **Efficiency**: Common tasks are quick
- **Accessibility**: Usable by everyone

**Cultural Sensitivity:**
- Respect local customs and language
- Use appropriate imagery
- Consider low-literacy users
- Support regional number formats
- Respect privacy preferences

**Village Context:**
- Design for slower connections
- Minimize data usage
- Provide offline alternatives
- Use familiar patterns (WhatsApp-like messaging)
- Clear, simple language

---

**This prompt should be used as a comprehensive guide for building VillageVault with perfect UI/UX. Every screen, component, and interaction should align with these specifications while maintaining flexibility for improvements based on user feedback.**

