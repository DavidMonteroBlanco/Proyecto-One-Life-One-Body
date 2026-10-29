<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Aviso dentro de la web. Complementa al email: si el correo se pierde
 * o acaba en spam, el cliente lo ve igualmente al entrar.
 */
class Notification extends Model
{
    protected $fillable = [
        'user_id', 'type', 'title', 'body', 'link', 'read_at',
    ];

    protected function casts(): array
    {
        return ['read_at' => 'datetime'];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function scopeUnread($query)
    {
        return $query->whereNull('read_at');
    }
}
