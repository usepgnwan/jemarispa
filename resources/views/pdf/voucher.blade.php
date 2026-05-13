<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <style>
        @page {
            margin: 0;
        }
        body {
            font-family: 'Helvetica', 'Arial', sans-serif;
            margin: 0;
            padding: 40px;
            color: #333;
            background-color: #fff;
        }
        .header {
            overflow: hidden;
            margin-bottom: 30px;
        }
        .voucher-title-box {
            float: left;
            background: linear-gradient(to right, #fdbb2d, #f97316);
            padding: 10px 40px;
            border-radius: 10px;
            color: #fff;
        }
        .voucher-title-box h1 {
            margin: 0;
            font-size: 28px;
            font-weight: normal;
        }
        .header-logo {
            float: right;
            width: 80px;
        }
        .sub-header {
            clear: both;
            margin-top: 10px;
            font-size: 12px;
            color: #666;
        }
        .voucher-card {
            margin-top: 30px;
            position: relative;
            height: 350px;
            background-color: #444;
            border-radius: 20px;
            overflow: hidden;
            color: #fff;
        }
        .voucher-card-image {
            position: absolute;
            left: 0;
            top: 0;
            width: 45%;
            height: 100%;
            background-image: url('{{ public_path('images/pijat tradisional.jpg') }}');
            background-size: cover;
            background-position: center;
        }
        .voucher-card-content {
            position: absolute;
            right: 0;
            top: 0;
            width: 55%;
            height: 100%;
            padding: 40px;
            background-color: #3f3f3f;
            box-sizing: border-box;
        }
        .voucher-card-content .logo-small {
            width: 60px;
            margin-bottom: 20px;
            display: block;
            margin-left: auto;
            margin-right: auto;
        }
        .voucher-card-content h2 {
            font-size: 48px;
            text-align: center;
            margin: 0;
            letter-spacing: 5px;
            font-weight: bold;
            font-family: 'Times New Roman', serif;
        }
        .package-badge {
            background-color: #f97316;
            color: #fff;
            padding: 10px;
            border-radius: 8px;
            text-align: center;
            font-size: 14px;
            font-weight: bold;
            margin-top: 20px;
        }
        .valid-until {
            text-align: center;
            margin-top: 40px;
            font-size: 10px;
            color: #ccc;
        }
        .valid-until .date {
            display: block;
            font-size: 14px;
            color: #fff;
            margin-top: 5px;
        }
        .social-info {
            position: absolute;
            bottom: 20px;
            width: 100%;
            text-align: center;
            font-size: 9px;
            color: #ccc;
        }
        .social-info span {
            margin: 0 10px;
        }

        .details-section {
            margin-top: 40px;
        }
        .details-section h3 {
            font-size: 20px;
            margin-bottom: 15px;
        }
        .details-table {
            width: 100%;
            border-collapse: collapse;
        }
        .details-table td {
            padding: 12px 15px;
            font-size: 14px;
        }
        .details-table tr:nth-child(even) {
            background-color: #f8f9fa;
        }
        .label {
            width: 30%;
            color: #555;
        }
        .value {
            font-weight: bold;
        }

        .instructions {
            margin-top: 30px;
            font-size: 11px;
            line-height: 1.6;
        }
        .instructions h4 {
            font-size: 13px;
            margin-bottom: 5px;
            margin-top: 15px;
        }
        .instructions ul {
            padding-left: 0;
            list-style: none;
            margin: 0;
        }
        .instructions li {
            position: relative;
            padding-left: 15px;
            margin-bottom: 3px;
        }
        .instructions li::before {
            content: "-";
            position: absolute;
            left: 0;
        }

        .footer {
            margin-top: 50px;
            border-top: 1px solid #eee;
            padding-top: 15px;
            overflow: hidden;
        }
        .footer-left {
            float: left;
            font-size: 10px;
            color: #999;
        }
        .footer-left .wa {
            display: block;
            color: #f97316;
            font-weight: bold;
            font-size: 12px;
            margin-top: 5px;
        }
        .footer-right {
            float: right;
            text-align: right;
            font-size: 10px;
            color: #999;
        }
        .footer-right .inv {
            display: block;
            color: #fdbb2d;
            font-weight: bold;
            font-size: 12px;
            margin-top: 5px;
        }

        /* Tear effect simulation */
        .tear {
            position: absolute;
            left: 45%;
            top: 0;
            width: 15px;
            height: 100%;
            background-image: radial-gradient(circle at 0px 10px, transparent 10px, #3f3f3f 10px);
            background-size: 15px 20px;
            z-index: 10;
            transform: translateX(-50%);
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="voucher-title-box">
            <h1>Voucher Paperless</h1>
        </div>
        <img src="{{ public_path('images/Jemari Logo - 2.png') }}" class="header-logo">
    </div>

    <div class="sub-header">
        Dipesan dan dibeli melalui <strong>Jemari Home Spa</strong>
    </div>

    <div class="voucher-card">
        <div class="voucher-card-image"></div>
        <div class="tear"></div>
        <div class="voucher-card-content">
            <img src="{{ public_path('images/Jemari Logo - 2.png') }}" class="logo-small" style="filter: brightness(0) invert(1);">
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
                <span>jemarihomespa.com</span>
                <span>0895 1616 6090</span>
                <span>@jemari.homespa</span>
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
        </table>
    </div>

    <div class="instructions">
        <h4>Cara Penukaran E-Voucher :</h4>
        <ul>
            <li>Wajib reservasi minimal 1 jam sebelum jadwal treatment melalui Whatsapp <strong>0895 1616 6090</strong> di jam operasional pada pukul 08.00 - 21.00</li>
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

    <div class="footer">
        <div class="footer-left">
            Info lebih lanjut, hubungi admin melalui whatsapp
            <span class="wa">0895 1616 6090</span>
        </div>
        <div class="footer-right">
            Nomor invoice :
            <span class="inv">INV/{{ $voucher->created_at->format('y/m') }}/{{ str_pad($voucher->id, 4, '0', STR_PAD_LEFT) }}</span>
        </div>
    </div>
</body>
</html>
