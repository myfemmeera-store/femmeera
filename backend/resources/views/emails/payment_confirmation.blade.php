@extends('emails.layout')

@section('content')
<h2 class="h2-title">Payment Received Successfully</h2>
<p class="paragraph">
    Dear {{ $order['shipping_address']['name'] ?? 'Customer' }},
</p>
<p class="paragraph">
    We have successfully verified your Razorpay payment for Order <strong>#{{ $order['order_number'] }}</strong>.
</p>

<div style="background-color: #F0FFF4; border: 1px solid #C6F6D5; border-radius: 12px; padding: 18px; margin: 20px 0;">
    <h3 style="margin: 0 0 10px 0; font-size: 14px; color: #22543D;">Transaction Receipt</h3>
    <table style="width: 100%; font-size: 13px; color: #2D3748; line-height: 1.6;">
        <tr>
            <td><strong>Order Number:</strong></td>
            <td style="text-align: right;">#{{ $order['order_number'] }}</td>
        </tr>
        <tr>
            <td><strong>Transaction ID:</strong></td>
            <td style="text-align: right; font-family: monospace;">{{ $order['transaction_id'] ?? $transaction_id ?? 'N/A' }}</td>
        </tr>
        <tr>
            <td><strong>Amount Paid:</strong></td>
            <td style="text-align: right; font-weight: bold; color: #B38548;">₹{{ number_format($order['total'], 2) }}</td>
        </tr>
        <tr>
            <td><strong>Payment Gateway:</strong></td>
            <td style="text-align: right;">Razorpay Secure API</td>
        </tr>
    </table>
</div>

<p class="paragraph">
    Your order is now confirmed and moves to fulfillment. You can track your shipment status from your Femmeera customer account dashboard.
</p>
@endsection
