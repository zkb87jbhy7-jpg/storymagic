'use client'

import { useTranslations } from 'next-intl'
import { Package } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { OrderCard } from '@/components/orders/OrderCard'
import { EmptyState } from '@/components/shared/EmptyState'

export default function OrdersPage() {
  const t = useTranslations('orders')

  // Orders would come from API/server component
  const orders: Array<React.ComponentProps<typeof OrderCard>> = []

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
          <Package className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {t('ordersTitle')}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {t('ordersSubtitle')}
          </p>
        </div>
      </div>

      {/* Orders list */}
      {orders.length === 0 ? (
        <EmptyState
          icon={Package}
          title={t('noOrders')}
          description={t('noOrdersDescription')}
        />
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <OrderCard key={order.id} {...order} />
          ))}
        </div>
      )}
    </div>
  )
}
