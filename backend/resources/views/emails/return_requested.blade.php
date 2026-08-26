@extends('emails.layout')

@section('content')
<h2 class="h2-title">Return Request Received</h2>
<p class="paragraph">
    Dear {{ $customer_name ?? 'Customer' }},
</p>
<p class="paragraph">
    We have received your return request for Order <strong>#{{ $order_number }}</strong>.
</p>

<div style="background-color: #FAF4EB; border: 1px solid #E8DEC8; border-radius: 12px; padding: 16px; margin: 20px 0;">
    <p style="margin: 0; font-size: 13px; color: #7A6240; font-weight: bold;">Return Ticket ID: #{{ $return_id ?? $return_number ?? 'RET-1001' }}</p>
    <p style="margin: 4px 0 0 0; font-size: 12px; color: #555;">Reason: {{ $return_reason ?? 'Size Exchange / Defect' }}</p>
</div>

<p class="paragraph">
    Our quality assurance team is reviewing your request and will update you within 24 business hours.
</p>
@endsection
