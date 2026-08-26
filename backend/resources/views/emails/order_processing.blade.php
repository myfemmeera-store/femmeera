@extends('emails.layout')

@section('content')
<h2 class="h2-title">Your Order is Being Processed</h2>
<p class="paragraph">
    Dear {{ $order['shipping_address']['name'] ?? 'Customer' }},
</p>
<p class="paragraph">
    Great news! Order <strong>#{{ $order['order_number'] }}</strong> has moved into active processing. Our quality team is inspecting and packaging your luxury items with care.
</p>

<div style="background-color: #FAF4EB; border: 1px solid #E8DEC8; border-radius: 12px; padding: 16px; margin: 20px 0;">
    <p style="margin: 0; font-size: 13px; color: #7A6240; font-weight: bold;">Status: PROCESSING & PACKAGING</p>
    <p style="margin: 4px 0 0 0; font-size: 12px; color: #555;">Estimated Dispatch: Within 24 Hours</p>
</div>

<p class="paragraph">
    You will receive another notification with tracking details as soon as your package is dispatched.
</p>
@endsection
