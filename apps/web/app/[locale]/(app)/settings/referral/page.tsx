'use client'

import { useCallback, useState } from 'react'
import { useTranslations } from 'next-intl'
import {
  Users,
  Copy,
  Check,
  Gift,
  TrendingUp,
  Share2,
  UserPlus,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface ReferralStats {
  totalReferrals: number
  successfulReferrals: number
  pendingReferrals: number
  totalEarned: number
  currency: string
}

interface Referral {
  id: string
  email: string
  status: 'pending' | 'signed_up' | 'subscribed'
  date: string
  reward?: number
}

const referralStatusStyles = {
  pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  signed_up: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  subscribed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
} as const

export default function ReferralPage() {
  const t = useTranslations('settings')
  const [copied, setCopied] = useState(false)

  const referralCode = 'STORY-XXXX'
  const referralLink = `https://storymagic.app/ref/${referralCode}`

  const stats: ReferralStats = {
    totalReferrals: 0,
    successfulReferrals: 0,
    pendingReferrals: 0,
    totalEarned: 0,
    currency: 'USD',
  }

  const referrals: Referral[] = []

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: stats.currency,
    }).format(amount)

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(referralLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [referralLink])

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
          <Share2 className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {t('referralTitle')}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {t('referralSubtitle')}
          </p>
        </div>
      </div>

      {/* Referral link card */}
      <div className="rounded-2xl border border-slate-200 bg-gradient-to-r from-purple-50 to-pink-50 p-6 dark:border-slate-700 dark:from-purple-900/10 dark:to-pink-900/10">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
          {t('yourReferralLink')}
        </h2>
        <div className="mt-3 flex items-center gap-2">
          <div className="flex-1 truncate rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-mono text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300">
            {referralLink}
          </div>
          <button
            type="button"
            onClick={handleCopy}
            className={cn(
              'inline-flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold',
              copied
                ? 'bg-green-600 text-white'
                : 'bg-primary-600 text-white hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600',
              'transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
              'dark:focus-visible:ring-offset-slate-900',
            )}
          >
            {copied ? (
              <>
                <Check className="h-4 w-4" aria-hidden="true" />
                {t('copied')}
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" aria-hidden="true" />
                {t('copyLink')}
              </>
            )}
          </button>
        </div>
        <p className="mt-3 text-xs text-slate-600 dark:text-slate-400">
          {t('referralRewardDescription')}
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
            <Users className="h-5 w-5" aria-hidden="true" />
          </div>
          <p className="mt-3 text-2xl font-bold text-slate-900 dark:text-white">
            {stats.totalReferrals}
          </p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {t('totalReferrals')}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
            <UserPlus className="h-5 w-5" aria-hidden="true" />
          </div>
          <p className="mt-3 text-2xl font-bold text-slate-900 dark:text-white">
            {stats.successfulReferrals}
          </p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {t('successfulReferrals')}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
            <TrendingUp className="h-5 w-5" aria-hidden="true" />
          </div>
          <p className="mt-3 text-2xl font-bold text-slate-900 dark:text-white">
            {stats.pendingReferrals}
          </p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {t('pendingReferrals')}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
            <Gift className="h-5 w-5" aria-hidden="true" />
          </div>
          <p className="mt-3 text-2xl font-bold text-slate-900 dark:text-white">
            {formatCurrency(stats.totalEarned)}
          </p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {t('totalEarned')}
          </p>
        </div>
      </div>

      {/* Referral history */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
          {t('referralHistory')}
        </h2>
        {referrals.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center dark:border-slate-600 dark:bg-slate-800">
            <Users
              className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-600"
              aria-hidden="true"
            />
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
              {t('noReferrals')}
            </p>
            <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
              {t('shareToGetStarted')}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
            <table className="w-full min-w-[500px] text-start">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="px-5 py-3 text-start text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    {t('referredUser')}
                  </th>
                  <th className="px-5 py-3 text-start text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    {t('status')}
                  </th>
                  <th className="px-5 py-3 text-start text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    {t('date')}
                  </th>
                  <th className="px-5 py-3 text-start text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    {t('reward')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {referrals.map((referral) => (
                  <tr
                    key={referral.id}
                    className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/50"
                  >
                    <td className="px-5 py-3 text-sm text-slate-900 dark:text-white">
                      {referral.email}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={cn(
                          'inline-block rounded-full px-2.5 py-0.5 text-xs font-medium',
                          referralStatusStyles[referral.status],
                        )}
                      >
                        {t(`referralStatus.${referral.status}`)}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-sm text-slate-600 dark:text-slate-300">
                      <time dateTime={referral.date}>
                        {new Date(referral.date).toLocaleDateString()}
                      </time>
                    </td>
                    <td className="px-5 py-3 text-sm font-medium text-slate-900 dark:text-white">
                      {referral.reward ? formatCurrency(referral.reward) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
