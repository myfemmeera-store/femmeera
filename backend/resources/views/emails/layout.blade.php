<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $subject ?? 'Femmeera Store' }}</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            background-color: #F8F5F0;
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            color: #1A1A1A;
            -webkit-font-smoothing: antialiased;
        }
        .wrapper {
            width: 100%;
            background-color: #F8F5F0;
            padding: 30px 15px;
            box-sizing: border-box;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #FFFFFF;
            border-radius: 16px;
            overflow: hidden;
            border: 1px solid #EFE6D8;
            box-shadow: 0 4px 20px rgba(0,0,0,0.04);
        }
        .header {
            background-color: #1A1A1A;
            padding: 28px 20px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-family: 'Georgia', serif;
            font-size: 26px;
            font-weight: 700;
            letter-spacing: 2px;
            color: #E6C594;
            text-transform: uppercase;
        }
        .header p {
            margin: 4px 0 0 0;
            font-size: 11px;
            color: #A3937D;
            letter-spacing: 1.5px;
            text-transform: uppercase;
        }
        .content {
            padding: 32px 28px;
        }
        .h2-title {
            font-family: 'Georgia', serif;
            font-size: 20px;
            color: #1A1A1A;
            margin-top: 0;
            margin-bottom: 12px;
        }
        .paragraph {
            font-size: 14px;
            line-height: 1.6;
            color: #4A4A4A;
            margin-top: 0;
            margin-bottom: 20px;
        }
        .btn {
            display: inline-block;
            background-color: #B38548;
            color: #FFFFFF !important;
            font-size: 13px;
            font-weight: 700;
            text-decoration: none;
            padding: 14px 28px;
            border-radius: 8px;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin: 15px 0;
        }
        .table-custom {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        .table-custom th {
            background-color: #FAF4EB;
            color: #7A6240;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 1px;
            padding: 10px 12px;
            text-align: left;
            border-bottom: 1px solid #E8DEC8;
        }
        .table-custom td {
            padding: 12px;
            font-size: 13px;
            border-bottom: 1px solid #F3EDE3;
            color: #333333;
        }
        .total-box {
            background-color: #FAF6F0;
            border-radius: 12px;
            padding: 16px 20px;
            margin-top: 20px;
            border: 1px solid #E8DEC8;
        }
        .total-row {
            display: flex;
            justify-content: space-between;
            font-size: 13px;
            margin-bottom: 8px;
            color: #555555;
        }
        .total-grand {
            font-size: 16px;
            font-weight: 700;
            color: #1A1A1A;
            border-top: 1px solid #E0D4C0;
            padding-top: 10px;
            margin-top: 8px;
        }
        .footer {
            background-color: #FAF6F0;
            padding: 24px 20px;
            text-align: center;
            border-top: 1px solid #EFE6D8;
            font-size: 12px;
            color: #7A7A7A;
            line-height: 1.5;
        }
        .footer a {
            color: #B38548;
            text-decoration: none;
        }
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="container">
            <div class="header">
                <h1>FEMMEERA</h1>
                <p>LUXURY ETHNIC & CONTEMPORARY COUTURE</p>
            </div>

            <div class="content">
                @yield('content')
            </div>

            <div class="footer">
                <p style="margin-top: 0;">Need help with your order? Contact our Concierge Support.</p>
                <p>Email: <a href="mailto:support@femmeera.com">support@femmeera.com</a> | Phone: +91 98765 43210</p>
                <p style="font-size: 11px; color: #999999; margin-bottom: 0;">&copy; {{ date('Y') }} Femmeera Store. All rights reserved.</p>
            </div>
        </div>
    </div>
</body>
</html>
