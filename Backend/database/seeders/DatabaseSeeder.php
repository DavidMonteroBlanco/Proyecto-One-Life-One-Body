<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'user@test.com'],
            [
                'name' => 'User',
                'password' => Hash::make('12345678'),
                'role' => 'user',
            ]
        );


        User::updateOrCreate(
    ['email' => 'dabuky@gmail.com'],
    [
        'name' => 'Admin',
        'password' => bcrypt('Dabu23'),
        'role' => 'admin'
    ]
);

    }
}
