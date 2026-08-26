@extends('emails.layout')

@section('content')
<h2 class="h2-title">Welcome to Femmeera, {{ $customer_name ?? $user['name'] ?? 'Valued Customer' }}!</h2>
<p class="paragraph">
    Thank you for joining Femmeera. We are delighted to welcome you to our exclusive community of handcrafted ethnic and luxury fashion.
</p>
<p class="paragraph">
    Explore our latest collections of Banarasi silk sarees, designer Kurti sets, handcrafted co-ords, and evening couture designed for elegance and distinction.
</p>

<div style="text-align: center; margin: 25px 0;">
    <a href="http://localhost:3000/shop" class="btn">Explore Collections</a>
</div>

<p class="paragraph" style="font-size: 12px; color: #7A7A7A; text-align: center;">
    Enjoy Free Shipping on orders above ₹1,499 & 7-Day Hassle-Free Returns.
</p>
@endsection
