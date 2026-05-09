<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Package>
 */
class PackageFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'title_id' => $this->faker->words(3, true),
            'title_en' => $this->faker->words(3, true),
            'category_id' => $this->faker->randomElement(['Pijat', 'Bekam', 'Totok', 'Lulur']),
            'category_en' => $this->faker->randomElement(['Massage', 'Cupping', 'Acupressure', 'Scrub']),
            'description_id' => '<p>' . $this->faker->paragraph() . '</p>',
            'description_en' => '<p>' . $this->faker->paragraph() . '</p>',
        ];
    }
}
