"use client"
import { useRef } from "react"
import Link from "next/link"
import { Facebook, Instagram, MessageCircleCode, Youtube, Mail } from "lucide-react"

import { Separator } from "@/components/ui/separator"
import { trpc } from "@/utils/trpc"
import Image from "next/image"
import { motion } from "framer-motion"

export function Footer() {
  const { data, isLoading, error } = trpc.methods.getMethods.useQuery()
  const { data: configWeb } = trpc.setting.getSetting.useQuery()
  const paymentMethods = data?.data || []

  // Create duplicated array for infinite scrolling effect
  const duplicatedMethods = [...paymentMethods, ...paymentMethods]
  const containerRef = useRef<HTMLDivElement>(null)

  // Footer links organized in 3 sections
  const mainLinks = [
    { title: "Beranda", url: "/" },
    { title: "Cek Transaksi", url: "/find" },
    { title: "Hubungi Kami", url: "/contact-us" },
    { title: "Ulasan", url: "#" },
  ]

  const supportLinks = [
    { title: "Dukungan", url: "#" },
    { title: "Whatsapp", url: configWeb?.data?.url_wa || "#" },
    { title: "Instagram", url: configWeb?.data?.url_ig || "#" },
    { title: "Email", url: "#" },
  ]

  const legalLinks = [
    { title: "Legalitas", url: "#" },
    { title: "Kebijakan Pribadi", url: "#" },
    { title: "Syarat & Ketentuan", url: "#" },
  ]

  // Social media icons
  const socialLinks = [
    { icon: Facebook, href: "#", label: "Facebook" },
    { icon: Instagram, href: configWeb?.data?.url_ig || "#", label: "Instagram" },
    { icon: MessageCircleCode, href: configWeb?.data?.url_wa || "#", label: "WhatsApp" },
    { icon: Mail, href: "#", label: "Email" },
    { icon: Youtube, href: configWeb?.data?.url_youtube || "#", label: "Youtube" },
  ]

  return (
    <footer className="relative py-24">
      <div className="container mx-auto px-4 max-w-7xl py-12">
        {/* Company Info */}
        <div className="mb-12 max-w-3xl">
          <div className="flex items-center space-x-2 mb-4">
            <h3 className="text-2xl font-bold text-white tracking-wide">
              {configWeb?.data?.judul_web || "Vazzuniverse"}
            </h3>
          </div>
          <p className="text-gray-400 text-sm leading-relaxed mb-6">
            {configWeb?.data?.deskripsi_web ||
              "Your trusted platform for game credits, diamonds, and subscriptions. Fast, secure, and available 24/7."}
          </p>
          <div className="flex space-x-4">
            {socialLinks.map((social) => (
              <Link
                key={social.label}
                href={social.href}
                className="text-gray-400 hover:text-blue-500 transition-colors duration-300 transform hover:scale-110"
              >
                <span className="sr-only">{social.label}</span>
                <social.icon className="h-5 w-5" />
              </Link>
            ))}
          </div>
        </div>

        {/* Separator */}
        <Separator className="mb-10 bg-gray-700" />

        {/* Main Footer Content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 mb-12">
          {/* Main Navigation Links */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white relative inline-block">
              Peta Situs
              <span className="absolute -bottom-2 left-0 w-12 h-1 bg-blue-600 rounded-full"></span>
            </h3>
            <ul className="space-y-3 text-sm">
              {mainLinks.map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.url}
                    className="text-gray-400 hover:text-white transition-colors duration-300 flex items-center group"
                  >
                    <span className="transform transition-transform duration-300 group-hover:translate-x-2">
                      {link.title}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white relative inline-block">
              Dukungan
              <span className="absolute -bottom-2 left-0 w-12 h-1 bg-blue-600 rounded-full"></span>
            </h3>
            <ul className="space-y-3 text-sm">
              {supportLinks.map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.url}
                    className="text-gray-400 hover:text-white transition-colors duration-300 flex items-center group"
                  >
                    <span className="transform transition-transform duration-300 group-hover:translate-x-2">
                      {link.title}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white relative inline-block">
              Legalitas
              <span className="absolute -bottom-2 left-0 w-12 h-1 bg-blue-600 rounded-full"></span>
            </h3>
            <ul className="space-y-3 text-sm">
              {legalLinks.map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.url}
                    className="text-gray-400 hover:text-white transition-colors duration-300 flex items-center group"
                  >
                    <span className="transform transition-transform duration-300 group-hover:translate-x-2">
                      {link.title}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Payment Methods - Enhanced Slider */}
        <div className="mb-12">
          <Separator className="mb-8 bg-gray-700" />
        
          <div className="relative overflow-hidden py-4" ref={containerRef}>
            {isLoading ? (
              <div className="flex justify-center items-center py-6">
                <div className="animate-pulse flex space-x-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-12 w-20 bg-gray-700 rounded"></div>
                  ))}
                </div>
              </div>
            ) : error ? (
              <div className="text-red-400 py-4 text-center">Error loading payment methods</div>
            ) : (
              <motion.div
                className="flex gap-12"
                animate={{
                  x: [0, -1500],
                }}
                transition={{
                  repeat: Number.POSITIVE_INFINITY,
                  repeatType: "loop",
                  duration: 30,
                  ease: "linear",
                }}
              >
                {duplicatedMethods.length > 0
                  ? duplicatedMethods.map((method, index) => (
                      <div key={`${method.id}-${index}`} className="flex flex-col items-center min-w-[100px] group">
                        <div className="h-12 w-20 flex items-center justify-center bg-gray-800/50 rounded-lg p-2 group-hover:bg-gray-700/70 transition-all duration-300">
                          <Image
                            width={80}
                            height={48}
                            src={method.images || "/placeholder.svg"}
                            alt={method.name}
                            className="h-auto w-auto max-h-full max-w-full object-contain group-hover:scale-110 transition-transform duration-300"
                          />
                        </div>
                      </div>
                    ))
                  : // Fallback payment methods
                    [
                      { id: "visa", name: "Visa" },
                      { id: "mastercard", name: "Mastercard" },
                      { id: "paypal", name: "PayPal" },
                      { id: "googlepay", name: "Google Pay" },
                      { id: "applepay", name: "Apple Pay" },
                      { id: "crypto", name: "Cryptocurrency" },
                      { id: "banktransfer", name: "Bank Transfer" },
                      // Duplicates for scroll
                      { id: "visa-2", name: "Visa" },
                      { id: "mastercard-2", name: "Mastercard" },
                      { id: "paypal-2", name: "PayPal" },
                      { id: "googlepay-2", name: "Google Pay" },
                      { id: "applepay-2", name: "Apple Pay" },
                      { id: "crypto-2", name: "Cryptocurrency" },
                      { id: "banktransfer-2", name: "Bank Transfer" },
                    ].map((method) => (
                      <div key={method.id} className="flex flex-col items-center min-w-[100px] group">
                        <div className="h-12 w-20 flex items-center justify-center bg-gray-800/50 rounded-lg p-2 group-hover:bg-gray-700/70 transition-all duration-300">
                          <Image
                            width={80}
                            height={48}
                            src="/placeholder.svg?height=48&width=80"
                            alt={method.name}
                            className="h-auto max-h-full object-contain group-hover:scale-110 transition-transform duration-300"
                          />
                        </div>
                      </div>
                    ))}
              </motion.div>
            )}
          </div>
        </div>

        {/* Copyright */}
        <Separator className="mb-6 bg-gray-700" />
        <div className="flex flex-col md:flex-row justify-between items-center text-gray-400 text-sm">
          <p>
            © {new Date().getFullYear()} {configWeb?.data?.judul_web || "Vazzuniverse"}. All rights reserved.
          </p>
          <p className="mt-2 md:mt-0">
            {"Designed with"} <span className="text-red-500">♥</span> for gamers worldwide
          </p>
        </div>
      </div>
    </footer>
  )
}

