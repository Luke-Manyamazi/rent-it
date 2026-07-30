/**
 * The `paynow` npm package ships no type declarations (its published
 * `dist/` omits the `.d.ts` files its own `src/` has) — this covers only the
 * surface api/initiate-viewing-payment.ts and api/paynow-webhook.ts use,
 * transcribed from https://github.com/paynow/Paynow-NodeJS-SDK/blob/master/src/paynow.ts
 * and src/types/payment.ts.
 */
declare module 'paynow' {
  export class Payment {
    reference: string
    authEmail: string
    add(title: string, amount: number, quantity?: number): Payment
    total(): number
  }

  export interface PaynowInitResponse {
    success: boolean
    hasRedirect: boolean
    redirectUrl?: string
    error?: string
    pollUrl?: string
    instructions?: string
    status: string
  }

  export class Paynow {
    constructor(integrationId: string, integrationKey: string, resultUrl: string, returnUrl: string)
    createPayment(reference: string, authEmail: string): Payment
    send(payment: Payment): Promise<PaynowInitResponse>
    sendMobile(payment: Payment, phone: string, method: string): Promise<PaynowInitResponse>
    verifyHash(values: Record<string, string>): boolean
  }
}
