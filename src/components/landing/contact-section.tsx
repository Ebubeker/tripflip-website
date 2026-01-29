'use client'

import { motion } from 'framer-motion'
import { Mail, Twitter, MessageCircle } from 'lucide-react'

export function ContactSection() {
  return (
    <section id="contact" className="py-40 bg-[#f5f1eb]">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-xl mx-auto text-center"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Get in Touch
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Have questions? We'd love to hear from you. Reach out and we'll get back to you as soon as possible.
          </p>

          <div className="grid sm:grid-cols-3 gap-6">
            <motion.a
              href="mailto:hello@tripflip.app"
              whileHover={{ y: -5 }}
              className="flex flex-col items-center p-6 rounded-2xl bg-white border-2 border-[#e8e4dd] hover:border-primary/30 transition-all"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                <Mail className="w-6 h-6 text-primary" />
              </div>
              <span className="text-sm font-medium text-gray-900">Email</span>
              <span className="text-xs text-gray-500 mt-1">hello@tripflip.app</span>
            </motion.a>

            <motion.a
              href="https://twitter.com/tripflipapp"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ y: -5 }}
              className="flex flex-col items-center p-6 rounded-2xl bg-white border-2 border-[#e8e4dd] hover:border-primary/30 transition-all"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                <Twitter className="w-6 h-6 text-primary" />
              </div>
              <span className="text-sm font-medium text-gray-900">Twitter</span>
              <span className="text-xs text-gray-500 mt-1">@tripflipapp</span>
            </motion.a>

            <motion.a
              href="#"
              whileHover={{ y: -5 }}
              className="flex flex-col items-center p-6 rounded-2xl bg-white border-2 border-[#e8e4dd] hover:border-primary/30 transition-all"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                <MessageCircle className="w-6 h-6 text-primary" />
              </div>
              <span className="text-sm font-medium text-gray-900">Chat</span>
              <span className="text-xs text-gray-500 mt-1">Live support</span>
            </motion.a>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
