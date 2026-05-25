<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <title>Pesanan Baru {{ $transaction->order_number }}</title>
</head>
<body style="margin:0; padding:0; background:#f4f5f7; font-family:Arial, Helvetica, sans-serif; color:#333;">
    @php
        $items = $transaction->items;
        $groupedItems = $items->groupBy('guest_index');
        $subtotal = $items->sum('price');
        $transportFee = (float) ($transaction->transport_fee ?? 0);
        $discountAmount = (float) ($transaction->discount_amount ?? 0);
        $statusLabel = $transaction->status === 'success' ? 'Sudah Dibayar' : ($transaction->status === 'failed' ? 'Dibatalkan' : 'Belum Dibayar');
        $statusColor = $transaction->status === 'success' ? '#10b981' : ($transaction->status === 'failed' ? '#6b7280' : '#ef4444');
        $serviceDate = $transaction->schedule_date ? \Carbon\Carbon::parse($transaction->schedule_date)->format('d M Y') : '-';
        $createdDate = $transaction->created_at ? \Carbon\Carbon::parse($transaction->created_at)->format('d M Y') : '-';
        $therapists = $items->pluck('employee.name')->filter()->unique()->join(', ') ?: '-';
        $cleanPackageName = function ($name) {
            return trim(preg_replace('/\s+\d+\s*(menit|minutes|mins|min)\b/i', '', (string) $name));
        };
    @endphp

    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#f4f5f7; padding:24px 0;">
        <tr>
            <td align="center">
                <table width="680" cellpadding="0" cellspacing="0" role="presentation" style="width:680px; max-width:100%; background:#ffffff; border-radius:14px; overflow:hidden;">
                    <tr>
                        <td style="padding:28px 30px 18px 30px;">
                            <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                                <tr>
                                    <td valign="top" style="width:50%;">
                                        <div style="width:76px; height:76px; border-radius:14px; background:#333; color:#fff; text-align:center; line-height:76px; font-size:13px; font-weight:bold; letter-spacing:1px;">JEMARI</div>
                                    </td>
                                    <td valign="top" align="right" style="width:50%;">
                                        <div style="display:inline-block; background:{{ $statusColor }}; color:#fff; padding:6px 14px; border-radius:999px; font-size:10px; font-weight:bold; text-transform:uppercase; letter-spacing:.4px;">{{ $statusLabel }}</div>
                                        <h1 style="font-size:28px; line-height:1; margin:12px 0 4px 0; color:#111; letter-spacing:0;">INVOICE</h1>
                                        <div style="font-size:12px; color:#666;">{{ $transaction->order_number }}</div>
                                    </td>
                                </tr>
                            </table>

                            <div style="margin-top:18px;">
                                <div style="font-size:18px; font-weight:bold; color:#111;">Jemari Home Spa</div>
                                <div style="font-size:12px; color:#666; margin-top:3px;">jemarihomespa.com</div>
                                <div style="font-size:12px; color:#666; margin-top:3px;">
                                    Telp: {{ $settings->phone ?? '089516166090' }} Email: {{ $settings->email ?? 'jemari.homespa27@gmail.com' }}
                                </div>
                            </div>
                        </td>
                    </tr>

                    <tr>
                        <td style="padding:0 30px;">
                            <div style="border-top:1px solid #eeeeee;"></div>
                        </td>
                    </tr>

                    <tr>
                        <td style="padding:22px 30px 10px 30px;">
                            <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                                <tr>
                                    <td valign="top" style="width:55%; padding-right:18px;">
                                        <div style="font-size:10px; color:#999; font-weight:bold; text-transform:uppercase; letter-spacing:1px; margin-bottom:7px;">Tagihan Kepada</div>
                                        <div style="font-size:16px; font-weight:bold; color:#111;">{{ $transaction->customer_name }}</div>
                                        <div style="font-size:12px; color:#666; line-height:1.5; margin-top:5px;">Telp: {{ $transaction->phone ?: '-' }}</div>
                                        <div style="margin-top:12px;">
                                            <div style="font-size:10px; color:#999; font-weight:bold; text-transform:uppercase; letter-spacing:.5px;">Alamat Customer</div>
                                            <div style="font-size:12px; color:#333; line-height:1.5; margin-top:4px;">{{ $transaction->address ?: '-' }}</div>
                                        </div>
                                        <div style="margin-top:12px;">
                                            <div style="font-size:10px; color:#999; font-weight:bold; text-transform:uppercase; letter-spacing:.5px;">Catatan Customer</div>
                                            <div style="font-size:12px; color:#333; line-height:1.5; margin-top:4px;">{{ $transaction->notes ?: '-' }}</div>
                                        </div>
                                    </td>
                                    <td valign="top" style="width:45%;">
                                        <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="font-size:12px; color:#333;">
                                            <tr>
                                                <td style="padding:3px 0; color:#999; width:95px;">Tanggal</td>
                                                <td style="padding:3px 0; color:#999; width:12px;">:</td>
                                                <td style="padding:3px 0;">{{ $createdDate }}</td>
                                            </tr>
                                            <tr>
                                                <td style="padding:3px 0; color:#999;">Tgl. Layanan</td>
                                                <td style="padding:3px 0; color:#999;">:</td>
                                                <td style="padding:3px 0;">{{ $serviceDate }}</td>
                                            </tr>
                                            <tr>
                                                <td style="padding:3px 0; color:#999;">Waktu</td>
                                                <td style="padding:3px 0; color:#999;">:</td>
                                                <td style="padding:3px 0;">{{ $transaction->schedule_time ?: '-' }}</td>
                                            </tr>
                                            <tr>
                                                <td style="padding:3px 0; color:#999;">Terapis</td>
                                                <td style="padding:3px 0; color:#999;">:</td>
                                                <td style="padding:3px 0;">{{ $therapists }}</td>
                                            </tr>
                                            <tr>
                                                <td style="padding:3px 0; color:#999;">Pembayaran</td>
                                                <td style="padding:3px 0; color:#999;">:</td>
                                                <td style="padding:3px 0;">{{ $transaction->payment_method }}</td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <tr>
                        <td style="padding:10px 30px 0 30px;">
                            <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:collapse;">
                                <thead>
                                    <tr>
                                        <th align="left" style="padding:12px 6px; border-bottom:1px solid #eeeeee; color:#999; font-size:10px; text-transform:uppercase; letter-spacing:.5px;">Produk</th>
                                        <th align="center" style="padding:12px 6px; border-bottom:1px solid #eeeeee; color:#999; font-size:10px; text-transform:uppercase; letter-spacing:.5px;">Qty</th>
                                        <th align="right" style="padding:12px 6px; border-bottom:1px solid #eeeeee; color:#999; font-size:10px; text-transform:uppercase; letter-spacing:.5px;">Harga</th>
                                        <th align="right" style="padding:12px 6px; border-bottom:1px solid #eeeeee; color:#999; font-size:10px; text-transform:uppercase; letter-spacing:.5px;">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    @foreach ($groupedItems as $guestIndex => $guestItems)
                                        <tr>
                                            <td colspan="4" style="background:#f9fafb; border-bottom:1px solid #eeeeee; padding:8px 10px; font-size:10px; font-weight:bold; text-transform:uppercase; color:#333;">Person {{ $guestIndex }}</td>
                                        </tr>
                                        @foreach ($guestItems as $item)
                                            <tr>
                                                <td style="padding:13px 6px 13px 14px; border-bottom:1px solid #f5f5f5; font-size:12px; color:#222;">
                                                    <div style="font-weight:bold;">{{ $cleanPackageName($item->package_name) }}</div>
                                                    <div style="font-size:10px; color:#888; margin-top:3px;">{{ $item->package_duration }} | {{ ucfirst($item->guest_gender ?: '-') }} | Terapis {{ ucfirst($item->therapist_gender_preference ?: '-') }}</div>
                                                </td>
                                                <td align="center" style="padding:13px 6px; border-bottom:1px solid #f5f5f5; font-size:12px;">1 Pax</td>
                                                <td align="right" style="padding:13px 6px; border-bottom:1px solid #f5f5f5; font-size:12px;">{{ number_format((float) $item->price, 0, ',', '.') }}</td>
                                                <td align="right" style="padding:13px 6px; border-bottom:1px solid #f5f5f5; font-size:12px; font-weight:bold;">{{ number_format((float) $item->price, 0, ',', '.') }}</td>
                                            </tr>
                                        @endforeach
                                    @endforeach
                                </tbody>
                            </table>
                        </td>
                    </tr>

                    <tr>
                        <td style="padding:24px 30px 30px 30px;">
                            <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                                <tr>
                                    <td valign="top" style="width:55%; padding-right:20px;">
                                        <div style="font-size:14px; font-weight:bold; color:#333; margin-bottom:8px;">Pesan & Informasi</div>
                                        <div style="font-size:12px; color:#555; line-height:1.6;">
                                            Pembayaran bisa diberikan langsung kepada terapis kami (tunai) atau transfer melalui rekening berikut:<br>
                                            <strong>BCA a.n Acep Dani : 7772554756</strong><br>
                                            <span style="font-size:11px; color:#888;">Harap mengirimkan bukti transfer kepada admin melalui WhatsApp setelah melakukan pembayaran.</span>
                                            <br><br><strong>Catatan Customer:</strong> {{ $transaction->notes ?: '-' }}
                                        </div>
                                    </td>
                                    <td valign="top" style="width:45%;">
                                        <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#f8f9fa; border-radius:12px; padding:14px;">
                                            <tr>
                                                <td style="padding:5px 0; font-size:12px; color:#777;">Sub Total</td>
                                                <td align="right" style="padding:5px 0; font-size:12px; font-weight:bold;">Rp {{ number_format((float) $subtotal, 0, ',', '.') }}</td>
                                            </tr>
                                            <tr>
                                                <td style="padding:5px 0; font-size:12px; color:#777;">Biaya Transport</td>
                                                <td align="right" style="padding:5px 0; font-size:12px; font-weight:bold;">Rp {{ number_format($transportFee, 0, ',', '.') }}</td>
                                            </tr>
                                            @if ($discountAmount > 0)
                                                <tr>
                                                    <td style="padding:5px 0; font-size:12px; color:#777;">Diskon</td>
                                                    <td align="right" style="padding:5px 0; font-size:12px; font-weight:bold;">- Rp {{ number_format($discountAmount, 0, ',', '.') }}</td>
                                                </tr>
                                            @endif
                                            @if ($transaction->voucher)
                                                <tr>
                                                    <td style="padding:5px 0; font-size:12px; color:#777;">Voucher {{ $transaction->voucher->code }}</td>
                                                    <td align="right" style="padding:5px 0; font-size:12px; font-weight:bold;">- Rp {{ number_format((float) $transaction->voucher->discount_amount, 0, ',', '.') }}</td>
                                                </tr>
                                            @endif
                                            <tr>
                                                <td colspan="2" style="border-top:1px solid #e5e7eb; padding-top:8px;"></td>
                                            </tr>
                                            <tr>
                                                <td style="padding:6px 0 0 0; font-size:13px; color:#3b82f6; font-weight:bold;">TOTAL</td>
                                                <td align="right" style="padding:6px 0 0 0; font-size:16px; color:#3b82f6; font-weight:bold;">Rp {{ number_format((float) $transaction->total_price, 0, ',', '.') }}</td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <tr>
                        <td align="right" style="padding:0 30px 30px 30px;">
                            <div style="font-size:12px; color:#666; margin-bottom:32px;">Hormat Kami,</div>
                            <div style="font-size:13px; color:#111; font-weight:bold;">Jemari Home Spa</div>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
