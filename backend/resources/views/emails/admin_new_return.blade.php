@extends('emails.layout')

@section('content')
<h2 class="h2-title" style="color: #B38548;">[ADMIN ALERT] New Return Request</h2>
<p class="paragraph">
    A customer has filed a new return request for Order <strong>#{{ $order_number }}</strong>.
</p>

<div style="background-color: #FAF4EB; border: 1px solid #E8DEC8; border-radius: 12px; padding: 16px; margin: 20px 0;">
    <p style="margin: 4px 0; font-size: 13px;"><strong>Return ID:</strong> #{{ $return_id ?? 'N/A' }}</p>
    <p style="margin: 4px 0; font-size: 13px;"><strong>Reason:</strong> {{ $return_reason ?? 'N/A' }}</p>
</div>

<div style="text-align: center; margin: 25px 0;">
    <a href="http://localhost:3001/dashboard/returns" class="btn">Process Return Request</a>
</div>
@endsection
