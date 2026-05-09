<?php

namespace Database\Seeders;

use App\Models\Setting;
use App\Models\ServiceArea;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SettingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::statement('DELETE FROM settings');
        DB::statement('DELETE FROM service_areas');

        // Seed General Settings
        Setting::create([
            'phone' => '089516166090',
            'description_id' => 'Sebuah tempat perlindungan yang didedikasikan untuk pemulihan tubuh, pikiran, dan jiwa. Rasakan seni hidup sehat melalui ritual kami yang dikurasi, dikirim langsung ke kenyamanan rumah Anda.',
            'description_en' => 'A sanctuary dedicated to the restoration of body, mind, and spirit. Experience the art of living well through our curated rituals, delivered directly to the comfort of your sanctuary.',
            'template_order' => '<p><strong>Form Reservasi Jemari Home Spa</strong></p><p>Nama : [name]</p><p>Jumlah order (pax) : [pax]</p><p>Gender : [gender]</p><p>Alamat Lengkap : [address]</p><p><strong>Pilihan Treatment :</strong>[package]</p><p>Jadwal Treatment : [schedule]</p><p>Metode Pembayaran : [payment]</p><p>Jumlah terapis (pax) : [therapist_pax]</p><p>Pilihan Terapis : [therapist_gender]</p><p>Dari mana Kakak mendapatkan informasi tentang Jemari Home Spa : [source]</p><p><strong>Detail Pesanan:</strong></p><p>[details]</p><p>---</p><p><strong>Total Bayar: [total]</strong></p><p>Catatan: [notes]</p>',
            'template_question' => '<p>Halo Jemari Home Spa, saya [name] ingin bertanya mengenai: [question]</p>',
            'template_invoice' => '<p>Halo, Kak [name],</p><p>Terlampir Invoice [invoice_no] dengan detail pesanan sebagai berikut :</p><p>[details]</p><p>Biaya Transport : [transport]</p><p><strong>Total Pembayaran : [total]</strong></p><p>Untuk file invoice bisa di download di sini [link]</p><p>-</p><p>Pembayaran bisa melaui terapis kami atau transfer melalui rekening berikut :</p><p><strong>BCA a.n Acep Dani : 7772554756</strong></p><p>(Kirimkan bukti transfer, dan nama pemilik rekening setelah melakukan pembayaran)</p><p>-</p><p>Terima kasih telah menggunakan jasa Jemari Home Spa<br>jemarihomespa.com</p>',
        ]);

        // Seed Service Areas
        $areas = [
            ['name' => 'pijat panggilan Bandung'],
            ['name' => 'Kota Cimahi'],
            ['name' => 'Kabupaten Bandung'],
            ['name' => 'Kabupaten Bandung Barat'],
        ];

        foreach ($areas as $area) {
            ServiceArea::create($area);
        }
    }
}
