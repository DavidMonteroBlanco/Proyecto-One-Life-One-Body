<?php

namespace App\Http\Controllers;

use App\Models\MethodStep;
use Illuminate\Http\Request;

class MethodStepController extends Controller
{
    public function index()
    {
        return MethodStep::orderBy('sort_order')->orderBy('id')->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:120'],
            'description' => ['nullable', 'string'],
            'sort_order' => ['nullable', 'integer', 'min:0', 'max:9999'],
        ]);

        $item = MethodStep::create($data);

        return response()->json($item, 201);
    }

    public function update(Request $request, MethodStep $methodStep)
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:120'],
            'description' => ['nullable', 'string'],
            'sort_order' => ['nullable', 'integer', 'min:0', 'max:9999'],
        ]);

        $methodStep->update($data);

        return response()->json($methodStep);
    }

    public function destroy(MethodStep $methodStep)
    {
        $methodStep->delete();
        return response()->json(['message' => 'Eliminado']);
    }

    public function publicIndex()
    {
        return MethodStep::orderBy('sort_order')->orderBy('id')->get();
    }
}
