# TripFlip Technical Specification

## Core Philosophy
**Automation-First**: Take responsibility away from users while providing freedom when needed.

## User Input (Minimal)
1. Destination (smart autocomplete)
2. Travel Dates (date range)
3. Number of Travelers (stepper)
4. Departure City (autocomplete)
5. Budget Override (optional)

## Automatic Processing
1. Destination Analysis (city/region/country detection)
2. Flight Search → Auto-select best option
3. Hotel Search → Auto-select optimal choice
4. POI Discovery → Find attractions
5. Itinerary Generation → Gemini creates optimized plan
6. Price Calculation → Complete breakdown
7. Present Complete Trip

## API Integrations
- Flights: Skyscanner API (or Amadeus as fallback)
- Hotels: Booking.com API (or Amadeus as fallback)
- POIs: Google Places API
- AI: Google Gemini
- Maps: Mapbox GL JS

## Trip Details View (Tabs)
1. Overview - Summary, highlights, map
2. Itinerary - Day-by-day breakdown
3. Flights - Departure and return details
4. Hotels - Accommodation info
5. Budget - Complete price breakdown

## Map System (3 Views)
1. Trip Overview Map - All POIs, hotels, color-coded
2. Daily Route Map - Single day, connected route
3. Navigation Mode - Turn-by-turn directions

## Chat Assistant
- OPTIONAL feature (small floating button)
- For edge cases and customization
- Not the main flow
