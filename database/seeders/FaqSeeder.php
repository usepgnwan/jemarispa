<?php

namespace Database\Seeders;

use App\Models\Faq;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class FaqSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::statement('DELETE FROM faqs');

        $faqs = [
            [
                'title_id' => 'Bagaimana cara melakukan pemesanan?',
                'description_id' => '<p>Anda dapat melakukan pemesanan melalui website ini dengan memilih paket yang diinginkan, lalu mengisi form reservasi yang akan terhubung langsung ke WhatsApp kami.</p>',
                'title_en' => 'How do I make a booking?',
                'description_en' => '<p>You can make a booking through this website by selecting your desired package and filling out the reservation form, which will connect directly to our WhatsApp.</p>',
            ],
            [
                'title_id' => 'Apakah melayani Home Service?',
                'description_id' => '<p>Ya, kami melayani Home Service untuk area tertentu. Silakan hubungi admin kami melalui WhatsApp for konfirmasi jangkauan area dan biaya transportasi.</p>',
                'title_en' => 'Do you offer Home Service?',
                'description_en' => '<p>Yes, we offer Home Service for certain areas. Please contact our admin via WhatsApp to confirm area coverage and transportation fees.</p>',
            ],
            [
                'title_id' => 'Metode pembayaran apa saja yang diterima?',
                'description_id' => '<p>Kami menerima pembayaran tunai (Cash), transfer bank, dan berbagai jenis E-Wallet seperti GoPay, OVO, dan Dana.</p>',
                'title_en' => 'What payment methods are accepted?',
                'description_en' => '<p>We accept cash, bank transfers, and various E-Wallets such as GoPay, OVO, and Dana.</p>',
            ],
            [
                'title_id' => 'Berapa lama waktu ideal untuk memesan sebelum jadwal?',
                'description_id' => '<p>Kami menyarankan Anda untuk memesan setidaknya 2-3 jam sebelum waktu yang diinginkan untuk memastikan ketersediaan terapis.</p>',
                'title_en' => 'How far in advance should I book?',
                'description_en' => '<p>We recommend booking at least 2-3 hours in advance to ensure therapist availability.</p>',
            ],
            [
                'title_id' => 'Apakah saya bisa memilih terapis?',
                'description_id' => '<p>Tentu, Anda dapat meminta terapis tertentu jika mereka tersedia pada jadwal yang Anda pilih.</p>',
                'title_en' => 'Can I choose my therapist?',
                'description_en' => '<p>Certainly, you can request a specific therapist if they are available at your chosen time.</p>',
            ],
            [
                'title_id' => 'Apakah tersedia terapis pria dan wanita?',
                'description_id' => '<p>Ya, kami menyediakan tenaga terapis profesional baik pria maupun wanita untuk kenyamanan Anda.</p>',
                'title_en' => 'Are both male and female therapists available?',
                'description_en' => '<p>Yes, we provide both professional male and female therapists for your comfort.</p>',
            ],
        ];

        foreach ($faqs as $faq) {
            Faq::create($faq);
        }
    }
}
