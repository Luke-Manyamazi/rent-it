import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Loader2, ShieldCheck } from 'lucide-react'
import type { ConfirmationResult } from 'firebase/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp'
import { phoneSchema, otpSchema, type PhoneValues } from '@/features/auth/schemas'
import {
  sendPhoneVerificationCode,
  confirmPhoneVerificationCode,
} from '@/features/auth/api/auth'
import { getAuthErrorMessage } from '@/features/auth/api/error-messages'

const RECAPTCHA_CONTAINER_ID = 'phone-verify-recaptcha'

export function VerifyPhonePage() {
  const navigate = useNavigate()
  const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(null)
  const [code, setCode] = useState('')
  const [sending, setSending] = useState(false)
  const [confirming, setConfirming] = useState(false)

  const phoneForm = useForm<PhoneValues>({
    resolver: zodResolver(phoneSchema),
    defaultValues: { phoneNumber: '+263' },
  })

  async function onSendCode(values: PhoneValues) {
    setSending(true)
    try {
      const result = await sendPhoneVerificationCode(values.phoneNumber, RECAPTCHA_CONTAINER_ID)
      setConfirmation(result)
      toast.success('Code sent — check your SMS messages.')
    } catch (error) {
      toast.error(getAuthErrorMessage(error))
    } finally {
      setSending(false)
    }
  }

  async function onConfirmCode() {
    if (!confirmation) return
    const parsed = otpSchema.safeParse({ code })
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message)
      return
    }
    setConfirming(true)
    try {
      await confirmPhoneVerificationCode(confirmation, code)
      toast.success('Phone number verified.')
      navigate('/dashboard', { replace: true })
    } catch (error) {
      toast.error(getAuthErrorMessage(error))
    } finally {
      setConfirming(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-sm flex-col justify-center px-4 py-16">
      <span className="bg-verified text-verified-foreground mb-4 flex size-10 items-center justify-center rounded-full">
        <ShieldCheck className="size-5" />
      </span>
      <h1 className="text-2xl font-semibold tracking-tight">Verify your phone</h1>
      <p className="text-muted-foreground mt-1 text-sm">
        Verified phone numbers build trust with landlords and agencies, and
        unlock the "Verified Before You Travel" booking guarantee.
      </p>

      <div id={RECAPTCHA_CONTAINER_ID} />

      {!confirmation ? (
        <Form {...phoneForm}>
          <form onSubmit={phoneForm.handleSubmit(onSendCode)} className="mt-6 space-y-4">
            <FormField
              control={phoneForm.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone number</FormLabel>
                  <FormControl>
                    <Input type="tel" placeholder="+263771234567" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={sending}>
              {sending && <Loader2 className="size-4 animate-spin" />}
              Send code
            </Button>
          </form>
        </Form>
      ) : (
        <div className="mt-6 space-y-4">
          <p className="text-sm font-medium">Enter the 6-digit code</p>
          <InputOTP maxLength={6} value={code} onChange={setCode}>
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
          <Button className="w-full" disabled={confirming} onClick={onConfirmCode}>
            {confirming && <Loader2 className="size-4 animate-spin" />}
            Confirm
          </Button>
        </div>
      )}

      <Button
        variant="ghost"
        className="mt-4 w-full"
        onClick={() => navigate('/dashboard', { replace: true })}
      >
        Skip for now
      </Button>
    </div>
  )
}
