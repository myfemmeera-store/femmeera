@extends('emails.layout')

@section('content')
<h2 class="h2-title">Update on Return Request</h2>
<p class="paragraph">
    Dear {{ $customer_name ?? 'Customer' }},
</p>
<p class="paragraph">
    We regret to inform you that your return request for Order <strong>#{{ $order_number }}</strong> could not be approved at this time.
</p>

<div style="background-color: #FFF5F5; border: 1px solid #FEB2B2; border-radius: 12px; padding: 16px; margin: 20px 0;">
    <p style="margin: 0; font-size: 13px; color: #9B2C2C; font-weight: bold;">Status: REJECTED</p>
    <p style="margin: 4px 0 0 0; font-size: 12px; color: #555;">Reason: {{ $admin_notes ?? 'Does not comply with 7-day return policy guidelines.' }}</p>
</div>

<p class="paragraph">
    If you feel this decision was made in error, please contact our support team.
</p>
@endsection
