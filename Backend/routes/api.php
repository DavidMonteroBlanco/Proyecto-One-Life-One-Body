<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\WorkoutController;
use App\Http\Controllers\ServiceController;
use App\Http\Controllers\MethodStepController;
use App\Http\Controllers\CollaboratorController;
use App\Http\Controllers\SiteSettingController;
use App\Http\Controllers\ExternalWgerController;
use App\Http\Controllers\SavedExerciseController;
use App\Http\Controllers\AdminReportController;
use App\Http\Controllers\AdminUserWorkoutController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\WeightRecordController;
use App\Http\Controllers\ForgotPasswordController;
use App\Http\Controllers\ChatbotController;
use App\Http\Controllers\AdminWeightController;
use App\Http\Controllers\AdminDietController;
use App\Http\Controllers\UserDietController;
use App\Http\Controllers\AppointmentController;

// ══════════════════════════════════════════════════════════════════
// HEALTH CHECK
// ══════════════════════════════════════════════════════════════════
Route::get('/_ping', fn() => response()->json(['ok' => true]));
Route::get('/ping',  fn() => response()->json(['status' => 'ok']));

// ══════════════════════════════════════════════════════════════════
// AUTH PÚBLICA — Rate limit estricto: 5 intentos / 15 min
// ══════════════════════════════════════════════════════════════════
Route::middleware('throttle:auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login',    [AuthController::class, 'login']);
    Route::post('/forgot-password/request-code', [ForgotPasswordController::class, 'requestCode']);
    Route::post('/forgot-password/reset',        [ForgotPasswordController::class, 'reset']);
});

// ══════════════════════════════════════════════════════════════════
// CHATBOT — Rate limit: 20/hora
// ══════════════════════════════════════════════════════════════════
Route::middleware('throttle:chatbot')->group(function () {
    Route::post('/chatbot', [ChatbotController::class, 'chat']);
});

// ══════════════════════════════════════════════════════════════════
// RUTAS PÚBLICAS DE LECTURA
// ══════════════════════════════════════════════════════════════════
Route::get('/public/external/wger/exercises',          [ExternalWgerController::class, 'exercises']);
Route::get('/public/external/wger/exerciseinfo/{id}',  [ExternalWgerController::class, 'exerciseInfo']);
Route::get('/public/services',      [ServiceController::class,    'publicIndex']);
Route::get('/public/method',        [MethodStepController::class, 'publicIndex']);
Route::get('/public/collaborators', [CollaboratorController::class, 'publicIndex']);
Route::get('/public/site',          [SiteSettingController::class, 'publicIndex']);

// ══════════════════════════════════════════════════════════════════
// RUTAS PRIVADAS — Requieren token Sanctum
// ══════════════════════════════════════════════════════════════════
Route::middleware('auth:sanctum')->group(function () {

    Route::get('/me',      [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // Perfil del usuario
    Route::middleware('throttle:sensitive')->group(function () {
        Route::put('/me/profile',                [ProfileController::class, 'updateProfile']);
        Route::post('/me/password/request-code', [ProfileController::class, 'requestPasswordCode']);
        Route::post('/me/password/change',       [ProfileController::class, 'changePassword']);
    });

    // Seguimiento de peso (usuario solo VER)
    Route::get('/weight-records',       [WeightRecordController::class, 'index']);
    Route::get('/weight-records/stats', [WeightRecordController::class, 'stats']);

    // Dieta del usuario (solo VER)
    Route::get('/my-diet', [UserDietController::class, 'myDiet']);

    // Reservas de pesaje
    Route::get('/my-appointments',                      [AppointmentController::class, 'myAppointments']);
    Route::get('/appointments/slots',                   [AppointmentController::class, 'availableSlots']);
    Route::post('/appointments/book',                   [AppointmentController::class, 'book']);
    Route::patch('/appointments/{appointment}/cancel',  [AppointmentController::class, 'cancel']);

    // Workouts
    Route::get('/workouts',              [WorkoutController::class, 'index']);
    Route::post('/workouts',             [WorkoutController::class, 'store']);
    Route::put('/workouts/{workout}',    [WorkoutController::class, 'update']);
    Route::delete('/workouts/{workout}', [WorkoutController::class, 'destroy']);

    // Ejercicios guardados
    Route::get('/saved-exercises',                    [SavedExerciseController::class, 'index']);
    Route::post('/saved-exercises',                   [SavedExerciseController::class, 'store']);
    Route::delete('/saved-exercises/{savedExercise}', [SavedExerciseController::class, 'destroy']);

    // ══════════════════════════════════════════════════════════
    // ADMIN
    // ══════════════════════════════════════════════════════════
    Route::middleware(['admin', 'throttle:sensitive'])->group(function () {

        Route::apiResource('services',      ServiceController::class)->except(['show']);
        Route::apiResource('method-steps',  MethodStepController::class)->except(['show']);
        Route::apiResource('collaborators', CollaboratorController::class)->except(['show']);

        Route::get('/site-settings',                  [SiteSettingController::class, 'index']);
        Route::post('/site-settings',                 [SiteSettingController::class, 'upsert']);
        Route::delete('/site-settings/{siteSetting}', [SiteSettingController::class, 'destroy']);

        Route::get('/admin/reports/workouts.pdf',   [AdminReportController::class, 'workoutsPdf']);
        Route::post('/admin/users/{user}/workouts', [AdminUserWorkoutController::class, 'store']);

        // Gestión de usuarios y pesajes
        Route::get('/admin/users',                             [AdminWeightController::class, 'users']);
        Route::get('/admin/users/{user}/weight-records',       [AdminWeightController::class, 'records']);
        Route::get('/admin/users/{user}/weight-records/stats', [AdminWeightController::class, 'stats']);
        Route::post('/admin/users/{user}/weight-records',      [AdminWeightController::class, 'store']);
        Route::put('/admin/weight-records/{weightRecord}',     [AdminWeightController::class, 'update']);
        Route::delete('/admin/weight-records/{weightRecord}',  [AdminWeightController::class, 'destroy']);
        Route::get('/admin/users/{user}/weight-records/pdf',   [AdminWeightController::class, 'exportPdf']);

        // Gestión de dietas
        Route::get('/admin/diet/users',                     [AdminDietController::class, 'users']);
        Route::get('/admin/diet/users/{user}',              [AdminDietController::class, 'index']);
        Route::post('/admin/diet/users/{user}',             [AdminDietController::class, 'storePlan']);
        Route::put('/admin/diet/plans/{dietPlan}',          [AdminDietController::class, 'updatePlan']);
        Route::delete('/admin/diet/plans/{dietPlan}',       [AdminDietController::class, 'destroyPlan']);
        Route::patch('/admin/diet/plans/{dietPlan}/toggle', [AdminDietController::class, 'toggleActive']);

        // Gestión de reservas
        Route::get('/admin/appointments',                        [AppointmentController::class, 'adminIndex']);
        Route::patch('/admin/appointments/{appointment}/status', [AppointmentController::class, 'adminUpdateStatus']);
    });
});

// ══════════════════════════════════════════════════════════════════
// PDF EXPORT — Fuera del middleware auth (se abre en nueva pestaña)
// ══════════════════════════════════════════════════════════════════
Route::get('/admin/users/{user}/weight-records/pdf', [AdminWeightController::class, 'exportPdf']);