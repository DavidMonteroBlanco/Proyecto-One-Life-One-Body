<?php

namespace App\Http\Controllers;

use App\Models\SiteSetting;
use Illuminate\Http\Request;

class SiteSettingController extends Controller
{
    public function index()
    {
        return SiteSetting::orderBy('key')->get();
    }

    public function upsert(Request $request)
    {
        $data = $request->validate([
            'key' => ['required', 'string', 'max:120'],
            'value' => ['nullable', 'string'],
        ]);

        $item = SiteSetting::updateOrCreate(
            ['key' => $data['key']],
            ['value' => $data['value']]
        );

        return response()->json($item);
    }

    public function destroy(SiteSetting $siteSetting)
    {
        $siteSetting->delete();
        return response()->json(['message' => 'Eliminado']);
    }

    public function publicIndex()
    {
        return SiteSetting::orderBy('key')->get();
    }
}
