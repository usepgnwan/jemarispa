<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\PackageDuration>
 */
class PackageDurationFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'duration' => $this->faker->randomElement(['60', '90', '120']),
            'price' => $this->faker->randomElement([100000, 125000, 150000, 175000, 200000, 225000, 250000]),
        ];
    }
}
