<?php

namespace App\Http\Controllers;

use App\Models\Collaborator;
use Illuminate\Http\Request;

class CollaboratorController extends Controller
{
    public function index()
    {
        return Collaborator::orderBy('sort_order')->orderBy('id')->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'role' => ['nullable', 'string', 'max:120'],
            'bio' => ['nullable', 'string', 'max:20000'],
            'image_url' => ['nullable', 'string', 'max:255'],
            'sort_order' => ['nullable', 'integer', 'min:0', 'max:9999'],
        ]);
      
        $item = Collaborator::create($data);
        
        $bio = $request->input('bio');
    if ($bio === null || trim((string)$bio) === '') {
     $bio = $request->input('description'); 
    }   

    $item->bio = $bio;
        return response()->json($item, 201);
        
    }

    public function update(Request $request, Collaborator $collaborator)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'role' => ['nullable', 'string', 'max:120'],
            'bio' => ['nullable', 'string', 'max:20000'],
            'image_url' => ['nullable', 'string', 'max:255'],
            'sort_order' => ['nullable', 'integer', 'min:0', 'max:9999'],
        ]);

        $collaborator->update($data);

        $data = $request->only(['name','title','bio','image_url','sort_order']);
        if (empty($data['bio'])) {
        $data['bio'] = $request->input('description');
        }
        $collaborator->update($data);

        return response()->json($collaborator);
    }

    public function destroy(Collaborator $collaborator)
    {
        $collaborator->delete();
        return response()->json(['message' => 'Eliminado']);
    }

    public function publicIndex()
    {
        return Collaborator::orderBy('sort_order')->orderBy('id')->get();
    }
    
}
