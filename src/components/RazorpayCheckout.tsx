'use client'

import React, { useState, useEffect } from 'react'

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Razorpay: any
  }
}

interface RazorpayCheckoutProps {
  orderId: string
  amount: number
  currency: string
  registrationId: string
  razorpayKey?: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSuccess: (response: any) => void
  buttonText?: string
  className?: string
}

export default function RazorpayCheckout({
  orderId,
  amount,
  currency = 'INR',
  registrationId,
  razorpayKey,
  onSuccess,
  buttonText = 'Pay Now with Razorpay',
  className = '',
}: RazorpayCheckoutProps) {
  const [loading, setLoading] = useState(false)
  const [scriptLoaded, setScriptLoaded] = useState(false)

  useEffect(() => {
    if (window.Razorpay) {
      setScriptLoaded(true)
      return
    }

    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    script.onload = () => setScriptLoaded(true)
    script.onerror = () => {
      console.error('Failed to load Razorpay SDK')
      alert('Unable to load payment gateway. Please check your internet connection.')
    }
    document.body.appendChild(script)

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script)
      }
    }
  }, [])

  const handlePayment = () => {
    if (!scriptLoaded || !window.Razorpay) {
      alert('Payment SDK is still loading, please wait a moment.')
      return
    }

    setLoading(true)

    const options = {
      key: razorpayKey || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '',
      amount: amount,
      currency: currency,
      name: 'DHRUVA · Kerala NCC Fest',
      description: `Registration #${registrationId}`,
      order_id: orderId,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      handler: function (response: any) {
        setLoading(false)
        onSuccess(response)
      },
      modal: {
        ondismiss: function () {
          setLoading(false)
        },
      },
      theme: {
        color: '#CC892F', // DHRUVA Rich Golden Amber
      },
    }

    try {
      const paymentObject = new window.Razorpay(options)
      paymentObject.open()
    } catch (err) {
      console.error('Error opening Razorpay checkout:', err)
      setLoading(false)
      alert('Error launching payment window.')
    }
  }

  return (
    <button
      type="button"
      onClick={handlePayment}
      disabled={loading || !scriptLoaded}
      className={
        className ||
        'w-full h-12 px-6 rounded-full font-bold text-xs uppercase tracking-wider gold-gradient-button transition disabled:opacity-50 flex items-center justify-center gap-2'
      }
    >
      {loading ? (
        <>
          <span className="inline-block animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></span>
          Processing...
        </>
      ) : (
        <>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          {buttonText} (₹{(amount / 100).toFixed(2)})
        </>
      )}
    </button>
  )
}
