// Static data for landing page

export const PRICING_TIERS = [
  {
    name: 'Free',
    monthlyPrice: 0,
    yearlyPrice: 0,
    features: [
      '1 trip per month',
      'Basic AI planning',
      'Flight search',
      'View itinerary',
    ],
    cta: 'Get Started',
    highlighted: false,
    whopPlanId: {
      monthly: null,
      yearly: null,
    },
  },
  {
    name: 'Explorer',
    monthlyPrice: 10,
    yearlyPrice: 96, // 20% off
    features: [
      '5 trips per month',
      'Advanced AI planning',
      'Hotel search & booking',
      'Budget tracking',
      'Export to calendar',
    ],
    cta: 'Start Exploring',
    highlighted: true,
    whopPlanId: {
      monthly: process.env.NEXT_PUBLIC_WHOP_EXPLORER_MONTHLY_PLAN_ID,
      yearly: process.env.NEXT_PUBLIC_WHOP_EXPLORER_YEARLY_PLAN_ID,
    },
  },
  {
    name: 'Wanderer',
    monthlyPrice: 25,
    yearlyPrice: 240, // 20% off
    features: [
      'Unlimited trips',
      'Priority AI processing',
      'All booking integrations',
      'Trip sharing',
      'Priority support',
      'Early access to features',
    ],
    cta: 'Go Unlimited',
    highlighted: false,
    whopPlanId: {
      monthly: process.env.NEXT_PUBLIC_WHOP_WANDERER_MONTHLY_PLAN_ID,
      yearly: process.env.NEXT_PUBLIC_WHOP_WANDERER_YEARLY_PLAN_ID,
    },
  },
]

export const EXAMPLE_TRIPS = [
  {
    destination: 'Paris, France',
    duration: '7 days',
    iconName: 'MapPin' as const,
    highlights: ['Eiffel Tower at sunset', 'Louvre Museum tour', 'Seine River cruise', 'Montmartre exploration'],
  },
  {
    destination: 'Tokyo, Japan',
    duration: '10 days',
    iconName: 'Sun' as const,
    highlights: ['Shibuya crossing', 'Mt. Fuji day trip', 'Traditional temples', 'Akihabara adventure'],
  },
  {
    destination: 'Rome, Italy',
    duration: '5 days',
    iconName: 'Bank' as const,
    highlights: ['Colosseum tour', 'Vatican Museums', 'Trevi Fountain', 'Roman cuisine tasting'],
  },
]

export const FAQ_ITEMS = [
  {
    q: 'How does AI trip planning work?',
    a: 'Our AI analyzes your destination, travel dates, budget, and preferences to create a personalized itinerary. It searches real-time flight and hotel data, finds the best deals, and suggests activities based on what travelers like you have enjoyed.',
  },
  {
    q: 'Can I modify the suggested itinerary?',
    a: 'Absolutely! Everything our AI suggests is fully customizable. You can add, remove, or rearrange activities, change hotels, pick different flights, and adjust your budget at any time.',
  },
  {
    q: 'Are the flight and hotel prices real?',
    a: 'Yes, we pull live pricing data from major travel APIs including Duffel and Amadeus. Prices are updated in real-time when you search, though they may change when you go to book.',
  },
  {
    q: 'Is my payment information secure?',
    a: 'We use industry-standard encryption and secure payment processing. We never store your full payment details on our servers - all transactions are handled through trusted payment providers.',
  },
  {
    q: 'Can I share my trip with friends?',
    a: 'Yes! With Explorer and Wanderer plans, you can generate a shareable link that lets friends and family view your trip details. They can see your itinerary, accommodations, and planned activities.',
  },
  {
    q: 'What happens if I need to change my trip?',
    a: 'You can edit your trip anytime before booking. After booking flights or hotels, changes are subject to the provider\'s cancellation and change policies, which we display clearly before you book.',
  },
  {
    q: 'Do you offer refunds?',
    a: 'We offer a 14-day money-back guarantee on all paid plans. If you\'re not satisfied, contact us within 14 days of your subscription start date for a full refund.',
  },
]

export const HOW_IT_WORKS = [
  {
    step: 1,
    title: 'Enter Destination',
    description: 'Just tell us where you want to go. That\'s it!',
    iconName: 'Crosshair' as const,
  },
  {
    step: 2,
    title: 'AI Plans Everything',
    description: 'Our AI finds the best flights, hotels, and creates your itinerary',
    iconName: 'Robot' as const,
  },
  {
    step: 3,
    title: 'Customize & Refine',
    description: 'Adjust anything to match your preferences and budget',
    iconName: 'PencilSimple' as const,
  },
  {
    step: 4,
    title: 'Book & Travel',
    description: 'Confirm your bookings and enjoy your perfectly planned trip',
    iconName: 'AirplaneTilt' as const,
  },
]

export const WHY_CHOOSE_US = [
  {
    iconName: 'Crosshair' as const,
    title: 'All-in-One Platform',
    description: 'Flights, hotels, itinerary, budget tracking - everything you need in one place. No more juggling between apps.',
  },
  {
    iconName: 'Robot' as const,
    title: 'AI-Powered Planning',
    description: 'Our AI learns from millions of trips to give you personalized recommendations that match your travel style.',
  },
  {
    iconName: 'Coins' as const,
    title: 'Best Price Guarantee',
    description: 'We compare prices across 300+ airlines and thousands of hotels to find you the best deals.',
  },
  {
    iconName: 'ShieldCheck' as const,
    title: 'Secure & Private',
    description: 'Your data is encrypted and never sold. We take your privacy seriously.',
  },
]

export const POPULAR_DESTINATIONS = [
  { name: 'Paris', country: 'France', iconName: 'MapPin' as const },
  { name: 'Tokyo', country: 'Japan', iconName: 'Sun' as const },
  { name: 'New York', country: 'USA', iconName: 'Buildings' as const },
  { name: 'Bali', country: 'Indonesia', iconName: 'Umbrella' as const },
  { name: 'Rome', country: 'Italy', iconName: 'Bank' as const },
  { name: 'Barcelona', country: 'Spain', iconName: 'Church' as const },
]

// Early bird discount percentage (20%)
export const PRE_LAUNCH_DISCOUNT = 0.20
