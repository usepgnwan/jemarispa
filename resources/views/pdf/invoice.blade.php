<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice - {{ $transaction->order_number }}</title>
    <style>
        @page {
            margin: 0;
        }
        body {
            font-family: 'Helvetica', 'Arial', sans-serif;
            margin: 0;
            padding: 40px;
            color: #333;
            line-height: 1.4;
        }
        .header {
            margin-bottom: 30px;
        }
        .logo-container {
            float: left;
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
            text-align: right;
        }
        .status-badge {
            background-color: #ef4444;
            color: white;
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 10px;
            font-weight: bold;
            text-transform: uppercase;
            display: inline-block;
            margin-bottom: 5px;
        }
        .invoice-title {
            font-size: 24px;
            font-weight: bold;
            margin: 0;
            color: #000;
        }
        .invoice-number {
            font-size: 12px;
            color: #666;
            margin: 0;
        }
        .company-info {
            margin-top: 10px;
            clear: both;
        }
        .company-name {
            font-size: 18px;
            font-weight: bold;
            margin: 0;
        }
        .company-details {
            font-size: 11px;
            color: #666;
            margin-top: 2px;
        }
        .divider {
            border-bottom: 1px solid #eee;
            margin: 20px 0;
        }
        .info-grid {
            width: 100%;
            margin-bottom: 30px;
        }
        .info-grid td {
            vertical-align: top;
            font-size: 11px;
        }
        .tagihan-kepada {
            color: #999;
            font-weight: bold;
            text-transform: uppercase;
            font-size: 10px;
            letter-spacing: 1px;
            margin-bottom: 8px;
        }
        .customer-name {
            font-size: 14px;
            font-weight: bold;
            margin: 0;
        }
        .meta-table {
            width: 100%;
        }
        .meta-table td {
            padding: 2px 0;
        }
        .meta-label {
            color: #999;
            width: 100px;
        }
        .meta-separator {
            width: 10px;
            color: #999;
        }
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
        }
        .items-table th {
            text-align: left;
            padding: 10px 5px;
            border-bottom: 1px solid #eee;
            color: #999;
            font-size: 10px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .items-table td {
            padding: 15px 5px;
            border-bottom: 1px solid #f9f9f9;
            font-size: 11px;
        }
        .items-table .text-right {
            text-align: right;
        }
        .items-table .text-center {
            text-align: center;
        }
        .item-name {
            font-weight: bold;
            display: block;
        }
        .summary-container {
            width: 350px;
            float: right;
            background-color: #f8f9fa;
            border-radius: 12px;
            padding: 15px;
        }
        .summary-table {
            width: 100%;
        }
        .summary-table td {
            padding: 5px 0;
            font-size: 11px;
        }
        .summary-label {
            color: #999;
        }
        .summary-value {
            text-align: right;
            font-weight: bold;
        }
        .summary-divider {
            border-bottom: 1px solid #ddd;
            margin: 5px 0;
        }
        .summary-total {
            color: #3b82f6;
            font-size: 13px;
        }
        .notes-section {
            width: 350px;
            float: left;
        }
        .notes-title {
            font-weight: bold;
            font-size: 14px;
            margin-bottom: 10px;
        }
        .notes-content {
            font-size: 11px;
            color: #555;
            line-height: 1.6;
        }
        .footer-sign {
            margin-top: 50px;
            clear: both;
            text-align: right;
        }
        .sign-text {
            font-size: 11px;
            color: #666;
            margin-bottom: 60px;
        }
        .sign-name {
            font-weight: bold;
            font-size: 12px;
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
            @if($transaction->status === 'success')
                <div class="status-badge" style="background-color: #10b981;">Sudah Dibayar</div>
            @elseif($transaction->status === 'failed')
                <div class="status-badge" style="background-color: #6b7280;">Dibatalkan</div>
            @else
                <div class="status-badge" style="background-color: #ef4444;">Belum Dibayar</div>
            @endif
            <h1 class="invoice-title">INVOICE</h1>
            <p class="invoice-number">{{ $transaction->order_number }}</p>
        </div>
        <div class="clear"></div>
    </div>

    <div class="company-info">
        <p class="company-name">Jemari Home Spa</p>
        <p class="company-details">jemarihomespa.com</p>
        <p class="company-details">Telp: {{ $settings->phone ?? '089516166090' }} Email: {{ $settings->email ?? 'jemari.homespa27@gmail.com' }}</p>
    </div>

    <div class="divider"></div>

    <table class="info-grid">
        <tr>
            <td width="60%">
                <div class="tagihan-kepada">TAGIHAN KEPADA</div>
                <p class="customer-name">{{ $transaction->customer_name }}</p>
            </td>
            <td width="40%">
                <table class="meta-table">
                    <tr>
                        <td class="meta-label">Tanggal</td>
                        <td class="meta-separator">:</td>
                        <td>{{ \Carbon\Carbon::parse($transaction->created_at)->format('d M Y') }}</td>
                    </tr>
                    <tr>
                        <td class="meta-label">Tgl. Jatuh Tempo</td>
                        <td class="meta-separator">:</td>
                        <td>{{ \Carbon\Carbon::parse($transaction->schedule_date)->format('d M Y') }}</td>
                    </tr>
                    <tr>
                        <td class="meta-label">Referensi</td>
                        <td class="meta-separator">:</td>
                        <td>{{ $transaction->source ?: '-' }}</td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>

    <table class="items-table">
        <thead>
            <tr>
                <th>PRODUK</th>
                <th class="text-center">KUANTITAS</th>
                <th class="text-right">HARGA</th>
                <th class="text-center">DISKON</th>
                <th class="text-right">HARGA DISKON</th>
                <th class="text-center">PAJAK</th>
                <th class="text-right">JUMLAH</th>
            </tr>
        </thead>
        <tbody>
            @php
                $groupedItems = $transaction->items->groupBy('guest_index');
            @endphp
            @foreach($groupedItems as $guestIndex => $items)
                <tr>
                    <td colspan="7" style="background-color: #f9f9f9; font-weight: bold; font-size: 10px; padding: 5px 10px; border-bottom: 1px solid #eee;">PERSON {{ $guestIndex }}</td>
                </tr>
                @foreach($items as $item)
                <tr>
                    <td style="padding-left: 20px;">
                        <span class="item-name">{{ $item->package_name }} - {{ $item->package_duration }}</span>
                        <div style="font-size: 9px; color: #999; margin-top: 2px;">Gender: {{ ucfirst($item->guest_gender) }} | Terapis: {{ ucfirst($item->therapist_gender_preference) }}</div>
                    </td>
                    <td class="text-center">1 Pax</td>
                    <td class="text-right">Rp {{ number_format($item->price, 0, ',', '.') }}</td>
                    <td class="text-center">0%</td>
                    <td class="text-right">Rp {{ number_format($item->price, 0, ',', '.') }}</td>
                    <td class="text-center">-</td>
                    <td class="text-right">Rp {{ number_format($item->price, 0, ',', '.') }}</td>
                </tr>
                @endforeach
            @endforeach
        </tbody>
    </table>

    <div class="summary-section">
        <div class="notes-section">
            <h4 class="notes-title">Pesan</h4>
            <p class="notes-content">
                Pembayaran bisa diberikan langsung kepada terapis kami (tunai) atau transfer melalui rekening berikut :<br>
                <strong>BCA a.n Acep Dani : 7772554756</strong><br>
                # Harap mengirimkan bukti transfer kepada admin melalui whatsapp setelah melakukan pembayaran
            </p>
        </div>

        <div class="summary-container">
            <table class="summary-table">
                <tr>
                    <td class="summary-label">Sub Total</td>
                    <td class="summary-value">Rp {{ number_format($transaction->items->sum('price'), 0, ',', '.') }}</td>
                </tr>
                <tr>
                    <td class="summary-label">Biaya Transport</td>
                    <td class="summary-value">Rp {{ number_format($transaction->transport_fee, 0, ',', '.') }}</td>
                </tr>
                <tr>
                    <td class="summary-label">Grand Total</td>
                    <td class="summary-value">Rp {{ number_format($transaction->total_price + $transaction->transport_fee, 0, ',', '.') }}</td>
                </tr>
                <tr>
                    <td colspan="2" class="summary-divider"></td>
                </tr>
                <tr class="summary-total">
                    <td class="summary-label" style="color: #3b82f6;">Total</td>
                    <td class="summary-value">Rp {{ number_format($transaction->total_price + $transaction->transport_fee, 0, ',', '.') }}</td>
                </tr>
                <tr>
                    <td colspan="2" class="summary-divider"></td>
                </tr>
                <tr>
                    <td class="summary-label">Sisa Tagihan</td>
                    <td class="summary-value">Rp {{ number_format($transaction->total_price + $transaction->transport_fee, 0, ',', '.') }}</td>
                </tr>
            </table>
        </div>
        <div class="clear"></div>
    </div>

    <div class="footer-sign">
        <p class="sign-text">Dengan Hormat,</p>
        <p class="sign-name">Jemari Home Spa</p>
    </div>
</body>
</html>
