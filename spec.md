# Chess Master

## Current State
A full-stack chess app with three game modes (PvP, Bot, Online Multiplayer) and WebRTC voice chat. The frontend uses React + TypeScript + Tailwind. Chess pieces use Unicode symbols which renders them without visible color distinction between black and white. The App.tsx footer contains a "Built with caffeine.ai" advertisement link. No authentication system exists.

## Requested Changes (Diff)

### Add
- Firebase Authentication (email/password + Google sign-in)
- Auth screens: Login page and Register page with tabs or toggle
- User profile screen: display name, email, avatar (initials-based), stats placeholder
- Profile button/menu in game header when logged in
- Firebase config setup (firebase.ts)
- Auth context/provider (useAuth hook)
- Lichess-style chess pieces: replace Unicode symbols with proper SVG inline pieces where white pieces are white-filled with black stroke and black pieces are black-filled with white stroke

### Modify
- ChessBoard.tsx: Replace Unicode text chess pieces with SVG-based pieces. White pieces: white fill, dark stroke/outline. Black pieces: dark/black fill, light stroke. Board colors stay the same (#F0D9B5 light, #B58863 dark).
- App.tsx: Remove the footer with "Built with caffeine.ai" advertisement. Show auth state - if not logged in, show auth page first. If logged in, show game.
- index.css: Update chess-piece styles to support SVG piece rendering
- ModeSelector.tsx: Show user avatar/name at top when logged in

### Remove
- Footer with caffeine.ai advertisement link in App.tsx

## Implementation Plan
1. Install firebase package
2. Create src/firebase.ts with Firebase config and auth initialization
3. Create src/hooks/useAuth.ts - Firebase auth context with email/password sign-in, Google sign-in, sign-out, user state
4. Create src/components/AuthScreen.tsx - Login/Register page with email+password form and "Continue with Google" button. Clean, Lichess-inspired dark design.
5. Create src/components/ProfilePanel.tsx - User profile dropdown/sheet showing name, email, avatar initials, sign-out button
6. Update ChessBoard.tsx - Replace PIECE_SYMBOLS (Unicode) with inline SVG components for all 12 piece types. White pieces use white fill + black stroke. Black pieces use black fill + white stroke.
7. Update App.tsx - Remove caffeine.ai footer. Wrap app with AuthProvider. Show AuthScreen when not logged in.
8. Update main.tsx to wrap with auth provider
