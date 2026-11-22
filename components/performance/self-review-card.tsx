'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/common/toast'
import { submitSelfReview } from '@/lib/api/appraisals'
import type { Appraisal } from '@/types/performance'

/** The employee's own step in the review workflow. */
export function SelfReviewCard({
  appraisal,
  onChanged,
}: {
  appraisal: Appraisal
  onChanged: () => void
}) {
  const toast = useToast()
  const [comment, setComment] = useState('')
  const [rating, setRating] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async () => {
    setBusy(true)
    try {
      await submitSelfReview(appraisal._id, {
        comment: comment.trim(),
        ...(rating ? { rating: Number(rating) } : {}),
      })
      toast('Self review submitted')
      onChanged()
    } catch (problem) {
      toast(problem instanceof Error ? problem.message : 'Could not submit', 'error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <section aria-labelledby="self-review-heading" className="panel p-6">
      <h2 id="self-review-heading" className="text-lg font-semibold">
        Your self review
      </h2>
      <p className="mt-1 text-sm text-foreground/65">
        Your review cannot move to your manager until you submit this.
      </p>
      <div className="mt-4 space-y-3">
        <label htmlFor="self-review" className="block text-sm font-medium">
          What went well, and what would you do differently?
        </label>
        <textarea
          id="self-review"
          rows={4}
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          className="w-full rounded-xl border edge bg-white/80 p-3 text-sm"
        />
        <div className="max-w-[10rem]">
          <label htmlFor="self-rating" className="mb-1 block text-sm font-medium">
            Your rating (optional)
          </label>
          <Input
            id="self-rating"
            type="number"
            min="0"
            max="5"
            step="0.1"
            value={rating}
            onChange={(event) => setRating(event.target.value)}
          />
        </div>
        <Button disabled={busy || !comment.trim()} onClick={() => void submit()}>
          {busy ? 'Submitting…' : 'Submit self review'}
        </Button>
      </div>
    </section>
  )
}
