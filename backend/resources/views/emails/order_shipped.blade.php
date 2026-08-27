@extends('emails.layout')

@section('content')
<h2 class="h2-title">Your Order Has Been Shipped!</h2>
<p class="paragraph">
    Dear {{ $order['shipping_address']['name'] ?? 'Customer' }},
</p>
<p class="paragraph">
    Exciting news! Your order <strong>#{{ $order['order_number'] }}</strong> has been dispatched and is on its way to your shipping address.
</p>

<div style="background-color: #EBF8FF; border: 1px solid #BEE3F8; border-radius: 12px; padding: 18px; margin: 20px 0;">
    <h3 style="margin: 0 0 10px 0; font-size: 14px; color: #2B6CB0;">Shipment Tracking Details</h3>
    <p style="margin: 4px 0; font-size: 13px;"><strong>Courier Partner:</strong> {{ $order['courier_name'] ?? 'Express Logistics' }}</p>
    <p style="margin: 4px 0; font-size: 13px;"><strong>Tracking AWB Number:</strong> <span style="font-family: monospace; font-weight: bold;">{{ $order['tracking_number'] ?? 'AWB88492049' }}</span></p>
    <p style="margin: 4px 0; font-size: 13px;"><strong>Estimated Delivery:</strong> {{ $order['estimated_delivery'] ?? '2 - 4 Business Days' }}</p>
</div>

<div style="text-align: center; margin: 25px 0;">
    <a href="{{ $order['tracking_url'] ?? 'https://femmeera.com/account/orders' }}" class="btn">Track Package Live</a>
</div>
@endsection
