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

        $packages = [
            [
                'id' => [
                    'title' => 'Body Massage',
                    'category' => 'Massage',
                    'description' => 'Relaksasi tubuh menyeluruh dengan teknik pijat tradisional yang menenangkan.',
                ],
                'en' => [
                    'title' => 'Body Massage',
                    'category' => 'Massage',
                    'description' => 'Full body relaxation with soothing traditional massage techniques.',
                ],
                'durations' => [
                    ['duration' => '90 Menit', 'price' => 140000],
                    ['duration' => '120 Menit', 'price' => 180000],
                    ['duration' => '150 Menit', 'price' => 220000],
                ]
            ],
            [
                'id' => [
                    'title' => 'Body Massage & Refleksi',
                    'category' => 'Massage & Reflexology',
                    'description' => 'Kombinasi pijat tubuh dan pijat refleksi kaki untuk sirkulasi darah yang lebih baik.',
                ],
                'en' => [
                    'title' => 'Body Massage & Reflexology',
                    'category' => 'Massage & Reflexology',
                    'description' => 'Combination of body massage and foot reflexology for better blood circulation.',
                ],
                'durations' => [
                    ['duration' => '90 Menit', 'price' => 160000],
                    ['duration' => '120 Menit', 'price' => 200000],
                    ['duration' => '150 Menit', 'price' => 240000],
                ]
            ],
            [
                'id' => [
                    'title' => 'Body Massage & Totok Wajah',
                    'category' => 'Massage & Face Acupressure',
                    'description' => 'Segarkan tubuh dan wajah dengan kombinasi pijat tubuh dan totok wajah.',
                ],
                'en' => [
                    'title' => 'Body Massage & Face Acupressure',
                    'category' => 'Massage & Face Acupressure',
                    'description' => 'Refresh your body and face with a combination of body massage and face acupressure.',
                ],
                'durations' => [
                    ['duration' => '90 Menit', 'price' => 160000],
                    ['duration' => '120 Menit', 'price' => 200000],
                    ['duration' => '150 Menit', 'price' => 240000],
                ]
            ],
            [
                'id' => [
                    'title' => 'Body Massage & Scrub',
                    'category' => 'Massage & Scrub',
                    'description' => 'Angkat sel kulit mati dan relaksasi otot dengan pijat dan scrub tubuh.',
                ],
                'en' => [
                    'title' => 'Body Massage & Body Scrub',
                    'category' => 'Massage & Body Scrub',
                    'description' => 'Remove dead skin cells and relax muscles with body massage and scrub.',
                ],
                'durations' => [
                    ['duration' => '90 Menit', 'price' => 160000],
                    ['duration' => '120 Menit', 'price' => 200000],
                    ['duration' => '150 Menit', 'price' => 240000],
                ]
            ],
            [
                'id' => [
                    'title' => 'Body Massage & Kerokan',
                    'category' => 'Massage & Scraping',
                    'description' => 'Solusi tradisional untuk masuk angin dan kelelahan otot.',
                ],
                'en' => [
                    'title' => 'Body Massage & Scraping Therapy',
                    'category' => 'Massage & Scraping',
                    'description' => 'Traditional solution for common cold and muscle fatigue.',
                ],
                'durations' => [
                    ['duration' => '90 Menit', 'price' => 150000],
                    ['duration' => '120 Menit', 'price' => 190000],
                ]
            ],
            [
                'id' => [
                    'title' => 'Kerokan (Khusus Tambahan)',
                    'category' => 'Add-on',
                    'description' => 'Tambahan layanan kerokan untuk melengkapi treatment utama Anda.',
                ],
                'en' => [
                    'title' => 'Scraping (Additional Only)',
                    'category' => 'Add-on',
                    'description' => 'Additional scraping therapy to complement your main treatment.',
                ],
                'durations' => [
                    ['duration' => '30 Menit', 'price' => 50000],
                ]
            ],
            [
                'id' => [
                    'title' => '(Paket 3 Treatment) Body Massage, Refleksi & Scrub',
                    'category' => 'Combo Package',
                    'description' => 'Paket lengkap relaksasi, sirkulasi, dan kecantikan kulit.',
                ],
                'en' => [
                    'title' => '(3 Treatments) Body Massage, Reflexology & Scrub',
                    'category' => 'Combo Package',
                    'description' => 'Complete package for relaxation, circulation, and skin beauty.',
                ],
                'durations' => [
                    ['duration' => '120 Menit', 'price' => 225000],
                    ['duration' => '150 Menit', 'price' => 255000],
                ]
            ],
            [
                'id' => [
                    'title' => '(Paket 3 Treatment) Body Massage, Refleksi & Totok Wajah',
                    'category' => 'Combo Package',
                    'description' => 'Paket lengkap untuk kebugaran tubuh dan kesegaran wajah.',
                ],
                'en' => [
                    'title' => '(3 Treatments) Body Massage, Reflexology & Face Acupressure',
                    'category' => 'Combo Package',
                    'description' => 'Complete package for body fitness and facial freshness.',
                ],
                'durations' => [
                    ['duration' => '120 Menit', 'price' => 225000],
                    ['duration' => '150 Menit', 'price' => 255000],
                ]
            ],
            [
                'id' => [
                    'title' => '(Paket 3 Treatment) Body Massage, Scrub & Totok Wajah',
                    'category' => 'Combo Package',
                    'description' => 'Kombinasi sempurna untuk relaksasi dan perawatan kecantikan luar dalam.',
                ],
                'en' => [
                    'title' => '(3 Treatments) Body Massage, Body Scrub & Face Acupressure',
                    'category' => 'Combo Package',
                    'description' => 'Perfect combination for relaxation and inner-outer beauty care.',
                ],
                'durations' => [
                    ['duration' => '120 Menit', 'price' => 225000],
                    ['duration' => '150 Menit', 'price' => 255000],
                ]
            ],
            [
                'id' => [
                    'title' => '(Paket Full Treatment) Body Massage, Refleksi, Totok Wajah, & Scrub',
                    'category' => 'Full Paket',
                    'description' => 'Pengalaman spa termewah untuk pemulihan total tubuh dan pikiran.',
                ],
                'en' => [
                    'title' => '(Full Paket) Body Massage, Reflexology, Face Acupressure & Scrub',
                    'category' => 'Full Paket',
                    'description' => 'The ultimate spa experience for total body and mind recovery.',
                ],
                'durations' => [
                    ['duration' => '150 Menit', 'price' => 265000],
                    ['duration' => '180 Menit', 'price' => 315000],
                ]
            ],
            [
                'id' => [
                    'title' => 'Body Massage + Bekam',
                    'category' => 'Massage & Cupping',
                    'description' => 'Detoksifikasi maksimal dengan kombinasi pijat dan bekam medik.',
                ],
                'en' => [
                    'title' => 'Body Massage + Cupping Therapy',
                    'category' => 'Massage & Cupping',
                    'description' => 'Maximum detoxification with a combination of massage and medical cupping.',
                ],
                'durations' => [
                    ['duration' => '60 Menit', 'price' => 250000],
                    ['duration' => '90 Menit', 'price' => 285000],
                    ['duration' => '120 Menit', 'price' => 315000],
                ]
            ],
            [
                'id' => [
                    'title' => 'Bekam Basah Only',
                    'category' => 'Cupping Therapy',
                    'description' => 'Terapi bekam medik untuk mengeluarkan toksin dan meningkatkan imunitas.',
                ],
                'en' => [
                    'title' => 'Medical Wet Cupping Only',
                    'category' => 'Cupping Therapy',
                    'description' => 'Medical wet cupping therapy to remove toxins and boost immunity.',
                ],
                'durations' => [
                    ['duration' => '60 Menit', 'price' => 160000],
                ]
            ],
            [
                'id' => [
                    'title' => 'Massage Ibu Hamil',
                    'category' => 'Pregnancy Massage',
                    'description' => 'Pijat khusus yang aman dan nyaman untuk ibu hamil, membantu meredakan pegal.',
                ],
                'en' => [
                    'title' => 'Prenatal Massage',
                    'category' => 'Pregnancy Massage',
                    'description' => 'Special massage that is safe and comfortable for pregnant women, helping to relieve aches.',
                ],
                'durations' => [
                    ['duration' => '90 Menit', 'price' => 165000],
                ]
            ],
            [
                'id' => [
                    'title' => 'Massage Ibu Hamil & Totok Wajah',
                    'category' => 'Pregnancy Paket',
                    'description' => 'Relaksasi tubuh dan kesegaran wajah khusus untuk calon ibu.',
                ],
                'en' => [
                    'title' => 'Prenatal Massage & Face Acupressure',
                    'category' => 'Pregnancy Paket',
                    'description' => 'Body relaxation and facial freshness specially for mothers-to-be.',
                ],
                'durations' => [
                    ['duration' => '90 Menit', 'price' => 190000],
                ]
            ],
            [
                'id' => [
                    'title' => 'Massage Ibu Hamil & Scrub',
                    'category' => 'Pregnancy Paket',
                    'description' => 'Perawatan tubuh lengkap yang aman untuk mencerahkan kulit saat masa kehamilan.',
                ],
                'en' => [
                    'title' => 'Prenatal Massage & Body Scrub',
                    'category' => 'Pregnancy Paket',
                    'description' => 'Complete body treatment that is safe for brightening skin during pregnancy.',
                ],
                'durations' => [
                    ['duration' => '90 Menit', 'price' => 190000],
                ]
            ],
        ];

        foreach ($packages as $pkgData) {
            $package = Package::create([
                'title_id' => $pkgData['id']['title'],
                'title_en' => $pkgData['en']['title'],
                'category_id' => $pkgData['id']['category'],
                'category_en' => $pkgData['en']['category'],
                'description_id' => '<p>' . $pkgData['id']['description'] . '</p>',
                'description_en' => '<p>' . $pkgData['en']['description'] . '</p>',
            ]);

            foreach ($pkgData['durations'] as $duration) {
                PackageDuration::create([
                    'package_id' => $package->id,
                    'duration' => $duration['duration'],
                    'price' => $duration['price'],
                ]);
            }
        }
    }
}
