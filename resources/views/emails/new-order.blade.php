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
        $pax = $groupedItems->count();
        $serviceDate = $transaction->schedule_date
            ? \Carbon\Carbon::parse($transaction->schedule_date)->locale('id')->translatedFormat('l, d F Y')
            : '-';
        $schedule = trim($serviceDate . ($transaction->schedule_time ? ', ' . $transaction->schedule_time : ''));
        $subtotal = (float) $items->sum('price');
        $transportFee = (float) ($transaction->transport_fee ?? 0);
        $discountAmount = (float) ($transaction->discount_amount ?? 0);
        $voucherDiscount = (float) optional($transaction->voucher)->discount_amount;
        $total = (float) $transaction->total_price;

        $cleanPackageName = function ($name) {
            return trim(preg_replace('/\s+\d+\s*(menit|minutes|mins|min)\b/i', '', (string) $name));
        };

        $formatGender = function ($gender) {
            return ucfirst((string) ($gender ?: '-'));
        };

        $formatCurrency = function ($amount) {
            return 'Rp ' . number_format((float) $amount, 0, ',', '.');
        };

        $genderLines = $groupedItems->map(function ($guestItems, $guestIndex) use ($formatGender) {
            return 'Pelanggan ' . $guestIndex . ': ' . $formatGender(optional($guestItems->first())->guest_gender);
        })->values()->implode("\n");

        $therapistGenderLines = $groupedItems->map(function ($guestItems, $guestIndex) use ($formatGender) {
            return 'Pelanggan ' . $guestIndex . ': ' . $formatGender(optional($guestItems->first())->therapist_gender_preference);
        })->values()->implode("\n");

        $packageLines = $groupedItems->map(function ($guestItems, $guestIndex) use ($cleanPackageName, $formatCurrency) {
            $packages = $guestItems->map(function ($item) use ($cleanPackageName, $formatCurrency) {
                return '- ' . $cleanPackageName($item->package_name)
                    . ' ' . $item->package_duration
                    . ' @ ' . $formatCurrency($item->price);
            })->implode("\n");

            return 'Pelanggan ' . $guestIndex . ":\n" . $packages;
        })->values()->implode("\n\n");

        $summaryLines = [
            'Subtotal: ' . $formatCurrency($subtotal),
        ];

        if ($transportFee > 0) {
            $summaryLines[] = 'Biaya Transport: ' . $formatCurrency($transportFee);
        }

        if ($discountAmount > 0) {
            $summaryLines[] = 'Diskon: - ' . $formatCurrency($discountAmount);
        }

        if ($transaction->voucher) {
            $summaryLines[] = 'Voucher ' . $transaction->voucher->code . ': - ' . $formatCurrency($voucherDiscount);
        }

        $summaryLines[] = 'Total: ' . $formatCurrency($total);

        $defaultTemplate = '<p><strong>Form Reservasi Jemari Home Spa</strong></p><p>Nama : [name]</p><p>Jumlah order (pax) : [pax]</p><p>Gender : [gender]</p><p>Alamat Lengkap : [address]</p><p><strong>Pilihan Treatment :</strong>[package]</p><p>Jadwal Treatment : [schedule]</p><p>Metode Pembayaran : [payment]</p><p>Jumlah terapis (pax) : [therapist_pax]</p><p>Pilihan Terapis : [therapist_gender]</p><p>Dari mana Kakak mendapatkan informasi tentang Jemari Home Spa : [source]</p><p><strong>Detail Pesanan:</strong></p><p>[details]</p><p>---</p><p><strong>Total Bayar: [total]</strong></p><p>Catatan: [notes]</p>';
        $template = optional($settings)->template_order ?: $defaultTemplate;
        $templateHasHtml = $template !== strip_tags($template);

        $toEmailHtml = function ($value) {
            return nl2br(e((string) ($value ?: '-')), false);
        };

        $totalText = $formatCurrency($total);
        if ($transaction->voucher) {
            $totalText .= ' (Sudah potong Voucher ' . $transaction->voucher->code . ' -' . $formatCurrency($voucherDiscount) . ')';
        }

        $replacements = [
            '[name]' => $toEmailHtml($transaction->customer_name),
            '[phone]' => $toEmailHtml($transaction->phone),
            '[pax]' => $toEmailHtml($pax),
            '[gender]' => $toEmailHtml($genderLines),
            '[address]' => $toEmailHtml($transaction->address),
            '[package]' => '<br>' . $toEmailHtml($packageLines),
            '[details]' => $toEmailHtml($packageLines . "\n\n" . implode("\n", $summaryLines)),
            '[date]' => $toEmailHtml($serviceDate),
            '[time]' => $toEmailHtml($transaction->schedule_time),
            '[schedule]' => $toEmailHtml($schedule),
            '[payment]' => $toEmailHtml($transaction->payment_method),
            '[therapist_pax]' => $toEmailHtml($pax),
            '[therapist_gender]' => $toEmailHtml($therapistGenderLines),
            '[source]' => $toEmailHtml($transaction->source),
            '[notes]' => $toEmailHtml($transaction->notes),
            '[total]' => $toEmailHtml($totalText),
            '[order_number]' => $toEmailHtml($transaction->order_number),
        ];

        $messageHtml = str_replace(array_keys($replacements), array_values($replacements), $template);

        if (! $templateHasHtml) {
            $messageHtml = nl2br($messageHtml, false);
        } else {
            $messageHtml = preg_replace('/<p(\s[^>]*)?>/i', '<p$1 style="margin:0 0 4px 0; line-height:1.45;">', $messageHtml);
        }
    @endphp

    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#f4f5f7; padding:24px 0;">
        <tr>
            <td align="center">
                <table width="680" cellpadding="0" cellspacing="0" role="presentation" style="width:680px; max-width:100%; background:#ffffff; border-radius:12px; overflow:hidden;">
                    <tr>
                        <td style="padding:28px 30px; background:#111827; color:#ffffff;">
                            <div style="font-size:12px; line-height:1.4; text-transform:uppercase; letter-spacing:.8px; color:#d1d5db;">Pesanan Baru</div>
                            <h1 style="font-size:24px; line-height:1.25; margin:6px 0 0 0; color:#ffffff;">{{ $transaction->order_number }}</h1>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:28px 30px 8px 30px;">
                            <div style="font-size:15px; line-height:1.45; color:#333;">
                                {!! $messageHtml !!}
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:20px 30px 30px 30px;">
                            <div style="border-top:1px solid #eeeeee; padding-top:16px; font-size:12px; line-height:1.6; color:#777;">
                                Email ini dibuat otomatis dari template <strong>Order Template (Reservation)</strong> di halaman Settings.
                            </div>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
