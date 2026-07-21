<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    @php
        $logoPath = public_path('images/Jemari Logo - 2.png');
        $logoSrc = '';
        if (file_exists($logoPath)) {
            $logoData = base64_encode(file_get_contents($logoPath));
            $logoSrc = 'data:image/png;base64,' . $logoData;
        }

        $ogSharePath = public_path('images/og-share.jpg');
        $ogShareSrc = '';
        if (file_exists($ogSharePath)) {
            $ogShareData = base64_encode(file_get_contents($ogSharePath));
            $ogShareSrc = 'data:image/jpeg;base64,' . $ogShareData;
        }

    @endphp
    <style>
        @page { margin: 0; }
        body { font-family: 'Helvetica', 'Arial', sans-serif; margin: 0; padding: 25px 40px; color: #333; background-color: #fff; }
        
        .header-table { width: 100%; margin-bottom: 20px; border-collapse: collapse; }
        .voucher-title-box {
            background-color: #f97316;
            background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQAAAAABCAIAAAC+O+cgAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAAW0lEQVQokZ2RsRGAMAwD9UuwKNPTUZCCBGQZmhTO++yXOfZNkkDi/YUGgJD/qgCmokxvH7gNqnYeDAkopUwsHwBYBv20VvC9YnkUSUDrytHa62ClYiyNK6dYgBO9cQL/wEyeUgAAAABJRU5ErkJggg==');
            background-repeat: repeat-y;
            background-size: 100% 100%;
            padding: 8px 30px;
            border-radius: 10px;
            border : none;
            color: #fff;
            display: inline-block;
        }
        .voucher-title-box h1 { margin: 0; font-size: 32px; font-weight: bold; }
        .sub-header { margin-top: 5px; font-size: 11px; color: #666; margin-left: 5px; }
        
        .logo-wrapper {
            background-color: #555555;
            border-radius: 12px;
            width: 40px;
            height: 40px;
        }
        .logo-wrapper img { width: 25px; height: auto; }
        
        .voucher-card {
            margin-top: 15px;
            position: relative;
            height: 310px;
            background-color: #444;
            border-radius: 20px;
            overflow: hidden;
            color: #fff;
        }
        .voucher-card-image {
            position: absolute;
            left: 0; top: 0;
            width: 45%; height: 100%;
            @if($ogShareSrc)
                background-image: url('{{ $ogShareSrc }}');
            @else
                background-color: #444;
            @endif
            background-size: cover;
            background-position: center;
        }
        .voucher-card-content {
            position: absolute;
            right: 0; top: 0;
            width: 55%; height: 100%;
            padding: 25px 35px;
            background-color: #3f3f3f;
            box-sizing: border-box;
        }
        .voucher-card-content .logo-small {
            width: 55px;
            display: inline-block;
        }
        .voucher-card-content h2 {
            font-size: 40px; text-align: center; margin: 0; letter-spacing: 5px; font-weight: bold; font-family: 'Times New Roman', serif;
        }
        .voucher-card-content h3 {
            font-size: 30px; text-align: center; margin: 0; letter-spacing: 5px; font-weight: bold; font-family: 'Times New Roman', serif;
        }
        .package-badge {
            background-color: #f97316;
            color: #fff; padding: 8px; border-radius: 8px; text-align: center; font-size: 12px; font-weight: bold; margin-top: 15px;
        }
        .valid-until {
            text-align: center; margin-top: 30px; font-size: 9px; color: #ccc;
        }
        .valid-until .date {
            display: block; font-size: 12px; color: #fff; margin-top: 3px;
        }
        .social-info {
            position: absolute; bottom: 15px; width: 100%; text-align: center; font-size: 8px; color: #ccc;
        }
        .social-info span { margin: 0 10px; }

        .details-section { margin-top: 25px; }
        .details-section h3 { font-size: 18px; margin-bottom: 10px; }
        .details-table { width: 100%; border-collapse: collapse; }
        .details-table td { padding: 8px 15px; font-size: 13px; }
        .details-table tr:nth-child(even) { background-color: #f8f9fa; }
        .label { width: 30%; color: #555; }
        .value { font-weight: bold; }

        .instructions { margin-top: 20px; font-size: 11px; line-height: 1.5; }
        .instructions h4 { font-size: 12px; margin-bottom: 5px; margin-top: 10px; }
        .instructions ul { padding-left: 0; list-style: none; margin: 0; }
        .instructions li { position: relative; padding-left: 15px; margin-bottom: 3px; }
        .instructions li::before { content: "-"; position: absolute; left: 0; }

        .footer { margin-top: 30px; border-top: 1px solid #eee; padding-top: 15px; overflow: hidden; }
        .footer-left { float: left; font-size: 10px; color: #999; }
        .footer-left .wa { display: block; color: #f97316; font-weight: bold; font-size: 12px; margin-top: 5px; }
        .footer-right { float: right; text-align: right; font-size: 10px; color: #999; }
        .footer-right .inv { display: block; color: #fdbb2d; font-weight: bold; font-size: 12px; margin-top: 5px; }
    </style>
</head>
<body>
    <table class="header-table">
        <tr>
            <td style="vertical-align: top; text-align: left;">
                <div class="voucher-title-box">
                    <h1>Voucher Paperless</h1>
                </div>
                <div class="sub-header">
                    Dipesan dan dibeli melalui <strong>Jemari Home Spa</strong>
                </div>
            </td>
            <td style="vertical-align: middle; text-align: right; width: 90px;">
                @if($logoSrc)
                    <table width="80" height="80" border="0" cellpadding="0" cellspacing="0" style="background-color: #555555; border-radius: 12px; border-collapse: collapse; margin-left: auto; width: 80px; height: 80px; overflow: hidden;">
                        <tr height="80">
                            <td align="center" valign="middle" style="padding: 12px; width: 60px; height: 60px; overflow: hidden;">
                                <img src="{{ $logoSrc }}" alt="Logo" style="width: 46px; max-width: 46px; height: auto; display: inline;">
                            </td>
                        </tr>
                    </table>
                @else
                    <div style="font-weight: bold; font-size: 14px; color: #f97316;">JEMARI</div>
                @endif
            </td>
        </tr>
    </table>

    <div class="voucher-card">
        <div class="voucher-card-image"></div>
        <div class="voucher-card-content">
            @if($logoSrc)
                <div style="text-align: center; width: 100%; margin-bottom: 15px;">
                    <img src="{{ $logoSrc }}" class="logo-small" />
                </div>
            @else
                <div style="text-align: center; font-weight: bold; margin-bottom: 20px;">JEMARI</div>
            @endif
            <h2>VOUCHER</h2>
            <div class="package-badge">
                @if($voucher->category === 'bundle')
                    @foreach($voucher->bundle_packages as $pkg)
                        {{ $pkg['name'] }} - {{ $pkg['duration'] }}{{ !$loop->last ? ' & ' : '' }}
                    @endforeach
                @else
                    {{ $voucher->description ?: 'Voucher Treatment' }}
                @endif
            </div>

            <div class="valid-until">
                Valid until
                <span class="date">{{ \Carbon\Carbon::parse($voucher->expired_at)->translatedFormat('F d, Y') }}</span>
            </div>

            <div class="social-info">
                <span>{{ $setting->website ?? 'jemarihomespa.com' }}</span>
                <span>{{ $setting->phone ?? '0895 1616 6090' }}</span>
                <span>{{ isset($setting->url_instagram) ? '@' . ltrim(parse_url($setting->url_instagram, PHP_URL_PATH), '/') : '@jemari.homespa' }}</span>
            </div>
        </div>
    </div>

    <div class="details-section">
        <h3>Rincian Pembelian :</h3>
        <table class="details-table">
            <tr>
                <td class="label">Nama customer</td>
                <td class="value">: {{ $voucher->customer_name ?: '-' }}</td>
            </tr>
            <tr>
                <td class="label">Berlaku untuk</td>
                <td class="value">: 1 orang</td>
            </tr>
            <tr>
                <td class="label">Masa berlaku voucher</td>
                <td class="value">: {{ $voucher->created_at->translatedFormat('d F Y') }} - {{ \Carbon\Carbon::parse($voucher->expired_at)->translatedFormat('d F Y') }}</td>
            </tr>
            <tr>
                <td class="label">Kode Voucher</td>
                <td class="value">: {{ $voucher->code }}</td>
            </tr>
        </table>
    </div>

    @if(isset($setting) && $setting->voucher_instructions)
        <div class="instructions">
            {!! $setting->voucher_instructions !!}
        </div>
    @else
        <div class="instructions">
            <h4>Cara Penukaran E-Voucher :</h4>
            <ul>
                <li>Wajib reservasi minimal 1 jam sebelum jadwal treatment melalui Whatsapp <strong>{{ $setting->phone ?? '0895 1616 6090' }}</strong> di jam operasional pada pukul 08.00 - 21.00</li>
                <li>Kirimkan voucher yang telah dibeli ke admin Jemari Home Spa untuk proses penukaran</li>
                <li>Penggantian jadwal treatment bisa dilakukan sebelum terapis menuju atau tiba di tempat customer. Jika terapis sudah dalam perjalanan atau tiba di tempat, maka customer wajib mengganti biaya transportasi sebesar Rp. 30.000</li>
            </ul>

            <h4>Syarat & Ketentuan :</h4>
            <ul>
                <li>E-voucher tidak bisa diganti dengan treatment lain</li>
                <li>Berlaku setiap hari termasuk Sabtu, Minggu, dan hari libur nasional</li>
                <li>Voucher yang sudah dibeli tidak dapat dikembalikan (non-refundable).</li>
                <li>Voucher dianggap hangus jika sudah melewati masa berlaku dan tidak dapat ditukarkan ataupun di refund</li>
            </ul>
        </div>
    @endif

    <div class="footer">
        <div class="footer-left">
            Info lebih lanjut, hubungi admin melalui whatsapp
            <span class="wa">{{ $setting->phone ?? '0895 1616 6090' }}</span>
        </div>
        <div class="footer-right">
            Nomor invoice :
            <span class="inv">INV/{{ $voucher->created_at->format('y/m') }}/{{ str_pad($voucher->id, 4, '0', STR_PAD_LEFT) }}</span>
        </div>
    </div>
</body>
</html> 