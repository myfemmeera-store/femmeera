@extends('emails.layout')

@section('content')
<h2 class="h2-title">Refund Processed Successfully</h2>
<p class="paragraph">
    Dear {{ $customer_name ?? 'Customer' }},
</p>
<p class="paragraph">
    Your refund of <strong>₹{{ number_format($refund_amount ?? 0, 2) }}</strong> for Order <strong>#{{ $order_number }}</strong> has been <strong>COMPLETED</strong>.
</p>

<div style="background-color: #F0FFF4; border: 1px solid #C6F6D5; border-radius: 12px; padding: 18px; margin: 20px 0;">
    <h3 style="margin: 0 0 8px 0; font-size: 14px; color: #22543D;">Refund Summary</h3>
    <p style="margin: 4px 0; font-size: 13px;"><strong>Order ID:</strong> #{{ $order_number }}</p>
    <p style="margin: 4px 0; font-size: 13px;"><strong>Amount Refunded:</strong> ₹{{ number_format($refund_amount ?? 0, 2) }}</p>
    <p style="margin: 4px 0; font-size: 13px;"><strong>Status:</strong> COMPLETED</p>
</div>
@endsection
