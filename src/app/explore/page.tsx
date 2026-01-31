'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Navbar } from '@/components/shared/navbar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Search,
  TrendingUp,
  Sparkles,
  MapPin,
  Calendar,
  Plane,
  Palmtree,
  Mountain,
  Building2,
  Compass,
  Heart,
  Users,
  Wallet,
  ArrowRight,
  Star
} from 'lucide-react'

// Featured destinations data
const trendingDestinations = [
  { name: 'Tokyo', country: 'Japan', image: '🗼', price: 1200, rating: 4.9 },
  { name: 'Paris', country: 'France', image: '🗼', price: 900, rating: 4.8 },
  { name: 'Bali', country: 'Indonesia', image: '🏝️', price: 800, rating: 4.7 },
  { name: 'New York', country: 'USA', image: '🗽', price: 1100, rating: 4.6 },
  { name: 'Barcelona', country: 'Spain', image: '⛪', price: 750, rating: 4.8 },
  { name: 'Dubai', country: 'UAE', image: '🏙️', price: 950, rating: 4.5 },
]

const categories = [
  { name: 'Beach & Islands', icon: Palmtree, color: 'bg-cyan-100 text-cyan-600', destinations: ['Maldives', 'Bali', 'Phuket', 'Santorini'] },
  { name: 'Mountains & Nature', icon: Mountain, color: 'bg-green-100 text-green-600', destinations: ['Swiss Alps', 'Patagonia', 'Nepal', 'New Zealand'] },
  { name: 'Cities & Culture', icon: Building2, color: 'bg-purple-100 text-purple-600', destinations: ['Rome', 'Kyoto', 'Istanbul', 'Marrakech'] },
  { name: 'Adventure', icon: Compass, color: 'bg-orange-100 text-orange-600', destinations: ['Costa Rica', 'Iceland', 'South Africa', 'Peru'] },
  { name: 'Romantic Getaways', icon: Heart, color: 'bg-pink-100 text-pink-600', destinations: ['Paris', 'Venice', 'Maldives', 'Santorini'] },
  { name: 'Family Friendly', icon: Users, color: 'bg-blue-100 text-blue-600', destinations: ['Orlando', 'London', 'Tokyo', 'Barcelona'] },
  { name: 'Budget Travel', icon: Wallet, color: 'bg-yellow-100 text-yellow-600', destinations: ['Vietnam', 'Portugal', 'Mexico', 'Thailand'] },
]

const weekendGetaways = [
  { from: 'New York', to: 'Miami', price: 299, days: 3 },
  { from: 'London', to: 'Amsterdam', price: 199, days: 2 },
  { from: 'Los Angeles', to: 'Las Vegas', price: 249, days: 2 },
  { from: 'Paris', to: 'Barcelona', price: 179, days: 3 },
]

const bucketList = [
  { name: 'Northern Lights in Iceland', emoji: '🌌' },
  { name: 'Machu Picchu, Peru', emoji: '🏔️' },
  { name: 'Safari in Tanzania', emoji: '🦁' },
  { name: 'Great Barrier Reef', emoji: '🐠' },
  { name: 'Cherry Blossoms in Japan', emoji: '🌸' },
  { name: 'Aurora in Norway', emoji: '✨' },
]

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar variant="hero" />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-sky-500 to-sky-600 text-white pt-12 pb-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Explore Destinations
            </h1>
            <p className="text-xl text-white/90 mb-8">
              Discover your next adventure. Get inspired by trending destinations, deals, and curated collections.
            </p>
            
            {/* Search Bar */}
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Search destinations, countries, or experiences..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-14 pl-12 pr-4 text-lg rounded-2xl border-0 text-gray-900 bg-white"
              />
            </div>
          </motion.div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-12 space-y-16">
        {/* Trending Destinations */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-bold text-gray-900">Trending Now</h2>
            </div>
            <Button variant="ghost" className="gap-2">
              View all <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {trendingDestinations.map((dest, i) => (
              <motion.div
                key={dest.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link href={`/plan?destination=${encodeURIComponent(dest.name)}`}>
                  <div className="bg-white rounded-2xl p-4 shadow-sm border hover:shadow-md hover:-translate-y-1 transition-all cursor-pointer">
                    <div className="text-4xl mb-3">{dest.image}</div>
                    <h3 className="font-semibold text-gray-900">{dest.name}</h3>
                    <p className="text-sm text-gray-500">{dest.country}</p>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-sm font-medium text-blue-600">From ${dest.price}</span>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                        <span className="text-xs text-gray-600">{dest.rating}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Browse by Category */}
        <section>
          <h2 className="text-2xl font-bold mb-6 text-gray-900">Browse by Category</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {categories.slice(0, 4).map((cat, i) => (
              <motion.div
                key={cat.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white rounded-2xl p-6 shadow-sm border hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className={`w-12 h-12 rounded-xl ${cat.color} flex items-center justify-center mb-4`}>
                  <cat.icon className="w-6 h-6" />
                </div>
                <h3 className="font-semibold mb-2 text-gray-900">{cat.name}</h3>
                <div className="flex flex-wrap gap-2">
                  {cat.destinations.slice(0, 3).map(d => (
                    <Link key={d} href={`/plan?destination=${encodeURIComponent(d)}`}>
                      <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full hover:bg-gray-200 transition-colors">
                        {d}
                      </span>
                    </Link>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
          
          <div className="grid md:grid-cols-3 gap-4 mt-4">
            {categories.slice(4).map((cat, i) => (
              <motion.div
                key={cat.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: (i + 4) * 0.05 }}
                className="bg-white rounded-2xl p-6 shadow-sm border hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className={`w-12 h-12 rounded-xl ${cat.color} flex items-center justify-center mb-4`}>
                  <cat.icon className="w-6 h-6" />
                </div>
                <h3 className="font-semibold mb-2 text-gray-900">{cat.name}</h3>
                <div className="flex flex-wrap gap-2">
                  {cat.destinations.slice(0, 3).map(d => (
                    <Link key={d} href={`/plan?destination=${encodeURIComponent(d)}`}>
                      <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full hover:bg-gray-200 transition-colors">
                        {d}
                      </span>
                    </Link>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Weekend Getaways */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <Calendar className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold text-gray-900">Weekend Getaways</h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {weekendGetaways.map((trip, i) => (
              <motion.div
                key={`${trip.from}-${trip.to}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white rounded-2xl p-5 shadow-sm border hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="font-medium text-gray-900">{trip.from}</span>
                  <Plane className="w-4 h-4 text-gray-400" />
                  <span className="font-medium text-gray-900">{trip.to}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">{trip.days} days</span>
                  <span className="text-lg font-bold text-primary">${trip.price}</span>
                </div>
                <Link href={`/plan?destination=${encodeURIComponent(trip.to)}&departureCity=${encodeURIComponent(trip.from)}`}>
                  <Button className="w-full mt-4" variant="outline" size="sm">
                    Plan this trip
                  </Button>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Bucket List */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold text-gray-900">Bucket List Experiences</h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {bucketList.map((item, i) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link href={`/plan?destination=${encodeURIComponent(item.name.split(',')[0])}`}>
                  <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white rounded-2xl p-6 hover:scale-[1.02] transition-transform cursor-pointer">
                    <span className="text-3xl mb-3 block">{item.emoji}</span>
                    <h3 className="font-semibold text-lg">{item.name}</h3>
                    <p className="text-white/60 text-sm mt-1">Once in a lifetime</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="text-center py-12">
          <h2 className="text-3xl font-bold mb-4 text-gray-900">Ready to plan your trip?</h2>
          <p className="text-gray-600 mb-8 max-w-lg mx-auto">
            Tell us where you want to go and we'll create the perfect itinerary in seconds.
          </p>
          <Link href="/plan">
            <Button size="lg" className="gap-2 px-8">
              <Sparkles className="w-5 h-5" />
              Start Planning
            </Button>
          </Link>
        </section>
      </main>
    </div>
  )
}
