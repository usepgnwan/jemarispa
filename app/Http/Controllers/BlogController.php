<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Blog;
use Inertia\Inertia;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;

use Intervention\Image\Encoders\JpegEncoder;

class BlogController extends Controller
{
    public function index(Request $request)
    {
        $limit = $request->input('limit', 10);
        $search = $request->input('search');

        $blogs = Blog::query()
            ->with('user')
            ->when($search, function ($query, $search) {
                $query->where('title', 'ilike', "%{$search}%")
                      ->orWhere('tag', 'ilike', "%{$search}%")
                      ->orWhere('type_package', 'ilike', "%{$search}%");
            })
            ->latest()
            ->paginate($limit)
            ->withQueryString();

        return Inertia::render('Admin/Blog/Index', [
            'blogs' => $blogs,
            'filters' => $request->only(['search', 'limit']),
        ]);
    }

    public function publicIndex(Request $request)
    {
        $search = $request->input('search');

        $blogs = Blog::query()
            ->with('user')
            ->when($search, function ($query, $search) {
                $query->where('title', 'ilike', "%{$search}%")
                      ->orWhere('tag', 'ilike', "%{$search}%")
                      ->orWhere('type_package', 'ilike', "%{$search}%");
            })
            ->latest()
            ->paginate(9)
            ->withQueryString();

        return Inertia::render('Blog/Index', [
            'blogs' => $blogs,
            'filters' => $request->only(['search', 'tag']),
            'signaturePackages' => \App\Models\Package::where('is_signature', true)->orderByRaw('priority ASC NULLS LAST')->orderBy('id', 'desc')->get()
        ])->withViewData([
            'meta' => [
                'title' => 'Blog & Artikel Kesehatan - Jemari Home Spa',
                'description' => 'Temukan artikel menarik seputar kesehatan, manfaat pijat, dan tips gaya hidup sehat dari Jemari Spa.',
                'static_content' => '<h1>Blog Kesehatan Jemari Home Spa</h1><p>Kumpulan artikel dan tips kesehatan, manfaat pijat tradisional, dan panduan relaksasi dari Jemari Home Spa.</p>'
            ]
        ]);
    }

    public function publicShow($slug)
    {
        $blog = Blog::where('slug', $slug)->with('user')->firstOrFail();
        
        $suggestions = Blog::where('id', '!=', $blog->id)
            ->latest()
            ->limit(3)
            ->get();

        return Inertia::render('Blog/Show', [
            'blog' => $blog,
            'suggestions' => $suggestions,
            'signaturePackages' => \App\Models\Package::where('is_signature', true)->orderByRaw('priority ASC NULLS LAST')->orderBy('id', 'desc')->get()
        ])->withViewData([
            'meta' => [
                'title' => $blog->title . ' - Jemari Home Spa',
                'description' => Str::limit(strip_tags($blog->description), 150),
                'static_content' => '<h1>' . $blog->title . '</h1><div>' . $blog->description . '</div>'
            ]
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Blog/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'slug' => 'required|string|unique:blogs,slug|max:255',
            'description' => 'required|string',
            'tag' => 'nullable|string',
            'type_package' => 'nullable|string|max:255',
            'thumbnail' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:5120', // Max 5MB
        ]);

        $validated['user_id'] = $request->user()->id;

        if ($request->hasFile('thumbnail')) {
            $validated['thumbnail'] = $this->compressAndSaveImage($request->file('thumbnail'));
        }

        Blog::create($validated);

        return redirect()->route('admin.blog.index')->with('message', 'Blog berhasil ditambahkan!');
    }

    public function edit(Blog $blog)
    {
        return Inertia::render('Admin/Blog/Edit', [
            'blog' => $blog
        ]);
    }

    public function update(Request $request, Blog $blog)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:blogs,slug,' . $blog->id,
            'description' => 'required|string',
            'tag' => 'nullable|string',
            'type_package' => 'nullable|string|max:255',
            'thumbnail' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:5120',
        ]);

        if ($request->hasFile('thumbnail')) {
            if ($blog->thumbnail && Storage::disk('public')->exists($blog->thumbnail)) {
                Storage::disk('public')->delete($blog->thumbnail);
            }
            $validated['thumbnail'] = $this->compressAndSaveImage($request->file('thumbnail'));
        } else {
            // Keep the existing thumbnail if no new file was uploaded
            unset($validated['thumbnail']);
        }

        $blog->update($validated);

        return redirect()->route('admin.blog.index')->with('message', 'Blog berhasil diperbarui!');
    }

    public function destroy(Blog $blog)
    {
        if ($blog->thumbnail && Storage::disk('public')->exists($blog->thumbnail)) {
            Storage::disk('public')->delete($blog->thumbnail);
        }
        
        $blog->delete();

        return redirect()->route('admin.blog.index')->with('message', 'Blog berhasil dihapus!');
    }

    private function compressAndSaveImage($file)
    {
        $filename = time().'_'.$file->getClientOriginalName();

        $manager = new ImageManager(new Driver());

        // Use JpegEncoder for Intervention Image v4
        $image = $manager->decode($file)->encode(new JpegEncoder(90));
        
        Storage::disk('public')->put("blogs/$filename", $image);
        
        return "blogs/".$filename;
    }
}
