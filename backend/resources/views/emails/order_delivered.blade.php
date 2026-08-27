@extends('emails.layout')

@section('content')
<h2 class="h2-title">Order Delivered Successfully</h2>
<p class="paragraph">
    Dear {{ $order['shipping_address']['name'] ?? 'Customer' }},
</p>
<p class="paragraph">
    Your order <strong>#{{ $order['order_number'] }}</strong> has been successfully delivered. We hope you adore your new Femmeera couture pieces!
</p>

<div style="background-color: #F0FFF4; border: 1px solid #C6F6D5; border-radius: 12px; padding: 16px; margin: 20px 0; text-align: center;">
    <p style="margin: 0; font-size: 14px; color: #22543D; font-weight: bold;">Status: DELIVERED</p>
</div>

<p class="paragraph">
    If you have any feedback or require assistance with sizing or styling, our customer concierge is always available.
</p>
<div style="text-align: center; margin: 25px 0;">
    <a href="https://femmeera.com/account/orders" class="btn">Leave a Product Review</a>
</div>
@endsection
