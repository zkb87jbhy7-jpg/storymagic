'use client'

import { useTranslations } from 'next-intl'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Package, BookOpen, CreditCard, MapPin } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { OrderTracker } from '@/components/orders/OrderTracker'

export default function OrderDetailPage() {
  const t = useTranslations('orders')
  const params = useParams()
  const router = useRouter()
  const orderId = params.id as string

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Back */}
      <button
        type="button"
        onClick={() => router.back()}
        className={cn(
          'inline-flex items-center gap-2 text-sm font-medium',
          'text-slate-600 transition-colors hover:text-slate-900',
          'dark:text-slate-400 dark:hover:text-white',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:rounded',
        )}
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        {t('backToOrders')}
      </button>

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
          <Package className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {t('orderDetail')}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {t('orderId')}: {orderId}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Order tracking */}
        <div className="lg:col-span-2">
          <OrderTracker
            status="pending"
            dates={{ ordered: new Date().toISOString() }}
          />
        </div>

        {/* Order summary sidebar */}
        <div className="space-y-4">
          {/* Book info */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
              <BookOpen className="h-4 w-4" aria-hidden="true" />
              {t('bookDetails')}
            </h3>
            <div className="mt-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400">{t('bookTitle')}</span>
                <span className="font-medium text-slate-900 dark:text-white">-</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400">{t('coverType')}</span>
                <span className="font-medium text-slate-900 dark:text-white">-</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400">{t('bookSize')}</span>
                <span className="font-medium text-slate-900 dark:text-white">-</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400">{t('quantity')}</span>
                <span className="font-medium text-slate-900 dark:text-white">1</span>
              </div>
            </div>
          </div>

          {/* Payment info */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
              <CreditCard className="h-4 w-4" aria-hidden="true" />
              {t('paymentDetails')}
            </h3>
            <div className="mt-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400">{t('subtotal')}</span>
                <span className="font-medium text-slate-900 dark:text-white">-</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400">{t('shipping')}</span>
                <span className="font-medium text-slate-900 dark:text-white">-</span>
              </div>
              <div className="border-t border-slate-200 pt-2 dark:border-slate-700">
                <div className="flex justify-between text-sm font-semibold">
                  <span className="text-slate-900 dark:text-white">{t('total')}</span>
                  <span className="text-slate-900 dark:text-white">-</span>
                </div>
              </div>
            </div>
          </div>

          {/* Shipping address */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
              <MapPin className="h-4 w-4" aria-hidden="true" />
              {t('shippingAddress')}
            </h3>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
              {t('noAddressYet')}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
