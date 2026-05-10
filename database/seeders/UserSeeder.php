<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@jemarispa.com'],
            [
                'name' => 'Admin Utama',
                'password' => Hash::make('password'),
                'role' => 'admin',
            ]
        );

        User::updateOrCreate(
            ['email' => 'marketing@jemarispa.com'],
            [
                'name' => 'Digital Marketing',
                'password' => Hash::make('password'),
                'role' => 'marketing',
            ]
        );

        User::updateOrCreate(
            ['email' => 'cs@jemarispa.com'],
            [
                'name' => 'Customer Service',
                'password' => Hash::make('password'),
                'role' => 'cs',
            ]
        );
    }
}
