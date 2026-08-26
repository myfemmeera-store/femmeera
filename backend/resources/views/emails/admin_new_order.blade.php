@extends('emails.layout')

@section('content')
<h2 class="h2-title" style="color: #B38548;">[ADMIN ALERT] New Order Received</h2>
<p class="paragraph">
    A new order <strong>#{{ $order['order_number'] }}</strong> has been successfully placed on Femmeera Store.
</p>

<div style="background-color: #FAF4EB; border: 1px solid #E8DEC8; border-radius: 12px; padding: 16px; margin: 20px 0;">
    <p style="margin: 4px 0; font-size: 13px;"><strong>Customer:</strong> {{ $order['shipping_address']['name'] ?? 'N/A' }}</p>
    <p style="margin: 4px 0; font-size: 13px;"><strong>Total Amount:</strong> ₹{{ number_format($order['total'], 2) }}</p>
    <p style="margin: 4px 0; font-size: 13px;"><strong>Payment Method:</strong> {{ strtoupper($order['payment_method'] ?? 'ONLINE') }} ({{ $order['payment_status'] ?? 'PAID' }})</p>
</div>

<div style="text-align: center; margin: 25px 0;">
    <a href="http://localhost:3001/dashboard/orders/{{ $order['id'] ?? '' }}" class="btn">View in Admin Dashboard</a>
</div>
@endsection
