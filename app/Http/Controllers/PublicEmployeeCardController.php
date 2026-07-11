<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PublicEmployeeCardController extends Controller
{
    public function show($nip)
    {
        $employee = Employee::with(['skills', 'certifications', 'serviceAreas'])
            ->where('nip', $nip)
            ->orWhere('id', $nip)
            ->firstOrFail();

        return Inertia::render('Public/EmployeeCard', [
            'employee' => $employee,
        ])->withViewData([
            'meta' => [
                'title' => 'Kartu Identitas Staf - ' . $employee->name . ' | Jemari Home Spa',
                'description' => 'Verifikasi resmi identitas dan keahlian staf terapis Jemari Home Spa: ' . $employee->name . ' (' . ($employee->title ?? 'Terapis Spa') . ').'
            ]
        ]);
    }
}
