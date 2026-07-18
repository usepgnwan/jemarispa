<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice - {{ $transaction->order_number }}</title>
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
        .info-grid {
            width: 100%;
            margin-bottom: 20px;
            table-layout: fixed;
        }
        .info-grid td {
            vertical-align: top;
            font-size: 11px;
            word-wrap: break-word;
        }
        .tagihan-kepada {
            color: #999;
            font-weight: bold;
            text-transform: uppercase;
            font-size: 9px;
            letter-spacing: 1px;
            margin-bottom: 5px;
        }
        .customer-name {
            font-size: 13px;
            font-weight: bold;
            margin: 0;
        }
        .customer-address {
            font-size: 10px;
            color: #666;
            margin-top: 3px;
            line-height: 1.4;
            max-width: 90%;
        }
        .meta-table {
            width: 100%;
        }
        .meta-table td {
            padding: 2px 0;
        }
        .meta-label {
            color: #999;
            width: 80px;
        }
        .meta-separator {
            width: 10px;
            color: #999;
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
        .item-name {
            font-weight: bold;
            display: block;
            margin-bottom: 2px;
        }
        .summary-section {
            width: 100%;
            margin-top: 10px;
        }
        .notes-section {
            width: 55%;
            float: left;
        }
        .summary-container {
            width: 40%;
            float: right;
            background-color: #f8f9fa;
            border-radius: 12px;
            padding: 12px;
        }
        .notes-title {
            font-weight: bold;
            font-size: 12px;
            margin-bottom: 8px;
            color: #333;
        }
        .notes-content {
            font-size: 10px;
            color: #555;
            line-height: 1.5;
            padding-right: 15px;
        }
        .summary-table {
            width: 100%;
        }
        .summary-table td {
            padding: 4px 0;
            font-size: 10px;
        }
        .summary-label {
            color: #777;
        }
        .summary-value {
            text-align: right;
            font-weight: bold;
            color: #333;
        }
        .summary-divider {
            border-bottom: 1px solid #eee;
            margin: 4px 0;
        }
        .summary-total {
            color: #3b82f6;
            font-size: 12px;
        }
        .footer-sign {
            margin-top: 40px;
            clear: both;
            text-align: right;
        }
        .sign-text {
            font-size: 10px;
            color: #666;
            margin-bottom: 50px;
        }
        .sign-name {
            font-weight: bold;
            font-size: 11px;
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
        $cleanPackageName = function ($name) {
            $name = preg_replace('/\s+\d+\s*(menit|minutes|mins|min)\b/i', '', (string) $name);
            return trim(preg_replace('/\s+\d+$/', '', $name));
        };
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
            @php
                $isLunas = $transaction->status === 'success' || 
                           ($transaction->payment_type === 'dp' && $transaction->is_pelunasan_paid);
            @endphp
            @if($isLunas)
                <div class="status-badge" style="background-color: #10b981;">Sudah Dibayar (LUNAS)</div>
            @elseif($transaction->status === 'failed')
                <div class="status-badge" style="background-color: #6b7280;">Dibatalkan</div>
            @elseif($transaction->payment_type === 'dp' && !$transaction->is_pelunasan_paid)
                <div class="status-badge" style="background-color: #f97316;">DP Dibayar (Sisa Belum Lunas)</div>
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
            <td width="55%">
                <div class="tagihan-kepada">TAGIHAN KEPADA</div>
                <p class="customer-name">{{ $transaction->customer_name }}</p>
                <div class="customer-address">{{ $transaction->address }}</div>
                @if($transaction->phone)
                    <div class="customer-address">Telp: {{ $transaction->phone }}</div>
                @endif
            </td>
            <td width="45%">
                <table class="meta-table">
                    <tr>
                        <td class="meta-label">Tanggal</td>
                        <td class="meta-separator">:</td>
                        <td>{{ \Carbon\Carbon::parse($transaction->created_at)->format('d M Y') }}</td>
                    </tr>
                    <tr>
                        <td class="meta-label">Tgl. Layanan</td>
                        <td class="meta-separator">:</td>
                        <td>{{ \Carbon\Carbon::parse($transaction->schedule_date)->format('d M Y') }}</td>
                    </tr>
                    <!-- <tr>
                        <td class="meta-label">Waktu</td>
                        <td class="meta-separator">:</td>
                        <td>
                                @php
                                    $timeStr = str_replace('.', ':', $transaction->schedule_time);
                                    // Ensure it has at least HH:mm
                                    if (strlen($timeStr) < 5 && strpos($timeStr, ':') !== false) {
                                        $parts = explode(':', $timeStr);
                                        $timeStr = sprintf('%02d:%02d', $parts[0], $parts[1]);
                                    }
                                    $startTime = \Carbon\Carbon::parse($timeStr)->format('H:i');
                                    
                                    $guestDurations = $transaction->items->groupBy('guest_index')->map(function($items) {
                                        return $items->sum(function($item) {
                                            return (int) filter_var($item->package_duration, FILTER_SANITIZE_NUMBER_INT);
                                        });
                                    });
                                    $maxDuration = $guestDurations->max() ?? 0;
                                    $endTime = \Carbon\Carbon::parse($timeStr)->addMinutes($maxDuration)->format('H:i');
                                @endphp
                                {{ $startTime }} - {{ $endTime }}
                        </td>
                    </tr> -->
                    <tr>
                        <td class="meta-label">Total Pelanggan</td>
                        <td class="meta-separator">:</td>
                        <td>{{ $transaction->items->pluck('guest_index')->unique()->count() }} Orang</td>
                    </tr>
                    <tr>
                        <td class="meta-label">Terapis</td>
                        <td class="meta-separator">:</td>
                        <td>{{ $transaction->items->pluck('employee.name')->filter()->unique()->join(', ') ?: '-' }}</td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>

    <table class="items-table">
        <colgroup>
            <col style="width: 30%;">
            <col style="width: 10%;">
            <col style="width: 15%;">
            <col style="width: 10%;">
            <col style="width: 15%;">
            <col style="width: 5%;">
            <col style="width: 15%;">
        </colgroup>
        <thead>
            <tr>
                <th>PRODUK</th>
                <th class="text-center">QTY</th>
                <th class="text-right">HARGA</th>
                <th class="text-center">DISC</th>
                <th class="text-right">SUBTOTAL</th>
                <th class="text-center">TAX</th>
                <th class="text-right">TOTAL</th>
            </tr>
        </thead>
        <tbody>
            @php
                $groupedItems = $transaction->items->groupBy(function($item) {
                    return $item->package_name . '___' . $item->package_duration . '___' . $item->price;
                });
            @endphp
            @foreach($groupedItems as $key => $items)
                @php
                    $firstItem = $items->first();
                    $qty = $items->count();
                    $price = $firstItem->price;
                    $subtotal = $price * $qty;
                @endphp
                <tr>
                    <td>
                        <span class="item-name">{{ $cleanPackageName($firstItem->package_name) }}</span>
                        <div style="font-size: 9px; color: #888; margin-top: 2px;">{{ $firstItem->package_duration }}</div>
                    </td>
                    <td class="text-center">{{ $qty }} Pax</td>
                    <td class="text-right">{{ number_format($price, 0, ',', '.') }}</td>
                    <td class="text-center">0%</td>
                    <td class="text-right">{{ number_format($subtotal, 0, ',', '.') }}</td>
                    <td class="text-center">-</td>
                    <td class="text-right">{{ number_format($subtotal, 0, ',', '.') }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <div class="summary-section">
        <div class="notes-section">
            <h4 class="notes-title">Pesan & Informasi</h4>
            <p class="notes-content">
                Pembayaran bisa diberikan langsung kepada terapis kami (tunai) atau transfer melalui rekening berikut :<br>
                <strong>BCA a.n Acep Dani : 7772554756</strong><br>
                <span style="font-size: 9px; color: #888;">* Harap mengirimkan bukti transfer kepada admin melalui whatsapp setelah melakukan pembayaran.</span>
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
                @if($transaction->discount_percent > 0)
                <tr>
                    <td class="summary-label">Diskon ({{ (float)$transaction->discount_percent }}%)</td>
                    <td class="summary-value">- Rp {{ number_format($transaction->discount_amount, 0, ',', '.') }}</td>
                </tr>
                @endif
                @if($transaction->voucher)
                <tr>
                    <td class="summary-label">Voucher ({{ $transaction->voucher->code }})</td>
                    <td class="summary-value">- Rp {{ number_format($transaction->voucher->discount_amount, 0, ',', '.') }}</td>
                </tr>
                @endif
                <tr>
                    <td colspan="2" class="summary-divider"></td>
                </tr>
                <tr class="summary-total">
                    <td class="summary-label" style="color: #3b82f6; font-weight: bold;">TOTAL KESELURUHAN</td>
                    <td class="summary-value" style="color: #3b82f6; font-size: 14px;">Rp {{ number_format($transaction->total_price, 0, ',', '.') }}</td>
                </tr>
                @if($transaction->payment_type === 'dp' && $transaction->dp_amount > 0)
                <tr>
                    <td colspan="2" class="summary-divider"></td>
                </tr>
                <tr>
                    <td class="summary-label" style="color: #f97316; font-weight: bold;">Down Payment (DP) Dibayar</td>
                    <td class="summary-value" style="color: #f97316; font-weight: bold;">- Rp {{ number_format($transaction->dp_amount, 0, ',', '.') }}</td>
                </tr>
                <tr class="summary-total">
                    <td class="summary-label" style="color: {{ $transaction->is_pelunasan_paid ? '#10b981' : '#ef4444' }}; font-weight: bold;">SISA PELUNASAN</td>
                    <td class="summary-value" style="color: {{ $transaction->is_pelunasan_paid ? '#10b981' : '#ef4444' }}; font-size: 14px;">
                        @if($transaction->is_pelunasan_paid)
                            Rp {{ number_format($transaction->total_price - $transaction->dp_amount, 0, ',', '.') }} (LUNAS)
                        @else
                            Rp {{ number_format($transaction->total_price - $transaction->dp_amount, 0, ',', '.') }}
                        @endif
                    </td>
                </tr>
                @endif
            </table>
        </div>
        <div class="clear"></div>
    </div>

    <div class="footer-sign">
        <p class="sign-text">Hormat Kami,</p>
        <div style="height: 40px;"></div>
        <p class="sign-name">Jemari Home Spa</p>
    </div>

    @if($transaction->review_token && $transaction->review_expires_at && \Carbon\Carbon::parse($transaction->review_expires_at)->isFuture())
    <div style="margin-top: 30px; padding: 15px; background-color: #fdf2f0; border: 1px solid #f9d6d1; border-radius: 12px; text-align: center;">
        <p style="font-size: 9px; color: #e07a5f; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 5px 0;">Ulasan Anda Sangat Berarti</p>
        <p style="font-size: 11px; font-weight: bold; color: #333; margin: 0 0 10px 0;">Berikan ulasan layanan kami untuk membantu kami berkembang</p>
        <a href="{{ url('/review/' . $transaction->review_token) }}" style="display: inline-block; background-color: #e07a5f; color: white; padding: 8px 20px; border-radius: 20px; font-size: 10px; font-weight: bold; text-decoration: none;">
            TULIS ULASAN
        </a>
        <p style="font-size: 8px; color: #999; margin: 8px 0 0 0;">Link berlaku 24 jam · S/d {{ \Carbon\Carbon::parse($transaction->review_expires_at)->locale('id')->isoFormat('D MMMM YYYY HH:mm') }}</p>
    </div>
    @endif
</body>
</html>
