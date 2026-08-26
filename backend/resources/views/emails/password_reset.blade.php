@extends('emails.layout')

@section('content')
<h2 class="h2-title">Reset Your Password</h2>
<p class="paragraph">
    Dear {{ $customer_name ?? 'Valued Customer' }},
</p>
<p class="paragraph">
    We received a request to reset the password for your Femmeera customer account.
</p>

<div style="text-align: center; margin: 30px 0;">
    <a href="{{ $reset_link ?? 'http://localhost:3000/auth/reset-password' }}" class="btn">Reset Password</a>
</div>

<p class="paragraph" style="font-size: 12px; color: #7A7A7A;">
    If you did not request a password reset, please ignore this email or contact support if you suspect unauthorized access.
</p>
@endsection
