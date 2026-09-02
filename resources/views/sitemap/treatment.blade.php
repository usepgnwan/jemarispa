<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    @foreach ($packages as $package)
        <url>
            <loc>{{ url('/treatment/' . Str::slug(strtolower($package->title_id))) }}</loc>
            <lastmod>{{ ($package->updated_at ?? $package->created_at ?? now())->tz('UTC')->toAtomString() }}</lastmod>
            <changefreq>daily</changefreq>
            <priority>0.8</priority>
        </url>
    @endforeach
</urlset>

