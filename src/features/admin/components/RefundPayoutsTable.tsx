import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { ViewingPayment } from '@/types/viewing-payment'

export function RefundPayoutsTable({ payments }: { payments: ViewingPayment[] }) {
  if (payments.length === 0) {
    return (
      <p className="text-muted-foreground py-8 text-center text-sm">
        No refunds owed right now.
      </p>
    )
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tenant</TableHead>
            <TableHead>Method</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Refunded (in-app)</TableHead>
            <TableHead className="text-right">Reference</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.map((payment) => (
            <TableRow key={payment.id}>
              <TableCell className="font-mono text-xs">{payment.tenantId}</TableCell>
              <TableCell>
                <Badge variant="outline" className="capitalize">
                  {payment.method}
                </Badge>
                {payment.phoneNumber && (
                  <p className="text-muted-foreground mt-0.5 text-xs">{payment.phoneNumber}</p>
                )}
              </TableCell>
              <TableCell>${payment.amountUsd}</TableCell>
              <TableCell className="text-muted-foreground text-xs">
                {payment.refundedAt?.toDate().toLocaleString(undefined, {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                }) ?? '—'}
              </TableCell>
              <TableCell className="text-right font-mono text-xs">
                {payment.paynowReference}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
