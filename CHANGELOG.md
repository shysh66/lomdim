# Changelog

## 1.2.1 (2026-02-11)

### Fixed
- **Sorter Game:** Fixed color sorting level - replaced ambiguous items (butterfly, fish, diamond) with clearly colored items:
  - Red: Apple 🍎, Strawberry 🍓, Red Heart ❤️
  - Blue: Cap 🧢, Whale 🐳, Blue Heart 💙

## 1.2.0 (2026-02-11)

### Improved (Zone A - Little Explorers)
- **Junior Math:** Wrong answers now stay grayed out so kids can see which options they already tried
- **First Word Game:** Now has stages with 5 randomized words per stage
  - Progress bar shows current word in stage
  - After completing a stage, kids can:
    - Continue to next stage
    - Retry with new randomized words
    - Return to menu
  - Added more words (20 total) for variety

### Fixed
- Wrong answer buttons in Zone A games now properly disable and stay grayed out

## 1.1.0 (2026-02-11)

### Added
- Expanded Math Challenge with 21 progressive levels:
  - 4 levels of addition (up to 5, 10, 20, 50)
  - 4 levels of subtraction (up to 5, 10, 20, 50)
  - 2 mixed addition/subtraction levels
  - 5 multiplication levels (tables 2-10)
  - 3 division levels
  - 3 advanced challenge levels
- Level selection screen in Math Challenge
- Trophy/Achievement system with 16 trophies:
  - Streak achievements (5, 10, 20 correct answers)
  - Subject mastery (addition, subtraction, multiplication, division)
  - XP milestones (100, 500, 1000 XP)
  - Special achievements for memory, English, and logic games
- Trophy display modal in Zone B menu
- More XP ranks (10 total): Beginner, Explorer, Bronze, Silver, Gold, Platinum, Diamond, Champion, Genius, Legend

### Improved
- Progress bar now shows accurate progress within current rank
- Each math level has specific questions-to-pass requirements
- Better visual feedback for level completion

## 1.0.1 (2026-02-11)

### Fixed
- Math equations now display left-to-right (LTR) while Hebrew UI remains right-to-left (RTL)
- Fixed Junior Math game equation display
- Fixed Math Challenge game equation display
- Fixed Logic games (alligator comparison and number sequences) display

## 1.0.0 (2026-02-11)

### Added
- Initial release of Lomdim educational app
- Two zones: "Little Explorers" (ages 4-5) and "Ace Academy" (ages 6+)
- Zone A games:
  - The Sorter (drag & drop sorting by colors, shapes, animals)
  - Feed the Animal (counting game)
  - Junior Math (visual addition/subtraction)
  - First Word (Hebrew word to image matching)
- Zone B games:
  - Math Challenge (addition, subtraction, multiplication, division)
  - English Basics (audio-visual word learning)
  - Logic & Thinking (alligator comparison, number sequences)
  - Smart Memory (card matching with emoji, words, math)
- Profile system with avatars and names
- XP economy with ranks (Bronze to Legend)
- Parents Zone with math gatekeeper and activity dashboard
- Hebrew RTL interface with Web Speech API TTS support
- LocalStorage persistence for profiles and progress
- Framer Motion animations throughout
