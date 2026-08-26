@extends('emails.layout')

@section('content')
<h2 class="h2-title">Return Request Approved</h2>
<p class="paragraph">
    Dear {{ $customer_name ?? 'Customer' }},
</p>
<p class="paragraph">
    Your return request for Order <strong>#{{ $order_number }}</strong> has been <strong>APPROVED</strong>.
</p>

<div style="background-color: #F0FFF4; border: 1px solid #C6F6D5; border-radius: 12px; padding: 18px; margin: 20px 0;">
    <h3 style="margin: 0 0 10px 0; font-size: 14px; color: #22543D;">Next Steps for Pickup</h3>
    <p style="margin: 4px 0; font-size: 13px;">1. Package the item safely in its original tags and box.</p>
    <p style="margin: 4px 0; font-size: 13px;">2. Our courier agent will arrive to collect the package within 24-48 hours.</p>
    <p style="margin: 4px 0; font-size: 13px;">3. Once QC verification is completed at our warehouse, your refund will be processed.</p>
</div>
@endsection
