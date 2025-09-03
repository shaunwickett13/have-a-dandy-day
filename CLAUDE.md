# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

"Have A Dandy Day" is a whimsical, interactive web experience that wishes visitors a dandy day through animations, music, and motivational quotes from the character Dandy Dan. This is a static website with no build process required.

## Architecture

### Core Components

1. **Main Experience** (`index.html:215-323`)
   - Central button triggers a 30-second audiovisual experience
   - Synchronized animations tied to audio timestamps via `focusSchedule` array
   - Fireworks generation starts at 25 seconds
   - Experience auto-stops when audio ends

2. **Quote System** (`index.html:35-82`)
   - QuoteProvider class manages 18 randomized quotes
   - Quotes shuffle on initialization for varied user experience
   - Share functionality integrates with native sharing APIs

3. **API Integration** (`index.html:84-105`)
   - DandyDayApi class connects to `api.haveadandyday.com`
   - Tracks total button clicks across all users
   - Displays count using Odometer library for animated numbers

4. **Animation System**
   - CSS animations in `style.css:829-1183` handle all visual effects
   - Keyframe animations for: fireworks, dancing, rainbow colors, clouds drifting, sun rotating, grass swaying
   - JavaScript controls animation timing and state transitions

### State Management

The application uses CSS classes on the body element to manage global state:
- `body.active` - Main experience is running
- `#splash.show-misc` - Bottom panel sections are visible
- `#quote-section.show-quote` - Quote is displayed

### Key Interactive Elements

- **Start Button**: Launches main experience with audio/visual show
- **Share Button**: Native share API integration (hidden if unavailable)
- **Stats Button**: Shows total dandy days wished globally
- **Quotes Button**: Interactive Dandy Dan nose-boop for new quotes
- **FAQ/About**: Static informational content

## Backend Architecture

### AWS Amplify Setup
The backend uses AWS Amplify Gen 2 with:
- **DynamoDB Table** (`DandyDayCounter`) - Stores button click count
- **Lambda Function** (`counter-api`) - Handles increment/get operations  
- **API Gateway** - REST API with CORS for public access

### API Endpoints
- `POST /statistics/button` - Increment counter
- `GET /statistics/button` - Get current count

## Development Notes

### Testing Changes
Since this is a static site, simply open `index.html` in a browser. The site includes live.js for auto-refresh during localhost development (`index.html:258-263`).

### Backend Development
- Run `npm run sandbox` to start local Amplify sandbox
- API URL is configured in `api-config.js`

### Cross-Origin Considerations
The API calls to `api.haveadandyday.com` may fail locally due to CORS. The experience degrades gracefully if API is unavailable.

### Browser Compatibility
- Uses modern CSS features (backdrop-filter, aspect-ratio, container queries)
- Requires JavaScript for all interactive features
- Share button auto-hides on browsers without native share support

### Key Files
- `index.html` - All HTML and JavaScript logic
- `style.css` - All styling and animations
- `audio/jingle.mp3` - 30-second audio track that drives the experience
- `error.html` - 404 error page
- `site.webmanifest` - PWA configuration