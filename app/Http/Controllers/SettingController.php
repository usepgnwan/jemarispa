<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use App\Models\ServiceArea;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SettingController extends Controller
{
    public function index()
    {
        $settings = Setting::first();
        $serviceAreas = ServiceArea::all();

        return Inertia::render('Admin/Settings/Index', [
            'settings' => $settings,
            'serviceAreas' => $serviceAreas,
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'description_id' => 'nullable|string',
            'description_en' => 'nullable|string',
            'phone' => 'nullable|string',
            'email' => 'nullable|string|email',
            'template_order' => 'nullable|string',
            'template_question' => 'nullable|string',
            'template_invoice' => 'nullable|string',
        ]);

        $setting = Setting::first();
        if ($setting) {
            $setting->update($validated);
        } else {
            Setting::create($validated);
        }

        return back()->with('message', 'Settings updated successfully');
    }

    public function storeArea(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        ServiceArea::create($validated);

        return back()->with('message', 'Service area added successfully');
    }

    public function updateArea(Request $request, ServiceArea $area)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $area->update($validated);

        return back()->with('message', 'Service area updated successfully');
    }

    public function destroyArea(ServiceArea $area)
    {
        $area->delete();

        return back()->with('message', 'Service area deleted successfully');
    }
}
