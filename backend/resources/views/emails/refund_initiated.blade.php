@extends('emails.layout')

@section('content')
<h2 class="h2-title">Refund Initiated</h2>
<p class="paragraph">
    Dear {{ $customer_name ?? 'Customer' }},
</p>
<p class="paragraph">
    A refund of <strong>₹{{ number_format($refund_amount ?? 0, 2) }}</strong> has been <strong>INITIATED</strong> for Order <strong>#{{ $order_number }}</strong>.
</p>

<div style="background-color: #EBF8FF; border: 1px solid #BEE3F8; border-radius: 12px; padding: 16px; margin: 20px 0;">
    <p style="margin: 0; font-size: 13px; color: #2B6CB0; font-weight: bold;">Refund Status: PROCESSING</p>
    <p style="margin: 4px 0 0 0; font-size: 12px; color: #555;">Refund Reference: {{ $refund_reference ?? 'REF-992019' }}</p>
</div>

<p class="paragraph">
    Depending on your payment method, funds will reflect in your bank or card account within 3 to 5 business days.
</p>
@endsection
