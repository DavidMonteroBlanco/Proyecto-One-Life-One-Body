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


Route::get('/_ping', function () {
    return response()->json(['ok' => true]);
});

Route::get('/ping', function () {
    return response()->json([
        'status' => 'ok',
        'message' => 'API funcionando'
    ]);
});


Route::post('/login', [AuthController::class, 'login']);

Route::get('/public/external/wger/exercises', [ExternalWgerController::class, 'exercises']);
Route::get('/public/external/wger/exerciseinfo/{id}', [ExternalWgerController::class, 'exerciseInfo']);

Route::get('/public/services', [ServiceController::class, 'publicIndex']);
Route::get('/public/method', [MethodStepController::class, 'publicIndex']);
Route::get('/public/collaborators', [CollaboratorController::class, 'publicIndex']);
Route::get('/public/site', [SiteSettingController::class, 'publicIndex']);


Route::middleware('auth:sanctum')->group(function () {

    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::get('/workouts', [WorkoutController::class, 'index']);
    Route::post('/workouts', [WorkoutController::class, 'store']);
    Route::put('/workouts/{workout}', [WorkoutController::class, 'update']);
    Route::delete('/workouts/{workout}', [WorkoutController::class, 'destroy']);

    Route::get('/saved-exercises', [SavedExerciseController::class, 'index']);
    Route::post('/saved-exercises', [SavedExerciseController::class, 'store']);
    Route::delete('/saved-exercises/{savedExercise}', [SavedExerciseController::class, 'destroy']);


    Route::middleware('admin')->group(function () {

        Route::get('/services', [ServiceController::class, 'index']);
        Route::post('/services', [ServiceController::class, 'store']);
        Route::put('/services/{service}', [ServiceController::class, 'update']);
        Route::delete('/services/{service}', [ServiceController::class, 'destroy']);

        Route::get('/method-steps', [MethodStepController::class, 'index']);
        Route::post('/method-steps', [MethodStepController::class, 'store']);
        Route::put('/method-steps/{methodStep}', [MethodStepController::class, 'update']);
        Route::delete('/method-steps/{methodStep}', [MethodStepController::class, 'destroy']);

        Route::get('/collaborators', [CollaboratorController::class, 'index']);
        Route::post('/collaborators', [CollaboratorController::class, 'store']);
        Route::put('/collaborators/{collaborator}', [CollaboratorController::class, 'update']);
        Route::delete('/collaborators/{collaborator}', [CollaboratorController::class, 'destroy']);

        Route::get('/site-settings', [SiteSettingController::class, 'index']);
        Route::post('/site-settings', [SiteSettingController::class, 'upsert']);
        Route::delete('/site-settings/{siteSetting}', [SiteSettingController::class, 'destroy']);

        Route::get('/admin/reports/workouts.pdf', [AdminReportController::class, 'workoutsPdf']);

        Route::post('/admin/users/{user}/workouts', [AdminUserWorkoutController::class, 'store']);

        });   
});