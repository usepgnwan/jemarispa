<?php

namespace Database\Seeders;

use App\Models\Package;
use App\Models\PackageDuration;
use Illuminate\Database\Seeder;

class PackageSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Delete in order to respect foreign keys
        PackageDuration::query()->delete();
        Package::query()->delete();

        $rituals = [
            [
                'id' => 'Pijat Tradisional',
                'title' => ['ID' => 'Pijat Tradisional', 'EN' => 'Traditional Massage'],
                'desc' => [
                    'ID' => 'Layanan pijat panggilan profesional untuk relaksasi tubuh dan pikiran. Terapis bersertifikat siap datang ke lokasi Anda.',
                    'EN' => 'Professional on-call massage service for body and mind relaxation. Certified therapists ready to come to your location.'
                ],
                'img' => '/images/pijat tradisional.JPG',
                'category' => 'Massage',
                'durations' => [
                    ['duration' => '90 Menit', 'price' => 140000],
                    ['duration' => '120 Menit', 'price' => 180000],
                ]
            ],
            [
                'id' => 'Bekam',
                'title' => ['ID' => 'Bekam Profesional', 'EN' => 'Professional Cupping'],
                'desc' => [
                    'ID' => 'Terapi bekam steril untuk detoksifikasi dan melancarkan peredaran darah. Aman dan ditangani oleh ahli.',
                    'EN' => 'Sterile cupping therapy for detoxification and blood circulation. Safe and handled by experts.'
                ],
                'img' => '/images/bekam.webp',
                'category' => 'Cupping',
                'durations' => [
                    ['duration' => '60 Menit', 'price' => 160000],
                ]
            ],
            [
                'id' => 'Kerokan',
                'title' => ['ID' => 'Terapi Kerokan', 'EN' => 'Scraping Therapy'],
                'desc' => [
                    'ID' => 'Teknik tradisional yang efektif untuk meredakan masuk angin dan pegal-pegal dengan peralatan higienis.',
                    'EN' => 'Effective traditional technique to relieve colds and muscle aches with hygienic equipment.'
                ],
                'img' => '/images/kerokan.JPG',
                'category' => 'Traditional',
                'durations' => [
                    ['duration' => '30 Menit', 'price' => 50000],
                ]
            ],
            [
                'id' => 'Totok Wajah',
                'title' => ['ID' => 'Totok Wajah', 'EN' => 'Face Acupressure'],
                'desc' => [
                    'ID' => 'Membantu wajah lebih segar, bercahaya (glowing), dan rileks. Solusi kecantikan tanpa macet.',
                    'EN' => 'Helps the face look fresher, glowing, and relaxed. Beauty solution without the traffic.'
                ],
                'img' => '/images/totok wajah.jpg',
                'category' => 'Beauty',
                'durations' => [
                    ['duration' => '60 Menit', 'price' => 100000],
                ]
            ],
            [
                'id' => 'Pijat Refleksi',
                'title' => ['ID' => 'Pijat Refleksi', 'EN' => 'Reflexology'],
                'desc' => [
                    'ID' => 'Melancarkan peredaran darah dan mengembalikan keseimbangan energi tubuh Anda.',
                    'EN' => 'Improves blood circulation and restores your body\'s energy balance.'
                ],
                'img' => '/images/pijat refleksi.JPG',
                'category' => 'Reflexology',
                'durations' => [
                    ['duration' => '60 Menit', 'price' => 120000],
                ]
            ],
            [
                'id' => 'Pijat Ibu Hamil',
                'title' => ['ID' => 'Pijat Ibu Hamil', 'EN' => 'Pregnancy Massage'],
                'desc' => [
                    'ID' => 'Relaksasi khusus untuk meredakan stres dan nyeri punggung selama masa kehamilan.',
                    'EN' => 'Specialized relaxation to relieve stress and back pain during pregnancy.'
                ],
                'img' => '/images/pijat ibu hamil.JPG',
                'category' => 'Pregnancy',
                'durations' => [
                    ['duration' => '90 Menit', 'price' => 165000],
                ]
            ],
        ];

        foreach ($rituals as $ritual) {
            $package = Package::create([
                'title_id' => $ritual['title']['ID'],
                'title_en' => $ritual['title']['EN'],
                'category_id' => $ritual['category'],
                'category_en' => $ritual['category'],
                'description_id' => '<p>' . $ritual['desc']['ID'] . '</p>',
                'description_en' => '<p>' . $ritual['desc']['EN'] . '</p>',
                'is_signature' => true,
                'image' => str_replace('/images/', '', $ritual['img']), // Store relative to public/images if needed, or just the filename
            ]);

            // Even if hidden in UI, we seed some durations for POS/backend consistency
            foreach ($ritual['durations'] as $duration) {
                PackageDuration::create([
                    'package_id' => $package->id,
                    'duration' => $duration['duration'],
                    'price' => $duration['price'],
                ]);
            }
        }

        // Add some regular packages (non-signature)
        $regularPackages = [
            [
                'title_id' => 'Paket Relaksasi Total',
                'title_en' => 'Total Relaxation Package',
                'category' => 'Spa',
                'description_id' => '<p>Kombinasi pijat tradisional dan lulur untuk kesegaran maksimal.</p>',
                'description_en' => '<p>Combination of traditional massage and body scrub for maximum freshness.</p>',
                'durations' => [
                    ['duration' => '120 Menit', 'price' => 250000],
                    ['duration' => '150 Menit', 'price' => 300000],
                ]
            ]
        ];

        foreach ($regularPackages as $reg) {
            $package = Package::create([
                'title_id' => $reg['title_id'],
                'title_en' => $reg['title_en'],
                'category_id' => $reg['category'],
                'category_en' => $reg['category'],
                'description_id' => $reg['description_id'],
                'description_en' => $reg['description_en'],
                'is_signature' => false,
            ]);

            foreach ($reg['durations'] as $duration) {
                PackageDuration::create([
                    'package_id' => $package->id,
                    'duration' => $duration['duration'],
                    'price' => $duration['price'],
                ]);
            }
        }
    }
}
