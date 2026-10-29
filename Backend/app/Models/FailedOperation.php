<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Una operación que no salió bien y que el sistema va a reintentar.
 * Si agota los reintentos, se queda aquí para que David la vea.
 */
class FailedOperation extends Model
{
    protected $fillable = [
        'operation', 'summary', 'payload', 'last_error',
        'attempts', 'next_attempt_at', 'resolved_at',
        'user_id', 'triggered_by',
    ];

    protected function casts(): array
    {
        return [
            'payload'         => 'array',
            'attempts'        => 'integer',
            'next_attempt_at' => 'datetime',
            'resolved_at'     => 'datetime',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /** Pendientes: ni resueltas ni agotadas */
    public function scopePending($query)
    {
        return $query->whereNull('resolved_at')->whereNotNull('next_attempt_at');
    }

    /** Agotadas: ya no se reintentan solas, necesitan a una persona */
    public function scopeExhausted($query)
    {
        return $query->whereNull('resolved_at')->whereNull('next_attempt_at');
    }

    public function getAgotadaAttribute(): bool
    {
        return $this->resolved_at === null && $this->next_attempt_at === null;
    }
}
