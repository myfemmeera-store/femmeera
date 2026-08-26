@extends('emails.layout')

@section('content')
<h2 class="h2-title" style="color: #D9534F;">[ALERT] Payment Verification Failure</h2>
<p class="paragraph">
    A payment verification attempt failed for Order <strong>#{{ $order_number }}</strong>.
</p>

<div style="background-color: #FFF5F5; border: 1px solid #FEB2B2; border-radius: 12px; padding: 16px; margin: 20px 0;">
    <p style="margin: 4px 0; font-size: 13px;"><strong>Order ID:</strong> #{{ $order_number }}</p>
    <p style="margin: 4px 0; font-size: 13px;"><strong>Reason:</strong> {{ $error_message ?? 'Razorpay Signature Mismatch or Gate Exception' }}</p>
</div>
@endsection
