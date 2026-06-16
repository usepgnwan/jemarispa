<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Revenue Terapis - {{ $therapistName }}</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap');
        @page {
            margin: 0;
        }
        body {
            font-family: 'Poppins', 'Helvetica', 'Arial', sans-serif;
            margin: 0;
            padding: 30px;
            color: #333;
            line-height: 1.4;
            font-size: 11px;
        }
        .header {
            margin-bottom: 20px;
        }
        .logo-container {
            float: left;
            width: 50%;
        }
        .logo {
            width: 80px;
            height: auto;
        }
        .logo img {
            width: 100%;
            display: block;
        }
        .status-container {
            float: right;
            width: 50%;
            text-align: right;
        }
        .invoice-title {
            font-size: 22px;
            font-weight: bold;
            margin: 0;
            color: #000;
        }
        .invoice-number {
            font-size: 11px;
            color: #666;
            margin: 0;
        }
        .company-info {
            margin-top: 10px;
            clear: both;
        }
        .company-name {
            font-size: 16px;
            font-weight: bold;
            margin: 0;
        }
        .company-details {
            font-size: 10px;
            color: #666;
            margin-top: 2px;
        }
        .divider {
            border-bottom: 1px solid #eee;
            margin: 15px 0;
        }
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 25px;
            table-layout: fixed;
        }
        .items-table th {
            text-align: left;
            padding: 10px 5px;
            border-bottom: 1px solid #eee;
            color: #999;
            font-size: 9px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .items-table td {
            padding: 12px 5px;
            border-bottom: 1px solid #f9f9f9;
            font-size: 10px;
            vertical-align: top;
            word-wrap: break-word;
        }
        .items-table .text-right {
            text-align: right;
        }
        .items-table .text-center {
            text-align: center;
        }
        .clear {
            clear: both;
        }
    </style>
</head>
<body>
    @php
        $logoPath = public_path('images/logo-jemari.jpg');
        $logoSrc = '';
        if (file_exists($logoPath)) {
            $logoData = base64_encode(file_get_contents($logoPath));
            $logoSrc = 'data:image/jpeg;base64,' . $logoData;
        }
        $settings = \App\Models\Setting::first();
    @endphp
    <div class="header">
        <div class="logo-container">
            <div class="logo">
                @if($logoSrc)
                    <img src="{{ $logoSrc }}" alt="Logo">
                @else
                    <div style="background: #4b4b4b; color: white; width: 60px; height: 60px; border-radius: 8px; text-align: center; line-height: 60px; font-weight: bold; font-size: 10px;">JEMARI</div>
                @endif
            </div>
        </div>
        <div class="status-container">
            <h1 class="invoice-title">PENDAPATAN TERAPIS</h1>
            <p class="invoice-number">{{ $therapistName }}</p>
            <p class="invoice-number">
                @if($startDate && $endDate)
                    {{ \Carbon\Carbon::parse($startDate)->format('d M Y') }} - {{ \Carbon\Carbon::parse($endDate)->format('d M Y') }}
                @elseif($startDate)
                    Mulai {{ \Carbon\Carbon::parse($startDate)->format('d M Y') }}
                @elseif($endDate)
                    Sampai {{ \Carbon\Carbon::parse($endDate)->format('d M Y') }}
                @else
                    Semua Waktu
                @endif
            </p>
        </div>
        <div class="clear"></div>
    </div>

    <div class="company-info">
        <p class="company-name">Jemari Home Spa</p>
        <p class="company-details">jemarihomespa.com</p>
        <p class="company-details">Telp: {{ $settings->phone ?? '089516166090' }} Email: {{ $settings->email ?? 'jemari.homespa27@gmail.com' }}</p>
    </div>

    <div class="divider"></div>

    <table class="items-table">
        <colgroup>
            <col style="width: 15%;">
            <col style="width: 25%;">
            <col style="width: 35%;">
            <col style="width: 10%;">
            <col style="width: 15%;">
        </colgroup>
        <thead>
            <tr>
                <th>TANGGAL</th>
                <th>CUSTOMER</th>
                <th>LAYANAN</th>
                <th class="text-center">METODE</th>
                <th class="text-right">PENDAPATAN</th>
            </tr>
        </thead>
        <tbody>
            @foreach($transactions as $item)
            <tr>
                <td>{{ \Carbon\Carbon::parse($item->date)->format('d/m/Y') }}</td>
                <td>{{ $item->customer_name }}</td>
                <td>
                    <span style="font-weight: bold; display: block; margin-bottom: 2px;">{{ $item->package_name }}</span>
                    <!-- <span style="font-size: 9px; color: #888;">{{ $item->package_duration }}</span> -->
                </td>
                <td class="text-center">{{ strtoupper($item->payment_method) }}</td>
                <td class="text-right">Rp {{ number_format($item->commission, 0, ',', '.') }}</td>
            </tr>
            @endforeach
        </tbody>
        <tfoot>
            <tr>
                <td colspan="4" class="text-right" style="padding-top: 15px; border-top: 1px solid #ccc; font-weight: bold;">TOTAL</td>
                <td class="text-right" style="padding-top: 15px; border-top: 1px solid #ccc; font-weight: bold; color: #3b82f6;">
                    Rp {{ number_format($transactions->sum('commission'), 0, ',', '.') }}
                </td>
            </tr>
        </tfoot>
    </table>
</body>
</html>
