<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

class ExternalWgerController extends Controller
{
    private function stripHtml(?string $html): string
    {
        $html = (string) $html;
        $text = preg_replace('/<[^>]+>/', ' ', $html);
        $text = preg_replace('/\s+/', ' ', (string) $text);
        return trim((string) $text);
    }

   
    private function pickBestDescription(array $item): string
    {
        $direct = $this->stripHtml($item['description'] ?? '');
        if ($direct !== '') return $direct;

        
        $candidateTexts = [];

        if (!empty($item['translations']) && is_array($item['translations'])) {
            foreach ($item['translations'] as $t) {
                if (is_array($t)) {
                    $candidateTexts[] = $this->stripHtml($t['description'] ?? '');
                }
            }
        }

        if (!empty($item['exercise']) && is_array($item['exercise'])) {
            $candidateTexts[] = $this->stripHtml($item['exercise']['description'] ?? '');
        }

        foreach ($candidateTexts as $c) {
            if ($c !== '') return $c;
        }

       
        $parts = [];

        $name = trim((string)($item['name'] ?? ''));
        if ($name !== '') $parts[] = "Ejercicio: {$name}.";

        if (!empty($item['category'])) {
            if (is_array($item['category']) && !empty($item['category']['name'])) {
                $parts[] = "Categoría: " . $item['category']['name'] . ".";
            } else {
                $parts[] = "Categoría: entrenamiento general.";
            }
        }

        if (!empty($item['muscles']) && is_array($item['muscles'])) {
            $muscleNames = [];
            foreach ($item['muscles'] as $m) {
                if (is_array($m) && !empty($m['name'])) $muscleNames[] = $m['name'];
            }
            if (!empty($muscleNames)) {
                $parts[] = "Músculos: " . implode(', ', array_slice($muscleNames, 0, 4)) . ".";
            }
        }

        if (!empty($item['equipment']) && is_array($item['equipment'])) {
            $eq = [];
            foreach ($item['equipment'] as $e) {
                if (is_array($e) && !empty($e['name'])) $eq[] = $e['name'];
            }
            if (!empty($eq)) {
                $parts[] = "Material: " . implode(', ', array_slice($eq, 0, 3)) . ".";
            }
        }

        $fallback = trim(implode(' ', $parts));
        if ($fallback !== '') return $fallback;

        return "Descripción no disponible en la fuente externa.";
    }

    // Extrae el nombre localizado: español (lang 4) > inglés (lang 2) > campo name
    private function pickName(array $item): string
    {
        $spanish = null;
        $english = null;
        foreach (($item['translations'] ?? []) as $t) {
            $lang = (int)($t['language'] ?? 0);
            $n    = trim((string)($t['name'] ?? ''));
            if ($n === '') continue;
            if ($lang === 4) { $spanish = $n; break; }
            if ($lang === 2) $english = $n;
        }
        return $spanish ?? $english ?? trim((string)($item['name'] ?? '')) ?: ('Ejercicio #' . ($item['id'] ?? '?'));
    }

    // Extrae la descripción: español (lang 4) > lógica anterior
    private function pickDescriptionLocalized(array $item): string
    {
        foreach (($item['translations'] ?? []) as $t) {
            if ((int)($t['language'] ?? 0) === 4) {
                $d = $this->stripHtml($t['description'] ?? '');
                if ($d !== '') return $d;
            }
        }
        return $this->pickBestDescription($item);
    }

    private function pickImage(array $item): ?string
    {
        if (!empty($item['images']) && is_array($item['images'])) {
            foreach ($item['images'] as $img) {
                if (is_array($img) && !empty($img['image'])) {
                    return (string) $img['image'];
                }
            }
        }
        return null;
    }

    // Fetch images from wger exerciseimage endpoint (separate from exerciseinfo)
    private function fetchWgerImages(int $exerciseBaseId): array
    {
        $cacheKey = "wger_exerciseimage_" . $exerciseBaseId;
        return Cache::remember($cacheKey, 60 * 60 * 24, function () use ($exerciseBaseId) {
            $res = Http::timeout(6)->acceptJson()->get("https://wger.de/api/v2/exerciseimage/", [
                "format"        => "json",
                "exercise_base" => $exerciseBaseId,
                "limit"         => 4,
            ]);
            if (!$res->ok()) return [];
            $imgs = [];
            foreach (($res->json()["results"] ?? []) as $img) {
                if (!empty($img["image"])) $imgs[] = (string) $img["image"];
            }
            return $imgs;
        });
    }

    // Fetch a thumbnail from Wikipedia (free, no API key)
    private function fetchWikipediaImage(string $englishName): ?string
    {
        if ($englishName === '') return null;
        $cacheKey = "wiki_img_" . md5($englishName);
        return Cache::remember($cacheKey, 60 * 60 * 24 * 7, function () use ($englishName) {
            $res = Http::timeout(5)->acceptJson()->get("https://en.wikipedia.org/w/api.php", [
                "action"     => "query",
                "prop"       => "pageimages",
                "pithumbsize"=> 400,
                "format"     => "json",
                "generator"  => "search",
                "gsrsearch"  => $englishName . " exercise",
                "gsrlimit"   => 1,
            ]);
            if (!$res->ok()) return null;
            $pages = $res->json()["query"]["pages"] ?? [];
            foreach ($pages as $page) {
                $src = $page["thumbnail"]["source"] ?? null;
                if ($src) return (string) $src;
            }
            return null;
        });
    }

    // Get the English name from translations (for Wikipedia queries)
    private function pickEnglishName(array $item): string
    {
        foreach (($item['translations'] ?? []) as $t) {
            if ((int)($t['language'] ?? 0) === 2) {
                $n = trim((string)($t['name'] ?? ''));
                if ($n !== '') return $n;
            }
        }
        return trim((string)($item['name'] ?? ''));
    }

    public function exercises(Request $request)
    {
        $request->validate([
            "search"   => ["nullable", "string", "max:40"],
            "limit"    => ["nullable", "integer", "min:1", "max:50"],
            "category" => ["nullable", "integer"],
        ]);

        $search   = trim((string) $request->query("search", ""));
        $limit    = (int) $request->query("limit", 20);
        $category = $request->query("category");
        $category = $category !== null ? (int) $category : null;

        $cacheKey = "wger_exerciseinfo_list_v2_" . md5($search . "_" . $limit . "_" . ($category ?? "all"));

        $data = Cache::remember($cacheKey, 60 * 10, function () use ($search, $limit, $category) {
            $params = ["limit" => $limit, "format" => "json"];
            if ($search !== "")  $params["search"]   = $search;
            if ($category)       $params["category"] = $category;

            $res = Http::timeout(8)->acceptJson()->get("https://wger.de/api/v2/exerciseinfo/", $params);

            if (!$res->ok()) {
                return ["count" => 0, "results" => [], "error" => "wger_" . $res->status()];
            }
            return $res->json();
        });

        $results = array_map(function ($x) {
            $images = [];
            foreach (($x["images"] ?? []) as $img) {
                if (!empty($img["image"])) $images[] = (string) $img["image"];
            }

            // Fallback 1: wger exerciseimage endpoint
            if (empty($images) && !empty($x["id"])) {
                $images = $this->fetchWgerImages((int) $x["id"]);
            }

            // Fallback 2: Wikipedia thumbnail
            if (empty($images)) {
                $engName = $this->pickEnglishName($x);
                if ($engName !== '') {
                    $wikiImg = $this->fetchWikipediaImage($engName);
                    if ($wikiImg) $images = [$wikiImg];
                }
            }

            $muscles = [];
            foreach (($x["muscles"] ?? []) as $m) {
                if (!empty($m["name_en"])) $muscles[] = $m["name_en"];
                elseif (!empty($m["name"])) $muscles[] = $m["name"];
            }

            return [
                "id"       => $x["id"] ?? null,
                "name"     => $this->pickName($x),
                "category" => $x["category"]["name"] ?? null,
                "muscles"  => array_values(array_unique($muscles)),
                "images"   => $images,
            ];
        }, $data["results"] ?? []);

        return response()->json([
            "count"   => $data["count"] ?? 0,
            "results" => $results,
        ]);
    }


    
    public function exerciseInfo(int $id)
    {
        $cacheKey = "wger_exerciseinfo_" . $id;

        $data = Cache::remember($cacheKey, 60 * 60, function () use ($id) {
            $url = "https://wger.de/api/v2/exerciseinfo/" . $id . "/";

            $res = Http::timeout(10)->acceptJson()->get($url);

            if (!$res->ok()) {
                return ["error" => "wger_error_" . $res->status()];
            }

            return $res->json();
        });

        if (!is_array($data) || isset($data["error"])) {
            return response()->json($data, 404);
        }

        $images = [];
        foreach (($data["images"] ?? []) as $img) {
            if (!empty($img["image"])) $images[] = (string) $img["image"];
        }

        // Fallback 1: wger exerciseimage endpoint
        if (empty($images)) {
            $images = $this->fetchWgerImages($id);
        }

        // Fallback 2: Wikipedia thumbnail
        if (empty($images)) {
            $engName = $this->pickEnglishName($data);
            if ($engName !== '') {
                $wikiImg = $this->fetchWikipediaImage($engName);
                if ($wikiImg) $images = [$wikiImg];
            }
        }

        $muscles = [];
        foreach (($data["muscles"] ?? []) as $m) {
            if (!empty($m["name_en"])) $muscles[] = $m["name_en"];
            elseif (!empty($m["name"])) $muscles[] = $m["name"];
        }

        $equipment = [];
        foreach (($data["equipment"] ?? []) as $e) {
            if (!empty($e["name"])) $equipment[] = $e["name"];
        }

        return response()->json([
            "id"          => $data["id"] ?? $id,
            "name"        => $this->pickName($data),
            "description" => $this->pickDescriptionLocalized($data),
            "category"    => $data["category"]["name"] ?? null,
            "muscles"     => array_values(array_unique($muscles)),
            "equipment"   => array_values(array_unique($equipment)),
            "images"      => $images,
        ]);
    }
}
