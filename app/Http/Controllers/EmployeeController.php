<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\Skill;
use App\Models\Certification;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class EmployeeController extends Controller
{
    public function index(Request $request)
    {
        $query = Employee::with(['user', 'skills', 'certifications']);

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'ilike', "%{$search}%")
                  ->orWhere('fullname', 'ilike', "%{$search}%")
                  ->orWhere('nip', 'ilike', "%{$search}%")
                  ->orWhere('title', 'ilike', "%{$search}%")
                  ->orWhere('nohp', 'ilike', "%{$search}%");
            });
        }

        $employees = $query->latest()->paginate(10)->withQueryString();

        return Inertia::render('Admin/Employee/Index', [
            'employees' => $employees,
            'filters' => $request->only('search')
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Employee/Create', [
            'skills' => Skill::orderBy('name')->get(),
            'certifications' => Certification::orderBy('name')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nip' => 'nullable|string|max:50|unique:employees,nip',
            'name' => 'required|string|max:255',
            'fullname' => 'nullable|string|max:255',
            'nohp' => 'required|string|max:20',
            'title' => 'required|string|max:255',
            'work_area' => 'nullable|string|max:255',
            'status' => 'required|in:aktif,tidak_aktif',
            'join_date' => 'nullable|date',
            'email' => 'required|email|max:255|unique:users,email',
            'is_active' => 'boolean',
            'photo' => 'nullable|image|max:5120',
            'skills' => 'nullable|array',
            'skills.*' => 'exists:skills,id',
            'certifications' => 'nullable|array',
            'certifications.*.certification_id' => 'nullable|exists:certifications,id',
            'certifications.*.certificate_number' => 'nullable|string|max:255',
            'certifications.*.valid_until' => 'nullable|date',
            'certifications.*.file' => 'nullable|file|mimes:jpg,jpeg,png,webp,pdf|max:5120',
        ]);

        $photoPath = null;
        if ($request->hasFile('photo')) {
            $photoPath = $request->file('photo')->store('employees', 'public');
        }

        $employee = Employee::create([
            'nip' => $validated['nip'] ?? null,
            'name' => $validated['name'],
            'fullname' => !empty($validated['fullname']) ? $validated['fullname'] : $validated['name'],
            'nohp' => $validated['nohp'],
            'title' => $validated['title'],
            'work_area' => $validated['work_area'] ?? 'Jemari Home Spa - Seluruh Area Layanan',
            'status' => $validated['status'] ?? 'aktif',
            'join_date' => $validated['join_date'],
            'photo' => $photoPath,
        ]);

        if ($request->has('skills')) {
            $employee->skills()->sync($request->input('skills', []));
        }

        $this->syncEmployeeCertifications($employee, $request);

        \App\Models\User::create([
            'employee_id' => $employee->id,
            'name' => $employee->name,
            'fullname' => $employee->fullname,
            'email' => $validated['email'],
            'password' => \Illuminate\Support\Facades\Hash::make('password123'),
            'role' => 'terapis',
            'is_active' => $request->boolean('is_active', true),
        ]);

        return redirect()->route('admin.employee.index')->with('message', 'Karyawan berhasil ditambahkan!');
    }

    public function edit(Employee $employee)
    {
        $user = \App\Models\User::where('employee_id', $employee->id)->first();
        $employee->email = $user ? $user->email : '';
        $employee->is_active = $user ? (bool)$user->is_active : true;
        $employee->load(['skills', 'certifications']);

        return Inertia::render('Admin/Employee/Edit', [
            'employee' => $employee,
            'skills' => Skill::orderBy('name')->get(),
            'certifications' => Certification::orderBy('name')->get(),
        ]);
    }

    public function update(Request $request, Employee $employee)
    {
        $user = \App\Models\User::where('employee_id', $employee->id)->first();

        $validated = $request->validate([
            'nip' => ['nullable', 'string', 'max:50', \Illuminate\Validation\Rule::unique('employees', 'nip')->ignore($employee->id)],
            'name' => 'required|string|max:255',
            'fullname' => 'nullable|string|max:255',
            'nohp' => 'required|string|max:20',
            'title' => 'required|string|max:255',
            'work_area' => 'nullable|string|max:255',
            'status' => 'required|in:aktif,tidak_aktif',
            'join_date' => 'nullable|date',
            'email' => ['required', 'email', 'max:255', \Illuminate\Validation\Rule::unique('users', 'email')->ignore($user ? $user->id : null)],
            'is_active' => 'boolean',
            'photo' => 'nullable|image|max:5120',
            'skills' => 'nullable|array',
            'skills.*' => 'exists:skills,id',
            'certifications' => 'nullable|array',
            'certifications.*.certification_id' => 'nullable|exists:certifications,id',
            'certifications.*.certificate_number' => 'nullable|string|max:255',
            'certifications.*.valid_until' => 'nullable|date',
            'certifications.*.file' => 'nullable|file|mimes:jpg,jpeg,png,webp,pdf|max:5120',
        ]);

        if ($request->hasFile('photo')) {
            if ($employee->photo) {
                Storage::disk('public')->delete($employee->photo);
            }
            $employee->photo = $request->file('photo')->store('employees', 'public');
        }

        $employee->update([
            'nip' => $validated['nip'] ?? null,
            'name' => $validated['name'],
            'fullname' => !empty($validated['fullname']) ? $validated['fullname'] : $validated['name'],
            'nohp' => $validated['nohp'],
            'title' => $validated['title'],
            'work_area' => $validated['work_area'] ?? $employee->work_area ?? 'Jemari Home Spa - Seluruh Area Layanan',
            'status' => $validated['status'] ?? 'aktif',
            'join_date' => $validated['join_date'],
            'photo' => $employee->photo,
        ]);

        if ($request->has('skills')) {
            $employee->skills()->sync($request->input('skills', []));
        }

        $this->syncEmployeeCertifications($employee, $request);

        if ($user) {
            $user->update([
                'name' => $employee->name,
                'fullname' => $employee->fullname,
                'email' => $validated['email'],
                'is_active' => $request->boolean('is_active', true),
            ]);
        } else {
            \App\Models\User::create([
                'employee_id' => $employee->id,
                'name' => $employee->name,
                'fullname' => $employee->fullname,
                'email' => $validated['email'],
                'password' => \Illuminate\Support\Facades\Hash::make('password123'),
                'role' => 'terapis',
                'is_active' => $request->boolean('is_active', true),
            ]);
        }

        return redirect()->route('admin.employee.index')->with('message', 'Karyawan berhasil diperbarui!');
    }

    public function destroy(Employee $employee)
    {
        if ($employee->photo) {
            Storage::disk('public')->delete($employee->photo);
        }

        $user = \App\Models\User::where('employee_id', $employee->id)->first();
        if ($user) {
            $user->delete();
        }
        $employee->delete();
        return redirect()->route('admin.employee.index')->with('message', 'Karyawan berhasil dihapus!');
    }

    private function syncEmployeeCertifications(Employee $employee, Request $request)
    {
        $certificationsInput = $request->input('certifications', []);
        $syncData = [];

        if (is_array($certificationsInput)) {
            foreach ($certificationsInput as $index => $item) {
                $certId = is_array($item) ? ($item['certification_id'] ?? null) : $item;
                if (!$certId) continue;

                $filePath = is_array($item) ? ($item['existing_file'] ?? null) : null;
                if ($request->hasFile("certifications.{$index}.file")) {
                    $filePath = $request->file("certifications.{$index}.file")->store('certifications', 'public');
                }

                $certNumber = is_array($item) ? ($item['certificate_number'] ?? null) : null;
                $validUntil = is_array($item) ? ($item['valid_until'] ?? null) : null;

                $syncData[$certId] = [
                    'certificate_file' => $filePath,
                    'certificate_number' => $certNumber ?: null,
                    'valid_until' => $validUntil ?: null,
                ];
            }
        }

        $employee->certifications()->sync($syncData);
    }
}
