@extends('emails.layout')

@section('content')
<h2 class="h2-title">Order Confirmation</h2>
<p class="paragraph">
    Dear {{ $order['shipping_address']['name'] ?? $user['name'] ?? 'Customer' }},
</p>
<p class="paragraph">
    Thank you for your purchase! We have received your order <strong>#{{ $order['order_number'] }}</strong> and our artisan team is preparing it for fulfillment.
</p>

<div style="background-color: #FAF4EB; border: 1px solid #E8DEC8; border-radius: 12px; padding: 16px; margin-bottom: 20px;">
    <p style="margin: 0; font-size: 13px; color: #7A6240; font-weight: bold;">Order Status: {{ $order['order_status'] ?? 'PROCESSING' }}</p>
    <p style="margin: 4px 0 0 0; font-size: 12px; color: #555;">Payment Method: {{ strtoupper($order['payment_method'] ?? 'ONLINE') }} | Payment Status: {{ $order['payment_status'] ?? 'PAID' }}</p>
</div>

<h3 style="font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #1A1A1A; margin-bottom: 10px;">Items Ordered</h3>
<table class="table-custom">
    <thead>
        <tr>
            <th>Product</th>
            <th style="text-align: center;">Qty</th>
            <th style="text-align: right;">Price</th>
        </tr>
    </thead>
    <tbody>
        @foreach($order['items'] ?? [] as $item)
        <tr>
            <td>
                <strong>{{ $item['product_name'] ?? $item['name'] ?? 'Item' }}</strong><br>
                <span style="font-size: 11px; color: #777;">Variant: {{ $item['color'] ?? 'Standard' }} / {{ $item['size'] ?? 'M' }}</span>
            </td>
            <td style="text-align: center;">{{ $item['quantity'] }}</td>
            <td style="text-align: right;">₹{{ number_format($item['line_total'] ?? ($item['unit_price'] * $item['quantity']), 2) }}</td>
        </tr>
        @endforeach
    </tbody>
</table>

<div class="total-box">
    <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
        <tr>
            <td style="padding: 4px 0; color: #666;">Subtotal:</td>
            <td style="padding: 4px 0; text-align: right; font-weight: bold; color: #333;">₹{{ number_format($order['subtotal'], 2) }}</td>
        </tr>
        @if(($order['discount_amount'] ?? 0) > 0)
        <tr>
            <td style="padding: 4px 0; color: #D9534F;">Discount Savings:</td>
            <td style="padding: 4px 0; text-align: right; font-weight: bold; color: #D9534F;">- ₹{{ number_format($order['discount_amount'], 2) }}</td>
        </tr>
        @endif
        <tr>
            <td style="padding: 4px 0; color: #666;">Shipping:</td>
            <td style="padding: 4px 0; text-align: right; font-weight: bold; color: #28A745;">{{ ($order['shipping_amount'] ?? 0) == 0 ? 'FREE' : ('₹' . number_format($order['shipping_amount'], 2)) }}</td>
        </tr>
        <tr style="border-top: 1px solid #E0D4C0;">
            <td style="padding: 10px 0 0 0; font-size: 15px; font-weight: bold; color: #1A1A1A;">Total Amount:</td>
            <td style="padding: 10px 0 0 0; text-align: right; font-size: 16px; font-weight: bold; color: #B38548;">₹{{ number_format($order['total'], 2) }}</td>
        </tr>
    </table>
    <p style="font-size: 10px; color: #888; margin: 6px 0 0 0; text-align: right;">(Inclusive of all taxes)</p>
</div>

<h3 style="font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #1A1A1A; margin-top: 25px; margin-bottom: 10px;">Shipping Address</h3>
<div style="background-color: #FDFBF7; border: 1px solid #EFE6D8; border-radius: 8px; padding: 12px; font-size: 13px; line-height: 1.5; color: #444;">
    <strong>{{ $order['shipping_address']['name'] ?? 'Recipient' }}</strong><br>
    {{ $order['shipping_address']['address'] ?? '' }} {{ $order['shipping_address']['address_line_2'] ?? '' }}<br>
    {{ $order['shipping_address']['city'] ?? '' }}, {{ $order['shipping_address']['state'] ?? '' }} - {{ $order['shipping_address']['pincode'] ?? '' }}<br>
    Phone: {{ $order['shipping_address']['phone'] ?? 'N/A' }}
</div>

<div style="text-align: center; margin-top: 25px;">
    <a href="http://localhost:3000/account/orders" class="btn">View Order Details</a>
</div>
@endsection
