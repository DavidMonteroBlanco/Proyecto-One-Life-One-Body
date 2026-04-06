<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PasswordVerificationCode extends Model
{
    protected $fillable = [
        'user_id',
        'code',
        'method',
        'expires_at',
    ];

    protected function casts(): array
    {
        return [
            'expires_at' => 'datetime',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function isExpired(): bool
    {
        return $this->expires_at->isPast();
    }
}